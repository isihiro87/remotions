// src/character/ScienceTeacherOverlay.tsx
import React, {useMemo} from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {FPS} from "../utils/timing";
import {LESSON_TIMING} from "../lessonData";

type MouthState = "closed" | "small" | "medium" | "wide";
type EyeState = "open" | "intermediate" | "close";

const smoothVolume = (volumes: number[], window = 3): number[] => {
  const result: number[] = [];

  for (let i = 0; i < volumes.length; i++) {
    let sum = 0;
    let count = 0;

    for (let j = i - window; j <= i + window; j++) {
      if (j >= 0 && j < volumes.length) {
        sum += volumes[j];
        count++;
      }
    }
    result.push(count === 0 ? 0 : sum / count);
  }

  return result;
};

const generateMouthStates = (
  volumeArray: number[],
  baseThreshold = 0.005,
  framesPerCycle = 18
): MouthState[] => {
  const smoothed = smoothVolume(volumeArray, 1);
  const result: MouthState[] = [];

  for (let f = 0; f < smoothed.length; f++) {
    const v = smoothed[f];
    if (v < baseThreshold) {
      result.push("closed");
      continue;
    }

    const wave =
      0.5 +
      0.5 *
        Math.sin((Math.PI * 2 * f) / framesPerCycle + Math.sin(f * 0.24) * 0.8);
    const perturbed = v * (0.7 + 0.3 * wave);

    if (perturbed < baseThreshold * 1.6) {
      result.push("small");
    } else if (perturbed < baseThreshold * 3.2) {
      result.push("medium");
    } else {
      result.push("wide");
    }
  }

  return result;
};

const blinkPattern: EyeState[] = [
  "open",
  "intermediate",
  "close",
  "close",
  "intermediate",
  "open",
  "open",
];

const generateEyeStates = (
  totalFrames: number,
  fps: number,
  random: () => number
): EyeState[] => {
  const states: EyeState[] = Array(totalFrames).fill("open");
  let cursor = 0;

  while (cursor < totalFrames) {
    const waitSec = 2.4 + random() * 2.6;
    const waitFrames = Math.round(waitSec * fps);
    const blinkStart = cursor + waitFrames;

    if (blinkStart >= totalFrames) {
      break;
    }

    for (let i = 0; i < blinkPattern.length; i++) {
      const idx = blinkStart + i;
      if (idx >= totalFrames) {
        break;
      }
      states[idx] = blinkPattern[i];
    }

    const recoveryPadding = Math.round(random() * fps * 0.15);
    cursor = blinkStart + blinkPattern.length + recoveryPadding;
  }

  return states;
};

const hashString = (value: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const mulberry32 = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const createSyntheticVolumeArray = (): number[] => {
  const totalFrames = LESSON_TIMING.totalDurationFrames;
  const volumes = Array(totalFrames).fill(0);

  let slideStartFrame = 0;

  LESSON_TIMING.slideTimings.forEach((slideTiming) => {
    slideTiming.localLineTimings.forEach((lt) => {
      const lineSeed = hashString(
        `${slideTiming.slide.slideId}-${lt.line.lineNumber}`
      );
      const rand = mulberry32(lineSeed);

      const startFrame =
        slideStartFrame + Math.round(lt.startSec * FPS);
      const endFrame =
        slideStartFrame + Math.round(lt.endSec * FPS);
      const durationFrames = Math.max(1, endFrame - startFrame);

      const textFactor = Math.min(1, lt.line.text.length / 35);
      const highlightFactor = Math.min(
        1,
        (lt.line.highlightWords?.length ?? 0) / 4
      );

      const baseEnergy = 0.028 + 0.02 * textFactor;
      const emphasis = 0.015 * highlightFactor + rand() * 0.018;
      const totalEnergy = baseEnergy + emphasis;

      const phase = rand() * Math.PI * 2;
      const vibratoFreq = 0.4 + rand() * 0.35;
      const jitterFreq = 1.2 + rand() * 1.0;

      for (let i = 0; i < durationFrames; i++) {
        const frameIndex = startFrame + i;
        if (frameIndex >= totalFrames) {
          break;
        }

        const progress = i / durationFrames;
        const envelope = Math.pow(Math.sin(Math.PI * progress), 1.08);
        const vibrato = 0.52 + 0.48 * Math.sin(i * vibratoFreq + phase);
        const jitter =
          0.6 +
          0.4 * Math.abs(Math.sin(i * jitterFreq + phase * 0.7));

        const volume = totalEnergy * envelope * vibrato * jitter;
        volumes[frameIndex] = Math.max(volumes[frameIndex], volume);
      }
    });

    slideStartFrame += Math.ceil(slideTiming.durationSec * FPS);
  });

  return volumes;
};

const selectExpressionImage = (
  frame: number,
  eyeState: EyeState,
  mouthState: MouthState
): string => {
  const mouthIsClosed = mouthState === "closed";
  const mouthIsWide = mouthState === "wide";

  const loopToggle = (frame % 6) < 3;

  if (eyeState === "close") {
    return mouthIsClosed
      ? "eyes-closed_mouth-closed"
      : "eyes-closed_mouth-open";
  }

  if (eyeState === "intermediate") {
    return mouthIsClosed
      ? "eyes-half_mouth-closed"
      : "eyes-half_mouth-open";
  }

  if (mouthIsClosed) {
    return "eyes-open_mouth-closed";
  }

  if (mouthIsWide) {
    return loopToggle
      ? "eyes-open_mouth-open"
      : "eyes-open_mouth-closed";
  }

  return loopToggle
    ? "eyes-open_mouth-open"
    : "eyes-open_mouth-closed";
};

export const ScienceTeacherOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  const motionProfile = useMemo(() => {
    const volumeArray = createSyntheticVolumeArray();
    const mouthStates = generateMouthStates(volumeArray);
    const eyeRandom = mulberry32(hashString("science-teacher-eye"));
    const eyeStates = generateEyeStates(
      LESSON_TIMING.totalDurationFrames,
      FPS,
      eyeRandom
    );

    return {mouthStates, eyeStates};
  }, []);

  const mouthStates = motionProfile.mouthStates;
  const eyeStates = motionProfile.eyeStates;

  const safeMouthIndex = Math.min(
    frame,
    mouthStates.length - 1
  );
  const safeEyeIndex = Math.min(frame, eyeStates.length - 1);

  const mouthState = mouthStates[safeMouthIndex];
  const eyeState = eyeStates[safeEyeIndex];

  const expressionKey = selectExpressionImage(
    frame,
    eyeState,
    mouthState
  );
  const imageSrc = staticFile(`science_teacher/${expressionKey}.png`);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: "26%",
          maxWidth: 400,
          minWidth: 220,
        }}
      >
        <Img
          src={imageSrc}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            filter: "drop-shadow(0px 12px 24px rgba(0,0,0,0.2))",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

