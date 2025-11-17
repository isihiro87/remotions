import { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { splitHighlightText } from "../utils/text";

interface HighlightedTextProps {
  text: string;
  highlightWords?: string[];
  delayFrames?: number;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  highlightWords,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const segments = useMemo(
    () => splitHighlightText(text, highlightWords),
    [text, highlightWords]
  );

  return (
    <span>
      {segments.map((segment, index) => {
        const segmentDelay = delayFrames + index * Math.round(0.2 * fps);
        const opacity = interpolate(
          frame,
          [segmentDelay, segmentDelay + Math.round(12)],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const translateY = interpolate(
          frame,
          [segmentDelay, segmentDelay + Math.round(12)],
          [12, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const scale = segment.highlight
          ? interpolate(
              frame,
              [
                segmentDelay + Math.round(8),
                segmentDelay + Math.round(11),
                segmentDelay + Math.round(14),
              ],
              [1.0, 1.08, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            )
          : 1;

        return (
          <span
            key={`${segment.text}-${index}`}
            style={{
              display: "inline-block",
              color: segment.highlight ? "#FF5252" : "#1A1A1A",
              fontWeight: segment.highlight ? 700 : 500,
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              transition: "transform 0.2s ease",
              whiteSpace: "pre-wrap",
            }}
          >
            {segment.text}
          </span>
        );
      })}
    </span>
  );
};

