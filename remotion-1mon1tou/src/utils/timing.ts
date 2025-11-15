// src/utils/timing.ts
import {LessonDef, SlideDef, LineDef, ImageDef} from "../types";

export const FPS = 30;

export const secondsToFrames = (seconds: number, fps: number): number =>
  Math.max(1, Math.round(seconds * fps));

export const framesToSeconds = (frames: number, fps: number): number =>
  Number((frames / fps).toFixed(2));

// 各スライド内での行ごとの開始・終了時間（秒）
export type LocalLineTiming = {
  line: LineDef;
  startSec: number;
  endSec: number;
};

export type SlideTimingInfo = {
  slide: SlideDef;
  durationSec: number;
  localLineTimings: LocalLineTiming[];
};

export type LessonTimingInfo = {
  slideTimings: SlideTimingInfo[];
  totalDurationSec: number;
  totalDurationFrames: number;
};

// スライド1枚のローカルタイミング計算
export const computeSlideTiming = (
  slide: SlideDef,
  timingDefaults: LessonDef["timingDefaults"]
): SlideTimingInfo => {
  const pauseBetweenLinesDefault =
    slide.timingOverride?.pauseBetweenLinesSeconds ??
    timingDefaults.pauseBetweenLinesSeconds;

  let current = 0;
  const localLineTimings: LocalLineTiming[] = [];

  slide.lines.forEach((line, index) => {
    const startSec = current;
    const endSec = startSec + line.audioDurationSeconds;
    localLineTimings.push({line, startSec, endSec});
    current = endSec;

    const isLast = index === slide.lines.length - 1;
    if (!isLast) {
      const pauseAfter =
        line.pauseAfterSeconds ?? pauseBetweenLinesDefault;
      current += pauseAfter;
    }
  });

  // 最後の行の後のポーズ
  const lastLine = slide.lines[slide.lines.length - 1];
  const pauseAfterLastLine =
    slide.timingOverride?.pauseAfterLastLineSeconds ??
    lastLine.pauseAfterSeconds ??
    timingDefaults.pauseBetweenSlidesSeconds;

  const durationSec = current + pauseAfterLastLine;

  return {
    slide,
    durationSec,
    localLineTimings,
  };
};

// レッスン全体のタイミング計算
export const computeLessonTiming = (lesson: LessonDef): LessonTimingInfo => {
  const slideTimings = lesson.slides.map((slide) =>
    computeSlideTiming(slide, lesson.timingDefaults)
  );
  const totalDurationSec = slideTimings.reduce(
    (sum, s) => sum + s.durationSec,
    0
  );
  const totalDurationFrames = Math.ceil(totalDurationSec * FPS);

  return {
    slideTimings,
    totalDurationSec,
    totalDurationFrames,
  };
};

// 画像の開始・終了秒をスライド内ローカル時間として計算
export const resolveImageTiming = (
  image: ImageDef,
  slideTiming: SlideTimingInfo
): {startSec: number; endSec: number} => {
  const {timing, hideAt} = image;

  const lineTime = (lineNumber: number) => {
    const lt = slideTiming.localLineTimings.find(
      (lt) => lt.line.lineNumber === lineNumber
    );
    if (!lt) {
      throw new Error(
        `lineNumber ${lineNumber} not found in slide ${slideTiming.slide.slideId}`
      );
    }
    return lt;
  };

  // start
  let startSec = 0;
  if (timing.mode === "with-line") {
    const lt = lineTime(timing.lineNumber);
    const offset = timing.offsetSeconds ?? 0;
    startSec = lt.startSec + offset;
  } else if (timing.mode === "absolute") {
    startSec = timing.timeFromSlideStartSeconds;
  } else if (timing.mode === "after-line") {
    const lt = lineTime(timing.lineNumber);
    const offset = timing.offsetSeconds ?? 0;
    startSec = lt.endSec + offset;
  }

  // end（デフォルトはスライド終了まで）
  let endSec = slideTiming.durationSec;
  if (hideAt) {
    if (hideAt.mode === "absolute") {
      endSec = hideAt.timeFromSlideStartSeconds;
    } else if (hideAt.mode === "after-line") {
      const lt = lineTime(hideAt.lineNumber);
      const offset = hideAt.offsetSeconds ?? 0;
      endSec = lt.endSec + offset;
    }
  }

  if (endSec < startSec) {
    endSec = startSec + 0.1; // 最低0.1秒は表示
  }

  return {startSec, endSec};
};
