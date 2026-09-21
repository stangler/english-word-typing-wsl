# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

NEW CROWN Lesson 1〜5 + 小学校の単語を対象とした、ブラウザで直接動作するタイピング練習アプリです。
フレームワーク不使用の単一HTMLファイルアプリで、CSVデータをJSONに変換するビルドスクリプトを含みます。
開発は WSL2 (Ubuntu) 上で行います（もともとは Windows ローカルで作業しており、Windows 特有のトラブルを避けるため WSL へ移設しました）。

## 開発コマンド

```bash
# 開発環境: WSL2 (Ubuntu)。リポジトリは WSL 側の Linux ファイルシステムに置く（/mnt/c/... は避ける）
# 依存パッケージのインストール
pnpm install

# CSV → JSON ビルド（単語データの生成）
pnpm run build

# テスト — 未設定（このプロジェクトにはテストは存在しない）
```

## 主なファイル

| ファイル | 説明 |
|---|---|
| `english_typing.html` | メインアプリ単一ファイル。HTML/CSS/JSが全て含まれる。ブラウザで直接開くだけで動作 |
| `build.mjs` | csv-parseを使って `csv/` のCSVファイルから `json/` にJSONデータを生成するビルドスクリプト |
| `json/words-data.js` | ビルド成果物。`window.WORDS` として全単語データを公開（HTMLから直接読み込み用） |
| `csv/*.csv` | ソースの単語データ（UTF-8。BOM付き・BOMなしどちらも可）。編集したら `pnpm run build` で再生成 |
| `.gitattributes` | 改行コードをLFに正規化する設定（CRLF/LF混在の防止） |

## アーキテクチャ

- **単一HTMLファイル構成**: `english_typing.html` にCSS・JSが全て埋め込まれている。SPA的な画面遷移（start → quiz → result/history）を `<section>` の hidden属性で制御
- **データフロー**: CSV (`csv/`) → `build.mjs` → JSON (`json/`) → `json/words-data.js` → HTML内JSで `window.WORDS` として読み込み
- **状態管理**: グローバルの `state` オブジェクトに現在の問題キュー・スコア・間違えた問題などを保持
- **永続化**: `localStorage` にテスト履歴 (`typingHistory`) と出題済み問題の進捗 (`typingAttempted`) を保存
- **チャート**: Canvas APIによる手描きの折れ線グラフ（外部ライブラリ不使用）

## 単語データ構造

各単語オブジェクト:
```js
{ lesson: "1-1", part: "1", en: "hello", answer: "hello", ipa: "heˈlóu", pos: "名", ja: "こんにちは", ex_en: "...", ex_ja: "...", memo: "..." }
```

- `lesson`: サブレッスンID（`1-1` のような `番号-パート` 形式、`elementary`、または数値のみ）
- `answer`: `〜` 以下の表現を除いた答え用英語（ビルド時に自動生成）
- `pos`: 品詞タグ（名/動/形/副/句など）

## 制約と注意

- サーバー不要で動作するため `file://` プロトコルでも動くが、`json/words-data.js` は外部スクリプトとして `<script src>` で読み込まれる
- パッケージマネージャーは pnpm (v11.10.0)。`.npmrc` で `shamefully-hoist=true` が設定されている
- `json/` と `csv/` はGit管理対象。クローン後は `pnpm install && pnpm run build` でデータを再生成可能
- 依存は `csv-parse` だけのミニマム構成
- CSVは表計算ソフト不要でテキストエディタ／Google スプレッドシート等で編集可能。カンマ・引用符を含むセルはダブルクォートで囲む（RFC4180準拠、csv-parseが処理）
- 開発環境は WSL2 (Ubuntu 22.04)。Node.js / pnpm はWSL側のものを使う（`which -a node pnpm` で確認。PATHの先頭に `/mnt/c/...` が来るとWindows側の実行ファイルが使われてしまう）
- 改行コードは `.gitattributes`（`* text=auto eol=lf`）でLFに統一済み。CRLFで保存してもコミット時にLFへ正規化される（`build.mjs` は CSV の CRLF/LF どちらでも読み込める）
- HTMLを確認するときは、Windowsのエクスプローラーで `\\wsl.localhost\Ubuntu\home\<ユーザー名>\projects\english-word-typing-wsl` を開いて `english_typing.html` をダブルクリックするか、WSLから `explorer.exe .` でフォルダを開く