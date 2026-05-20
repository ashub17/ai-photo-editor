import type {
  EditImageRequest,
  EnhancePromptRequest,
  EnhancePromptResponse,
  GenerateImageRequest,
  ImageResult
} from "../types";

async function request<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error || "Request failed. Please try again.");
  }

  return payload as T;
}

export function enhancePrompt(
  body: EnhancePromptRequest
): Promise<EnhancePromptResponse> {
  return request<EnhancePromptResponse>("/api/enhance-prompt", body);
}

export function generateImage(body: GenerateImageRequest): Promise<ImageResult> {
  return request<ImageResult>("/api/generate-image", body);
}

export function editImage(body: EditImageRequest): Promise<ImageResult> {
  return request<ImageResult>("/api/edit-image", body);
}
