import type { HistoryItem } from "../types";

interface HistoryPanelProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export default function HistoryPanel({ items, onSelect }: HistoryPanelProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
      <h2 className="text-lg font-semibold text-white">Session history</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-slate-400">
          Your latest generated and edited images will be listed here.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="grid w-full grid-cols-[4.5rem_1fr] gap-3 rounded-lg border border-white/10 bg-slate-950/60 p-3 text-left transition hover:border-teal-300/60 hover:bg-slate-950"
            >
              <img
                src={item.imageUrl}
                alt=""
                className="h-16 w-16 rounded-md object-cover"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="rounded bg-teal-300/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-teal-200">
                    {item.type === "generate" ? "Generated" : "Edited"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </span>
                <span className="mt-2 line-clamp-2 block text-sm leading-5 text-slate-300">
                  {item.prompt}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
