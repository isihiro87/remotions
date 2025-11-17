import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import type { LessonDefinition } from "./types";
import { buildLessonTimeline } from "./utils/timeline";
import { SlideRenderer } from "./layouts/SlideRenderer";

interface LessonVideoProps {
  lesson: LessonDefinition;
}

export const LessonVideo: React.FC<LessonVideoProps> = ({ lesson }) => {
  const { fps } = useVideoConfig();
  const timeline = buildLessonTimeline(lesson, fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#F5F7FA" }}>
      {timeline.slides.map((slideTimeline) => (
        <Sequence
          key={slideTimeline.slide.slideId}
          from={slideTimeline.startFrame}
          durationInFrames={slideTimeline.endFrame - slideTimeline.startFrame}
        >
          <SlideRenderer timeline={slideTimeline} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const LessonComposition: React.FC<{ lesson: LessonDefinition }> = ({
  lesson,
}) => {
  const compositions = buildLessonTimeline(lesson, 30);

  return (
    <Composition
      id={lesson.lessonId}
      component={LessonVideo}
      durationInFrames={Math.max(1, compositions.totalDurationFrames)}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ lesson }}
    />
  );
};

