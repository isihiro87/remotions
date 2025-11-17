import { Composition, registerRoot } from "remotion";
import { buildStoryboard } from "./common/storyboard";
import { OneMonOneTouComposition } from "./compositions/OneMonOneTouComposition";
import { qaScripts } from "./data/scripts";

const RemotionRoot: React.FC = () => {
  return (
    <>
      {qaScripts.map((script) => {
        const storyboard = buildStoryboard(script);

        return (
          <Composition
            key={script.id}
            id={script.id}
            component={OneMonOneTouComposition}
            durationInFrames={storyboard.totalDurationInFrames}
            fps={storyboard.fps}
            width={storyboard.width}
            height={storyboard.height}
            defaultProps={{ script }}
          />
        );
      })}
    </>
  );
};

registerRoot(RemotionRoot);




