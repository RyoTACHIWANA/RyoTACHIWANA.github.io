/* ============================================================
   文豪探偵録 — メインスクリプト
   - turn.js でページめくり
   - 目次クリックで該当頁まで連続めくり
   - 章の頭でインク滲みアニメ＋音
   ============================================================ */

/* --- 読み込みチェック：jQuery / turn.js が無ければ案内を表示 --- */
(function(){
  function showLoadError(msg){
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(15,9,4,0.95);color:#e8c98a;font-family:serif;padding:32px;text-align:center;line-height:2;';
    d.innerHTML = '<div style="max-width:480px"><div style="font-size:18px;margin-bottom:16px;letter-spacing:0.1em">読み込みに失敗しました</div><div style="font-size:14px;color:#cbb088">' + msg + '</div></div>';
    document.body.appendChild(d);
  }
  if(typeof jQuery === 'undefined'){
    document.addEventListener('DOMContentLoaded', function(){
      showLoadError('js フォルダ内の jquery.min.js と turn.min.js が見つかりません。<br><br>index.html と同じ場所に <b>js</b> フォルダがあり、その中に両ファイルが入っているか確認してください。');
    });
    throw new Error('jQuery not loaded');
  }
  if(typeof jQuery.fn.turn === 'undefined'){
    document.addEventListener('DOMContentLoaded', function(){
      showLoadError('js/turn.min.js が見つかりません。<br><br>index.html と同じ場所の js フォルダに turn.min.js を入れてください。');
    });
    throw new Error('turn.js not loaded');
  }
})();

