import { AbsoluteFill } from "remotion";
import { ReactNode } from "react";

interface SlideFrameProps {
  children: ReactNode;
  backgroundColor?: string;
}

export const SlideFrame: React.FC<SlideFrameProps> = ({
  children,
  backgroundColor = "#F5F7FA",
}) => (
  <AbsoluteFill
    style={{
      padding: "80px 120px",
      backgroundColor,
      color: "#1A1A1A",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      fontFamily: "Noto Sans JP, sans-serif",
    }}
  >
    {children}
  </AbsoluteFill>
);

