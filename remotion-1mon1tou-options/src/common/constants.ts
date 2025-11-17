import type {
  CharacterConfig,
  DurationConfig,
  LayoutSettings,
  PanelTheme,
} from "../types";

export const DEFAULT_LAYOUT: LayoutSettings = {
  width: 1080,
  height: 1920,
  fps: 30,
  paddingX: 96,
  paddingY: 120,
};

export const DEFAULT_DURATIONS: DurationConfig = {
  introSeconds: 2,
  outroSeconds: 1.8,
  defaultQuestionSeconds: 4,
  defaultAnswerSeconds: 4,
  defaultTransitionSeconds: 0.3,
  defaultAnswerDelaySeconds: 0,
};

export const DEFAULT_THEME: PanelTheme = {
  backgroundColors: ["#f6f8fb", "#f6f8fb"],
  questionPanelColor: "#111827",
  answerPanelColor: "#0f172a",
  textColor: "#0f172a",
  accentColor: "#2563eb",
  overlayColor: undefined,
};

export const DEFAULT_CHARACTER: CharacterConfig = {
  displayName: "",
  imageSrc: undefined,
  width: undefined,
  height: undefined,
  offsetX: 0,
  offsetY: 0,
};

