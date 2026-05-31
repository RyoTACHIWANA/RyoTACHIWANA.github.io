/* ============================================================
   audio-engine.js
   - audio/{name}.mp3 があれば優先して再生
   - 無ければ Web Audio API で合成
   ============================================================ */

(function(global){
  var ctx = null;
  var enabled = false;
  var buffers = {};        // 読み込み済みMP3
  var available = {};      // MP3 が用意されているか
  var SOUNDS = ['page-turn','cover-open','ink-drop','stamp'];
  var BUFFER_GAINS = {
    'page-turn': 0.5
  };

  function ensureCtx(){
    if(ctx) return ctx;
    try{
      var AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return null;
      ctx = new AC();
    }catch(e){ return null; }
    return ctx;
  }

  // audioフォルダにMP3があれば読み込む（無くてもエラーにしない）
  function tryLoad(name){
    if(!ctx) return Promise.resolve();
    // file:// で開かれている場合、fetch はセキュリティ制限で必ず失敗し
    // コンソールにエラーが出る。その環境では最初から合成音だけを使う。
    if(location.protocol === 'file:'){
      available[name] = false;
      return Promise.resolve();
    }
    return fetch('audio/' + name + '.mp3')
      .then(function(r){ if(!r.ok) throw new Error('no file'); return r.arrayBuffer(); })
      .then(function(buf){ return ctx.decodeAudioData(buf); })
      .then(function(decoded){ buffers[name] = decoded; available[name] = true; })
      .catch(function(){ available[name] = false; });
  }

  function preload(){
    if(!ensureCtx()) return Promise.resolve();
    return Promise.all(SOUNDS.map(tryLoad));
  }

  function playBuffer(name, gain){
    var buf = buffers[name];
    if(!buf || !ctx) return false;
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var g = ctx.createGain();
    g.gain.value = gain != null ? gain : 0.6;
    src.connect(g); g.connect(ctx.destination);
    src.start();
    return true;
  }

  // ========= 以下、合成音 =========
  // 紙のページめくり音：短いノイズバースト＋ローパススイープ
  function synthPageTurn(){
    var t = ctx.currentTime;
    var dur = 0.32;
    // ノイズバッファ
    var sr = ctx.sampleRate, n = ctx.createBuffer(1, sr*dur, sr);
    var d = n.getChannelData(0);
    for(var i=0;i<d.length;i++){
      var p = i/d.length;
      // 立ち上がり→減衰のエンベロープ
      var env = Math.pow(1-p, 1.4) * (p < 0.05 ? p*20 : 1);
      d[i] = (Math.random()*2-1) * env;
    }
    var src = ctx.createBufferSource(); src.buffer = n;
    // ハイパス＋ローパスの組み合わせで紙のシャっという音色に
    var hp = ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=600;
    var lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=4500;
    lp.frequency.exponentialRampToValueAtTime(1200, t+dur);
    var g = ctx.createGain(); g.gain.value=0.35;
    src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t+dur);
  }

  // 表紙を開く：低めの革のきしみ。短いノイズ＋低音域＋ピッチダウン
  function synthCoverOpen(){
    var t = ctx.currentTime;
    var dur = 0.7;
    var sr = ctx.sampleRate, n = ctx.createBuffer(1, sr*dur, sr);
    var d = n.getChannelData(0);
    for(var i=0;i<d.length;i++){
      var p = i/d.length;
      var env = Math.pow(1-p, 1.2) * Math.min(1, p*8);
      // 周期的なきしみを加える
      var creak = Math.sin(2*Math.PI*60*p*dur + Math.sin(p*40)*2) * 0.3;
      d[i] = ((Math.random()*2-1)*0.6 + creak) * env;
    }
    var src = ctx.createBufferSource(); src.buffer = n;
    var lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1200;
    lp.frequency.exponentialRampToValueAtTime(400, t+dur);
    var g = ctx.createGain(); g.gain.value=0.5;
    src.connect(lp); lp.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t+dur);
  }

  // インクの「ボタッ」：低めのドロップ音。短いサイン波と軽いノイズ
  function synthInkDrop(){
    var t = ctx.currentTime;
    var osc = ctx.createOscillator(); osc.type='sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(70, t+0.25);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.45, t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t+0.32);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t+0.35);
    // 一緒に微かな滲み音
    setTimeout(function(){
      if(!ctx) return;
      var t2 = ctx.currentTime;
      var sr = ctx.sampleRate, n = ctx.createBuffer(1, sr*0.3, sr);
      var d = n.getChannelData(0);
      for(var i=0;i<d.length;i++){ d[i] = (Math.random()*2-1) * Math.pow(1-i/d.length,2) * 0.4; }
      var src = ctx.createBufferSource(); src.buffer = n;
      var lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=800;
      var gg = ctx.createGain(); gg.gain.value=0.15;
      src.connect(lp); lp.connect(gg); gg.connect(ctx.destination);
      src.start(t2);
    }, 80);
  }

  // スタンプ：木の机を叩くような短い打音
  function synthStamp(){
    var t = ctx.currentTime;
    var sr = ctx.sampleRate, n = ctx.createBuffer(1, sr*0.18, sr);
    var d = n.getChannelData(0);
    for(var i=0;i<d.length;i++){
      d[i] = (Math.random()*2-1) * Math.pow(1-i/d.length, 3);
    }
    var src = ctx.createBufferSource(); src.buffer = n;
    var bp = ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=250; bp.Q.value=2.5;
    var g = ctx.createGain(); g.gain.value=0.55;
    src.connect(bp); bp.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t+0.2);
  }

  var SYNTHS = {
    'page-turn': synthPageTurn,
    'cover-open': synthCoverOpen,
    'ink-drop': synthInkDrop,
    'stamp': synthStamp
  };

  function play(name){
    if(!enabled) return;
    if(!ensureCtx()) return;
    // 自動再生制限への対応
    if(ctx.state === 'suspended') ctx.resume();
    if(!playBuffer(name, BUFFER_GAINS[name])){
      var fn = SYNTHS[name];
      if(fn) try{ fn(); }catch(e){}
    }
  }

  function setEnabled(b){
    enabled = !!b;
    if(enabled){
      ensureCtx();
      if(ctx && ctx.state === 'suspended') ctx.resume();
      preload();
    }
  }

  global.BookAudio = {
    setEnabled: setEnabled,
    isEnabled: function(){ return enabled; },
    play: play,
    preload: preload
  };
})(window);
