import { HttpError, safeJsonParseObject } from "./utils";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const PROMPT_ENHANCEMENT_MAX_TOKENS = 700;
const IMAGE_REQUEST_MAX_TOKENS = 1200;

export interface EnhancedPrompt {
  intent: "generate" | "edit";
  enhancedPrompt: string;
  negativePrompt: string;
  styleHints: string[];
}

type JsonObject = Record<string, unknown>;

function getApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new HttpError(500, "OpenRouter API key is not configured.");
  }

  return apiKey;
}

export function getImageModel() {
  return (
    process.env.OPENROUTER_IMAGE_MODEL ||
    "google/gemini-3.1-flash-image-preview"
  );
}

async function postOpenRouter(body: JsonObject) {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "OpenRouter Image Studio"
    },
    body: JSON.stringify(body)
  });

  const rawText = await response.text();
  let payload: unknown = null;

  try {
    payload = rawText ? JSON.parse(rawText) : {};
  } catch {
    payload = { rawText };
  }

  if (!response.ok) {
    console.error("OpenRouter request failed", {
      status: response.status,
      payload
    });
    throw new HttpError(
      response.status >= 500 ? 502 : response.status,
      "OpenRouter request failed. Check your model and API key configuration."
    );
  }

  return payload as JsonObject;
}

function getAssistantText(raw: JsonObject): string {
  const message = (raw.choices as any[])?.[0]?.message;
  const content = message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (typeof item?.text === "string") {
          return item.text;
        }
        return "";
      })
      .join("\n")
      .trim();
  }

  return "";
}

export async function enhancePrompt(
  mode: "generate" | "edit",
  prompt: string
): Promise<EnhancedPrompt> {
  const fallback: EnhancedPrompt = {
    intent: mode,
    enhancedPrompt: prompt,
    negativePrompt: "",
    styleHints: []
  };

  try {
    const raw = await postOpenRouter({
      model: "openrouter/auto",
      max_tokens: PROMPT_ENHANCEMENT_MAX_TOKENS,
      messages: [
        {
          role: "system",
          content:
            "Return JSON only. Normalize image generation/editing prompts for an image model. Do not include markdown."
        },
        {
          role: "user",
          content: `Mode: ${mode}\nPrompt: ${prompt}\nReturn exactly this JSON shape: {"intent":"generate|edit","enhancedPrompt":"...","negativePrompt":"...","styleHints":["..."]}`
        }
      ]
    });

    const parsed = safeJsonParseObject(getAssistantText(raw));
    if (!parsed) {
      return fallback;
    }

    const intent =
      parsed.intent === "generate" || parsed.intent === "edit"
        ? parsed.intent
        : mode;
    const enhancedPrompt =
      typeof parsed.enhancedPrompt === "string" && parsed.enhancedPrompt.trim()
        ? parsed.enhancedPrompt.trim()
        : prompt;
    const negativePrompt =
      typeof parsed.negativePrompt === "string" ? parsed.negativePrompt : "";
    const styleHints = Array.isArray(parsed.styleHints)
      ? parsed.styleHints.filter((hint): hint is string => typeof hint === "string")
      : [];

    return {
      intent,
      enhancedPrompt,
      negativePrompt,
      styleHints
    };
  } catch (error) {
    console.error("Prompt enhancement failed", error);
    return fallback;
  }
}

function asImageUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const trimmed = value.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/")
  ) {
    return trimmed;
  }

  if (/^[A-Za-z0-9+/]+={0,2}$/.test(trimmed) && trimmed.length > 100) {
    return `data:image/png;base64,${trimmed}`;
  }

  return null;
}

export function extractImageFromOpenRouterResponse(raw: JsonObject): string {
  const firstChoice = (raw.choices as any[])?.[0];
  const message = firstChoice?.message;

  const messageImage =
    message?.images?.[0]?.image_url?.url ??
    message?.images?.[0]?.url ??
    message?.images?.[0]?.b64_json;
  const messageImageUrl = asImageUrl(messageImage);
  if (messageImageUrl) {
    return messageImageUrl;
  }

  const content = message?.content;
  if (Array.isArray(content)) {
    for (const item of content) {
      const directUrl =
        item?.image_url?.url ??
        item?.image_url ??
        item?.url ??
        item?.source?.url ??
        item?.b64_json;
      const imageUrl = asImageUrl(directUrl);
      if (imageUrl) {
        return imageUrl;
      }

      const textUrl = asImageUrl(item?.text);
      if (textUrl) {
        return textUrl;
      }
    }
  }

  const rawImage = (raw.images as any[])?.[0]?.url ?? (raw.images as any[])?.[0]?.b64_json;
  const rawImageUrl = asImageUrl(rawImage);
  if (rawImageUrl) {
    return rawImageUrl;
  }

  const dataImage = (raw.data as any[])?.[0]?.url ?? (raw.data as any[])?.[0]?.b64_json;
  const dataImageUrl = asImageUrl(dataImage);
  if (dataImageUrl) {
    return dataImageUrl;
  }

  console.error("No image found in OpenRouter response", raw);
  throw new HttpError(502, "OpenRouter returned no image. Check the configured image model.");
}

export async function generateImage({
  prompt,
  aspectRatio
}: {
  prompt: string;
  aspectRatio: string;
}) {
  const raw = await postOpenRouter({
    model: getImageModel(),
    max_tokens: IMAGE_REQUEST_MAX_TOKENS,
    modalities: ["image"],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          }
        ]
      }
    ],
    image_config: {
      aspect_ratio: aspectRatio
    }
  });

  return {
    imageUrl: extractImageFromOpenRouterResponse(raw),
    raw
  };
}

export async function editImage({
  prompt,
  imageDataUrl,
  strength
}: {
  prompt: string;
  imageDataUrl: string;
  strength: number;
}) {
  const raw = await postOpenRouter({
    model: getImageModel(),
    max_tokens: IMAGE_REQUEST_MAX_TOKENS,
    modalities: ["image"],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          },
          {
            type: "image_url",
            image_url: {
              url: imageDataUrl
            }
          }
        ]
      }
    ],
    image_config: {
      strength
    }
  });

  return {
    imageUrl: extractImageFromOpenRouterResponse(raw),
    raw
  };
}
