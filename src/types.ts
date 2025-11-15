// src/types.ts

// ------------------------------------------------------------------
// 一問一答コンテンツ用の型定義
// ------------------------------------------------------------------
export type DurationConfig = {
  introSeconds: number;
  outroSeconds: number;
  defaultQuestionSeconds: number;
  defaultAnswerSeconds: number;
  defaultTransitionSeconds: number;
  defaultAnswerDelaySeconds: number;
};

export type LayoutSettings = {
  width: number;
  height: number;
  fps: number;
  paddingX: number;
  paddingY: number;
};

export type PanelTheme = {
  backgroundColors: string[];
  questionPanelColor: string;
  answerPanelColor: string;
  textColor: string;
  accentColor: string;
  overlayColor?: string;
};

export type CharacterConfig = {
  displayName?: string;
  imageSrc?: string;
  width?: number;
  height?: number;
  offsetX?: number;
  offsetY?: number;
};

export type BackgroundMusicConfig = {
  src: string;
  volume?: number;
  startFromFrame?: number;
  loop?: boolean;
};

export type QAItemImage = {
  src: string;
  alt?: string;
  placement?: "top" | "bottom" | "left" | "right";
  size?: "small" | "medium" | "large";
  widthPx?: number;
  heightPx?: number;
  offsetX?: number;
  offsetY?: number;
};

export type QAChoiceOption = {
  id?: string;
  label?: string;
  text: string;
  isCorrect?: boolean;
};

export type QAScriptItem = {
  id: string;
  question: string;
  answer?: string;
  questionSeconds?: number;
  answerSeconds?: number;
  answerDelaySeconds?: number;
  transitionSeconds?: number;
  questionVoice?: string;
  answerVoice?: string;
  questionFontSizePx?: number;
  answerFontSizePx?: number;
  image?: QAItemImage;
  choices?: QAChoiceOption[];
};

export type QAScript = {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  outputFileBaseName?: string;
  layout?: Partial<LayoutSettings>;
  durations?: Partial<DurationConfig>;
  theme?: Partial<PanelTheme>;
  character?: Partial<CharacterConfig>;
  backgroundMusic?: BackgroundMusicConfig;
  items: QAScriptItem[];
};

export type StoryboardSegment = {
  type: "qa";
  from: number;
  durationInFrames: number;
  itemIndex: number;
  itemId: string;
  questionFrames: number;
  answerDelayFrames: number;
  answerFrames: number;
};

export type Storyboard = {
  fps: number;
  width: number;
  height: number;
  totalDurationInFrames: number;
  segments: StoryboardSegment[];
  durations: Required<DurationConfig>;
  layout: LayoutSettings;
};

// ------------------------------------------------------------------
// レッスンスライド（Science Teacher overlay 用）型定義
// ------------------------------------------------------------------
export type TimingDefaults = {
  pauseBetweenLinesSeconds: number;
  pauseBetweenSlidesSeconds: number;
};

export type SlideTimingOverride = {
  pauseBetweenLinesSeconds?: number;
  pauseAfterLastLineSeconds?: number;
};

export type FontSizePreset = "small" | "medium" | "large";

export type LineDef = {
  lineNumber: number;
  text: string;
  slide_content?: string;
  highlightWords?: string[];
  audioFile: string;
  audioDurationSeconds: number;
  pauseAfterSeconds?: number;
  fontSizePreset?: FontSizePreset;
  customFontSizePx?: number;
};

export type ImageTimingMode = "with-line" | "absolute" | "after-line";

export type ImageTimingSpec =
  | {
      mode: "with-line";
      lineNumber: number;
      offsetSeconds?: number;
    }
  | {
      mode: "absolute";
      timeFromSlideStartSeconds: number;
    }
  | {
      mode: "after-line";
      lineNumber: number;
      offsetSeconds?: number;
    };

export type ImageHideTimingSpec =
  | {
      mode: "after-line";
      lineNumber: number;
      offsetSeconds?: number;
    }
  | {
      mode: "absolute";
      timeFromSlideStartSeconds: number;
    };

export type ImageDef = {
  imageId: string;
  imagePath: string;
  slot: "RIGHT" | "LEFT" | "FULL" | "TOP" | "BOTTOM";
  size: "small" | "medium" | "large";
  timing: ImageTimingSpec;
  hideAt?: ImageHideTimingSpec;
};

export type LayoutType =
  | "TITLE_ONLY"
  | "TEXT_ONLY"
  | "IMAGE_RIGHT_TEXT_LEFT"
  | "IMAGE_LEFT_TEXT_RIGHT"
  | "IMAGE_FULL"
  | "SUMMARY";

export type SlideDef = {
  slideId: string;
  layoutType: LayoutType;
  title?: string;
  subtitle?: string;
  headline?: string;
  caption?: string;
  timingOverride?: SlideTimingOverride;
  textSizePreset?: FontSizePreset;
  lines: LineDef[];
  images?: ImageDef[];
};

export type LessonDef = {
  lessonId: string;
  title: string;
  timingDefaults: TimingDefaults;
  slides: SlideDef[];
};
