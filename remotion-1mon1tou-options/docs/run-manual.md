# 実行手順書（1問1答動画の生成）

この手順書では、`remotion-1mon1tou` プロジェクトで縦型の 1問1答動画を生成するまでのフローを示します。

## 前提環境

- Node.js 18 以上（推奨: 20 系）
- npm 9 以上
- FFmpeg（Remotion が内部的に使用するため、通常は Remotion CLI が自動で同梱するが、エラー時は手動インストールを確認）

## 初期セットアップ

1. ルートディレクトリへ移動  
   ```powershell
   cd remotion-1mon1tou
   ```
2. 依存パッケージのインストール  
   ```powershell
   npm install
   ```

## 編集・プレビュー

- Remotion Studio を起動し、ブラウザ上でプレビューする場合は以下を実行します。  
  ```powershell
  npm run dev
  ```
  > 既定では `http://localhost:3000` が開き、登録済みの Composition を選択してプレビューできます。

## 一括レンダリング

1. すべてのシナリオをまとめて MP4 出力する場合は以下のスクリプトを実行します。  
   ```powershell
   npm run render:all
   ```
2. 正常終了すると `out/` ディレクトリに `<シナリオID>.mp4` （または `outputFileBaseName` で指定した名前）が生成されます。

## 単体レンダリング（必要に応じて）

- 特定のシナリオのみをレンダリングする場合は Remotion CLI を直接使えます。  
  ```powershell
  npx remotion render <CompositionID> out/<ファイル名>.mp4 --props='{"scriptId":"sample-one-mon-one-tou"}'
  ```
  - `CompositionID` は `src/RemotionRoot.tsx` で登録した `script.id`。
  - `--props` を与えなくても、`defaultProps` で登録した内容が利用されます。

## シナリオの更新

- `src/data/scripts/` 配下のファイルを編集・追加することで、動画の内容を変更できます。
- 変更後は再度 `npm run render:all` を実行して出力を更新してください。

## トラブルシュートの基本

- 依存関係の不整合を感じたら `npm install` の再実行 or `npm ci`（lockfile が揃っている場合）を試してください。
- Remotion Studio が白画面になる場合はブラウザのコンソールログを確認し、データ定義のエラー（ID 重複や未定義項目など）を修正します。
- レンダリング時に音声ファイルが見つからないエラーが出る場合は、`public/` 以下にファイルがあるか、パス先頭の `/` の有無を確認してください。


