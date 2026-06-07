/* MyAIAgent — generative cinematic space/UFO ambient (Web Audio, no file).
   Starts on first user gesture (browsers block autoplay), with a sound toggle. */
(function () {
  var KEY = "myaiagent_sound";
  var pref = localStorage.getItem(KEY) || "on"; // 'on' | 'off'
  var ctx, master, bus, lp, started = false, btn;
  var ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8a5 5 0 0 1 0 8M18.7 6a8 8 0 0 1 0 12"/></svg>';
  var OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M22 9.5l-6 5M16 9.5l6 5"/></svg>';

  function build() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.0001; master.connect(ctx.destination);

    // spacey feedback "reverb"
    var delay = ctx.createDelay(2.0); delay.delayTime.value = 0.45;
    var fb = ctx.createGain(); fb.gain.value = 0.34;
    var wet = ctx.createGain(); wet.gain.value = 0.45;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);

    bus = ctx.createGain(); bus.connect(master); bus.connect(delay);
    lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 650; lp.Q.value = 0.8; lp.connect(bus);

    // deep evolving pad — an open-fifth drone (A / E)
    [55, 82.41, 110, 164.81].forEach(function (f, i) {
      var o = ctx.createOscillator(); o.type = i < 2 ? "sine" : "triangle";
      o.frequency.value = f; o.detune.value = i * 5 - 7;
      var g = ctx.createGain(); g.gain.value = 0.13 / (i + 1);
      o.connect(g); g.connect(lp); o.start();
    });
    // slow filter sweep for movement
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
    var lfg = ctx.createGain(); lfg.gain.value = 320;
    lfo.connect(lfg); lfg.connect(lp.frequency); lfo.start();
    // faint high shimmer with tremolo
    var sh = ctx.createOscillator(); sh.type = "sine"; sh.frequency.value = 1318.5;
    var shg = ctx.createGain(); shg.gain.value = 0.004;
    var trem = ctx.createOscillator(); trem.frequency.value = 0.18;
    var tremg = ctx.createGain(); tremg.gain.value = 0.004;
    trem.connect(tremg); tremg.connect(shg.gain); sh.connect(shg); shg.connect(bus); sh.start(); trem.start();

    scheduleUfo(7000);
    return true;
  }

  function scheduleUfo(ms) {
    setTimeout(function () {
      if (!ctx) return;
      var o = ctx.createOscillator(); o.type = "sine";
      var g = ctx.createGain(); g.gain.value = 0;
      var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      o.connect(g); if (pan) { g.connect(pan); pan.connect(bus); } else { g.connect(bus); }
      var t = ctx.currentTime, dur = 6.2;
      var f0 = 300 + Math.random() * 260, f1 = Math.random() < 0.5 ? f0 + 600 : 90;
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(f1, 70), t + dur);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.045, t + 2);
      g.gain.linearRampToValueAtTime(0, t + dur);
      if (pan) { pan.pan.setValueAtTime(-1, t); pan.pan.linearRampToValueAtTime(1, t + dur); }
      o.start(t); o.stop(t + dur + 0.2);
      scheduleUfo(13000 + Math.random() * 13000);
    }, ms);
  }

  function fade(to, dur) {
    if (!ctx) return;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
    master.gain.exponentialRampToValueAtTime(Math.max(to, 0.0001), t + dur);
  }

  function start() {
    if (started) return;
    if (!ctx && !build()) return;
    started = true;
    ctx.resume();
    if (pref === "on") { fade(0.2, 5); if (btn) btn.classList.remove("pending"); }
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
      ctx && ctx.resume();
      pref = pref === "on" ? "off" : "on";
      localStorage.setItem(KEY, pref);
      started = true;
      fade(pref === "on" ? 0.2 : 0.0001, pref === "on" ? 2 : 1.2);
      btn.classList.remove("pending");
      render();
    });
    start();
  });

  ["pointerdown", "keydown", "touchstart", "scroll"].forEach(function (ev) {
    window.addEventListener(ev, function h() { start(); window.removeEventListener(ev, h); }, { passive: true });
  });
})();
