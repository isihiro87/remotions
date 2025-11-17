import type {
  LessonDefinition,
  LessonTimeline,
  LineTiming,
  SlideDefinition,
  SlideLine,
  SlideTimeline,
  ImageTimingComputed,
} from "../types";
import { toFrames } from "./time";

export const buildLessonTimeline = (
  lesson: LessonDefinition,
  fps: number
): LessonTimeline => {
  let cursor = 0;
  const slideTimelines: SlideTimeline[] = [];

  const slidePauseDefault = lesson.timingDefaults.pauseBetweenSlidesSeconds;

  lesson.slides.forEach((slide) => {
    const slideStart = cursor;
    const lineTimings: LineTiming[] = [];

    const pauseBetweenLines =
      slide.timingOverride?.pauseBetweenLinesSeconds ??
      lesson.timingDefaults.pauseBetweenLinesSeconds;

    const pauseAfterLastLineSeconds =
      slide.timingOverride?.pauseAfterLastLineSeconds ?? slidePauseDefault;

    slide.lines.forEach((line, index) => {
      const lineStart = cursor;
      const lineDurationSeconds =
        line.audioDurationSeconds +
        (line.pauseAfterSeconds ??
          (index === slide.lines.length - 1
            ? pauseAfterLastLineSeconds
            : pauseBetweenLines));

      const lineDurationFrames = Math.max(
        1,
        toFrames(lineDurationSeconds, fps)
      );

      const lineEnd = lineStart + lineDurationFrames;

      lineTimings.push({
        line,
        startFrame: lineStart,
        endFrame: lineEnd,
        slideRelativeStartFrame: lineStart - slideStart,
        slideRelativeEndFrame: lineEnd - slideStart,
      });

      cursor = lineEnd;
    });

    const slideEnd = cursor;

    slideTimelines.push({
      slide,
      startFrame: slideStart,
      endFrame: slideEnd,
      lines: lineTimings,
      images: computeImageTimings(slide, lineTimings, fps),
    });
  });

  return {
    lesson,
    slides: slideTimelines,
    totalDurationFrames:
      slideTimelines.length > 0
        ? slideTimelines[slideTimelines.length - 1].endFrame
        : 0,
  };
};

const computeImageTimings = (
  slide: SlideDefinition,
  lineTimings: LineTiming[],
  fps: number
): ImageTimingComputed[] => {
  if (!slide.images) {
    return [];
  }

  return slide.images.map((image) => {
    const slideStart = lineTimings[0]?.startFrame ?? 0;
    const slideEnd = lineTimings[lineTimings.length - 1]?.endFrame ?? slideStart;

    const resolveLineFrame = (lineNumber?: number) => {
      if (lineNumber == null) {
        return lineTimings[0]?.startFrame ?? slideStart;
      }
      const target = lineTimings.find(
        ({ line }) => line.lineNumber === lineNumber
      );
      return target?.startFrame ?? slideStart;
    };

    const resolveLineAudioEndFrame = (line: SlideLine | undefined) => {
      if (!line) {
        return slideStart;
      }
      const lineTiming = lineTimings.find(
        ({ line: l }) => l.lineNumber === line.lineNumber
      );
      if (!lineTiming) {
        return slideStart;
      }

      const audioEndSeconds = line.audioDurationSeconds;
      return (
        lineTiming.startFrame + Math.max(1, toFrames(audioEndSeconds, fps))
      );
    };

    const timing = image.timing;
    let imageStartFrame = slideStart;

    switch (timing.mode) {
      case "with-line": {
        const lineFrame = resolveLineFrame(timing.lineNumber);
        imageStartFrame =
          lineFrame + toFrames(timing.offsetSeconds ?? 0, fps);
        break;
      }
      case "after-line": {
        const targetLine = lineTimings.find(
          ({ line }) => line.lineNumber === timing.lineNumber
        )?.line;

        const baseFrame = resolveLineAudioEndFrame(targetLine);
        imageStartFrame =
          baseFrame + toFrames(timing.offsetSeconds ?? 0, fps);
        break;
      }
      case "absolute": {
        imageStartFrame =
          slideStart +
          toFrames(timing.timeFromSlideStartSeconds ?? 0, fps);
        break;
      }
      default:
        imageStartFrame = slideStart;
    }

    const hideAt = image.hideAt;
    let imageEndFrame = slideEnd;

    if (hideAt) {
      switch (hideAt.mode) {
        case "with-line": {
          const baseFrame = resolveLineFrame(hideAt.lineNumber);
          imageEndFrame = baseFrame + toFrames(hideAt.offsetSeconds ?? 0, fps);
          break;
        }
        case "after-line": {
          const targetLine = lineTimings.find(
            ({ line }) => line.lineNumber === hideAt.lineNumber
          )?.line;

          const baseFrame = resolveLineAudioEndFrame(targetLine);
          imageEndFrame = baseFrame + toFrames(hideAt.offsetSeconds ?? 0, fps);
          break;
        }
        case "absolute": {
          imageEndFrame =
            slideStart +
            toFrames(hideAt.timeFromSlideStartSeconds ?? 0, fps);
          break;
        }
        default:
          imageEndFrame = slideEnd;
      }
    }

    return {
      image,
      startFrame: Math.min(imageStartFrame, slideEnd),
      endFrame: Math.max(imageStartFrame + 1, imageEndFrame),
    };
  });
};

