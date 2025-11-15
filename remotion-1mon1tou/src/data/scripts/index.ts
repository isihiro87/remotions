import type { QAScript } from "../../types";
import { sampleBasicScript } from "./sample-basic";

export const qaScripts: QAScript[] = [sampleBasicScript];

export const qaScriptMap = new Map<string, QAScript>(
  qaScripts.map((script) => [script.id, script]),
);

