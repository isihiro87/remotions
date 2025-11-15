import { AbsoluteFill } from "remotion";
import type { PanelTheme } from "../types";

type Props = {
  theme: PanelTheme;
};

export const BackgroundCanvas: React.FC<Props> = ({ theme: _theme }) => {
  const backgroundColor = "#ffffff";

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
      }}
    />
  );
};

