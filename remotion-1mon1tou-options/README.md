# remotion-1mon1tou

Remotion を使って縦型の 1問1答動画を量産するためのテンプレートです。共通コンポーネントや設定を `src/common/` 以下にまとめ、他タイプの動画にも転用しやすい構造になっています。

## 主な特徴

- 1080×1920 の縦型レイアウトに最適化。
- 画面左下にキャラクターを常時表示（画像がない場合は自動的に抽象アバターを描画）。
- `src/data/scripts/` に複数のシナリオを登録しておくと、一括レンダリングスクリプト (`npm run render:all`) でまとめて MP4 を出力。
- テーマ／レイアウト／タイムライン設定を共通化し、他の動画タイプにも流用可能。

## クイックスタート

```powershell
cd remotion-1mon1tou
npm install
npm run dev        # Remotion Studio を起動
npm run render:all # 登録済みシナリオを一括レンダリング
```

詳細な運用手順や構造説明は `docs/` 以下のドキュメントを参照してください。
