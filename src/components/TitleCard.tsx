import type { ComponentProps, FC } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { PanelTheme } from "../types";

type Props = {
  title: string;
  description?: string;
  durationInFrames: number;
  paddingX: number;
  paddingY: number;
  theme: PanelTheme;
  mode: "intro" | "outro";
  totalItems: number;
};

type CSSProperties = ComponentProps<"div">["style"];

const containerStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 32,
  textAlign: "center",
};

const titleStyle: CSSProperties = {
  fontSize: 96,
  fontWeight: 900,
  lineHeight: 1.1,
};

const descriptionStyle: CSSProperties = {
  fontSize: 40,
  lineHeight: 1.4,
  opacity: 0.8,
  whiteSpace: "pre-wrap",
  maxWidth: 760,
};

const detailStyle: CSSProperties = {
  fontSize: 26,
  fontWeight: 600,
  letterSpacing: "0.24em",
  textTransform: "uppercase",
  color: "#64748b",
};

export const TitleCard: FC<Props> = ({
  title,
  description,
  durationInFrames,
  paddingX,
  paddingY,
  theme,
  mode,
  totalItems,
}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(
    frame,
    [0, 12, durationInFrames - 18, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const translate = interpolate(frame, [0, 15], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const leadingText =
    mode === "intro" ? "シンプル一問一答" : "また次の一問一答で会いましょう";

  return (
    <AbsoluteFill
      style={{
        padding: `${paddingY}px ${paddingX}px`,
        opacity: fade,
        transform: `translateY(${translate}px)`,
        color: theme.questionPanelColor,
      }}
    >
      <div style={containerStyle}>
        <div style={detailStyle}>
          {leadingText} / 全{totalItems}問
        </div>
        <h1 style={titleStyle}>{title}</h1>
        {description ? <p style={descriptionStyle}>{description}</p> : null}
      </div>
    </AbsoluteFill>
  );
};

