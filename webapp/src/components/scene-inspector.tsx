import type { SceneProfile, SceneShot } from "@/lib/types";

type SceneInspectorProps = {
  profile: SceneProfile;
  shots: SceneShot[];
};

export function SceneInspector({ profile, shots }: SceneInspectorProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.035]">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
            Scene Intelligence
          </span>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {profile.theme}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {profile.mood} • {profile.lighting} • {profile.texture} texture
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-4">
          <InfoBadge label="Motion Curve" value={profile.motion.curve} />
          <InfoBadge
            label="Amplitude"
            value={profile.motion.amplitude.toFixed(2)}
          />
          <InfoBadge
            label="Frequency"
            value={profile.motion.frequency.toFixed(2)}
          />
          <InfoBadge label="Density" value={profile.density.toFixed(2)} />
        </div>

        <div className="rounded-2xl border border-white/40 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.045]">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Palette
          </span>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Background Gradient
              </p>
              <div className="mt-2 h-10 w-full overflow-hidden rounded-xl border border-white/30 shadow-inner">
                <div
                  className="h-full"
                  style={{
                    background: `linear-gradient(135deg, ${profile.palette.background.join(", ")})`,
                  }}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Accent Swatches
              </p>
              <div className="mt-2 flex gap-2">
                {profile.palette.accents.map((color) => (
                  <div
                    key={color}
                    className="flex h-10 flex-1 items-center justify-center rounded-xl border border-white/30 text-xs font-semibold text-white shadow-inner"
                    style={{ backgroundColor: color }}
                  >
                    {color.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
            Procedural Shot Plan
          </p>
          <ul className="mt-3 space-y-3">
            {shots.map((shot) => (
              <li
                key={shot.id}
                className="rounded-2xl border border-white/40 bg-white/60 p-4 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-3 py-0.5 text-xs font-semibold text-white">
                    {shot.focus}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {shot.title}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    t={shot.timestamp.toFixed(1)}s → +{shot.duration.toFixed(1)}s
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">
                  {shot.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/[0.03]">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
