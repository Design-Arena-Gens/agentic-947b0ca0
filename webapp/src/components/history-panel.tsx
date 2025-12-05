import type { GenerationHistoryItem } from "@/lib/types";
import { formatSeconds } from "@/lib/utils";

type HistoryPanelProps = {
  items: GenerationHistoryItem[];
  onLoad: (item: GenerationHistoryItem) => void;
};

export function HistoryPanel({ items, onLoad }: HistoryPanelProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-white/40 bg-white/50 p-8 text-center dark:border-white/10 dark:bg-white/[0.02]">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          No renders yet
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Generate your first sequence to populate the production history.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/60 p-6 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.035]">
      <header className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
            Render History
          </span>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Tap any render to load its configuration.
          </p>
        </div>
      </header>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onLoad(item)}
            className="group w-full rounded-2xl border border-white/40 bg-white/65 p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {item.sceneProfile.theme}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" • "}
                  {formatSeconds(item.settings.duration)}
                </p>
              </div>
              <span className="rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-3 py-1 text-xs font-semibold text-white">
                {item.settings.style}
              </span>
            </div>

            <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
              {item.prompt}
            </p>

            <div className="mt-4 overflow-hidden rounded-xl border border-white/30">
              <video
                src={item.videoUrl}
                className="h-32 w-full bg-black object-cover transition group-hover:scale-[1.02]"
                muted
                autoPlay
                playsInline
                loop
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
