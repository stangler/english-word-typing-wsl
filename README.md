# 英単語タイピング確認テスト

NEW CROWN Lesson 1〜5 + 小学校 の単語を対象としたタイピング練習アプリです。

ブラウザだけで動作するので、サーバーを用意する必要はありません。

- リポジトリ: <https://github.com/stangler/english-word-typing-wsl>
- 開発環境: WSL2 (Ubuntu)（もともとは Windows ローカルで開発していました。詳細は「開発環境」の節を参照）

## 使い方

1. `english_typing.html` をブラウザで直接開く（サーバー不要）
2. レッスンを選んでスタート
3. 日本語の意味に合う英単語・熟語をタイピング → Enter で答え合わせ
4. 「📉 苦手分析」で、どの単語をどれだけ間違えているか・どんな傾向で間違えているかを確認

### 機能

- **シャッフル機能**: 問題の順番をランダムに並び替えて出題できます
- **正誤記録**: セッション内の正解数・不正解数がリアルタイムに表示されます
- **復習機能**: 終了画面で間違えた単語の一覧を確認できます
- **パート／カテゴリー選択**: Lesson1〜5は「Lesson1」ボタン→「Part1」「Goal Activity」のようにパート単位で、「小学校」は「人」「動物」など12カテゴリー単位で出題できます。トップ画面のボタン数を抑えるため、パート・カテゴリーは1つのボタンをタップして開くパネルから選ぶ方式です
- **テスト履歴**: トップ画面下部に直近の結果一覧を表示（結果はリロードなしで即時反映）。結果画面の「履歴を見る」ボタンから、レッスンごとの正答率推移グラフと全履歴の一覧を確認できます
- **進捗状況の可視化**: 履歴画面に「進捗状況」パネルを表示し、Lesson1〜5の各パート・小学校の各カテゴリーについて「済（直近の正答率）」「未着手」が出題済み問題数とともに一目でわかります。バッジをタップするとその項目のクイズにすぐ挑戦できます
- **苦手分析**: 1問答えるたびに単語ごとの正誤・誤答を記録し、「📉 苦手分析」画面（トップ画面・結果画面・履歴画面から開けます）で次の内容を確認できます。記録は、テストを途中でやめた分も残ります
  - 間違い回数ランキング（上位30語）: 間違い回数 / 出題回数、直近の誤答、誤答タイプ
  - パート／カテゴリー別の誤答率
  - 誤答タイプ別の件数: 空欄 / 記号・スペースのミス / 語順違い・語の欠落・余分な語（熟語） / 語尾の違い（-s・-ed・-ing など） / 1文字の脱字 / 1文字の余分 / 隣り合う文字の入れ替え / 1文字の打ち間違い / 複数文字の綴りミス / 別の単語・うろ覚え
  - 品詞別の誤答率
  - 綴り・形の特徴別の誤答率: 熟語 / 文字数 / 記号を含む / 同じ文字の連続（ll, ss など） / ie・ei / gh・ph / -tion・-sion
  - 全体の誤答率より10ポイント以上高い項目には ▲ が付き、回答3回未満の項目は「データ不足」と表示されます
  - 「⬇ JSONエクスポート」で、単語別の記録と履歴をまとめてダウンロードできます
  - 記録は機能追加後に解いた分から貯まります（それ以前の分は復元できません）。誤答タイプと特徴は自動判定のため目安です

### ブラウザに保存されるデータ（localStorage）

| キー | 内容 |
|---|---|
| `typingHistory` | テスト終了時の結果（レッスン / 問題数 / 正解数 / 正答率） |
| `typingAttempted` | 出題済み問題の進捗 |
| `typingCompletion` | レッスンごとの直近の正答率・挑戦回数 |
| `typingWordStats` | 単語単位の記録（出題回数・間違い回数・誤答・誤答タイプ） |

「履歴をすべて削除」を実行すると、上記4つがすべて削除されます。

## 開発環境

**WSL2 (Ubuntu) 上の Linux ファイルシステムで開発します。**

