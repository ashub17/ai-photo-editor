import type { HistoryItem } from "../types";

interface HistoryPanelProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export default function HistoryPanel({ items, onSelect }: HistoryPanelProps) {
  return (
    <section className="rounded-xl border border-app-border bg-app-surface shadow-card">
      <div className="border-b border-app-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-app-text">History</h2>
      </div>

      <div className="p-3">
        {items.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg bg-app-elevated px-4 text-center">
            <svg className="h-8 w-8 text-app-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs leading-5 text-app-muted">
              Generated and edited images will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className="grid w-full grid-cols-[3.5rem_1fr] gap-3 rounded-lg border border-app-border bg-app-elevated p-2.5 text-left transition-all duration-150 hover:border-app-accent/40 hover:bg-app-input active:scale-[0.99]"
              >
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-14 w-14 rounded-md object-cover ring-1 ring-app-border"
                />
                <span className="min-w-0 py-0.5">
                  <span className="flex items-center gap-2">
                    <span className="rounded bg-app-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-app-accent">
                      {item.type === "generate" ? "Gen" : "Edit"}
                    </span>
                    <span className="text-[11px] text-app-muted">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </span>
                  <span className="mt-1.5 line-clamp-2 block text-xs leading-4 text-app-secondary">
                    {item.prompt}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
