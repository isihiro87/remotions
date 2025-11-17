import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import type { SlideTimeline } from "../types";
import { SlideFrame } from "../components/SlideFrame";
import { HighlightedText } from "../components/HighlightedText";
import { staticFile } from "remotion";
import { Img } from "remotion";
import { useMemo } from "react";

interface SlideRendererProps {
  timeline: SlideTimeline;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({ timeline }) => {
  const slideDuration =
    timeline.endFrame - timeline.startFrame > 0
      ? timeline.endFrame - timeline.startFrame
      : 1;

  return (
    <SlideFrame>
      <SlideLayout timeline={timeline} />

      {timeline.lines.map((lineTiming, index) => {
        const duration =
          lineTiming.slideRelativeEndFrame - lineTiming.slideRelativeStartFrame;

        return (
          <Sequence
            key={`${lineTiming.line.lineNumber}-text`}
            from={lineTiming.slideRelativeStartFrame}
            durationInFrames={duration}
          >
            <LineContent
              lineOrder={index}
              lineNumber={lineTiming.line.lineNumber}
              text={lineTiming.line.text}
              highlightWords={lineTiming.line.highlightWords}
              layoutType={timeline.slide.layoutType}
            />
            <Audio
              src={staticFile(lineTiming.line.audioFile)}
              startFrom={0}
              volume={1}
            />
          </Sequence>
        );
      })}

      {timeline.images.map((imageTiming) => (
        <Sequence
          key={imageTiming.image.imageId}
          from={imageTiming.startFrame - timeline.startFrame}
          durationInFrames={Math.max(
            1,
            imageTiming.endFrame - imageTiming.startFrame
          )}
        >
          <SlideImageRenderer
            imagePath={imageTiming.image.imagePath}
            slot={imageTiming.image.slot}
            size={imageTiming.image.size}
            alt={imageTiming.image.alt}
          />
        </Sequence>
      ))}

      <Sequence from={slideDuration - 1} durationInFrames={1}>
        {/* 終了マーカー */}
      </Sequence>
    </SlideFrame>
  );
};

interface LineContentProps {
  lineOrder: number;
  lineNumber: number;
  text: string;
  highlightWords?: string[];
  layoutType: SlideTimeline["slide"]["layoutType"];
}

const LineContent: React.FC<LineContentProps> = ({
  lineOrder,
  lineNumber,
  text,
  highlightWords,
  layoutType,
}) => {
  const containerStyle = getLineContainerStyle(layoutType);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        padding: "40px 0",
        pointerEvents: "none",
        ...containerStyle.fill,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
          ...containerStyle.row,
        }}
      >
        <LineNumberBadge lineNumber={lineNumber} />
        <div
          style={{
            fontSize: 48,
            lineHeight: 1.4,
            fontWeight: 600,
            maxWidth: containerStyle.maxWidth,
          }}
        >
          <HighlightedText
            text={text}
            highlightWords={highlightWords}
            delayFrames={lineOrder * 6}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LineNumberBadge: React.FC<{ lineNumber: number }> = ({ lineNumber }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        minWidth: 120,
        maxWidth: 120,
        padding: "8px 16px",
        borderRadius: 16,
        backgroundColor: "#1C3FAA",
        color: "#FFFFFF",
        fontWeight: 700,
        fontSize: 32,
        textAlign: "center",
        boxShadow: "0 12px 24px rgba(28,63,170,0.25)",
        opacity,
      }}
    >
      #{lineNumber.toString().padStart(3, "0")}
    </div>
  );
};

interface SlideImageRendererProps {
  imagePath: string;
  slot: "LEFT" | "RIGHT" | "FULL";
  size: "small" | "medium" | "large" | "fill";
  alt?: string;
}

const SlideImageRenderer: React.FC<SlideImageRendererProps> = ({
  imagePath,
  slot,
  size,
  alt,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, 12], [0.9, 1], {
    extrapolateRight: "clamp",
  });

  const dimensions = useMemo(() => {
    switch (size) {
      case "small":
        return { width: 480 };
      case "medium":
        return { width: 640 };
      case "large":
        return { width: 860 };
      case "fill":
      default:
        return { width: undefined };
    }
  }, [size]);

  const positionStyles: Record<typeof slot, React.CSSProperties> = {
    LEFT: {
      justifyContent: "flex-start",
    },
    RIGHT: {
      justifyContent: "flex-end",
    },
    FULL: {
      justifyContent: "center",
    },
  };

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        ...positionStyles[slot],
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          transition: "transform 0.2s ease",
          borderRadius: slot === "FULL" ? 0 : 24,
          overflow: "hidden",
          boxShadow:
            slot === "FULL"
              ? "0 0 0 rgba(0,0,0,0)"
              : "0 18px 32px rgba(0,0,0,0.18)",
        }}
      >
        <Img
          src={staticFile(imagePath)}
          alt={alt ?? imagePath}
          width={dimensions.width}
          style={{
            height: "auto",
            display: "block",
            maxHeight: slot === "FULL" ? "100%" : 720,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const SlideLayout: React.FC<{ timeline: SlideTimeline }> = ({ timeline }) => {
  switch (timeline.slide.layoutType) {
    case "TITLE_ONLY":
      return <TitleOnly timeline={timeline} />;
    case "TEXT_ONLY":
      return <TextOnly timeline={timeline} />;
    case "IMAGE_RIGHT_TEXT_LEFT":
      return <SplitLayout timeline={timeline} imageOn="right" />;
    case "IMAGE_LEFT_TEXT_RIGHT":
      return <SplitLayout timeline={timeline} imageOn="left" />;
    case "IMAGE_FULL":
      return <ImageFull timeline={timeline} />;
    case "SUMMARY":
      return <Summary timeline={timeline} />;
    default:
      return <TextOnly timeline={timeline} />;
  }
};

const SlideTitleBlock: React.FC<{
  title?: string;
  subtitle?: string;
}> = ({ title, subtitle }) => (
  <div style={{ marginBottom: 32 }}>
    {title ? (
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: "#0F172A",
          marginBottom: subtitle ? 16 : 0,
        }}
      >
        {title}
      </div>
    ) : null}
    {subtitle ? (
      <div style={{ fontSize: 36, color: "#1E293B", opacity: 0.7 }}>
        {subtitle}
      </div>
    ) : null}
  </div>
);

