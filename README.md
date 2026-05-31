# 文豪探偵録 — ポートフォリオ

革表紙の手帳をめくる体験で，作品・手記・書簡をひとつの本として読める1ページ構成のポートフォリオです．

## 構成

- `index.html` — すべてのコンテンツが入った単一ページ
- `style.css` — スタイル
- `script.js` — turn.js初期化と章ジャンプ
- `audio-engine.js` — 音の合成と再生
- `js/jquery.min.js`, `js/turn.min.js` — ページめくりライブラリ
- `audio/` — 音素材を置く場所（差し替え可能）

## 起動

ファイルを開くだけ．turn.jsとjQueryはローカルに同梱しているのでネット接続なしでも動きます．フォントだけはGoogle Fontsを参照するので，読み込めない環境では游明朝などにフォールバックします．

公開する場合はフォルダごと Netlify／Vercel／GitHub Pages にアップロードしてください．

## 中身の書き換え

すべて `index.html` の中にあります．探しやすいよう各見開きに `<!-- N. 章名 -->` のコメントを入れてあります．

- 表紙のタイトル → `class="cover-title"` の中身
- 序文 → `<!-- 5. 序（左） -->` のページ内
- 作品 → `<!-- 7. 作品（左） -->` 以降の `case-card` 要素
- 生い立ち／愛読書／時代 → 各章のページ
- 連絡先 → `<!-- 16. 書簡の続き -->` の `contact-links` のURL

## 音素材の差し替え

デフォルトでは Web Audio API で合成した音が鳴ります（紙のシャッ・革のきしみ・インクの滴・スタンプの打音）．軽量ですが質感はそこそこです．

`audio/` フォルダに以下のファイル名でMP3を置くと自動的にそちらが優先再生されます：

| ファイル名             | 鳴るタイミング                       |
|------------------------|--------------------------------------|
| `audio/page-turn.mp3`  | ページがめくられるとき               |
| `audio/cover-open.mp3` | 表紙が初めて開かれるとき             |
| `audio/ink-drop.mp3`   | 章タイトルでインクが滲むとき         |
| `audio/stamp.mp3`      | 目次クリック・音ON時の確認音         |

### おすすめのフリー素材サイト

いずれも商用・個人利用OK．クレジット表記の要否はライセンスによって違うので各サイトで確認してください．

- **Freesound** ([freesound.org](https://freesound.org/))
  CC0またはCC-BYで膨大な数の効果音．会員登録（無料）が必要．
  検索キーワード例：`page turn`, `book open`, `paper rustle`, `ink drop`, `stamp`, `leather creak`
- **Mixkit** ([mixkit.co/free-sound-effects/](https://mixkit.co/free-sound-effects/))
  登録不要．Mixkitライセンスで無料利用可．
- **Pixabay Sound Effects** ([pixabay.com/sound-effects/](https://pixabay.com/sound-effects/))
  登録不要．Pixabayライセンスで商用無料．
- **Zapsplat** ([zapsplat.com](https://www.zapsplat.com/))
  会員登録（無料）でクレジット表記ありの利用可．

ダウンロードしたMP3を上記の名前にリネームして `audio/` に置けば反映されます．長さは1秒以内のものを選ぶと違和感が少ないです．

## 操作方法

- 本の **角をマウスでドラッグ** で物理的にページをめくる
- **角をクリック** でも1ページずつめくれる
- **目次の項目をクリック** で該当章まで自動的に連続めくり
- **キーボードの← →** で前後に移動
- 右上の **♪ ボタン** で効果音のON／OFF（デフォルトOFF）
- 右上の **? ボタン** で操作ヘルプ

## 動作確認済み

Chrome／Safari／Firefox／Edgeの最新版．iOS Safari／Android Chromeでもタッチでめくれます．

## クレジット

- ページめくり：[turn.js](http://turnjs.com/) (BSD License) by Emmanuel García
- jQuery 1.12.4 (MIT License)
- Fonts: Shippori Mincho, Special Elite (Google Fonts, SIL Open Font License)
