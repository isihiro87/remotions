import {
  DEFAULT_CHARACTER,
  DEFAULT_DURATIONS,
  DEFAULT_LAYOUT,
  DEFAULT_THEME,
} from "./constants";
import type {
  CharacterConfig,
  DurationConfig,
  LayoutSettings,
  PanelTheme,
  QAScript,
  Storyboard,
} from "../types";
import { secondsToFrames } from "../utils/timing";

export const deriveLayout = (script?: QAScript): LayoutSettings => ({
  ...DEFAULT_LAYOUT,
  ...(script?.layout ?? {}),
});

export const deriveDurations = (script?: QAScript): Required<DurationConfig> => ({
  introSeconds: script?.durations?.introSeconds ?? DEFAULT_DURATIONS.introSeconds,
  outroSeconds: script?.durations?.outroSeconds ?? DEFAULT_DURATIONS.outroSeconds,
  defaultQuestionSeconds:
    script?.durations?.defaultQuestionSeconds ?? DEFAULT_DURATIONS.defaultQuestionSeconds,
  defaultAnswerSeconds:
    script?.durations?.defaultAnswerSeconds ?? DEFAULT_DURATIONS.defaultAnswerSeconds,
  defaultTransitionSeconds:
    script?.durations?.defaultTransitionSeconds ??
    DEFAULT_DURATIONS.defaultTransitionSeconds,
});

export const deriveTheme = (script?: QAScript): PanelTheme => ({
  ...DEFAULT_THEME,
  ...(script?.theme ?? {}),
});

export const deriveCharacter = (script?: QAScript): CharacterConfig => ({
  ...DEFAULT_CHARACTER,
  ...(script?.character ?? {}),
});

export const buildStoryboard = (script: QAScript): Storyboard => {
  const layout = deriveLayout(script);
  const durations = deriveDurations(script);
  const fps = layout.fps;

  let currentFrame = 0;
  const segments: Storyboard["segments"] = [];

  script.items.forEach((item, index) => {
    const questionSeconds =
      item.questionSeconds ?? durations.defaultQuestionSeconds;
    const answerSeconds =
      item.answerSeconds ?? durations.defaultAnswerSeconds;

    const questionFrames = secondsToFrames(questionSeconds, fps);
    const answerFrames = secondsToFrames(answerSeconds, fps);
    const totalFrames = questionFrames + answerFrames;

    segments.push({
      type: "qa",
      from: currentFrame,
      durationInFrames: totalFrames,
      itemIndex: index,
      itemId: item.id,
      questionFrames,
      answerFrames,
    });

    currentFrame += totalFrames;
  });

  return {
    fps,
    width: layout.width,
    height: layout.height,
    totalDurationInFrames: Math.max(1, currentFrame),
    segments,
    durations,
    layout,
  };
};

