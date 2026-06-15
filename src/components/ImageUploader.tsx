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
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be 10 MB or smaller.");
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
      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-app-secondary">
        Source image
      </span>

      <div className="rounded-lg border border-dashed border-app-border bg-app-input p-3">
        {imageDataUrl ? (
          <div className="space-y-3 animate-fade-in">
            <img
              src={imageDataUrl}
              alt="Uploaded preview"
              className="max-h-64 w-full rounded-md object-contain"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className="rounded-md border border-app-border px-3 py-1.5 text-xs font-medium text-app-secondary transition-colors duration-150 hover:border-app-line hover:text-app-text disabled:cursor-not-allowed disabled:opacity-50"
              >
                Replace
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onImageChange("")}
                className="rounded-md border border-rose-900/50 px-3 py-1.5 text-xs font-medium text-rose-400 transition-colors duration-150 hover:border-rose-700/50 hover:bg-rose-900/20 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-md border border-app-border bg-app-elevated px-4 py-8 text-center transition-colors duration-150 hover:border-app-accent/40 hover:bg-app-elevated disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-surface ring-1 ring-app-border">
              <svg
                className="h-5 w-5 text-app-secondary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-app-text">Upload an image</p>
              <p className="mt-0.5 text-xs text-app-muted">PNG, JPEG, or WebP · up to 10 MB</p>
            </div>
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

      {error ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-400">
          <span className="h-1 w-1 rounded-full bg-rose-400" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
