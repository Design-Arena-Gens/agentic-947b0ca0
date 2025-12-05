import { useMemo, useState } from "react";
import type { RefObject } from "react";
import type { GenerationStatus } from "@/hooks/use-video-generator";
import { cn } from "@/lib/utils";

type RenderViewportProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  videoUrl: string | null;
  status: GenerationStatus;
  progress: number;
  error: string | null;
};

const STATUS_LABELS: Record<GenerationStatus, string> = {
  idle: "Ready for prompt",
  rendering: "Rendering particle field",
  encoding: "Encoding timeline",
  complete: "Sequence ready",
  error: "Generation failed",
};

export function RenderViewport({
  canvasRef,
  videoUrl,
  status,
  progress,
  error,
}: RenderViewportProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const label = useMemo(() => STATUS_LABELS[status], [status]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 shadow-2xl">
      <canvas ref={canvasRef} className="absolute inset-0 h-0 w-0 opacity-0" />
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black/80">
        {videoUrl ? (
          <video
            src={videoUrl}
            className="h-full w-full object-cover"
            autoPlay={isPlaying}
            muted={isMuted}
            loop
            playsInline
            onClick={() => setIsPlaying((value) => !value)}
          />
        ) : (
          <EmptyState status={status} />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/70" />

        <div className="absolute left-4 top-4 flex items-center gap-3 rounded-full bg-black/60 px-4 py-2 backdrop-blur">
          <div className={cn("h-2 w-2 rounded-full", status === "complete" ? "bg-emerald-400" : status === "error" ? "bg-rose-400" : "bg-fuchsia-400 animate-pulse")} />
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
            {label}
          </span>
        </div>

        {status !== "idle" && status !== "complete" && (
          <div className="absolute bottom-4 left-4 right-4 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}

        {videoUrl && (
          <div className="absolute bottom-4 left-4 flex gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying((value) => !value)}
              className="rounded-full bg-white/90 px-4 py-1 text-xs font-semibold text-slate-900 shadow-lg transition hover:bg-white"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => setIsMuted((value) => !value)}
              className="rounded-full bg-white/90 px-4 py-1 text-xs font-semibold text-slate-900 shadow-lg transition hover:bg-white"
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <a
              href={videoUrl}
              download="sora-2-sequence.webm"
              className="rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-4 py-1 text-xs font-semibold text-white shadow-lg transition hover:scale-105"
            >
              Download
            </a>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-400/50 bg-rose-100/40 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}
    </section>
  );
}

function EmptyState({ status }: { status: GenerationStatus }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center text-white/80">
      <div className="h-20 w-20 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
      <p className="text-sm uppercase tracking-[0.4em]">
        {status === "idle" ? "Awaiting Prompt" : "Initializing Engine"}
      </p>
    </div>
  );
}
