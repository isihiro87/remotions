import React, {useMemo} from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type {
  CharacterConfig,
  PanelTheme,
  QAScript,
  Storyboard,
} from "../types";

type MouthState = "closed" | "small" | "medium" | "wide";
type EyeState = "open" | "intermediate" | "close";

type Props = {
  character: CharacterConfig;
  theme: PanelTheme;
  storyboard: Storyboard;
  script: QAScript;
};

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
  framesPerCycle = 18,
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
  random: () => number,
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

const createSyntheticVolumeArray = (
  script: QAScript,
  storyboard: Storyboard,
): number[] => {
  const totalFrames = storyboard.totalDurationInFrames;
  const volumes = Array(totalFrames).fill(0);

  script.items.forEach((item, index) => {
    const segment = storyboard.segments.find(
      (seg) => seg.type === "qa" && seg.itemIndex === index,
    );
    if (!segment) {
      return;
    }

    const seed = hashString(`qa-${item.id}`);
    const rand = mulberry32(seed);

    const phases: Array<{duration: number; text: string}> = [
      {duration: segment.questionFrames, text: item.question},
      {duration: segment.answerFrames, text: item.answer ?? ""},
    ];

    let phaseStartFrame = segment.from;

    phases.forEach(({duration, text}) => {
      if (duration <= 0) {
        return;
      }

      const textFactor = Math.min(1, text.length / 35);
      const baseEnergy = 0.028 + 0.02 * textFactor;
      const emphasis = rand() * 0.018;
      const totalEnergy = baseEnergy + emphasis;

      const phase = rand() * Math.PI * 2;
      const vibratoFreq = 0.4 + rand() * 0.35;
      const jitterFreq = 1.2 + rand() * 1.0;

      for (let i = 0; i < duration; i++) {
        const frameIndex = phaseStartFrame + i;
        if (frameIndex >= totalFrames) {
          break;
        }

        const progress = i / Math.max(1, duration);
        const envelope = Math.pow(Math.sin(Math.PI * progress), 1.08);
        const vibrato = 0.52 + 0.48 * Math.sin(i * vibratoFreq + phase);
        const jitter =
          0.6 +
          0.4 * Math.abs(Math.sin(i * jitterFreq + phase * 0.7));

        const volume = totalEnergy * envelope * vibrato * jitter;
        volumes[frameIndex] = Math.max(volumes[frameIndex], volume);
      }

      phaseStartFrame += duration;
    });
  });

  return volumes;
};

const selectExpressionImage = (
  frame: number,
  eyeState: EyeState,
  mouthState: MouthState,
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

export const CharacterOverlay: React.FC<Props> = ({
  character,
  theme,
  storyboard,
  script,
}) => {
  const frame = useCurrentFrame();
  const fps = storyboard.fps;

  const motionProfile = useMemo(() => {
    const volumeArray = createSyntheticVolumeArray(script, storyboard);
    const mouthStates = generateMouthStates(volumeArray);
    const eyeRandom = mulberry32(hashString("qa-character-eye"));
    const eyeStates = generateEyeStates(
      storyboard.totalDurationInFrames,
      fps,
      eyeRandom,
    );

    return {mouthStates, eyeStates};
  }, [fps, script, storyboard]);

  const mouthStates = motionProfile.mouthStates;
  const eyeStates = motionProfile.eyeStates;

  const safeMouthIndex = Math.min(frame, mouthStates.length - 1);
  const safeEyeIndex = Math.min(frame, eyeStates.length - 1);

  const mouthState = mouthStates[safeMouthIndex];
  const eyeState = eyeStates[safeEyeIndex];

  const expressionKey = selectExpressionImage(
    frame,
    eyeState,
    mouthState,
  );
  const expressionSrc = character.imageSrc
    ? staticFile(character.imageSrc.replace(/^\//, ""))
    : staticFile(`images/${expressionKey}.png`);

  const width = character.width ?? 320;
  const height = character.height ?? 640;
  const offsetX = character.offsetX ?? 0;
  const offsetY = character.offsetY ?? 0;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {character.displayName ? (
        <div
          style={{
            position: "absolute",
            left: offsetX + 24,
            bottom: offsetY + height + 60,
            padding: "6px 12px",
            borderRadius: 999,
            fontSize: 18,
            fontWeight: 600,
            color: "#334155",
            backgroundColor: "#ffffff",
            border: `1px solid ${theme.accentColor ?? "#e2e8f0"}`,
          }}
        >
          {character.displayName}
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: offsetX,
          bottom: offsetY,
          width: width * 1.15,
          maxWidth: 420,
          minWidth: 220,
        }}
      >
        <Img
          src={expressionSrc}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            filter: "drop-shadow(0px 12px 24px rgba(0,0,0,0.2))",
            transform: "scaleX(-1)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

