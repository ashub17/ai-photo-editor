import { useRef, useState } from "react";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

interface ImageUploaderProps {
  imageDataUrl: string;
  onImageChange: (imageDataUrl: string) => void;
  disabled?: boolean;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

export default function ImageUploader({
  imageDataUrl,
  onImageChange,
  disabled
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");

  async function handleFile(file?: File) {
    setError("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be 10MB or smaller.");
      return;
    }

    try {
      onImageChange(await readAsDataUrl(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read image file.");
    }
  }

  return (
    <div>
      <span className="text-sm font-medium text-studio-cream">Source image</span>
      <div className="mt-2 rounded-lg border border-dashed border-studio-muted/25 bg-studio-dark/60 p-4">
        {imageDataUrl ? (
          <div className="space-y-4">
            <img
              src={imageDataUrl}
              alt="Uploaded preview"
              className="max-h-72 w-full rounded-md object-contain"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className="rounded-md border border-studio-muted/20 px-3 py-2 text-sm font-medium text-studio-cream transition hover:bg-studio-cream/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Replace image
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onImageChange("")}
                className="rounded-md border border-rose-300/20 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex min-h-44 w-full flex-col items-center justify-center rounded-md border border-studio-muted/20 bg-studio-mid/15 px-4 py-8 text-center transition hover:bg-studio-mid/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="text-base font-medium text-studio-cream">
              Upload an image
            </span>
            <span className="mt-2 text-sm text-studio-muted">
              PNG, JPEG, or WebP up to 10MB
            </span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          disabled={disabled}
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </div>
      {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
