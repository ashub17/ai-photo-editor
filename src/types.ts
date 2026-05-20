export type Mode = "generate" | "edit";

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface EnhancePromptRequest {
  mode: Mode;
  prompt: string;
}

export interface EnhancePromptResponse {
  intent: Mode;
  enhancedPrompt: string;
  negativePrompt: string;
  styleHints: string[];
}

export interface ImageResult {
  imageUrl: string;
  finalPrompt: string;
  raw?: unknown;
}

export interface GenerateImageRequest {
  prompt: string;
  aspectRatio: AspectRatio;
  enhance: boolean;
}

export interface EditImageRequest {
  prompt: string;
  imageDataUrl: string;
  strength: number;
  enhance: boolean;
}

export interface HistoryItem {
  id: string;
  type: Mode;
  imageUrl: string;
  prompt: string;
  timestamp: string;
}
