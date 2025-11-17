# ファイル・ディレクトリ役割まとめ

このドキュメントは `remotion-1mon1tou` プロジェクト内の主要なファイルやディレクトリの役割を一覧化したものです。今後の機能追加やメンテナンス時の参照に利用してください。

| パス | 役割 |
| --- | --- |
| `package.json` | 依存パッケージ・スクリプト管理。`render:all` で一括レンダリングが可能。 |
| `tsconfig.json` | TypeScript のコンパイル設定。エイリアス `~/` や JSX 設定などを集約。 |
| `remotion.config.ts` | Remotion 全体設定（コーデック、画質、並列数など）。 |
| `vite.config.ts` | Vite の共通設定。パスエイリアスを有効化。 |
| `scripts/render-all.ts` | 登録済みの全シナリオを一括でレンダリングする Node スクリプト。 |
| `src/RemotionRoot.tsx` | Remotion に読み込まれるエントリ。全シナリオを Composition として登録。 |
| `src/common/` | 画面レイアウト・テーマ・キャラクターなど、動画タイプ共通で再利用する設定・ロジック。 |
| `src/common/constants.ts` | デフォルトレイアウト・テーマ・キャラクター設定を定義。 |
| `src/common/storyboard.ts` | シナリオ定義からストーリーボード（セグメント構成）を生成。 |
| `src/components/` | 各種表示コンポーネント。縦型動画共通の UI をここにまとめる。 |
| `src/components/BackgroundCanvas.tsx` | 背景グラデーションの描画。テーマの色設定を反映。 |
| `src/components/CharacterOverlay.tsx` | 画面左下にキャラクターを表示。画像が無い場合は抽象的なシェイプで代用。 |
| `src/components/QAContentCard.tsx` | 問題／解答テキストのカードレイアウト。アニメーションを含む。 |
| `src/components/TitleCard.tsx` | イントロ・アウトロ共通のタイトル表示カード。 |
| `src/compositions/OneMonOneTouComposition.tsx` | 1問1答動画のメイン Composition。ストーリーボードに従ってセクションを切り替える。 |
| `src/data/scripts/` | 生成対象となる動画シナリオのデータ群。 |
| `src/data/scripts/index.ts` | 利用可能なシナリオ一覧を配列で公開。 |
| `src/data/scripts/sample-basic.ts` | サンプルの 1問1答シナリオ定義（地理）。 |
| `src/data/scripts/sample-history.ts` | サンプルの 1問1答シナリオ定義（世界史）。 |
| `src/types.ts` | プロジェクトで用いる型定義。シナリオやテーマ設定、ストーリーボードの構造を明文化。 |
| `src/utils/timing.ts` | 時間変換など、アニメーション関連のユーティリティ。 |
| `docs/` | ドキュメント格納場所（本ファイル含む）。 |

今後新しい動画タイプを追加する場合も、共通化したい設定やコンポーネントは `common` や `components` へ拡張していくことを想定しています。
