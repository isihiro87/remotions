## Remotion Slides

中学生向け授業スライド動画を JSON から自動生成する Remotion プロジェクトです。`requiment.txt` に基づいて以下を実装しています。

- すべての行に通し番号を付与し、音声と同期して再生
- 行・スライド単位のポーズ調整（秒 → フレーム変換）
- 行単位での強調表示（`[[重要語句]]` または `highlightWords` 指定）
- レイアウトパターン：`TITLE_ONLY` / `TEXT_ONLY` / `IMAGE_RIGHT_TEXT_LEFT` / `IMAGE_LEFT_TEXT_RIGHT` / `IMAGE_FULL` / `SUMMARY`
- 画像の複数枚表示と表示/非表示タイミング（`with-line` / `after-line` / `absolute`）

### セットアップ

```pwsh
cd remotions/slides
npm install
```

### プレビュー

```pwsh
npm start
```

ブラウザが立ち上がったら `lessonId` を入力して再生できます（デフォルトは `sample_magnetism_01`）。

### レンダリング

```pwsh
npm run render -- --input-props='{"lessonId":"sample_magnetism_01"}'
```

`lessonId` は `data/lessons/<lessonId>.json` を指します。環境変数 `lessonId` または `LESSON_ID` を設定して render/preview を行うことも可能です。

### JSON の追加方法

1. `data/lessons` に新しい JSON を追加します（要件定義書のフォーマットに従ってください）。
2. オーディオファイルを `public/audio/...` に、画像を `public/images/...` に設置し、JSON からの相対パスを一致させます。
3. 必要に応じて `npm run render` の `lessonId` を変更します。

### 注意点

- JSON 内の `audioDurationSeconds` と `pauseAfterSeconds` を正しく設定すると、行の表示長さと音声が同期します。
- `IMAGE_FULL` レイアウトの場合でも `lines` 配列に行番号と音声ファイルを忘れずに記載してください。
- アセット（音声・画像）は `public` 配下に配置し、`staticFile()` で参照します。

