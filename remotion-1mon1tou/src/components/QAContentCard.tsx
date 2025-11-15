import type { CSSProperties } from "react";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { PanelTheme, QAItemImage } from "../types";

type Props = {
  title: string;
  description?: string;
  question: string;
  answer?: string;
  sequenceIndex: number;
  totalItems: number;
  showProgress: boolean;
  durationInFrames: number;
  questionDurationInFrames: number;
  answerDurationInFrames: number;
  paddingX: number;
  paddingY: number;
  theme: PanelTheme;
  questionFontSizePx?: number;
  answerFontSizePx?: number;
  image?: QAItemImage;
};

const containerStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  paddingTop: 48,
  paddingBottom: 48,
  gap: 32,
};

const headerGroupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 10,
};

const titleStyle: CSSProperties = {
  fontSize: 56,
  fontWeight: 800,
  textAlign: "center",
  lineHeight: 1.2,
};

const progressStyle: CSSProperties = {
  fontSize: 32,
  fontWeight: 600,
  textAlign: "center",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

const descriptionStyle: CSSProperties = {
  fontSize: 24,
  lineHeight: 1.5,
  opacity: 0.7,
  whiteSpace: "pre-wrap",
  textAlign: "center",
  maxWidth: 720,
};

const qaStackWrapperStyle: CSSProperties = {
  flex: 1,
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const QA_STACK_MAX_WIDTH = 880;

const qaStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
  width: "100%",
  maxWidth: QA_STACK_MAX_WIDTH,
  position: "relative",
  alignItems: "center",
};

const questionBoxStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 56px",
  textAlign: "center",
  borderRadius: 32,
  border: "2px solid #e3e8f4",
  backgroundColor: "#ffffff",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
};

const questionTextStyle: CSSProperties = {
  fontSize: 72,
  lineHeight: 1.28,
  fontWeight: 800,
  whiteSpace: "pre-wrap",
};

const answerBoxStyle: CSSProperties = {
  borderRadius: 28,
  border: "2px solid #d0d8ee",
  backgroundColor: "#f8fafc",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  whiteSpace: "pre-wrap",
  padding: "32px 40px",
  width: "100%",
  minHeight: 200,
  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
  position: "relative",
  overflow: "hidden",
};

const answerTextStyle: CSSProperties = {
  fontSize: 64,
  fontWeight: 800,
};

const layeredAnswerTextBase: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const imageSizeMap: Record<NonNullable<QAItemImage["size"]>, number> = {
  small: 320,
  medium: 460,
  large: 560,
};

const countLines = (text?: string) => {
  if (!text) {
    return 1;
  }
  return text.split(/\r?\n/).length;
};

const BASE_BOX_MIN_HEIGHT = 260;
const TALL_BOX_MIN_HEIGHT = 340;
const IMAGE_LAYER_GAP = 24;

