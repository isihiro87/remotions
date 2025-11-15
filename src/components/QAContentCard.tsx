import type {ComponentProps, FC} from "react";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { PanelTheme, QAChoiceOption, QAItemImage } from "../types";

type CSSProperties = ComponentProps<"div">["style"];

type Props = {
  title: string;
  description?: string;
  question: string;
  answer?: string;
  choices?: QAChoiceOption[];
  sequenceIndex: number;
  totalItems: number;
  showProgress: boolean;
  durationInFrames: number;
  questionDurationInFrames: number;
  answerDelayInFrames: number;
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
  paddingTop: 28,
  paddingBottom: 48,
  gap: 20,
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
  alignItems: "flex-start",
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
  marginTop: -12,
};

const questionBoxStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "36px 48px 32px",
  textAlign: "center",
  borderRadius: 32,
  border: "2px solid #e3e8f4",
  backgroundColor: "#ffffff",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
  gap: 28,
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

const choicesContainerStyle: CSSProperties = {
  borderRadius: 28,
  border: "2px solid #d0d8ee",
  backgroundColor: "#ffffff",
  padding: "32px 40px",
  width: "100%",
  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
};

const choicesGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 24,
};

const choiceCardBaseStyle: CSSProperties = {
  borderRadius: 24,
  border: "2px solid rgba(226,232,240,1)",
  backgroundColor: "#f8fafc",
  padding: "32px 28px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  gap: 14,
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
};

const choiceTextStyle: CSSProperties = {
  fontSize: 48,
  fontWeight: 800,
  lineHeight: 1.2,
  whiteSpace: "pre-wrap",
};

const choiceResultBadgeBase: CSSProperties = {
  position: "absolute",
  top: 18,
  right: 18,
  width: 58,
  height: 58,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 40,
  fontWeight: 700,
  color: "#ffffff",
};

const layeredAnswerTextBase: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const imageSizeMap: Record<NonNullable<QAItemImage["size"]>, number> = {
  small: 672,
  medium: 900,
  large: 1080,
};

const questionImageWrapperStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const countLines = (text?: string) => {
  if (!text) {
    return 1;
  }
  return text.split(/\r?\n/).length;
};

const estimateChoiceLineCount = (text: string) => {
  const normalized = text.replace(/\s+/g, "");
  const approxByLength = Math.ceil(normalized.length / 8);
  return Math.max(1, countLines(text), approxByLength);
};

const CORRECT_COLOR = "#16a34a";
const INCORRECT_COLOR = "#dc2626";
const CORRECT_BG = "rgba(34,197,94,0.14)";
const INCORRECT_BG = "rgba(239,68,68,0.14)";
const CORRECT_TEXT_COLOR = "#064e3b";
const INCORRECT_TEXT_COLOR = "#7f1d1d";

const BASE_BOX_MIN_HEIGHT = 260;
const TALL_BOX_MIN_HEIGHT = 340;

