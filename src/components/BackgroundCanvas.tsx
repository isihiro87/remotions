import type { FC } from "react";
import { AbsoluteFill } from "remotion";
import type { PanelTheme } from "../types";

type Props = {
  theme: PanelTheme;
};

export const BackgroundCanvas: FC<Props> = ({ theme: _theme }) => {
  const backgroundColor = "#ffffff";

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
      }}
    />
  );
};

