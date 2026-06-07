/* MyAIAgent — Challenge: progress (localStorage), XP bar, confetti, SFX, 100% medal. No deps. */
(function () {
  var KEY = "myaiagent_challenge_done";
  var TOTAL = 11;
  var LANG = (document.documentElement.lang || "nl").slice(0, 2);

  function getDone() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  function setDone(a) { localStorage.setItem(KEY, JSON.stringify(a)); }
  var done = getDone();

  // ---------- Sound effects (Web Audio, triggered by user click = allowed) ----------
  var actx;
  function AC() { if (!actx) { var C = window.AudioContext || window.webkitAudioContext; if (C) actx = new C(); } return actx; }
  function tone(freq, start, dur, type, vol) {
    var c = AC(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine"; o.frequency.value = freq;
    o.connect(g); g.connect(c.destination);
    var t = c.currentTime + start;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function sfxLevel() { var c = AC(); if (c && c.state === "suspended") c.resume();
    [659.25, 830.61, 987.77].forEach(function (f, i) { tone(f, i * 0.09, 0.5, "triangle", 0.16); }); }
  function sfxWin() { var c = AC(); if (c && c.state === "suspended") c.resume();
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach(function (f, i) { tone(f, i * 0.12, 0.9, "triangle", 0.18); });
    tone(130.81, 0, 1.4, "sine", 0.12); }

  // ---------- Map: completed nodes + XP bar + earned medal ----------
  document.querySelectorAll(".road-node[data-level]").forEach(function (n) {
    if (done.indexOf(n.getAttribute("data-level")) >= 0) n.classList.add("done");
  });
  var fill = document.querySelector(".xp-fill");
  var label = document.querySelector(".xp-label");
  function updateXP() {
    var pct = Math.round((done.length / TOTAL) * 100);
    if (fill) fill.style.width = pct + "%";
    if (label) {
      var tpl = label.getAttribute("data-tpl") || "{n}/{t} · {p}% XP";
      label.textContent = tpl.replace("{n}", done.length).replace("{t}", TOTAL).replace("{p}", pct);
    }
  }
  updateXP();
  // If already 100% and on the map, show the earned medal badge
  if (document.querySelector(".roadmap") && done.length >= TOTAL) addMapMedal();

  // ---------- Level page: complete button ----------
  var btn = document.querySelector("[data-complete]");
  if (btn) {
    var slug = btn.getAttribute("data-complete");
    var doneLabel = btn.getAttribute("data-done-label");
    var openLabel = btn.textContent;
    function refresh() {
      if (done.indexOf(slug) >= 0) { btn.classList.add("is-done"); btn.textContent = doneLabel; }
      else { btn.classList.remove("is-done"); btn.textContent = openLabel; }
    }
    refresh();
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var i = done.indexOf(slug);
      if (i < 0) {
        done.push(slug); setDone(done); refresh();
        if (done.length >= TOTAL) { confetti(true); sfxWin(); setTimeout(showMedal, 500); }
        else { confetti(false); sfxLevel(); }
      } else { done.splice(i, 1); setDone(done); refresh(); }
    });
  }

  // ---------- Confetti ----------
  function confetti(big) {
    var c = document.createElement("canvas"); c.className = "confetti-canvas";
    document.body.appendChild(c); var ctx = c.getContext("2d");
    c.width = innerWidth; c.height = innerHeight;
    var colors = ["#f9e7ad", "#ecc878", "#c79a3e", "#d6dde8", "#ffffff"];
    var N = big ? 280 : 150, P = [];
    for (var i = 0; i < N; i++) P.push({ x: innerWidth / 2, y: innerHeight / 2.6,
      vx: (Math.random() - 0.5) * (big ? 18 : 13), vy: (Math.random() * -1) * (big ? 16 : 13) - 3,
      g: 0.28 + Math.random() * 0.18, s: 4 + Math.random() * 6, c: colors[i % colors.length],
      a: 1, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4 });
    var t0 = Date.now(), life = big ? 3400 : 2400;
    (function loop() {
      ctx.clearRect(0, 0, c.width, c.height);
      for (var k = 0; k < P.length; k++) { var p = P[k];
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.a -= 0.008;
        ctx.save(); ctx.globalAlpha = Math.max(p.a, 0); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 1.6); ctx.restore(); }
      if (Date.now() - t0 < life) requestAnimationFrame(loop); else c.remove();
    })();
  }

  // ---------- 100% medal ----------
  var MEDAL = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="#3a2a08" stroke-width="1.2"><defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f9e7ad"/><stop offset=".5" stop-color="#ecc878"/><stop offset="1" stop-color="#b8863b"/></linearGradient></defs><path d="M8 2l1.5 4M16 2l-1.5 4" stroke="#c79a3e" stroke-width="1.6"/><circle cx="12" cy="14" r="7.5" fill="url(#mg)"/><path d="M12 9.6l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3L6.7 13l3.3-.5z" fill="#fff8e6" stroke="none"/></svg>';
  function texts() {
    return LANG === "en"
      ? { t: "🏆 CHALLENGE COMPLETE!", p: "You cleared all 11 levels. You're officially the founder of an AI-run company.", b: "Close" }
      : { t: "🏆 CHALLENGE VOLTOOID!", p: "Je hebt alle 11 levels gehaald. Jij bent nu de oprichter van een AI-bedrijf.", b: "Sluiten" };
  }
  function showMedal() {
    if (document.querySelector(".medal-overlay")) return;
    var T = texts();
    var ov = document.createElement("div"); ov.className = "medal-overlay";
    ov.innerHTML = '<div class="medal-card"><div class="medal">' + MEDAL + '</div>' +
      '<h3>' + T.t + '</h3><p>' + T.p + '</p>' +
      '<button class="btn btn-primary medal-close">' + T.b + '</button></div>';
    document.body.appendChild(ov);
    function close() { ov.remove(); }
    ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
    ov.querySelector(".medal-close").addEventListener("click", close);
  }
  function addMapMedal() {
    var head = document.querySelector("#map .section-head");
    if (!head || head.querySelector(".map-medal")) return;
    var T = texts();
    var d = document.createElement("div"); d.className = "map-medal";
    d.innerHTML = '<div class="map-medal-ico">' + MEDAL + '</div><span>' + T.t + '</span>';
    head.appendChild(d);
  }
})();
