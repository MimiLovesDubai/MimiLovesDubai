/* MyAIAgent — generative cinematic space/UFO ambient (Web Audio, no file).
   Mysterious A-minor drone with convolution reverb (galm), echo, distant bells
   and UFO sweeps. Starts on first user gesture; toggle remembers preference. */
(function () {
  var KEY = "myaiagent_sound";
  var pref = localStorage.getItem(KEY) || "on"; // 'on' | 'off'
  var ctx, master, bus, lp, started = false, btn;
  var ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8a5 5 0 0 1 0 8M18.7 6a8 8 0 0 1 0 12"/></svg>';
  var OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M22 9.5l-6 5M16 9.5l6 5"/></svg>';

  function impulse(sec, decay) {
    var rate = ctx.sampleRate, len = Math.floor(rate * sec), b = ctx.createBuffer(2, len, rate);
    for (var ch = 0; ch < 2; ch++) {
      var d = b.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }

  function build() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.0001; master.connect(ctx.destination);

    // long mysterious reverb (galm) via generated impulse
    var conv = ctx.createConvolver(); conv.buffer = impulse(4.2, 2.3);
    var wet = ctx.createGain(); wet.gain.value = 0.85; conv.connect(wet); wet.connect(master);
    // slow echo tails
    var delay = ctx.createDelay(2.0); delay.delayTime.value = 0.6;
    var fb = ctx.createGain(); fb.gain.value = 0.42;
    var dwet = ctx.createGain(); dwet.gain.value = 0.28;
    delay.connect(fb); fb.connect(delay); delay.connect(dwet); dwet.connect(master);

    bus = ctx.createGain(); bus.connect(master); bus.connect(conv); bus.connect(delay);
    lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 480; lp.Q.value = 1.1; lp.connect(bus);

    // moody A-minor drone (A1, A2, C3, E3) with slow detune drift
    [55, 110, 130.81, 164.81].forEach(function (f, i) {
      var o = ctx.createOscillator(); o.type = i < 2 ? "sine" : "triangle";
      o.frequency.value = f; o.detune.value = i * 5 - 7;
      var g = ctx.createGain(); g.gain.value = 0.12 / (i + 1);
      o.connect(g); g.connect(lp); o.start();
      var dl = ctx.createOscillator(); dl.frequency.value = 0.03 + i * 0.008;
      var dg = ctx.createGain(); dg.gain.value = 7; dl.connect(dg); dg.connect(o.detune); dl.start();
    });
    // slow dark filter sweep for movement
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.04;
    var lfg = ctx.createGain(); lfg.gain.value = 300; lfo.connect(lfg); lfg.connect(lp.frequency); lfo.start();

    scheduleBell(4500);
    scheduleUfo(9000);
    return true;
  }

  // distant bell tones (A-minor pentatonic) with long reverb tails
  function scheduleBell(ms) {
    setTimeout(function () {
      if (!ctx) return;
      var notes = [329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
      var f = notes[Math.floor(Math.random() * notes.length)];
      var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      var g = ctx.createGain(); g.gain.value = 0; o.connect(g); g.connect(bus);
      var t = ctx.currentTime;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.045, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
      o.start(t); o.stop(t + 3.6);
      scheduleBell(8000 + Math.random() * 10000);
    }, ms);
  }

  function scheduleUfo(ms) {
    setTimeout(function () {
      if (!ctx) return;
      var o = ctx.createOscillator(); o.type = "sine";
      var g = ctx.createGain(); g.gain.value = 0;
      var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      o.connect(g); if (pan) { g.connect(pan); pan.connect(bus); } else { g.connect(bus); }
      var t = ctx.currentTime, dur = 7;
      var f0 = 260 + Math.random() * 240, f1 = Math.random() < 0.5 ? f0 + 520 : 80;
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(f1, 60), t + dur);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.04, t + 2.5);
      g.gain.linearRampToValueAtTime(0, t + dur);
      if (pan) { pan.pan.setValueAtTime(-1, t); pan.pan.linearRampToValueAtTime(1, t + dur); }
      o.start(t); o.stop(t + dur + 0.2);
      scheduleUfo(15000 + Math.random() * 14000);
    }, ms);
  }

  function fade(to, dur) {
    if (!ctx) return;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
    master.gain.exponentialRampToValueAtTime(Math.max(to, 0.0001), t + dur);
  }

  var VOL = 0.26, faded = false;

  // Always resume on a gesture (browsers keep the context suspended until then);
  // only fade up once.
  function start() {
    if (!ctx && !build()) return;
    if (ctx.state === "suspended") ctx.resume();
    if (pref === "on" && !faded) {
      faded = true; fade(VOL, 6);
      if (btn) btn.classList.remove("pending");
    }
  }

  function render() {
    if (!btn) return;
    btn.innerHTML = pref === "on" ? ON : OFF;
    btn.classList.toggle("muted", pref !== "on");
  }

  document.addEventListener("DOMContentLoaded", function () {
    btn = document.createElement("button");
    btn.className = "sound-toggle" + (pref === "on" ? " pending" : "");
    btn.title = "Ruimte-ambient aan/uit";
    btn.setAttribute("aria-label", "Geluid aan of uit");
    render();
    document.body.appendChild(btn);
    btn.addEventListener("click", function () {
      if (!ctx) build();
      if (ctx && ctx.state === "suspended") ctx.resume();
      // First click while intended-on but not yet audible = simply start it.
      if (pref === "on" && !faded) {
        faded = true; fade(VOL, 2); btn.classList.remove("pending"); render(); return;
      }
      pref = pref === "on" ? "off" : "on";
      localStorage.setItem(KEY, pref);
      if (pref === "on") { faded = true; fade(VOL, 2); btn.classList.remove("pending"); }
      else { fade(0.0001, 1.4); }
      render();
    });
    // try immediately (will be suspended until a gesture)
    if (!ctx) build();
    if (ctx) ctx.resume();
  });

  ["pointerdown", "keydown", "touchstart", "scroll", "click"].forEach(function (ev) {
    window.addEventListener(ev, function h() {
      start();
      if (ctx && ctx.state === "running") window.removeEventListener(ev, h);
    }, { passive: true });
  });
})();
