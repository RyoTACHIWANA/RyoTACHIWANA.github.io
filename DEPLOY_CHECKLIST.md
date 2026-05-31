# 文豪探偵録ポートフォリオ — GitHub Pages公開チェックリスト

## 0. このZIPの使い方

この公開用ZIPは、`index.html` がルート直下に来るように調整済みです。
GitHub Pagesで `main / root` を公開元にする場合、ZIPの中身をそのままリポジトリ直下に置いてください。

## 1. 公開前に必ず差し替える項目

`index.html` の以下を差し替えてから公開する。

| 箇所 | 現在 | 差し替え方針 |
|---|---|---|
| `<title>` | 文豪探偵録 — 私的記録 | 氏名またはハンドル + Portfolio |
| `meta description` | 文豪・歴史・小説テーマ | NLP/LLM/災害情報/データ構築の説明にする |
| CASE No.01〜04 | 作品名をここに | 研究・実装・分析・MLOps系プロジェクトを入れる |
| 生い立ち | ここに経歴を綴る | 学部/研究室/研究テーマ/志向を簡潔に入れる |
| timeline | 19XX/20XX | 2024/2025/2026など実年にする |
| 愛読書 | 空欄 | 技術書・論文・文学など、人物像が伝わるものにする |
| 書簡 | you@example.com 等 | 実メール/GitHub/LinkedIn/Xなどに差し替える |

## 2. GitHubでの最短公開手順

### A. リポジトリ名

- ユーザーサイトとして公開するなら: `<GitHubユーザー名>.github.io`
- プロジェクトサイトとして公開するなら: 任意のリポジトリ名、例 `portfolio`

### B. ファイル配置

リポジトリ直下を以下のようにする。

```txt
.
├── index.html
├── style.css
├── script.js
├── audio-engine.js
├── js/
│   ├── jquery.min.js
│   └── turn.min.js
├── audio/
│   └── README.md
├── README.md
├── DEPLOY_CHECKLIST.md
└── .nojekyll
```

### C. GitHub Pages設定

GitHubのリポジトリ画面で：

1. `Settings`
2. `Pages`
3. `Build and deployment`
4. `Source`: `Deploy from a branch`
5. `Branch`: `main`
6. Folder: `/ (root)`
7. `Save`

## 3. ローカル確認

ブラウザで直接 `index.html` を開いてもよいが、公開前はローカルサーバーで確認するのが安全。

```bash
cd <repo>
python3 -m http.server 8000
```

その後、ブラウザで以下を開く。

```txt
http://localhost:8000/
```

## 4. 採用・研究ポートフォリオとして強くする最低条件

各CASEには以下の5点を必ず入れる。

```txt
作品名：
目的：
使った技術：
自分の担当：
成果・学び：
GitHub / Demo / Paper / Note：
```

特にML/NLP職向けには、見た目よりも以下が評価されやすい。

- データ収集・前処理の設計
- 評価指標
- ベースライン比較
- 失敗例・限界の記述
- 再現手順
- READMEの明確さ
- 実装の保守性

## 5. 公開後に確認すること

- URLが開けるか
- `style.css` が読み込まれているか
- ページめくりが動くか
- GitHubリンクが自分のページに向いているか
- Emailが実アドレスになっているか
- スマホで読めるか
- プレースホルダー文言が残っていないか

## 6. 既知の注意

- 効果音は初期OFF。ONにした後のみ再生される。
- Google Fontsは外部読み込み。ネットワーク制限下では代替フォントになる。
- `audio/` にMP3を入れなくても、Web Audio APIによる合成音で動く。
- 採用向けには、文豪風の演出だけでなく、技術的成果が即読めるようにする。