const TitleOnly: React.FC<{ timeline: SlideTimeline }> = ({ timeline }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "0 80px",
    }}
  >
    <SlideTitleBlock
      title={timeline.slide.title ?? timeline.slide.lines[0]?.text}
      subtitle={timeline.slide.subtitle}
    />
  </AbsoluteFill>
);

const TextOnly: React.FC<{ timeline: SlideTimeline }> = ({ timeline }) => (
  <AbsoluteFill style={{ justifyContent: "flex-start" }}>
    <SlideTitleBlock title={timeline.slide.title} subtitle={timeline.slide.subtitle} />
  </AbsoluteFill>
);

const SplitLayout: React.FC<{
  timeline: SlideTimeline;
  imageOn: "left" | "right";
}> = ({ timeline, imageOn }) => (
  <AbsoluteFill
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 48,
      alignItems: "center",
    }}
  >
    {imageOn === "left" ? (
      <>
        <ImagePlaceholder />
        <TextArea timeline={timeline} />
      </>
    ) : (
      <>
        <TextArea timeline={timeline} />
        <ImagePlaceholder />
      </>
    )}
  </AbsoluteFill>
);

const ImageFull: React.FC<{ timeline: SlideTimeline }> = ({ timeline }) => (
  <AbsoluteFill
    style={{
      borderRadius: 0,
      overflow: "hidden",
      backgroundColor: "#000000",
    }}
  >
    <SlideTitleBlock title={timeline.slide.title} subtitle={timeline.slide.subtitle} />
  </AbsoluteFill>
);

const Summary: React.FC<{ timeline: SlideTimeline }> = ({ timeline }) => (
  <AbsoluteFill
    style={{
      justifyContent: "flex-start",
    }}
  >
    <SlideTitleBlock title={timeline.slide.title} subtitle={timeline.slide.subtitle} />
    <div style={{ fontSize: 42, lineHeight: 1.4, opacity: 0.85 }}>
      まとめを読み上げている間に行が順次表示されます。
    </div>
  </AbsoluteFill>
);

const TextArea: React.FC<{ timeline: SlideTimeline }> = ({ timeline }) => (
  <div>
    <SlideTitleBlock title={timeline.slide.title} subtitle={timeline.slide.subtitle} />
  </div>
);

const getLineContainerStyle = (
  layoutType: SlideTimeline["slide"]["layoutType"]
) => {
  switch (layoutType) {
    case "IMAGE_RIGHT_TEXT_LEFT":
      return {
        fill: { paddingLeft: 40, paddingRight: 520 },
        row: { justifyContent: "flex-start" },
        maxWidth: "720px",
      };
    case "IMAGE_LEFT_TEXT_RIGHT":
      return {
        fill: { paddingLeft: 520, paddingRight: 40 },
        row: { justifyContent: "flex-end" },
        maxWidth: "720px",
      };
    case "IMAGE_FULL":
      return {
        fill: { padding: "48px 120px", justifyContent: "flex-end" },
        row: { justifyContent: "center" },
        maxWidth: "1080px",
      };
    case "SUMMARY":
      return {
        fill: { paddingLeft: 160, paddingRight: 160 },
        row: { justifyContent: "flex-start" },
        maxWidth: "1100px",
      };
    case "TITLE_ONLY":
      return {
        fill: {
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center" as const,
        },
        row: {
          flexDirection: "column" as const,
          alignItems: "center",
        },
        maxWidth: "1000px",
      };
    case "TEXT_ONLY":
    default:
      return {
        fill: { paddingLeft: 120, paddingRight: 120 },
        row: { justifyContent: "flex-start" },
        maxWidth: "960px",
      };
  }
};

const ImagePlaceholder: React.FC = () => (
  <div
    style={{
      width: "100%",
      height: "70%",
      borderRadius: 32,
      background: "rgba(15, 23, 42, 0.06)",
      border: "2px dashed rgba(15, 23, 42, 0.1)",
    }}
  />
);

