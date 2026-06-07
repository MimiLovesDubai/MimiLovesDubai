/* MyAIAgent — generative space ambient (Web Audio, no files).
   5 selectable "real space" presets (inspired by NASA sonifications):
   Deep Space, Pulsar, Solar Wind, UFO Encounter, Black Hole.
   Starts on first gesture; mute toggle + preset menu; remembers preferences. */
(function () {
  var KEY = "myaiagent_sound", PKEY = "myaiagent_preset";
  var pref = localStorage.getItem(KEY) || "on";       // 'on' | 'off'
  var preset = localStorage.getItem(PKEY) || "deepspace";
  var LANG = (document.documentElement.lang || "nl").slice(0, 2);
  var ctx, master, bus, faded = false, voices = [], timers = [], muteBtn, nameEl;
  var VOL = 0.26;

  var ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8a5 5 0 0 1 0 8M18.7 6a8 8 0 0 1 0 12"/></svg>';
  var OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M22 9.5l-6 5M16 9.5l6 5"/></svg>';

  var PRESETS = {
    deepspace: { nl: "Diepe ruimte", en: "Deep space", vol: 0.26,
      notes: [55, 110, 130.81, 164.81], cutoff: 480, q: 1.1, lfo: [0.04, 300], rev: [4.2, 2.3],
      bells: { scale: [329.63, 392, 440, 523.25, 587.33, 659.25], every: [8000, 18000], gain: 0.045 },
      ufo: [15000, 29000] },
    pulsar: { nl: "Pulsar", en: "Pulsar", vol: 0.24,
      notes: [65.41, 98], cutoff: 620, q: 1, lfo: [0.05, 240], rev: [3.0, 2.2],
      pulse: { freq: 196, rate: 2.4, gain: 0.13 }, ufo: [22000, 40000] },
    solarwind: { nl: "Zonnewind", en: "Solar wind", vol: 0.3,
      notes: [55], cutoff: 420, q: 0.8, lfo: [0.03, 200], rev: [3.6, 2.4],
      noise: { freq: 520, q: 1.4, lfoRate: 0.08, lfoDepth: 380, gain: 0.13 } },
    ufo: { nl: "UFO-ontmoeting", en: "UFO encounter", vol: 0.24,
      notes: [110, 146.83], cutoff: 720, q: 2, lfo: [0.12, 380], rev: [3.4, 2.2],
      theremin: { base: 660, gain: 0.05 },
      bells: { scale: [440, 554.37, 659.25, 880], every: [9000, 18000], gain: 0.04 },
      ufo: [6000, 13000] },
    blackhole: { nl: "Zwart gat", en: "Black hole", vol: 0.3,
      notes: [36.71, 55], cutoff: 300, q: 1.4, lfo: [0.025, 170], rev: [6.0, 2.0],
      sub: { freq: 30, gain: 0.14 },
      bells: { scale: [164.81, 196, 220], every: [12000, 24000], gain: 0.05 } },
  };

  function impulse(sec, decay) {
    var rate = ctx.sampleRate, len = Math.floor(rate * sec), b = ctx.createBuffer(2, len, rate);
    for (var ch = 0; ch < 2; ch++) { var d = b.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  function noiseBuf() {
    var len = ctx.sampleRate * 2, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function osc(type, freq) { var o = ctx.createOscillator(); o.type = type; o.frequency.value = freq; voices.push(o); return o; }

  function build() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC(); voices = []; timers = [];
    var P = PRESETS[preset] || PRESETS.deepspace;
    VOL = P.vol;
    master = ctx.createGain(); master.gain.value = 0.0001; master.connect(ctx.destination);

    // reverb (galm)
    var conv = ctx.createConvolver(); conv.buffer = impulse(P.rev[0], P.rev[1]);
    var wet = ctx.createGain(); wet.gain.value = 0.8; conv.connect(wet); wet.connect(master);
    var delay = ctx.createDelay(2.0); delay.delayTime.value = 0.6;
    var fb = ctx.createGain(); fb.gain.value = 0.4; var dwet = ctx.createGain(); dwet.gain.value = 0.26;
    delay.connect(fb); fb.connect(delay); delay.connect(dwet); dwet.connect(master);
    bus = ctx.createGain(); bus.connect(master); bus.connect(conv); bus.connect(delay);

    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = P.cutoff; lp.Q.value = P.q; lp.connect(bus);

    // drone pad + detune drift
    P.notes.forEach(function (f, i) {
      var o = osc(i < 2 ? "sine" : "triangle", f); o.detune.value = i * 5 - 7;
      var g = ctx.createGain(); g.gain.value = 0.12 / (i + 1); o.connect(g); g.connect(lp); o.start();
      var dl = osc("sine", 0.03 + i * 0.008); var dg = ctx.createGain(); dg.gain.value = 7; dl.connect(dg); dg.connect(o.detune); dl.start();
    });
    // dark filter sweep
    var lfo = osc("sine", P.lfo[0]); var lfg = ctx.createGain(); lfg.gain.value = P.lfo[1]; lfo.connect(lfg); lfg.connect(lp.frequency); lfo.start();

    if (P.sub) { var s = osc("sine", P.sub.freq); var sg = ctx.createGain(); sg.gain.value = P.sub.gain; s.connect(sg); sg.connect(bus); s.start(); }

    if (P.pulse) { // pulsar: steady pulsing tone
      var po = osc("sine", P.pulse.freq); var pg = ctx.createGain(); pg.gain.value = P.pulse.gain / 2;
      var plfo = osc("square", P.pulse.rate); var plg = ctx.createGain(); plg.gain.value = P.pulse.gain / 2;
      plfo.connect(plg); plg.connect(pg.gain); po.connect(pg); pg.connect(bus); po.start(); plfo.start();
    }
    if (P.noise) { // solar wind: filtered noise
      var ns = ctx.createBufferSource(); ns.buffer = noiseBuf(); ns.loop = true; voices.push(ns);
      var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = P.noise.freq; bp.Q.value = P.noise.q;
      var ng = ctx.createGain(); ng.gain.value = P.noise.gain; ns.connect(bp); bp.connect(ng); ng.connect(bus); ns.start();
      var nlfo = osc("sine", P.noise.lfoRate); var nlg = ctx.createGain(); nlg.gain.value = P.noise.lfoDepth; nlfo.connect(nlg); nlg.connect(bp.frequency); nlfo.start();
    }
    if (P.theremin) { // wavering high tone with vibrato + slow glides
      var to = osc("sine", P.theremin.base); var tg = ctx.createGain(); tg.gain.value = P.theremin.gain;
      var vib = osc("sine", 5.5); var vibg = ctx.createGain(); vibg.gain.value = 18; vib.connect(vibg); vibg.connect(to.detune);
      to.connect(tg); tg.connect(bus); to.start(); vib.start();
      (function glide() { if (!ctx) return; var f = 400 + Math.random() * 500;
        to.frequency.setTargetAtTime(f, ctx.currentTime, 1.5); timers.push(setTimeout(glide, 4000 + Math.random() * 4000)); })();
    }
    if (P.bells) scheduleBell(P.bells, 4500);
    if (P.ufo) scheduleUfo(P.ufo, 9000);
    return true;
  }

  function scheduleBell(cfg, ms) {
    timers.push(setTimeout(function () {
      if (!ctx) return;
      var f = cfg.scale[Math.floor(Math.random() * cfg.scale.length)];
      var o = osc("sine", f); var g = ctx.createGain(); g.gain.value = 0; o.connect(g); g.connect(bus);
      var t = ctx.currentTime;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(cfg.gain, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
      o.start(t); o.stop(t + 3.6);
      scheduleBell(cfg, cfg.every[0] + Math.random() * (cfg.every[1] - cfg.every[0]));
    }, ms));
  }
  function scheduleUfo(range, ms) {
    timers.push(setTimeout(function () {
      if (!ctx) return;
      var o = osc("sine", 300); var g = ctx.createGain(); g.gain.value = 0;
      var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      o.connect(g); if (pan) { g.connect(pan); pan.connect(bus); } else { g.connect(bus); }
      var t = ctx.currentTime, dur = 7, f0 = 260 + Math.random() * 240, f1 = Math.random() < 0.5 ? f0 + 520 : 80;
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(f1, 60), t + dur);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.04, t + 2.5); g.gain.linearRampToValueAtTime(0, t + dur);
      if (pan) { pan.pan.setValueAtTime(-1, t); pan.pan.linearRampToValueAtTime(1, t + dur); }
      o.start(t); o.stop(t + dur + 0.2);
      scheduleUfo(range, range[0] + Math.random() * (range[1] - range[0]));
    }, ms));
  }

  function fade(to, dur) {
    if (!ctx) return; var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
    master.gain.exponentialRampToValueAtTime(Math.max(to, 0.0001), t + dur);
  }
  function teardown() {
    timers.forEach(clearTimeout); timers = [];
    voices.forEach(function (v) { try { v.stop(); } catch (e) {} });
    voices = [];
    if (ctx) { try { ctx.close(); } catch (e) {} }
    ctx = null;
  }

  function start() {
    if (!ctx && !build()) return;
    if (ctx.state === "suspended") ctx.resume();
    if (pref === "on" && !faded) { faded = true; fade(VOL, 6); if (muteBtn) muteBtn.classList.remove("pending"); }
  }
  function applyPreset(key) {
    preset = key; localStorage.setItem(PKEY, key);
    if (nameEl) nameEl.textContent = PRESETS[key][LANG === "en" ? "en" : "nl"];
    if (ctx) { var wasOn = pref === "on" && faded; teardown(); faded = false; build(); ctx.resume();
      if (wasOn) { faded = true; fade(VOL, 2); } }
  }
  function renderMute() { if (!muteBtn) return; muteBtn.innerHTML = pref === "on" ? ON : OFF; muteBtn.classList.toggle("muted", pref !== "on"); }

  document.addEventListener("DOMContentLoaded", function () {
    var ui = document.createElement("div"); ui.className = "sound-ui";
    muteBtn = document.createElement("button");
    muteBtn.className = "sound-toggle" + (pref === "on" ? " pending" : "");
    muteBtn.title = "Geluid aan/uit"; muteBtn.setAttribute("aria-label", "Geluid aan of uit");
    renderMute();
    var picker = document.createElement("div"); picker.className = "sound-picker";
    nameEl = document.createElement("span"); nameEl.className = "sound-name";
    nameEl.textContent = PRESETS[preset][LANG === "en" ? "en" : "nl"];
    var pbtn = document.createElement("button"); pbtn.className = "preset-btn";
    pbtn.innerHTML = '🛰️ ' ; pbtn.appendChild(nameEl); pbtn.insertAdjacentHTML("beforeend", ' <span class="chev">⌄</span>');
    var menu = document.createElement("div"); menu.className = "sound-menu";
    Object.keys(PRESETS).forEach(function (k) {
      var it = document.createElement("button"); it.className = "sound-item" + (k === preset ? " active" : "");
      it.textContent = PRESETS[k][LANG === "en" ? "en" : "nl"];
      it.addEventListener("click", function () {
        applyPreset(k);
        menu.querySelectorAll(".sound-item").forEach(function (x) { x.classList.remove("active"); });
        it.classList.add("active"); menu.classList.remove("open");
        if (pref === "off") { pref = "on"; localStorage.setItem(KEY, "on"); renderMute(); start(); }
      });
      menu.appendChild(it);
    });
    pbtn.addEventListener("click", function () { menu.classList.toggle("open"); });
    picker.appendChild(menu); picker.appendChild(pbtn);
    ui.appendChild(muteBtn); ui.appendChild(picker);
    document.body.appendChild(ui);

    muteBtn.addEventListener("click", function () {
      if (!ctx) build();
      if (ctx && ctx.state === "suspended") ctx.resume();
      if (pref === "on" && !faded) { faded = true; fade(VOL, 2); muteBtn.classList.remove("pending"); renderMute(); return; }
      pref = pref === "on" ? "off" : "on"; localStorage.setItem(KEY, pref);
      if (pref === "on") { faded = true; fade(VOL, 2); muteBtn.classList.remove("pending"); } else { fade(0.0001, 1.4); }
      renderMute();
    });
    document.addEventListener("click", function (e) { if (!ui.contains(e.target)) menu.classList.remove("open"); });

    if (!ctx) build();
    if (ctx) ctx.resume();
  });

  ["pointerdown", "keydown", "touchstart", "scroll", "click"].forEach(function (ev) {
    window.addEventListener(ev, function h() { start(); if (ctx && ctx.state === "running") window.removeEventListener(ev, h); }, { passive: true });
  });
})();
