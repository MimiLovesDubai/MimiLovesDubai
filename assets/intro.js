/* MyAIAgent — cinematic intro.
   One gesture ("Enter") opens a film sequence: the logo clip large, then the
   main film, over an epic cinematic arrangement of the Tetris theme
   (Korobeiniki — a public-domain Russian folk song). The videos play muted;
   the music is a separate layer: it uses a real recording when present
   (assets/media/opening-music.mp3 or a URL) and otherwise plays the built-in
   synthesized arrangement, so there is always music.
   When the film ends (or is skipped) it fades into the site. Shows once/session. */
(function () {
  var KEY = "myaiagent_intro_seen";

  // base /assets/ url (works at root and /en/)
  var sc = document.querySelector('script[src*="intro.js"]');
  var ASSETS = sc ? sc.src.replace(/intro\.js.*$/, "") : "assets/";
  var MUSIC_FILE = ASSETS + "media/opening-music.mp3"; // drop a real recording here to use it instead of the synth

  // ---------------- music layer ----------------
  var musicEl = null, actx = null, mGain = null, busDry = null, busWet = null, padNode = null, mTimers = [], synthStopped = false;

  function impulse(sec, decay) {
    var r = actx.sampleRate, n = Math.floor(r * sec), b = actx.createBuffer(2, n, r);
    for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
    return b;
  }

  // --- Cinematic arrangement of the Tetris theme (Korobeiniki — Russian folk, public domain) ---
  var BPM = 140, SPB = 60 / BPM;
  var NF = {
    C2: 65.41, D2: 73.42, E2: 82.41, G2: 98.00, A2: 110.00, B2: 123.47,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, "G#3": 207.65, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, "G#4": 415.30, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, "G#5": 830.61, A5: 880.00,
  };
  // [note, beats] — null note = rest. 12 bars, loops.
  var MEL = [
    ["E5", 1], ["B4", .5], ["C5", .5], ["D5", 1], ["C5", .5], ["B4", .5],
    ["A4", 1], ["A4", .5], ["C5", .5], ["E5", 1], ["D5", .5], ["C5", .5],
    ["B4", 1.5], ["C5", .5], ["D5", 1], ["E5", 1],
    ["C5", 1], ["A4", 1], ["A4", 1], [null, 1],
    [null, .5], ["D5", 1], ["F5", .5], ["A5", 1], ["G5", .5], ["F5", .5],
    ["E5", 1.5], ["C5", .5], ["E5", 1], ["D5", .5], ["C5", .5],
    ["B4", 1], ["B4", .5], ["C5", .5], ["D5", 1], ["E5", 1],
    ["C5", 1], ["A4", 1], ["A4", 1], [null, 1],
    ["E5", 1], ["C5", 1], ["D5", 1], ["B4", 1],
    ["C5", 1], ["A4", 1], ["G#4", 2],
    ["E5", 1], ["C5", 1], ["D5", 1], ["B4", 1],
    ["C5", .5], ["E5", .5], ["A5", 1], ["G#5", 2],
  ];
  var CHORD = {
    Em: { pad: ["E3", "G3", "B3"], root: "E2" }, Am: { pad: ["A3", "C4", "E4"], root: "A2" },
    Dm: { pad: ["D3", "F3", "A3"], root: "D2" }, C: { pad: ["C3", "E3", "G3"], root: "C2" },
    G: { pad: ["G3", "B3", "D4"], root: "G2" }, E: { pad: ["E3", "G#3", "B3"], root: "E2" },
  };
  // [chord, beats] aligned to the melody bars
  var PADSEQ = [
    ["Em", 4], ["Am", 4], ["Em", 4], ["Am", 4], ["Dm", 4], ["C", 4], ["Em", 4], ["Am", 4],
    ["Am", 4], ["Am", 2], ["E", 2], ["Am", 4], ["Am", 2], ["E", 2],
  ];

  function lead(freq, t, dur) {
    var o = actx.createOscillator(); o.type = "sawtooth"; o.frequency.value = freq;
    var g = actx.createGain(); g.gain.value = 0; o.connect(g); g.connect(busDry); g.connect(busWet);
    var atk = 0.012, rel = Math.min(0.12, dur * 0.4);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.15, t + atk);
    g.gain.setValueAtTime(0.15, Math.max(t + atk, t + dur - rel)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var l = actx.createOscillator(); l.frequency.value = 5.5; var lg = actx.createGain(); lg.gain.value = 4; l.connect(lg); lg.connect(o.detune); l.start(t); l.stop(t + dur + 0.05);
    o.start(t); o.stop(t + dur + 0.05);
    var s = actx.createOscillator(); s.type = "triangle"; s.frequency.value = freq * 2;     // sparkle octave
    var sg = actx.createGain(); sg.gain.value = 0; s.connect(sg); sg.connect(busWet);
    sg.gain.setValueAtTime(0, t); sg.gain.linearRampToValueAtTime(0.045, t + 0.01); sg.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(dur, 0.5));
    s.start(t); s.stop(t + 0.62);
  }
  function padTone(freq, t, dur) {
    var o = actx.createOscillator(); o.type = "sawtooth"; o.frequency.value = freq;
    var g = actx.createGain(); g.gain.value = 0; o.connect(g); g.connect(padNode);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.034, t + 0.3);
    g.gain.setValueAtTime(0.034, t + dur - 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function bassTone(freq, t, dur) {
    var o = actx.createOscillator(); o.type = "sawtooth"; o.frequency.value = freq;
    var lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 650;
    var g = actx.createGain(); g.gain.value = 0; o.connect(lp); lp.connect(g); g.connect(busDry);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.03);
  }
  function boom(t) {
    var o = actx.createOscillator(); o.type = "sine";
    var g = actx.createGain(); g.gain.value = 0; o.connect(g); g.connect(busDry);
    o.frequency.setValueAtTime(125, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.start(t); o.stop(t + 0.55);
  }
  function scheduleLoop() {
    if (synthStopped) return;
    var t0 = actx.currentTime + 0.1, tm = t0, tp = t0, i, j;
    for (i = 0; i < MEL.length; i++) { var ev = MEL[i]; if (ev[0]) lead(NF[ev[0]], tm, ev[1] * SPB); tm += ev[1] * SPB; }
    for (i = 0; i < PADSEQ.length; i++) {
      var ch = CHORD[PADSEQ[i][0]], beats = PADSEQ[i][1], dur = beats * SPB;
      for (j = 0; j < ch.pad.length; j++) padTone(NF[ch.pad[j]], tp, dur + 0.1);
      for (j = 0; j < beats; j++) bassTone(NF[ch.root], tp + j * SPB, SPB * 0.92);
      boom(tp); tp += dur;
    }
    var loopLen = (tm - t0);
    mTimers.push(setTimeout(scheduleLoop, loopLen * 1000 - 120));
  }
  function startSynth() {
    if (actx) return;
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    actx = new AC(); synthStopped = false;
    mGain = actx.createGain(); mGain.gain.value = 0.0001; mGain.connect(actx.destination);
    var conv = actx.createConvolver(); conv.buffer = impulse(3.0, 2.4);
    var wet = actx.createGain(); wet.gain.value = 0.5; conv.connect(wet); wet.connect(mGain);
    busDry = actx.createGain(); busDry.gain.value = 0.85; busDry.connect(mGain);
    busWet = conv;
    padNode = actx.createBiquadFilter(); padNode.type = "lowpass"; padNode.frequency.value = 1700; padNode.Q.value = 0.6;
    padNode.connect(busDry); padNode.connect(busWet);
    actx.resume();
    var t = actx.currentTime; mGain.gain.setValueAtTime(0.0001, t); mGain.gain.linearRampToValueAtTime(0.9, t + 1.6);
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
