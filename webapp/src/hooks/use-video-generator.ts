import { useCallback, useEffect, useRef, useState } from "react";
import { createSeededRandom } from "@/lib/random";
import type { GenerationSettings, SceneProfile } from "@/lib/types";

export type GenerationStatus =
  | "idle"
  | "rendering"
  | "encoding"
  | "complete"
  | "error";

type Particle = {
  id: number;
  radius: number;
  baseX: number;
  baseY: number;
  depth: number;
  hue: string;
  drift: number;
  noise: number;
};

type FlowField = {
  particles: Particle[];
  gradientStops: string[];
};

const MIME_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

const DEFAULT_MIME = MIME_CANDIDATES.find((candidate) => {
  if (typeof window === "undefined" || !("MediaRecorder" in window)) return false;
  try {
    return MediaRecorder.isTypeSupported(candidate);
  } catch {
    return false;
  }
}) ?? "video/webm";

function createFlowField(
  settings: GenerationSettings,
  profile: SceneProfile,
): FlowField {
  const random = createSeededRandom(settings.seed);
  const particleCount = Math.floor(180 + profile.density * 220);
  const particles: Particle[] = [];

  for (let i = 0; i < particleCount; i += 1) {
    particles.push({
      id: i,
      radius: 1.4 + random() * (6 + profile.motion.amplitude * 12),
      baseX: random(),
      baseY: random(),
      depth: 0.2 + random() * 0.8,
      hue:
        profile.palette.accents[
          Math.floor(random() * profile.palette.accents.length)
        ],
      drift: (random() - 0.5) * profile.motion.drift * 2.4,
      noise: random(),
    });
  }

  const gradientStops = profile.palette.background;
  return { particles, gradientStops };
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  field: FlowField,
  progress: number,
) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const stops = field.gradientStops;
  stops.forEach((color, index) => {
    gradient.addColorStop(index / Math.max(1, stops.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const overlayOpacity = 0.28 + Math.sin(progress * Math.PI * 2) * 0.12;
  ctx.globalAlpha = overlayOpacity;
  ctx.fillStyle = "#ffffff10";
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;
}

function renderParticles(
  ctx: CanvasRenderingContext2D,
  settings: GenerationSettings,
  profile: SceneProfile,
  field: FlowField,
  frameIndex: number,
  totalFrames: number,
) {
  const time = frameIndex / totalFrames;
  const { motion } = profile;
  const { width, height } = settings;
  const speedMultiplier = 1 + motion.frequency * 1.8;
  const turbulence = motion.turbulence * 2.4;

  field.particles.forEach((particle) => {
    const phase =
      time * speedMultiplier +
      particle.depth * 0.5 +
      particle.noise * 1.2 +
      Math.sin(time * (2 + motion.frequency) + particle.id) * turbulence * 0.2;

    const curveStrength = motion.amplitude * 0.45;
    const offsetX =
      Math.sin(phase * Math.PI * 2 * 0.5) * curveStrength +
      Math.sin(phase * 4) * motion.turbulence * 0.12 +
      particle.drift * 0.6;
    const offsetY =
      Math.cos(phase * Math.PI * 2 * 0.5) * curveStrength * 0.82 +
      Math.sin(phase * 5) * motion.turbulence * 0.12 +
      particle.drift * 0.4;

    const x = (particle.baseX + offsetX) * width;
    const y = (particle.baseY + offsetY) * height;
    const radius = particle.radius * (0.5 + particle.depth * 0.5);

    ctx.beginPath();
    ctx.fillStyle = particle.hue;
    ctx.globalAlpha = 0.25 + particle.depth * 0.75;
    const blur = 8 + particle.depth * 18 + motion.turbulence * 8;
    ctx.shadowColor = `${particle.hue}80`;
    ctx.shadowBlur = blur;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function renderLightPass(
  ctx: CanvasRenderingContext2D,
  settings: GenerationSettings,
  profile: SceneProfile,
  frameIndex: number,
  totalFrames: number,
) {
  const progress = frameIndex / totalFrames;
  const shimmer = Math.sin(progress * Math.PI * 2 * profile.motion.frequency);
  const alpha = 0.16 + profile.motion.amplitude * 0.22;
  const gradient = ctx.createRadialGradient(
    settings.width * 0.5,
    settings.height * 0.35,
    settings.width * 0.08,
    settings.width * 0.5,
    settings.height * 0.5,
    settings.width * 0.6,
  );
  gradient.addColorStop(0, `${profile.palette.accents[0]}${Math.round(150 + shimmer * 50).toString(16)}`);
  gradient.addColorStop(1, "#ffffff00");

  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = alpha;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, settings.width, settings.height);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
}

export function useVideoGenerator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeRecorder = useRef<MediaRecorder | null>(null);
  const cleanupUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (cleanupUrl.current) {
        URL.revokeObjectURL(cleanupUrl.current);
      }
      const recorder = activeRecorder.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
    };
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setError(null);
    setVideoUrl(null);
  }, []);

  const generate = useCallback(
    async (settings: GenerationSettings, profile: SceneProfile) => {
      if (typeof window === "undefined") {
        throw new Error("Video generation is only supported in the browser.");
      }
      if (!canvasRef.current) {
        throw new Error("Canvas element is not attached.");
      }
      if (!("MediaRecorder" in window)) {
        throw new Error("MediaRecorder API is not supported in this browser.");
      }

      reset();
      setStatus("rendering");

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) {
        throw new Error("Unable to create 2D rendering context.");
      }

      canvas.width = settings.width;
      canvas.height = settings.height;

      const flowField = createFlowField(settings, profile);
      const stream = canvas.captureStream(settings.fps);
      const recorder = new MediaRecorder(stream, { mimeType: DEFAULT_MIME });
      activeRecorder.current = recorder;

      const chunks: Blob[] = [];

      const stopping = new Promise<{ url: string; blob: Blob }>((resolve, reject) => {
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        recorder.onerror = (event) => {
          setStatus("error");
          setError(event.error.name ?? "Recording error");
          reject(event.error);
        };
        recorder.onstop = () => {
          setStatus("encoding");
          setProgress(0.94);
          const blob = new Blob(chunks, { type: DEFAULT_MIME });
          const url = URL.createObjectURL(blob);
          cleanupUrl.current = url;
          setVideoUrl(url);
          setProgress(1);
          setStatus("complete");
          resolve({ url, blob });
        };
      });

      recorder.start();
      const totalFrames = Math.floor(settings.duration * settings.fps);
      let frameIndex = 0;

      const renderFrame = () => {
        drawBackground(ctx, settings.width, settings.height, flowField, frameIndex / totalFrames);
        renderParticles(ctx, settings, profile, flowField, frameIndex, totalFrames);
        renderLightPass(ctx, settings, profile, frameIndex, totalFrames);
      };

      const loop = () => {
        renderFrame();
        frameIndex += 1;
        const normalized = Math.min(frameIndex / totalFrames, 1);
        setProgress(normalized * 0.92 + 0.05);

        if (frameIndex < totalFrames) {
          requestAnimationFrame(loop);
        } else {
          recorder.stop();
        }
      };

      requestAnimationFrame(loop);

      const result = await stopping;
      return result;
    },
    [reset],
  );

  const loadFromHistory = useCallback((url: string) => {
    setStatus("complete");
    setError(null);
    setProgress(1);
    setVideoUrl(url);
    cleanupUrl.current = url;
  }, []);

  return {
    canvasRef,
    generate,
    status,
    progress,
    videoUrl,
    error,
    reset,
    loadFromHistory,
  };
}