(function($){
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 見開きごとの章名（しおり用）。見開きインデックスは Math.ceil(page/2)
  // ページ1は単独表紙、ページ最後も単独裏表紙
  // 見開き構成（左,右）: [_,1表紙] [2見返し,3目次] [4装飾,5序] [6装飾,7作品] [8作品,9生い立ち] [10生い立ち,11愛読書] [12愛読書,13時代] [14時代,15書簡] [16書簡,17見返し] [18裏表紙,_]
  function chapterAtPage(page){
    if(page <= 1) return '表紙';
    if(page === 2 || page === 3) return '目次';
    if(page === 4 || page === 5) return '序';
    if(page === 6 || page === 7) return '作品';
    if(page === 8) return '作品';
    if(page === 9 || page === 10) return '生い立ち';
    if(page === 11 || page === 12) return '愛読書';
    if(page === 13 || page === 14) return '心惹かれる時代';
    if(page === 15 || page === 16) return '書簡';
    return '裏表紙';
  }

  // 本のサイズをビューポートから計算
  function calcSize(){
    var W = window.innerWidth, H = window.innerHeight;
    // 余白を確保しつつ、できるだけ大きく
    var maxW = Math.min(W * 0.92, 1400);
    var maxH = Math.min(H * 0.86, 900);
    // 見開きの縦横比 ≒ 1.4 : 1（見開き全体）。1ページ単独だと 0.7 : 1
    // turn.jsは見開きwidthで指定
    var w = maxW, h = w / 1.5;
    if(h > maxH){ h = maxH; w = h * 1.5; }
    return { w: Math.round(w), h: Math.round(h) };
  }

  function initBook(){
    var s = calcSize();
    var $fb = $('#flipbook');
    $fb.turn({
      width: s.w,
      height: s.h,
      autoCenter: true,
      duration: reduceMotion ? 400 : 1100,   // ゆっくりめのめくり
      acceleration: true,
      gradients: true,
      elevation: 60,
      when: {
        turning: function(e, page, view){ onTurning(page); },
        turned:  function(e, page, view){ onTurned(page); }
      }
    });
    return $fb;
  }

  // 現在の見開きで「表紙→開く」演出の音を一度だけ
  var coverOpened = false;
  function onTurning(page){
    BookAudio.play('page-turn');
    if(!coverOpened && page >= 3){ coverOpened = true; BookAudio.play('cover-open'); }
    updateBookmark(page);
  }

  function onTurned(page){
    updateBookmark(page);
    // この見開きに章タイトルがあれば、インク滲み演出を発火
    setTimeout(function(){ triggerInkAt(page); }, 120);
  }

  function updateBookmark(page){
    $('#bmLabel').text(chapterAtPage(page));
    // turn.js は見開きの左ページ番号を返すことがある。
    // 表紙(1)と裏表紙(最終)以外は、章タイトルのある右ページ番号を表示する。
    var total = $('#flipbook > div').length;
    var shown = page;
    if(page > 1 && page < total && page % 2 === 0){ shown = page + 1; }
    $('#bmCur').text(shown);
  }

  // ページ内のインク滲み対象を発火
  function triggerInkAt(page){
    // 現在の見開きにある2ページのうち、ink-targetが含まれるものを探す
    var $pages = $('#flipbook .page');
    $pages.each(function(){
      var $p = $(this);
      var idx = $p.data('page-id') || $p.index() + 1;
    });
    // 簡単のため、可視中のページ内の .ink-target を全てrefreshする
    $('.ink-target').each(function(){
      var $el = $(this);
      // 可視チェック：祖先のpageが現在ターン後に表示されているか
      var rect = this.getBoundingClientRect();
      if(rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0){
        if(!$el.hasClass('bleed')){
          $el.addClass('bleed');
          BookAudio.play('ink-drop');
        }
      }
    });
  }

  // 目次クリック → 該当頁まで連続めくり
  function bindToc(){
    $(document).on('click', '.toc-item', function(e){
      e.preventDefault();
      var target = parseInt($(this).attr('data-goto'), 10);
      BookAudio.play('stamp');
      $('#flipbook').turn('page', target);
    });
  }

  // キーボード ← →
  function bindKeys(){
    $(document).on('keydown', function(e){
      // フォーカスがinput等にあるときはスキップ
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if(/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
      if(e.key === 'ArrowRight' || e.keyCode === 39){ $('#flipbook').turn('next'); }
      else if(e.key === 'ArrowLeft' || e.keyCode === 37){ $('#flipbook').turn('previous'); }
    });
  }

  // 音トグル
  function bindHud(){
    var $btn = $('#soundToggle'), $lbl = $('#soundLabel');
    $btn.on('click', function(){
      var now = !BookAudio.isEnabled();
      BookAudio.setEnabled(now);
      $btn.attr('aria-pressed', now ? 'true' : 'false');
      $lbl.text(now ? '音 ON' : '音 OFF');
      if(now){
        // 押した瞬間に短いフィードバック音
        setTimeout(function(){ BookAudio.play('stamp'); }, 40);
      }
    });
    var $help = $('#helpPanel');
    $('#helpBtn').on('click', function(){ $help.attr('hidden', !$help.is('[hidden]') ? '' : null); });
    $('#helpClose').on('click', function(){ $help.attr('hidden',''); });
  }

  // 表紙クリックでも開く（最初の頁めくり）
  function bindCoverClick(){
    $('#flipbook').on('click', '.cover-front', function(){
      $('#flipbook').turn('next');
    });
  }

  // リサイズ
  function bindResize(){
    var to;
    $(window).on('resize', function(){
      clearTimeout(to);
      to = setTimeout(function(){
        var s = calcSize();
        $('#flipbook').turn('size', s.w, s.h);
      }, 120);
    });
  }

  // 初期化
  $(function(){
    // しおりの総ページ数を反映
    var total = $('#flipbook > div').length;
    $('#bmTotal').text(total);

    initBook();
    bindToc();
    bindKeys();
    bindHud();
    bindCoverClick();
    bindResize();
    updateBookmark(1);

    // 表紙はクリックでも開けることを示すヒントを少し見せておく
  });

})(jQuery);
