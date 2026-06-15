import { HttpError, safeJsonParseObject } from "./utils.js";

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

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asObject(value: unknown): JsonObject | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function getApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new HttpError(500, "API key is not configured.");
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
      "HTTP-Referer": process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:5173",
      "X-Title": "Image Studio"
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
    console.error("API request failed", {
      status: response.status,
      payload
    });
    throw new HttpError(
      response.status >= 500 ? 502 : response.status,
      "Image API request failed. Check your model and API key configuration."
    );
  }

  return payload as JsonObject;
}

function getAssistantText(raw: JsonObject): string {
  const message = asObject(asArray(raw.choices)[0])?.message;
  const content = asObject(message)?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        const obj = asObject(item);
        return typeof obj?.text === "string" ? obj.text : "";
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
  const message = asObject(asObject(asArray(raw.choices)[0])?.message);

  const firstMessageImage = asObject(asArray(asObject(message?.images)?.[0] ?? message?.images)?.[0]);
  const messageImageUrl = asImageUrl(
    firstMessageImage?.image_url
      ? asObject(firstMessageImage.image_url)?.url
      : (firstMessageImage?.url ?? firstMessageImage?.b64_json)
  );
  if (messageImageUrl) return messageImageUrl;

  const content = message?.content;
  if (Array.isArray(content)) {
    for (const item of content) {
      const obj = asObject(item);
      if (!obj) continue;
      const directUrl =
        asObject(obj.image_url)?.url ??
        obj.image_url ??
        obj.url ??
        asObject(obj.source)?.url ??
        obj.b64_json;
      const imageUrl = asImageUrl(directUrl);
      if (imageUrl) return imageUrl;
      const textUrl = asImageUrl(obj.text);
      if (textUrl) return textUrl;
    }
  }

  const firstRawImage = asObject(asArray(raw.images)[0]);
  const rawImageUrl = asImageUrl(firstRawImage?.url ?? firstRawImage?.b64_json);
  if (rawImageUrl) return rawImageUrl;

  const firstDataItem = asObject(asArray(raw.data)[0]);
  const dataImageUrl = asImageUrl(firstDataItem?.url ?? firstDataItem?.b64_json);
  if (dataImageUrl) return dataImageUrl;

  console.error("No image found in API response", raw);
  throw new HttpError(502, "The API returned no image. Check the configured image model.");
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
