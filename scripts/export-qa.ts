import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {dirname, resolve} from "node:path";

const SCRIPT_PATH = resolve("src/data/sample.json");
const OUTPUT_PATH = resolve("out/sample-qa.txt");

const raw = readFileSync(SCRIPT_PATH, "utf-8");
const data = JSON.parse(raw) as {
  items?: Array<{question?: string; answer?: string}>;
};

const lines =
  data.items?.flatMap((item) => [
    (item.question ?? "").trim(),
    (item.answer ?? "").trim(),
  ]) ?? [];

const content = lines.filter((line) => line.length > 0).join("\n");

mkdirSync(dirname(OUTPUT_PATH), {recursive: true});
writeFileSync(OUTPUT_PATH, content, "utf-8");

console.log(`Exported ${lines.length / 2} QA pairs to ${OUTPUT_PATH}`);

