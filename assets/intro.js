/* MyAIAgent — cinematic intro.
   One gesture ("Enter") opens a film sequence: the logo clip large, then the
   main film, with the Flower Duet as the opening music. The videos play muted;
   the music is a separate layer: it uses a real recording when present
   (assets/media/opening-music.mp3 or a URL) and otherwise plays an elegant
   synthesized rendition of the Flower Duet so there is always music.
   When the film ends (or is skipped) it fades into the site. Shows once/session. */
(function () {
  var KEY = "myaiagent_intro_seen";

  // base /assets/ url (works at root and /en/)
  var sc = document.querySelector('script[src*="intro.js"]');
  var ASSETS = sc ? sc.src.replace(/intro\.js.*$/, "") : "assets/";
  var MUSIC_FILE = ASSETS + "media/opening-music.mp3"; // drop a real Flower Duet here to use it

  // ---------------- music layer ----------------
  var musicEl = null, actx = null, mGain = null, busDry = null, busWet = null, padNode = null, mTimers = [], synthStopped = false;

  function impulse(sec, decay) {
    var r = actx.sampleRate, n = Math.floor(r * sec), b = actx.createBuffer(2, n, r);
    for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
    return b;
  }
  function note(freq, t, dur, type, peak, vib, dest) {
    var o = actx.createOscillator(); o.type = type; o.frequency.value = freq;
    var g = actx.createGain(); g.gain.value = 0;
    o.connect(g); g.connect(dest || busDry); if (dest !== padNode) g.connect(busWet);
    var atk = Math.min(0.45, dur * 0.3), rel = Math.min(0.9, dur * 0.45);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + atk);
    g.gain.setValueAtTime(peak, Math.max(t + atk, t + dur - rel));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (vib) { var l = actx.createOscillator(); l.frequency.value = 5.4; var lg = actx.createGain(); lg.gain.value = vib; l.connect(lg); lg.connect(o.detune); l.start(t); l.stop(t + dur + 0.05); }
    o.start(t); o.stop(t + dur + 0.06);
  }
  function pluck(freq, t, peak) {
    var o = actx.createOscillator(); o.type = "triangle"; o.frequency.value = freq;
    var g = actx.createGain(); g.gain.value = 0; o.connect(g); g.connect(busDry); g.connect(busWet);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    o.start(t); o.stop(t + 1.6);
  }
  // Lush progression in D major with a flowing two-voice melody (parallel thirds/sixths),
  // a harp arpeggio and a warm string pad — an instrumental homage to Delibes' Flower Duet.
  var CH = [
    { b: 73.42,  tri: [146.83, 185.00, 220.00], top: 880.00, low: 739.99 }, // D
    { b: 98.00,  tri: [196.00, 246.94, 293.66], top: 783.99, low: 493.88 }, // G
    { b: 123.47, tri: [246.94, 293.66, 369.99], top: 739.99, low: 587.33 }, // Bm
    { b: 110.00, tri: [220.00, 277.18, 329.63], top: 659.25, low: 554.37 }, // A
    { b: 98.00,  tri: [196.00, 246.94, 293.66], top: 587.33, low: 493.88 }, // G
    { b: 73.42,  tri: [146.83, 185.00, 220.00], top: 739.99, low: 587.33 }, // D
    { b: 82.41,  tri: [164.81, 196.00, 246.94], top: 493.88, low: 392.00 }, // Em
    { b: 110.00, tri: [220.00, 277.18, 329.63], top: 659.25, low: 554.37 }, // A
  ];
  function scheduleLoop() {
    if (synthStopped) return;
    var dur = 3.0, t0 = actx.currentTime + 0.08;
    for (var i = 0; i < CH.length; i++) {
      var c = CH[i], t = t0 + i * dur;
      c.tri.forEach(function (f) { note(f, t, dur + 0.25, "sawtooth", 0.04, 5, padNode); });   // string pad
      var arp = [c.b, c.tri[0], c.tri[1], c.tri[2], c.tri[0] * 2, c.tri[1] * 2];                // harp
      for (var k = 0; k < arp.length; k++) pluck(arp[k], t + k * 0.5, 0.085 - k * 0.006);
      note(c.top, t + 0.18, dur - 0.36, "triangle", 0.15, 7, busDry);                           // melody (upper)
      note(c.low, t + 0.18, dur - 0.36, "triangle", 0.10, 7, busDry);                           // melody (lower third)
    }
    mTimers.push(setTimeout(scheduleLoop, CH.length * dur * 1000 - 220));
  }
  function startSynth() {
    if (actx) return;
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    actx = new AC(); synthStopped = false;
    mGain = actx.createGain(); mGain.gain.value = 0.0001; mGain.connect(actx.destination);
    var conv = actx.createConvolver(); conv.buffer = impulse(3.8, 2.2);
    var wet = actx.createGain(); wet.gain.value = 0.95; conv.connect(wet); wet.connect(mGain);
    busDry = actx.createGain(); busDry.gain.value = 0.7; busDry.connect(mGain);
    busWet = conv;
    padNode = actx.createBiquadFilter(); padNode.type = "lowpass"; padNode.frequency.value = 1500; padNode.Q.value = 0.6;
    padNode.connect(busDry); padNode.connect(busWet);
    actx.resume();
    var t = actx.currentTime; mGain.gain.setValueAtTime(0.0001, t); mGain.gain.linearRampToValueAtTime(0.85, t + 2.4);
    scheduleLoop();
  }
  function startMusic() {
    var a = new Audio(); a.src = MUSIC_FILE; a.loop = true; a.preload = "auto"; a.volume = 0;
    var used = false;
    a.onplaying = function () { used = true; musicEl = a; var v = 0; var iv = setInterval(function () { v += 0.05; a.volume = Math.min(v, 0.9); if (v >= 0.9) clearInterval(iv); }, 120); };
    a.onerror = function () { if (!used) startSynth(); };
    try { a.load(); } catch (e) {}
    var p = a.play(); if (p && p.catch) p.catch(function () {});
    setTimeout(function () { if (!used) startSynth(); }, 1500);
  }
  function stopMusic() {
    if (musicEl) { var a = musicEl; var v = a.volume; var iv = setInterval(function () { v -= 0.06; a.volume = Math.max(v, 0); if (v <= 0) { clearInterval(iv); try { a.pause(); } catch (e) {} } }, 80); musicEl = null; }
    synthStopped = true; mTimers.forEach(clearTimeout); mTimers = [];
    if (actx && mGain) { try { var t = actx.currentTime; mGain.gain.cancelScheduledValues(t); mGain.gain.setValueAtTime(mGain.gain.value, t); mGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4); } catch (e) {} setTimeout(function () { try { actx.close(); } catch (e) {} actx = null; }, 1600); }
  }

  // ---------------- sequence ----------------
  document.addEventListener("DOMContentLoaded", function () {
    var ov = document.getElementById("intro");
    if (!ov) return;
    function remove() { if (ov && ov.parentNode) ov.parentNode.removeChild(ov); }
    if (sessionStorage.getItem(KEY) === "1") { remove(); return; }

    document.documentElement.classList.add("intro-lock");
    var logoVid = ov.querySelector(".intro-logovid");
    var film = ov.querySelector(".intro-video");
    var enter = ov.querySelector(".intro-enter");
    var skip = ov.querySelector(".intro-skip");

    function playSafe(v) { try { v.currentTime = 0; } catch (e) {} var p = v.play(); if (p && p.catch) p.catch(function () {}); }

    function toFilm() {
      if (ov.classList.contains("stage-film") || ov.classList.contains("done")) return;
      ov.classList.remove("stage-logo"); ov.classList.add("stage-film");
      playSafe(film);
    }
    function finish() {
      if (ov.classList.contains("done")) return;
      ov.classList.add("done");
      try { logoVid.pause(); } catch (e) {} try { film.pause(); } catch (e) {}
      stopMusic();
      sessionStorage.setItem(KEY, "1");
      document.documentElement.classList.remove("intro-lock");
      window.dispatchEvent(new Event("intro:done"));
      setTimeout(remove, 1300);
    }

    enter.addEventListener("click", function () {
      ov.classList.add("stage-logo");
      startMusic();
      playSafe(logoVid);
    });
    logoVid.addEventListener("ended", toFilm);
    film.addEventListener("ended", finish);
    skip.addEventListener("click", function () {
      // first skip jumps from logo to film; a skip during the film exits
      if (ov.classList.contains("stage-logo")) toFilm(); else finish();
    });
  });
})();
