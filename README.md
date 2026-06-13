# 文豪探偵録 — Ryo TACHIWANA Portfolio

革表紙の手帳をめくる体験で読む、日本語NLP/災害証言分析ポートフォリオです。通常表示では turn.js のページめくりを使い、`?view=linear` では採用担当者向けに縦スクロールで素早く読めます。

## 構成

- `index.html` — 全コンテンツ、SEO/OGP/JSON-LD、線形ビュー用アンカー
- `style.css` — 手帳表示、線形/no-JSフォールバック、レスポンシブ、a11y
- `script.js` — turn.js初期化、目次ジャンプ、線形ビュー切替、音/ヘルプ制御
- `audio-engine.js` — Web Audio API 合成音とMP3フォールバック
- `assets/optimized/` — WebP化した表示用画像
- `assets/og-cover.jpg` — SNS共有用OGP画像
- `js/jquery.min.js`, `js/turn.min.js` — ページめくり用ライブラリ

## ローカル確認

```bash
python3 -m http.server 8000
```

通常表示:

```txt
http://localhost:8000/
```

速読表示:

```txt
http://localhost:8000/?view=linear#works
```

## 内容編集の目印

- 代表作: `#case-01`, `#case-03`
- 技術スタック: `#skills`
- 連絡先: `#contact`
- 公開URL: `index.html` 内の `canonical`, `og:url`, `twitter:image`

成果数値は、公開可能な一次情報で確認できるものだけを書いています。未測定の精度、未実装のRAG、未提供のCV/外部リンクは追加していません。

## 検証コマンド

```bash
npx lighthouse http://localhost:8000 --preset=desktop
npx @axe-core/cli http://localhost:8000
```

公開前に、ネガティブな整備状況の自己申告、作業用の仮文言、未確認数値、未実装機能を実装済みと読ませる表現が残っていないか全文検索してください。

## 依存について

ページめくり体験は既存の turn.js を維持しています。jQuery 3.7.1への差し替えは表示確認までは通りましたが、モバイルPerformanceが安定しなかったため、今回は既存の1.12.4に戻しています。将来的な撤去や軽量実装への置換は別タスクです。

## クレジット

- ページめくり: turn.js (BSD License) by Emmanuel Garcia
- jQuery 1.12.4 (MIT License)
- Fonts: Shippori Mincho, Special Elite (Google Fonts, SIL Open Font License)
