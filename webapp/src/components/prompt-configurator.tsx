import { useMemo } from "react";
import type { VideoStyle } from "@/lib/types";
import { cn, formatSeconds } from "@/lib/utils";

type ResolutionOption = {
  label: string;
  width: number;
  height: number;
};

const RESOLUTION_OPTIONS: ResolutionOption[] = [
  { label: "512 x 512", width: 512, height: 512 },
  { label: "720p Square", width: 720, height: 720 },
  { label: "1080 x 608", width: 1080, height: 608 },
];

const STYLE_OPTIONS: { id: VideoStyle; label: string; description: string }[] = [
  {
    id: "cinematic",
    label: "Cinematic",
    description: "Balanced motion, volumetric lighting and lens bloom.",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    description: "Aggressive parallax, neon accents, high turbulence.",
  },
  {
    id: "dreamscape",
    label: "Dreamscape",
    description: "Fluid organic morphing with surreal gradients.",
  },
  {
    id: "documentary",
    label: "Documentary",
    description: "Grounded pacing, observational light sweeps.",
  },
  {
    id: "sketch",
    label: "Concept Sketch",
    description: "Minimalist motion with illustrative shading.",
  },
];

type PromptConfiguratorProps = {
  prompt: string;
  duration: number;
  style: VideoStyle;
  resolution: ResolutionOption;
  onPromptChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  onStyleChange: (value: VideoStyle) => void;
  onResolutionChange: (value: ResolutionOption) => void;
  onGenerate: () => void;
  generating: boolean;
  progress: number;
};

export function PromptConfigurator({
  prompt,
  duration,
  style,
  resolution,
  onPromptChange,
  onDurationChange,
  onStyleChange,
  onResolutionChange,
  onGenerate,
  generating,
  progress,
}: PromptConfiguratorProps) {
  const durationLabel = useMemo(() => formatSeconds(duration), [duration]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/60 p-6 shadow-xl backdrop-blur-sm transition dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-col gap-6">
        <div>
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Worldbuilding Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder="Describe your scene with cinematic detail, e.g. “A vast neon metropolis during a torrential night, camera gliding between holographic billboards.”"
            className="mt-2 h-40 w-full resize-none rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-inner outline-none transition focus:border-transparent focus:ring-2 focus:ring-fuchsia-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-100"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-white/50 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
              <span>Duration</span>
              <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-semibold text-slate-700 shadow-sm dark:bg-white/10 dark:text-slate-200">
                {durationLabel}
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={12}
              step={0.5}
              value={duration}
              onChange={(event) => onDurationChange(Number(event.target.value))}
              className="accent-fuchsia-500"
            />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/50 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Resolution
            </span>
            <div className="flex flex-wrap gap-2">
              {RESOLUTION_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => onResolutionChange(option)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm font-semibold transition",
                    option.label === resolution.label
                      ? "border-transparent bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white shadow-lg"
                      : "border-white/60 bg-white/60 text-slate-600 hover:border-fuchsia-300 hover:text-fuchsia-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-white/50 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Render Style
            </span>
            <div className="relative">
              <select
                value={style}
                onChange={(event) => onStyleChange(event.target.value as VideoStyle)}
                className="block w-full appearance-none rounded-xl border border-white/50 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition focus:border-fuchsia-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-100"
              >
                {STYLE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                ▾
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          {STYLE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onStyleChange(option.id)}
              className={cn(
                "group flex flex-col gap-1 rounded-2xl border bg-white/60 p-3 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03]",
                option.id === style
                  ? "border-fuchsia-400/80 shadow-lg shadow-fuchsia-300/30 dark:border-fuchsia-400/50"
                  : "border-white/50",
              )}
            >
              <span
                className={cn(
                  "text-sm font-semibold",
                  option.id === style
                    ? "bg-gradient-to-r from-fuchsia-500 to-indigo-500 bg-clip-text text-transparent"
                    : "text-slate-800 dark:text-slate-100",
                )}
              >
                {option.label}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {option.description}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 rounded-2xl border border-white/60 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Neural Pipeline Stages
            </span>
            <div className="mt-2 flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              <span>Diffusion Draft</span>
              <span className="h-1 w-8 rounded-full bg-slate-300 dark:bg-white/10" />
              <span>Physics Reprojection</span>
              <span className="h-1 w-8 rounded-full bg-slate-300 dark:bg-white/10" />
              <span>Temporal Upscale</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className={cn(
              "flex items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-6 py-3 text-base font-semibold text-white shadow-xl transition hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-fuchsia-300 disabled:opacity-50",
              generating && "animate-pulse",
            )}
          >
            {generating ? "Synthesizing..." : "Generate Sequence"}
          </button>
        </div>

        {generating && (
          <div className="h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 transition-all duration-200"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export { RESOLUTION_OPTIONS };

