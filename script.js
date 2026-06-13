/* ============================================================
   文豪探偵録 — メインスクリプト
   - turn.js でページめくり
   - ?view=linear では縦読み/no-JS相当の表示
   - 目次クリックで該当頁まで連続めくり
   ============================================================ */

(function(global){
  var params = new URLSearchParams(global.location.search);
  var linear = params.get('view') === 'linear';
  global.PortfolioMode = { linear: linear };

  document.addEventListener('DOMContentLoaded', function(){
    if(linear) document.body.classList.add('linear-mode');
  });
})(window);

(function(global){
  function showFallbackNotice(msg){
    document.addEventListener('DOMContentLoaded', function(){
      document.body.classList.remove('book-mode');
      document.body.classList.remove('book-ready');
      document.body.classList.add('linear-mode');
      var d = document.createElement('div');
      d.className = 'load-notice';
      d.style.cssText = 'position:fixed;left:16px;right:16px;top:14px;z-index:99999;background:rgba(15,9,4,0.92);color:#e8c98a;border:1px solid #cbb088;font-family:serif;padding:12px 16px;text-align:center;line-height:1.7;';
      d.textContent = msg;
      document.body.appendChild(d);
    });
  }

  if(global.PortfolioMode.linear) return;

  if(typeof jQuery === 'undefined'){
    showFallbackNotice('ページめくりライブラリを読み込めなかったため、縦読み表示に切り替えました。');
    return;
  }
  if(typeof jQuery.fn.turn === 'undefined'){
    showFallbackNotice('turn.jsを読み込めなかったため、縦読み表示に切り替えました。');
    return;
  }

  (function($){
    var reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function chapterAtPage(page){
      if(page <= 1) return '表紙';
      if(page === 2 || page === 3) return '目次';
      if(page === 4 || page === 5) return '序';
      if(page === 6 || page === 7 || page === 8) return '作品';
      if(page === 9 || page === 10) return '生い立ち';
      if(page === 11 || page === 12) return '読書と言葉';
      if(page === 13 || page === 14) return '興味';
      if(page === 15 || page === 16) return 'Skills';
      if(page === 17 || page === 18) return '趣味';
      if(page === 19 || page === 20) return '書簡';
      return '裏表紙';
    }

    var hashToPage = {
      '#preface': 5,
      '#works': 7,
      '#case-01': 7,
      '#case-03': 8,
      '#background': 9,
      '#reading': 11,
      '#interests': 13,
      '#skills': 15,
      '#hobbies': 17,
      '#contact': 19
    };

    function calcSize(){
      var W = window.innerWidth, H = window.innerHeight;
      var maxW = Math.min(W * 0.92, 1400);
      var maxH = Math.min(H * 0.86, 900);
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
        duration: reduceMotion ? 400 : 1100,
        acceleration: true,
        gradients: true,
        elevation: 60,
        when: {
          turning: function(e, page){ onTurning(page); },
          turned:  function(e, page){ onTurned(page); }
        }
      });
      return $fb;
    }

    var coverOpened = false;
    function onTurning(page){
      BookAudio.play('page-turn');
      if(!coverOpened && page >= 3){ coverOpened = true; BookAudio.play('cover-open'); }
      updateBookmark(page);
    }

    function onTurned(page){
      updateBookmark(page);
      setTimeout(function(){ triggerInkAt(page); }, 120);
    }

    function updateBookmark(page){
      var total = $('#flipbook').turn('pages') || $('#flipbook > div').length;
      var shown = page;
      $('#bmLabel').text(chapterAtPage(shown));
      $('#bmCur').text(shown);
    }

    function triggerInkAt(){
      $('.ink-target').each(function(){
        var $el = $(this);
        var rect = this.getBoundingClientRect();
        if(rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0){
          if(!$el.hasClass('bleed')){
            $el.addClass('bleed');
            BookAudio.play('ink-drop');
          }
        }
      });
    }

    function goToPage(target){
      var page = parseInt(target, 10);
      if(!page) return;
      BookAudio.play('stamp');
      $('#flipbook').turn('page', page);
    }

    function bindToc(){
      $(document).on('click', '.toc-item', function(e){
        var target = parseInt($(this).attr('data-goto'), 10);
        if(!target) return;
        e.preventDefault();
        goToPage(target);
      });
    }

    function bindKeys(){
      $(document).on('keydown', function(e){
        var tag = (document.activeElement && document.activeElement.tagName) || '';
        if(/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
        if(e.key === 'ArrowRight' || e.keyCode === 39){ $('#flipbook').turn('next'); }
        else if(e.key === 'ArrowLeft' || e.keyCode === 37){ $('#flipbook').turn('previous'); }
      });
    }

    function bindHud(){
      var $btn = $('#soundToggle'), $lbl = $('#soundLabel');
      $btn.on('click', function(){
        var now = !BookAudio.isEnabled();
        BookAudio.setEnabled(now);
        $btn.attr('aria-pressed', now ? 'true' : 'false');
        $lbl.text(now ? '音 ON' : '音 OFF');
        if(now) setTimeout(function(){ BookAudio.play('stamp'); }, 40);
      });

      var help = document.getElementById('helpPanel');
      $('#helpBtn').on('click', function(){
        help.hidden = !help.hidden;
      });
      $('#helpClose').on('click', function(){
        help.hidden = true;
      });
    }

    function bindCoverClick(){
      $('#flipbook').on('click', '.cover-front', function(){
        $('#flipbook').turn('next');
      });
    }

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

    function bindHashNavigation(){
      if(hashToPage[window.location.hash]){
        setTimeout(function(){ goToPage(hashToPage[window.location.hash]); }, 180);
      }
      $(window).on('hashchange', function(){
        if(hashToPage[window.location.hash]) goToPage(hashToPage[window.location.hash]);
      });
    }

    $(function(){
      document.body.classList.remove('linear-mode');
      document.body.classList.add('book-mode');
      var total = $('#flipbook > div').length;
      $('#bmTotal').text(total);

      initBook();
      document.body.classList.add('book-ready');
      bindToc();
      bindKeys();
      bindHud();
      bindCoverClick();
      bindResize();
      bindHashNavigation();
      updateBookmark(1);
    });
  })(jQuery);
})(window);