const normalizeStaticPath = (src: string) => {
  if (/^https?:\/\//.test(src)) {
    return src;
  }
  return staticFile(src.replace(/^\//, ""));
};

export const QAContentCard: React.FC<Props> = ({
  title,
  description,
  question,
  answer,
  sequenceIndex,
  totalItems,
  showProgress,
  durationInFrames,
  questionDurationInFrames,
  answerDurationInFrames,
  paddingX,
  paddingY,
  theme,
  questionFontSizePx,
  answerFontSizePx,
  image,
}) => {
  const frame = useCurrentFrame();
  const questionPhaseEnd = Math.max(1, questionDurationInFrames);
  const fadeOutStart = Math.max(durationInFrames - 6, questionPhaseEnd);

  const questionTranslate = interpolate(
    Math.min(frame, questionPhaseEnd),
    [0, 8],
    [18, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const questionOpacity = interpolate(
    frame,
    [0, 8, fadeOutStart, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const answerRevealFrame = questionDurationInFrames;
  const answerFadeInEnd = Math.min(
    durationInFrames,
    answerRevealFrame + Math.min(12, answerDurationInFrames),
  );
  const answerBoxOpacity = interpolate(
    frame,
    [0, 8, durationInFrames - 6, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const answerTextOpacity = interpolate(
    frame,
    [answerRevealFrame, answerFadeInEnd],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const placeholderOpacity = interpolate(
    frame,
    [answerRevealFrame - 6, answerRevealFrame],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const textColor = theme.textColor ?? theme.questionPanelColor;
  const titleColor = theme.questionPanelColor ?? textColor;
  const answerText = answer ?? "（回答準備中）";
  const questionFontSize = questionFontSizePx ?? 72;
  const answerFontSize = answerFontSizePx ?? 64;
  const questionLineCount = countLines(question);
  const answerLineCount = countLines(answer ?? "");
  const questionMinHeight =
    questionLineCount >= 3 ? TALL_BOX_MIN_HEIGHT : BASE_BOX_MIN_HEIGHT;
  const answerMinHeight =
    answerLineCount >= 3 ? TALL_BOX_MIN_HEIGHT : BASE_BOX_MIN_HEIGHT;

  const imageWidth =
    image?.widthPx ?? (image ? imageSizeMap[image.size ?? "medium"] : 0);
  const imageLayer =
    image?.src && imageWidth > 0 ? (
      <div
        style={{
          position: "absolute",
          bottom: `calc(100% + ${IMAGE_LAYER_GAP}px)`,
          left: "50%",
          transform: "translateX(-50%)",
          width: Math.min(imageWidth, QA_STACK_MAX_WIDTH),
          borderRadius: 32,
          overflow: "hidden",
          boxShadow: "0 18px 42px rgba(15, 23, 42, 0.12)",
          backgroundColor: "#ffffff",
          pointerEvents: "none",
        }}
      >
        <img
          src={normalizeStaticPath(image.src)}
          alt={image.alt ?? ""}
          style={{
            width: "100%",
            height: image?.heightPx ?? "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    ) : null;

  return (
    <AbsoluteFill
      style={{
        padding: `${paddingY}px ${paddingX}px`,
        color: textColor,
        backgroundColor: "#ffffff",
      }}
    >
      <div style={containerStyle}>
        <div style={headerGroupStyle}>
          <div
            style={{
              ...titleStyle,
              color: titleColor,
            }}
          >
            {title}
          </div>
          {showProgress ? (
            <div
              style={{
                ...progressStyle,
                color: theme.accentColor,
              }}
            >
              Q{sequenceIndex + 1} / {totalItems}
            </div>
          ) : null}
          {description ? (
            <p style={{ ...descriptionStyle, color: textColor }}>{description}</p>
          ) : null}
        </div>

        <div style={qaStackWrapperStyle}>
          <div style={qaStackStyle}>
            {imageLayer}
            <div
              style={{
                ...questionBoxStyle,
                transform: `translateY(${questionTranslate}px)`,
                opacity: questionOpacity,
                minHeight: questionMinHeight,
              }}
            >
              <p
                style={{
                  ...questionTextStyle,
                  color: theme.questionPanelColor,
                  fontSize: questionFontSize,
                }}
              >
                {question}
              </p>
            </div>

            <div
              style={{
                ...answerBoxStyle,
                minHeight: answerMinHeight,
                opacity: answerBoxOpacity,
              }}
            >
              <span
                style={{
                  ...answerTextStyle,
                  color: theme.answerPanelColor,
                  fontSize: answerFontSize,
                  ...layeredAnswerTextBase,
                  opacity: placeholderOpacity,
                }}
              >
                ???
              </span>
              <span
                style={{
                  ...answerTextStyle,
                  color: theme.answerPanelColor,
                  fontSize: answerFontSize,
                  ...layeredAnswerTextBase,
                  opacity: answerTextOpacity,
                }}
              >
                {answerText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

