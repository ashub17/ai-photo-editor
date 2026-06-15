import type { ImageResult } from "../types";

interface ResultPanelProps {
  result: ImageResult | null;
  loading: boolean;
  error: string;
}

export default function ResultPanel({ result, loading, error }: ResultPanelProps) {
  return (
    <section className="rounded-xl border border-app-border bg-app-surface shadow-glow">
      <div className="flex items-center justify-between border-b border-app-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-app-text">Result</h2>
        {result?.imageUrl ? (
          <a
            href={result.imageUrl}
            download="image-studio-result.png"
            className="flex items-center gap-1.5 rounded-md bg-app-accent px-3 py-1.5 text-xs font-semibold text-app-bg shadow-accent-sm transition-all duration-150 hover:bg-app-accent-lt active:scale-[0.97]"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download
          </a>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-b-xl bg-app-input">
        {loading ? (
          <div className="flex min-h-80 flex-col items-center justify-center gap-5 px-6 text-center">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-2 border-app-border" />
              <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-app-accent" />
              <div className="absolute inset-[5px] animate-pulse rounded-full bg-app-accent/10" />
            </div>
            <div>
              <p className="text-sm font-medium text-app-text">Generating your image</p>
              <p className="mt-1 text-xs text-app-muted">This may take a few seconds…</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-80 items-center justify-center px-6 text-center animate-fade-in">
            <div className="max-w-md">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-950/60 ring-1 ring-rose-800/50">
                <svg className="h-5 w-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-sm leading-6 text-rose-300">{error}</p>
            </div>
          </div>
        ) : result ? (
          <img
            key={result.imageUrl}
            src={result.imageUrl}
            alt="Generated result"
            className="max-h-[38rem] w-full object-contain animate-fade-in"
          />
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-app-elevated ring-1 ring-app-border">
              <svg className="h-7 w-7 text-app-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p className="max-w-xs text-sm leading-6 text-app-muted">
              Your generated or edited image will appear here.
            </p>
          </div>
        )}
      </div>

      {result?.finalPrompt ? (
        <div className="border-t border-app-border px-5 py-4 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-widest text-app-muted">
            Final prompt
          </p>
          <p className="mt-2 text-sm leading-relaxed text-app-secondary">
            {result.finalPrompt}
          </p>
        </div>
      ) : null}
    </section>
  );
}