以前は Windows ローカル（リポジトリ名 `english-word-typing-win`）で作業していましたが、Windows 特有のトラブルが多かったため、リポジトリ名を `english-word-typing-wsl` に変更して作業環境を WSL 上へ移設しました。

移設のきっかけになった Windows でのトラブル:

- パスの区切り文字（`\` と `/`）や大文字・小文字の扱いの違いでスクリプトが期待どおり動かない
- 改行コード（CRLF / LF）の混在、日本語ファイル名（`csv/小学校.csv`）を扱うシェルでの文字エンコーディングの問題
- `node_modules` のファイルロック（`EPERM` / `EACCES`）やセキュリティソフトによるインストール・ビルドの遅延

リポジトリは **WSL 側の Linux ファイルシステム**（例: `~/projects/english-word-typing-wsl`）に置いてください。`/mnt/c/...`（Windows 側のドライブ）に置くと I/O が遅く、ファイル監視・パーミッションの問題も再発します。

### 必要なもの（WSL 側にインストールする）

- [Node.js](https://nodejs.org/)（WSL 側の v24 で動作確認）
- [pnpm](https://pnpm.io/)（v11 で動作確認、`npm install -g pnpm` でも導入可能）

WSL 側と Windows 側の両方に Node.js / pnpm が入っている場合は `which -a node pnpm` で確認してください。PATH の先頭に `/mnt/c/...` が来ていると Windows 側の実行ファイルが使われてしまいます。

### 初期セットアップ

```bash
# 依存パッケージのインストール
pnpm install
```

### Windows のブラウザでの動作確認

`file://` で開くだけで動作するため、WSL 上のファイルをそのまま Windows のブラウザで開けます。

1. Windows のエクスプローラーで `\\wsl.localhost\Ubuntu\home\<ユーザー名>\projects\english-word-typing-wsl` を開く
2. `english_typing.html` をダブルクリック（既定のブラウザで開きます）

WSL のターミナルからエクスプローラーを開く場合は次のコマンドが使えます。

```bash
# エクスプローラーでカレントディレクトリを開く
explorer.exe .
```

`http://` の URL で開きたい場合は、簡易サーバー経由でも確認できます（WSL2 の localhost 転送により Windows 側のブラウザからアクセスできます）。

```bash
python3 -m http.server 8000
# → Windows のブラウザで http://localhost:8000/english_typing.html を開く
```

### 単語データの更新

`csv/` フォルダに以下のCSVファイル（UTF-8）を配置した後、`pnpm run build` でJSONデータを再生成します。
Excel不要。テキストエディタやGoogleスプレッドシート、LibreOffice Calcなどで編集できます（BOM付きUTF-8でもBOMなしUTF-8でも読み込めます）。

必要なCSVファイル:

| ファイル | 内容 |
|---|---|
| `csv/Lesson1.csv` | NEW CROWN Lesson 1 の単語データ |
| `csv/Lesson2.csv` | NEW CROWN Lesson 2 の単語データ |
| `csv/Lesson3.csv` | NEW CROWN Lesson 3 の単語データ |
| `csv/Lesson4.csv` | NEW CROWN Lesson 4 の単語データ |
| `csv/Lesson5.csv` | NEW CROWN Lesson 5 の単語データ |
| `csv/小学校.csv` | 小学校の基本英単語 |

各CSVの列（1行目がヘッダー）:
- Lesson1〜5: `Lesson,Part,英語,発音,品詞,意味,英語例文,日本語訳,なんでもメモ`
- 小学校: `カテゴリー,英語,発音,日本語`

カンマや引用符を含むセルはダブルクォート `"..."` で囲んでください（例文中のカンマなど）。

```bash
pnpm run build
```

## 注意事項

- `csv/`（元データ）と `json/`（ビルド成果物）は、どちらも Git 管理対象です。`json/` は `build.mjs` が自動生成するため直接編集しないでください。  
  リポジトリをクローンしたら `pnpm install && pnpm run build` でデータを生成できます。
