import { useMemo } from "react";
import type { FC } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import {
  buildStoryboard,
  deriveCharacter,
  deriveTheme,
} from "../common/storyboard";
import { BackgroundCanvas } from "../components/BackgroundCanvas";
import { CharacterOverlay } from "../character/CharacterOverlay";
import { QAContentCard } from "../components/QAContentCard";
import type { PanelTheme, QAScript, Storyboard } from "../types";

type Props = {
  script: QAScript;
};

const normalizeStaticPath = (path: string) => path.replace(/^\//, "");

const renderSegment = (
  segment: Storyboard["segments"][number],
  script: QAScript,
  storyboard: Storyboard,
  theme: PanelTheme,
) => {
  const totalItems = script.items.length;
  const { paddingX, paddingY } = storyboard.layout;

  const item = script.items[segment.itemIndex ?? 0];
  const hasImage =
    typeof item.image?.src === "string" && item.image.src.trim().length > 0;
  const sequenceKey = `qa-${item.id}-${segment.from}`;

  return (
    <Sequence
      key={sequenceKey}
      from={segment.from}
      durationInFrames={segment.durationInFrames}
    >
      <QAContentCard
        title={script.title}
        description={script.description}
        question={item.question}
        answer={item.answer}
        choices={item.choices}
        sequenceIndex={segment.itemIndex ?? 0}
        totalItems={totalItems}
        showProgress={!hasImage}
        durationInFrames={segment.durationInFrames}
        questionDurationInFrames={segment.questionFrames}
        answerDurationInFrames={segment.answerFrames}
        answerDelayInFrames={segment.answerDelayFrames}
        paddingX={paddingX}
        paddingY={paddingY}
        theme={theme}
        questionFontSizePx={item.questionFontSizePx}
        answerFontSizePx={item.answerFontSizePx}
        image={item.image}
      />

      {item.questionVoice ? (
        <Audio src={staticFile(normalizeStaticPath(item.questionVoice))} />
      ) : null}

      {item.answerVoice ? (
        <Sequence
          from={segment.questionFrames + segment.answerDelayFrames}
        >
          <Audio src={staticFile(normalizeStaticPath(item.answerVoice))} />
        </Sequence>
      ) : null}
    </Sequence>
  );
};

export const OneMonOneTouComposition: FC<Props> = ({ script }) => {
  const storyboard = useMemo(() => buildStoryboard(script), [script]);
  const theme = useMemo(() => deriveTheme(script), [script]);
  const character = useMemo(() => deriveCharacter(script), [script]);

  return (
    <AbsoluteFill>
      <BackgroundCanvas theme={theme} />

      {script.backgroundMusic ? (
        <Audio
          src={staticFile(normalizeStaticPath(script.backgroundMusic.src))}
          volume={script.backgroundMusic.volume ?? 0.35}
          startFrom={script.backgroundMusic.startFromFrame ?? 0}
          loop={script.backgroundMusic.loop ?? true}
        />
      ) : null}

      {storyboard.segments.map((segment) =>
        renderSegment(segment, script, storyboard, theme),
      )}

      <CharacterOverlay
        character={character}
        theme={theme}
        storyboard={storyboard}
        script={script}
      />
    </AbsoluteFill>
  );
};