const normalizeStaticPath = (src: string) => {
  if (/^https?:\/\//.test(src)) {
    return src;
  }
  return staticFile(src.replace(/^\//, ""));
};

export const QAContentCard: FC<Props> = ({
  title,
  description,
  question,
  answer,
  choices,
  sequenceIndex,
  totalItems,
  showProgress,
  durationInFrames,
  questionDurationInFrames,
  answerDelayInFrames,
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

  const maxDelayFrames = Math.max(
    durationInFrames - questionDurationInFrames - answerDurationInFrames,
    0,
  );
  const clampedAnswerDelayFrames = Math.min(
    Math.max(answerDelayInFrames, 0),
    maxDelayFrames,
  );
  const answerRevealFrame =
    questionDurationInFrames + clampedAnswerDelayFrames;
  const answerFadeInEndBase = Math.min(
    durationInFrames,
    answerRevealFrame + Math.min(12, answerDurationInFrames),
  );
  const answerFadeInEnd =
    answerFadeInEndBase <= answerRevealFrame
      ? Math.min(answerRevealFrame + 1, durationInFrames)
      : answerFadeInEndBase;
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
  const resolvedAnswerText =
    answer ??
    choices?.find((choice) => choice.isCorrect)?.text ??
    "（回答準備中）";
  const answerText = resolvedAnswerText;
  const hasQuestionImage = Boolean(image?.src?.trim());
  const baseQuestionFontSize = questionFontSizePx ?? 72;
  const effectiveQuestionFontSize = hasQuestionImage
    ? Math.max(48, Math.round(baseQuestionFontSize * 0.9))
    : baseQuestionFontSize;
  const answerFontSize = answerFontSizePx ?? 64;
  const questionLineCount = countLines(question);
  const answerLineCount = countLines(answer ?? "");
  const imageWidth =
    image?.widthPx ?? (image ? imageSizeMap[image.size ?? "medium"] : 0);
  const imageHeight = hasQuestionImage
    ? image?.heightPx ?? Math.min(420, imageWidth * 0.65)
    : 0;
  const baseQuestionMinHeight =
    questionLineCount >= 3 ? TALL_BOX_MIN_HEIGHT : BASE_BOX_MIN_HEIGHT;
  const questionMinHeight = hasQuestionImage
    ? Math.max(baseQuestionMinHeight, BASE_BOX_MIN_HEIGHT + imageHeight * 0.75)
    : baseQuestionMinHeight;
  const answerMinHeight =
    answerLineCount >= 3 ? TALL_BOX_MIN_HEIGHT : BASE_BOX_MIN_HEIGHT;

  const hasChoices = (choices?.length ?? 0) > 0;
  const resultOpacity = interpolate(
    frame,
    [answerRevealFrame, answerRevealFrame + 8],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const resolvedChoices: QAChoiceOption[] = choices ?? [];

  const qaStackWrapperDynamicStyle = hasQuestionImage
    ? {
        alignItems: "flex-start",
      }
    : {
        alignItems: "center",
      };
  const qaStackDynamicStyle = hasQuestionImage
    ? {
        marginTop: -32,
        gap: 20,
      }
    : {
        marginTop: -160,
        gap: 26,
      };
  const questionBoxDynamicStyle = hasQuestionImage
    ? {
        padding: "28px 40px 24px",
        gap: 14,
        alignItems: "stretch",
      }
    : {
        justifyContent: "center",
      };
  const imageMaxWidth = hasQuestionImage
    ? Math.max(220, Math.min(imageWidth * 0.9, QA_STACK_MAX_WIDTH - 120))
    : undefined;
  const imageDisplayHeight = hasQuestionImage
    ? image?.heightPx ?? Math.max(180, Math.round(imageHeight * 0.8))
    : undefined;

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
        <div
          style={{
            ...qaStackWrapperStyle,
            ...(qaStackWrapperDynamicStyle ?? {}),
          }}
        >
          <div
            style={{
              ...qaStackStyle,
              ...(qaStackDynamicStyle ?? {}),
            }}
          >
            <div
              style={{
                ...questionBoxStyle,
                ...(questionBoxDynamicStyle ?? {}),
                transform: `translateY(${questionTranslate}px)`,
                opacity: questionOpacity,
                minHeight: questionMinHeight,
              }}
            >
              <p
                style={{
                  ...questionTextStyle,
                  color: theme.questionPanelColor,
                  fontSize: effectiveQuestionFontSize,
                }}
              >
                {question}
              </p>
              {hasQuestionImage ? (
                <div style={questionImageWrapperStyle}>
                  <img
                    src={normalizeStaticPath(image?.src ?? "")}
                    alt={image?.alt ?? ""}
                    style={{
                      width: "100%",
                      maxWidth: imageMaxWidth,
                      height: imageDisplayHeight,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
              ) : null}
            </div>

            {hasChoices ? (
              <div
                style={{
                  ...choicesContainerStyle,
                  opacity: answerBoxOpacity,
                }}
              >
                <div style={choicesGridStyle}>
                  {resolvedChoices.map((choice, index) => {
                    const isCorrect = Boolean(choice.isCorrect);
                    const isAnswerPhase = frame >= answerRevealFrame;
                    const isWrongResult = isAnswerPhase && !isCorrect;
                    const isCorrectResult = isAnswerPhase && isCorrect;
                    const estimatedLines = estimateChoiceLineCount(choice.text);
                    const choiceMinHeight =
                      estimatedLines <= 1
                        ? 140
                        : 140 + Math.min(3, estimatedLines - 1) * 48;

                    const backgroundColor = !isAnswerPhase
                      ? "#f8fafc"
                      : isCorrectResult
                        ? CORRECT_BG
                        : isWrongResult
                          ? INCORRECT_BG
                          : "#f8fafc";
                    const borderColor = !isAnswerPhase
                      ? "rgba(226,232,240,1)"
                      : isCorrectResult
                        ? CORRECT_COLOR
                        : isWrongResult
                          ? INCORRECT_COLOR
                          : "rgba(226,232,240,1)";
                    const textColor = !isAnswerPhase
                      ? theme.answerPanelColor
                      : isCorrectResult
                        ? CORRECT_TEXT_COLOR
                        : isWrongResult
                          ? INCORRECT_TEXT_COLOR
                          : theme.answerPanelColor;

                    return (
                      <div
                        key={choice.id ?? `${choice.text}-${index}`}
                        style={{
                          ...choiceCardBaseStyle,
                          minHeight: choiceMinHeight,
                          borderColor,
                          backgroundColor,
                          color: textColor,
                        }}
                      >
                        <span
                          style={{
                            ...choiceTextStyle,
                            color: textColor,
                            fontSize: Math.min(52, answerFontSize),
                          }}
                        >
                          {choice.text}
                        </span>
                        {isAnswerPhase ? (
                          <span
                            style={{
                              ...choiceResultBadgeBase,
                              backgroundColor: isCorrect
                                ? CORRECT_COLOR
                                : INCORRECT_COLOR,
                              opacity: resultOpacity,
                            }}
                          >
                            {isCorrect ? "○" : "×"}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

