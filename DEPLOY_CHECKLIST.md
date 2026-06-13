# 文豪探偵録ポートフォリオ — GitHub Pages公開チェックリスト

## 1. ローカル確認

```bash
python3 -m http.server 8000
```

- 通常表示: `http://localhost:8000/`
- 速読表示: `http://localhost:8000/?view=linear#works`
- 代表研究直リンク: `http://localhost:8000/?view=linear#case-03`

## 2. 公開前に確認すること

- 表紙からページめくりが動く
- 目次から各章へ移動できる
- `?view=linear` で全章を縦に読める
- JSが失敗しても本文が読める
- EmailとGitHubリンクが正しい
- SNS共有用の `assets/og-cover.jpg` が表示される
- 主要画像がWebPで配信される
- 未確認の成果数値や未実装機能を実装済みと読ませる表現がない

## 3. GitHub Pages設定

リポジトリ直下を以下のように配置する。

```txt
.
├── index.html
├── style.css
├── script.js
├── audio-engine.js
├── favicon.svg
├── assets/
│   ├── og-cover.jpg
│   ├── optimized/
│   └── hobbies/
├── js/
│   ├── jquery.min.js
│   └── turn.min.js
├── audio/
├── README.md
├── DEPLOY_CHECKLIST.md
└── .nojekyll
```

GitHubのリポジトリ画面で:

1. `Settings`
2. `Pages`
3. `Build and deployment`
4. `Source`: `Deploy from a branch`
5. `Branch`: `main`
6. Folder: `/ (root)`
7. `Save`

## 4. 採用・研究ポートフォリオとしての確認軸

代表作は以下が読める状態にする。

- 課題
- データ
- 手法
- 担当
- 結果または現時点で確認できる成果
- 限界
- 外部リンク

未測定の精度、未公開のコード、未実装のRAGは、実績として書かない。

## 5. 推奨検証

```bash
npx lighthouse http://localhost:8000 --preset=desktop
npx @axe-core/cli http://localhost:8000
```

目標:

- Lighthouse Performance: 90以上
- Accessibility: 95以上
- Best Practices: 95以上
- SEO: 100
- axe重大違反ゼロ
