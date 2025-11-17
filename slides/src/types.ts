export type LayoutType =
  | "TITLE_ONLY"
  | "TEXT_ONLY"
  | "IMAGE_RIGHT_TEXT_LEFT"
  | "IMAGE_LEFT_TEXT_RIGHT"
  | "IMAGE_FULL"
  | "SUMMARY";

export interface LessonTimingDefaults {
  pauseBetweenLinesSeconds: number;
  pauseBetweenSlidesSeconds: number;
}

export type TimingMode = "with-line" | "absolute" | "after-line";

export interface ImageTiming {
  mode: TimingMode;
  lineNumber?: number;
  offsetSeconds?: number;
  timeFromSlideStartSeconds?: number;
}

export interface ImageHideAt {
  mode: "with-line" | "after-line" | "absolute";
  lineNumber?: number;
  offsetSeconds?: number;
  timeFromSlideStartSeconds?: number;
}

export interface SlideImage {
  imageId: string;
  imagePath: string;
  slot: "LEFT" | "RIGHT" | "FULL";
  size: "small" | "medium" | "large" | "fill";
  timing: ImageTiming;
  hideAt?: ImageHideAt;
  alt?: string;
}

export interface SlideLine {
  lineNumber: number;
  text: string;
  highlightWords?: string[];
  audioFile: string;
  audioDurationSeconds: number;
  pauseAfterSeconds?: number;
}

export interface SlideTimingOverride {
  pauseBetweenLinesSeconds?: number;
  pauseAfterLastLineSeconds?: number;
}

export interface SlideDefinition {
  slideId: string;
  layoutType: LayoutType;
  title?: string;
  subtitle?: string;
  lines: SlideLine[];
  images?: SlideImage[];
  timingOverride?: SlideTimingOverride;
}

export interface LessonDefinition {
  lessonId: string;
  title: string;
  timingDefaults: LessonTimingDefaults;
  slides: SlideDefinition[];
}

export interface LineTiming {
  line: SlideLine;
  startFrame: number;
  endFrame: number;
  slideRelativeStartFrame: number;
  slideRelativeEndFrame: number;
}

export interface ImageTimingComputed {
  image: SlideImage;
  startFrame: number;
  endFrame: number;
}

export interface SlideTimeline {
  slide: SlideDefinition;
  startFrame: number;
  endFrame: number;
  lines: LineTiming[];
  images: ImageTimingComputed[];
}

export interface LessonTimeline {
  lesson: LessonDefinition;
  slides: SlideTimeline[];
  totalDurationFrames: number;
}

