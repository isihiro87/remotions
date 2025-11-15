# export-qa スクリプトについて

## 出力先
- `out/sample-qa.txt` に、`src/data/sample.json` 内の各 `question` と `answer` を交互に並べたテキストファイルを作成します。
- 出力ディレクトリ `out` が存在しない場合は自動で生成されます。

## 実行コマンド
```bash
npm run export:qa
```
- 上記コマンドは `tsx scripts/export-qa.ts` を起動し、自動的に最新の JSON 内容をもとに出力を更新します。

