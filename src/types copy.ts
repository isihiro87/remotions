// src/types.ts

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
  
  export type ImageTimingMode =
    | "with-line"
    | "absolute"
    | "after-line";
  
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
  