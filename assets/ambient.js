/* MyAIAgent — space ambient player.
   Plays REAL NASA-style recordings when available (assets/media/nasa-*.mp3 or a URL),
   and falls back to a generative Web-Audio synth per vibe so the site is never silent.
   Starts on first gesture; mute toggle + 5-track menu; remembers preferences. */
(function () {
  var KEY = "myaiagent_sound", PKEY = "myaiagent_preset";
  var pref = localStorage.getItem(KEY) || "on";          // 'on' | 'off'
  var preset = localStorage.getItem(PKEY) || "deepspace";
  var LANG = (document.documentElement.lang || "nl").slice(0, 2);

  // base URL of /assets/ derived from this script's own src (works at root and /en/)
  var sc = document.querySelector('script[src*="ambient.js"]');
  var ASSETS = sc ? sc.src.replace(/ambient\.js.*$/, "") : "assets/";

  // ---- Track config. Put a NASA file in assets/media/ with these names, OR
  //      replace the value with a full https:// URL to a NASA recording. ----
  var TRACKS = {
    deepspace: { nl: "Diepe ruimte", en: "Deep space", file: "media/nasa-deepspace.mp3" },
    pulsar:    { nl: "Pulsar",        en: "Pulsar",       file: "media/nasa-pulsar.mp3" },
    solarwind: { nl: "Zonnewind",     en: "Solar wind",   file: "media/nasa-solarwind.mp3" },
    ufo:       { nl: "UFO-ontmoeting", en: "UFO encounter", file: "media/nasa-ufo.mp3" },
    blackhole: { nl: "Zwart gat",     en: "Black hole",   file: "media/nasa-blackhole.mp3" },
  };
  function srcFor(key) { var f = TRACKS[key].file; return /^https?:/.test(f) ? f : ASSETS + f; }

  // ---- Generative fallback presets (Web Audio) ----
  var SYNTH = {
    deepspace: { vol: 0.26, notes: [55, 110, 130.81, 164.81], cutoff: 480, q: 1.1, lfo: [0.04, 300], rev: [4.2, 2.3],
      bells: { scale: [329.63, 392, 440, 523.25, 587.33, 659.25], every: [8000, 18000], gain: 0.045 }, ufo: [15000, 29000] },
    pulsar: { vol: 0.24, notes: [65.41, 98], cutoff: 620, q: 1, lfo: [0.05, 240], rev: [3.0, 2.2],
      pulse: { freq: 196, rate: 2.4, gain: 0.13 }, ufo: [22000, 40000] },
    solarwind: { vol: 0.3, notes: [55], cutoff: 420, q: 0.8, lfo: [0.03, 200], rev: [3.6, 2.4],
      noise: { freq: 520, q: 1.4, lfoRate: 0.08, lfoDepth: 380, gain: 0.13 } },
    ufo: { vol: 0.24, notes: [110, 146.83], cutoff: 720, q: 2, lfo: [0.12, 380], rev: [3.4, 2.2],
      theremin: { base: 660, gain: 0.05 }, bells: { scale: [440, 554.37, 659.25, 880], every: [9000, 18000], gain: 0.04 }, ufo: [6000, 13000] },
    blackhole: { vol: 0.3, notes: [36.71, 55], cutoff: 300, q: 1.4, lfo: [0.025, 170], rev: [6.0, 2.0],
      sub: { freq: 30, gain: 0.14 }, bells: { scale: [164.81, 196, 220], every: [12000, 24000], gain: 0.05 } },
  };

  var ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8a5 5 0 0 1 0 8M18.7 6a8 8 0 0 1 0 12"/></svg>';
  var OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M22 9.5l-6 5M16 9.5l6 5"/></svg>';

  var audioEl, usingFile = false, active = false, fbTimer;
  var ctx, master, bus, voices = [], timers = [], faded = false, VOL = 0.26, muteBtn, nameEl;

  // ---------------- NASA audio file layer ----------------
  function ensureAudio() {
    if (!audioEl) { audioEl = new Audio(); audioEl.loop = true; audioEl.preload = "auto"; audioEl.volume = 0.55; }
    return audioEl;
  }
  function tryPlay(key) {
    stopAll();
    var a = ensureAudio();
    usingFile = false;
    a.muted = pref !== "on";
    a.onplaying = function () { usingFile = true; clearTimeout(fbTimer); };
    a.onerror = function () { if (!usingFile) buildSynth(key); };
    a.src = srcFor(key);
    try { a.load(); } catch (e) {}
    var p = a.play();
    if (p && p.catch) p.catch(function () {}); // autoplay/format issues -> fallback timer handles it
    clearTimeout(fbTimer);
    fbTimer = setTimeout(function () { if (!usingFile) buildSynth(key); }, 2600);
  }
  function stopAll() {
    clearTimeout(fbTimer);
    if (audioEl) { audioEl.onplaying = audioEl.onerror = null; try { audioEl.pause(); } catch (e) {} }
    usingFile = false;
    teardownSynth();
  }

  // ---------------- generative synth fallback ----------------
  function impulse(sec, decay) { var r = ctx.sampleRate, n = Math.floor(r * sec), b = ctx.createBuffer(2, n, r);
    for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); } return b; }
  function noiseBuf() { var n = ctx.sampleRate * 2, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return b; }
  function osc(t, f) { var o = ctx.createOscillator(); o.type = t; o.frequency.value = f; voices.push(o); return o; }
  function fade(to, dur) { if (!ctx) return; var t = ctx.currentTime; master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t); master.gain.exponentialRampToValueAtTime(Math.max(to, 0.0001), t + dur); }
  function teardownSynth() { timers.forEach(clearTimeout); timers = []; voices.forEach(function (v) { try { v.stop(); } catch (e) {} }); voices = [];
    if (ctx) { try { ctx.close(); } catch (e) {} } ctx = null; faded = false; }

  function buildSynth(key) {
    if (ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    var P = SYNTH[key] || SYNTH.deepspace; VOL = P.vol;
    ctx = new AC(); voices = []; timers = [];
    master = ctx.createGain(); master.gain.value = 0.0001; master.connect(ctx.destination);
    var conv = ctx.createConvolver(); conv.buffer = impulse(P.rev[0], P.rev[1]);
    var wet = ctx.createGain(); wet.gain.value = 0.8; conv.connect(wet); wet.connect(master);
    var delay = ctx.createDelay(2.0); delay.delayTime.value = 0.6; var fb = ctx.createGain(); fb.gain.value = 0.4;
    var dwet = ctx.createGain(); dwet.gain.value = 0.26; delay.connect(fb); fb.connect(delay); delay.connect(dwet); dwet.connect(master);
    bus = ctx.createGain(); bus.connect(master); bus.connect(conv); bus.connect(delay);
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = P.cutoff; lp.Q.value = P.q; lp.connect(bus);
    P.notes.forEach(function (f, i) { var o = osc(i < 2 ? "sine" : "triangle", f); o.detune.value = i * 5 - 7;
      var g = ctx.createGain(); g.gain.value = 0.12 / (i + 1); o.connect(g); g.connect(lp); o.start();
      var dl = osc("sine", 0.03 + i * 0.008); var dg = ctx.createGain(); dg.gain.value = 7; dl.connect(dg); dg.connect(o.detune); dl.start(); });
    var lfo = osc("sine", P.lfo[0]); var lfg = ctx.createGain(); lfg.gain.value = P.lfo[1]; lfo.connect(lfg); lfg.connect(lp.frequency); lfo.start();
    if (P.sub) { var s = osc("sine", P.sub.freq); var sg = ctx.createGain(); sg.gain.value = P.sub.gain; s.connect(sg); sg.connect(bus); s.start(); }
    if (P.pulse) { var po = osc("sine", P.pulse.freq); var pg = ctx.createGain(); pg.gain.value = P.pulse.gain / 2;
      var pl = osc("square", P.pulse.rate); var plg = ctx.createGain(); plg.gain.value = P.pulse.gain / 2; pl.connect(plg); plg.connect(pg.gain); po.connect(pg); pg.connect(bus); po.start(); pl.start(); }
    if (P.noise) { var ns = ctx.createBufferSource(); ns.buffer = noiseBuf(); ns.loop = true; voices.push(ns);
      var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = P.noise.freq; bp.Q.value = P.noise.q;
      var ng = ctx.createGain(); ng.gain.value = P.noise.gain; ns.connect(bp); bp.connect(ng); ng.connect(bus); ns.start();
      var nl = osc("sine", P.noise.lfoRate); var nlg = ctx.createGain(); nlg.gain.value = P.noise.lfoDepth; nl.connect(nlg); nlg.connect(bp.frequency); nl.start(); }
    if (P.theremin) { var to = osc("sine", P.theremin.base); var tg = ctx.createGain(); tg.gain.value = P.theremin.gain;
      var vib = osc("sine", 5.5); var vg = ctx.createGain(); vg.gain.value = 18; vib.connect(vg); vg.connect(to.detune); to.connect(tg); tg.connect(bus); to.start(); vib.start();
      (function gl() { if (!ctx) return; to.frequency.setTargetAtTime(400 + Math.random() * 500, ctx.currentTime, 1.5); timers.push(setTimeout(gl, 4000 + Math.random() * 4000)); })(); }
    if (P.bells) scheduleBell(P.bells, 4500);
    if (P.ufo) scheduleUfo(P.ufo, 9000);
    ctx.resume();
    if (pref === "on") { faded = true; fade(VOL, 5); }
  }
  function scheduleBell(cfg, ms) { timers.push(setTimeout(function () { if (!ctx) return;
    var f = cfg.scale[Math.floor(Math.random() * cfg.scale.length)]; var o = osc("sine", f); var g = ctx.createGain(); g.gain.value = 0; o.connect(g); g.connect(bus);
    var t = ctx.currentTime; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(cfg.gain, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
    o.start(t); o.stop(t + 3.6); scheduleBell(cfg, cfg.every[0] + Math.random() * (cfg.every[1] - cfg.every[0])); }, ms)); }
  function scheduleUfo(r, ms) { timers.push(setTimeout(function () { if (!ctx) return;
    var o = osc("sine", 300); var g = ctx.createGain(); g.gain.value = 0; var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    o.connect(g); if (pan) { g.connect(pan); pan.connect(bus); } else g.connect(bus);
    var t = ctx.currentTime, dur = 7, f0 = 260 + Math.random() * 240, f1 = Math.random() < 0.5 ? f0 + 520 : 80;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(f1, 60), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.04, t + 2.5); g.gain.linearRampToValueAtTime(0, t + dur);
    if (pan) { pan.pan.setValueAtTime(-1, t); pan.pan.linearRampToValueAtTime(1, t + dur); }
    o.start(t); o.stop(t + dur + 0.2); scheduleUfo(r, r[0] + Math.random() * (r[1] - r[0])); }, ms)); }

  // ---------------- control ----------------
  function activate() { if (active || pref !== "on") return; active = true; tryPlay(preset); }
  function applyPreset(key) {
    preset = key; localStorage.setItem(PKEY, key);
    if (nameEl) nameEl.textContent = TRACKS[key][LANG === "en" ? "en" : "nl"];
    if (active) tryPlay(key);
  }
  function setMute(off) {
    if (usingFile && audioEl) audioEl.muted = off;
    else if (ctx) fade(off ? 0.0001 : VOL, off ? 1.4 : 2);
  }
  function renderMute() { if (!muteBtn) return; muteBtn.innerHTML = pref === "on" ? ON : OFF; muteBtn.classList.toggle("muted", pref !== "on"); }

  document.addEventListener("DOMContentLoaded", function () {
    var ui = document.createElement("div"); ui.className = "sound-ui";
    muteBtn = document.createElement("button"); muteBtn.className = "sound-toggle" + (pref === "on" ? " pending" : "");
    muteBtn.title = "Geluid aan/uit"; muteBtn.setAttribute("aria-label", "Geluid aan of uit"); renderMute();
    var picker = document.createElement("div"); picker.className = "sound-picker";
    nameEl = document.createElement("span"); nameEl.className = "sound-name"; nameEl.textContent = TRACKS[preset][LANG === "en" ? "en" : "nl"];
    var pbtn = document.createElement("button"); pbtn.className = "preset-btn"; pbtn.innerHTML = "🛰️ "; pbtn.appendChild(nameEl); pbtn.insertAdjacentHTML("beforeend", ' <span class="chev">⌄</span>');
    var menu = document.createElement("div"); menu.className = "sound-menu";
    Object.keys(TRACKS).forEach(function (k) {
      var it = document.createElement("button"); it.className = "sound-item" + (k === preset ? " active" : ""); it.textContent = TRACKS[k][LANG === "en" ? "en" : "nl"];
      it.addEventListener("click", function () {
        menu.querySelectorAll(".sound-item").forEach(function (x) { x.classList.remove("active"); }); it.classList.add("active"); menu.classList.remove("open");
        if (pref === "off") { pref = "on"; localStorage.setItem(KEY, "on"); renderMute(); }
        active = false; applyPreset(k); activate();
      });
      menu.appendChild(it);
    });
    pbtn.addEventListener("click", function () { menu.classList.toggle("open"); });
    picker.appendChild(menu); picker.appendChild(pbtn);
    ui.appendChild(muteBtn); ui.appendChild(picker); document.body.appendChild(ui);

    muteBtn.addEventListener("click", function () {
      if (!active && pref === "on") { activate(); muteBtn.classList.remove("pending"); return; }
      pref = pref === "on" ? "off" : "on"; localStorage.setItem(KEY, pref); muteBtn.classList.remove("pending");
      if (pref === "on" && !active) activate(); else setMute(pref !== "on");
      renderMute();
    });
    document.addEventListener("click", function (e) { if (!ui.contains(e.target)) menu.classList.remove("open"); });
  });

  ["pointerdown", "keydown", "touchstart", "scroll", "click"].forEach(function (ev) {
    window.addEventListener(ev, function h() { activate(); if (active) window.removeEventListener(ev, h); }, { passive: true });
  });
})();
