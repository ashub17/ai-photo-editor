export const MAX_PROMPT_LENGTH = 4000;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_ASPECT_RATIOS = new Set(["1:1", "16:9", "9:16", "4:3", "3:4"]);

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function requireString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new HttpError(400, `${fieldName} is required.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new HttpError(400, `${fieldName} is required.`);
  }

  if (trimmed.length > MAX_PROMPT_LENGTH) {
    throw new HttpError(
      400,
      `${fieldName} must be ${MAX_PROMPT_LENGTH} characters or fewer.`
    );
  }

  return trimmed;
}

export function requireBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== "boolean") {
    throw new HttpError(400, `${fieldName} must be true or false.`);
  }

  return value;
}

export function requireAspectRatio(value: unknown): string {
  if (typeof value !== "string" || !ALLOWED_ASPECT_RATIOS.has(value)) {
    throw new HttpError(400, "Choose a supported aspect ratio.");
  }

  return value;
}

export function requireStrength(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new HttpError(400, "strength must be a number.");
  }

  if (value < 0.1 || value > 1) {
    throw new HttpError(400, "strength must be between 0.1 and 1.0.");
  }

  return Number(value.toFixed(1));
}

export function requireImageDataUrl(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("data:image/")) {
    throw new HttpError(400, "A valid image data URL is required.");
  }

  const match = value.match(/^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new HttpError(400, "Image must be a PNG, JPEG, or WebP data URL.");
  }

  const base64 = match[2];
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  const approximateBytes = Math.floor((base64.length * 3) / 4) - padding;

  if (approximateBytes > MAX_IMAGE_BYTES) {
    throw new HttpError(413, "Image must be 10MB or smaller.");
  }

  return value;
}

export function safeJsonParseObject(text: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        const parsed = JSON.parse(text.slice(start, end + 1));
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? (parsed as Record<string, unknown>)
          : null;
      } catch {
        return null;
      }
    }
  }

  return null;
}