- 改行コードは `.gitattributes`（`* text=auto eol=lf`）でリポジトリ内 LF に統一済みです（Windows 時代に作成したファイルの CRLF / LF 混在は解消しました）。Windows 側のエディタで CRLF として保存しても、コミット時に LF へ正規化されます。
- そのため `csv/*.csv` も LF です。Excel で直接開くと改行が正しく扱われない場合があるため、編集にはテキストエディタや Google スプレッドシート等を使ってください。
- 日本語のファイル名（`csv/小学校.csv`）も WSL のシェルからそのまま指定できます（Windows 側のシェルで必要だった文字コード関連の指定は不要です）。

## ファイル構成

| ファイル | 説明 |
|---|---|
| `english_typing.html` | メインアプリ（ブラウザで直接開く） |
| `build.mjs` | CSV → JSON 変換スクリプト |
| `package.json` | プロジェクト設定・スクリプト定義 |
| `pnpm-lock.yaml` | pnpm ロックファイル |
| `CLAUDE.md` | AI コーディングエージェント（Claude Code）向けのリポジトリガイド |
| `.gitignore` | Git 管理除外設定 |
| `.npmrc` | npm/pnpm 設定 |
| `.gitattributes` | 改行コードの正規化設定（LF に統一） |
| `csv/` | 元のCSVファイル（編集するのはここ、Git管理対象） |
| `json/` | ビルド成果物のJSON（Git管理対象） |

### ビルドで生成されるファイル

| ファイル | 説明 |
|---|---|
| `json/words-data.js` | 全単語データ（HTMLから直接読み込まれる） |
| `json/words.json` | 全単語データ（JSON形式） |
| `json/lesson1-1.json`〜`lesson1-4.json` | Lesson 1（Part1〜3・Goal Activity）のデータ |
| `json/lesson2-1.json`〜`lesson2-3.json` | Lesson 2（Part1・Part2・Goal Activity）のデータ |
| `json/lesson3-1.json`〜`lesson3-6.json` | Lesson 3（Introduction・Part1〜3・Goal Activity・Take Action! Talk 1）のデータ |
| `json/lesson4-1.json`〜`lesson4-6.json` | Lesson 4（Introduction・Part1・Part2・Goal Activity・Take Action! Listen 1・Take Action! Talk 2）のデータ |
| `json/lesson5-1.json`〜`lesson5-6.json` | Lesson 5（Part1〜3・Small Talk・Goal Activity・Take Action! Listen 2）のデータ |
| `json/lesson-elementary.json` | 小学校のみのデータ |

## 対象単語

合計 397 語（Lesson 1〜5: 182 語 + 小学校: 215 語）を収録しています。

- Lesson 1〜5（NEW CROWN、各レッスンともPart単位で分割済み）
  - Lesson 1: 1-1〜1-4（Part1〜3・Goal Activity）
  - Lesson 2: 2-1〜2-3（Part1・Part2・Goal Activity）
  - Lesson 3: 3-1〜3-6（Introduction・Part1〜3・Goal Activity・Take Action! Talk 1）
  - Lesson 4: 4-1〜4-6（Introduction・Part1・Part2・Goal Activity・Take Action! Listen 1・Take Action! Talk 2）
  - Lesson 5: 5-1〜5-6（Part1〜3・Small Talk・Goal Activity・Take Action! Listen 2）
- 小学校で習う基本英単語（カテゴリー: 人／動物／食べ物・飲み物／身の回りのもの／場所／自然／教科／スポーツ／その他いろいろな名詞／状態や動作を表すことば／名詞をくわしくできることば／動詞・形容詞をくわしくできることば）

## 技術

- 純粋なHTML + CSS + JavaScript（フレームワーク不使用）
- データは `json/words-data.js` から読み込み（サーバー不要、ブラウザで直接開いて動作）
- CSV → JSON変換には [csv-parse](https://csv.js.org/parse/) を使用
- パッケージ管理: [pnpm](https://pnpm.io/)
- 開発環境: WSL2（Ubuntu 22.04 LTS）上の Linux ファイルシステム、Node.js v24 / pnpm v11
