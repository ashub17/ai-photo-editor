import type { ImageResult } from "../types";

interface ResultPanelProps {
  result: ImageResult | null;
  loading: boolean;
  error: string;
}

export default function ResultPanel({ result, loading, error }: ResultPanelProps) {
  return (
    <section className="rounded-lg border border-studio-muted/20 bg-studio-mid/15 p-5 shadow-glow">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-studio-cream">Result</h2>
        {result?.imageUrl ? (
          <a
            href={result.imageUrl}
            download="image-studio-result.png"
            className="rounded-md bg-studio-peach px-3 py-2 text-sm font-semibold text-studio-dark transition hover:bg-studio-cream"
          >
            Download
          </a>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-studio-muted/20 bg-studio-dark/70">
        {loading ? (
          <div className="flex min-h-80 items-center justify-center px-6 text-center">
            <div>
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-studio-peach border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-studio-cream">
                Rendering image...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-80 items-center justify-center px-6 text-center">
            <p className="max-w-md text-sm leading-6 text-rose-200">{error}</p>
          </div>
        ) : result ? (
          <img
            src={result.imageUrl}
            alt="Generated result"
            className="max-h-[38rem] w-full object-contain"
          />
        ) : (
          <div className="flex min-h-80 items-center justify-center px-6 text-center">
            <p className="max-w-sm text-sm leading-6 text-studio-muted">
              Results will appear here after a generation or edit request.
            </p>
          </div>
        )}
      </div>

      {result?.finalPrompt ? (
        <div className="mt-4 rounded-lg border border-studio-muted/20 bg-studio-dark/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-studio-muted">
            Final prompt used
          </p>
          <p className="mt-2 text-sm leading-6 text-studio-cream">
            {result.finalPrompt}
          </p>
        </div>
      ) : null}
    </section>
  );
}
