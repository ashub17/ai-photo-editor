import type { ImageResult } from "../types";

interface ResultPanelProps {
  result: ImageResult | null;
  loading: boolean;
  error: string;
}

export default function ResultPanel({ result, loading, error }: ResultPanelProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-slate-900/70 p-5 shadow-glow">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">Result</h2>
        {result?.imageUrl ? (
          <a
            href={result.imageUrl}
            download="openrouter-image-studio-result.png"
            className="rounded-md bg-teal-300 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
          >
            Download
          </a>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-slate-950/70">
        {loading ? (
          <div className="flex min-h-80 items-center justify-center px-6 text-center">
            <div>
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-teal-300 border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-slate-200">
                Rendering image with your OpenRouter model...
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
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Results will appear here after a generation or edit request.
            </p>
          </div>
        )}
      </div>

      {result?.finalPrompt ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Final prompt used
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            {result.finalPrompt}
          </p>
        </div>
      ) : null}
    </section>
  );
}
