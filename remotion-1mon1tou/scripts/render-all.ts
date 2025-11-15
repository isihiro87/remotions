import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { qaScripts } from "../src/data/scripts";

const ensureOutDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const main = async () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.join(currentDir, "..");
  const outDir = path.join(projectRoot, "out");
  const entryPoint = path.join(projectRoot, "src", "RemotionRoot.tsx");

  ensureOutDir(outDir);

  console.log("📦 バンドルを開始します...");
  const bundleLocation = await bundle({
    entryPoint,
  });

  for (const script of qaScripts) {
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: script.id,
    });

    const outputBaseName = script.outputFileBaseName ?? script.id;
    const outputPath = path.join(outDir, `${outputBaseName}.mp4`);

    console.log(`🎬 レンダリング開始: ${script.title} -> ${outputPath}`);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      audioCodec: "aac",
      outputLocation: outputPath,
    });

    console.log(`✅ レンダリング完了: ${outputPath}`);
  }

  console.log("✨ すべての動画レンダリングが完了しました。");
};

main().catch((error) => {
  console.error("レンダリング中にエラーが発生しました:", error);
  process.exit(1);
});

