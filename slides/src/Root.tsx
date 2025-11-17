import { registerRoot, Composition, getInputProps } from "remotion";
import { LessonVideo } from "./Video";
import type { LessonDefinition } from "./types";
import { buildLessonTimeline } from "./utils/timeline";
import defaultLessonData from "../data/lessons/sample_magnetism_01.json";

const RemotionRoot: React.FC = () => {
  const input = getInputProps<{ lesson?: LessonDefinition }>();
  const lesson = input.lesson ?? (defaultLessonData as LessonDefinition);
  const sanitizedId = lesson.lessonId
    .replace(/[^a-zA-Z0-9\u3000-\u9FFF-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const compositionId = sanitizedId.length > 0 ? sanitizedId : "lesson";
  const timeline = buildLessonTimeline(lesson, 30);

  return (
    <Composition
      id={compositionId}
      component={LessonVideo}
      durationInFrames={Math.max(1, timeline.totalDurationFrames)}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ lesson }}
    />
  );
};

registerRoot(RemotionRoot);

