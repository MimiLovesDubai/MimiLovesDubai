/* MyAIAgent — Challenge game logic: progress (localStorage), XP bar, confetti. No deps. */
(function () {
  var KEY = "myaiagent_challenge_done";
  var TOTAL = 11;

  function getDone() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  function setDone(a) { localStorage.setItem(KEY, JSON.stringify(a)); }
  var done = getDone();

  // ---- Map: mark completed nodes + XP bar ----
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

  // ---- Level page: complete button ----
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
      if (i < 0) { done.push(slug); setDone(done); refresh(); confetti(); }
      else { done.splice(i, 1); setDone(done); refresh(); } // tap again to undo
    });
  }

  // ---- Tiny gold confetti burst ----
  function confetti() {
    var c = document.createElement("canvas");
    c.className = "confetti-canvas";
    document.body.appendChild(c);
    var ctx = c.getContext("2d");
    function size() { c.width = window.innerWidth; c.height = window.innerHeight; }
    size();
    var colors = ["#f9e7ad", "#ecc878", "#c79a3e", "#d6dde8", "#ffffff"];
    var P = [];
    for (var i = 0; i < 150; i++) {
      P.push({
        x: window.innerWidth / 2, y: window.innerHeight / 2.6,
        vx: (Math.random() - 0.5) * 13, vy: (Math.random() * -1) * 13 - 3,
        g: 0.28 + Math.random() * 0.18, s: 4 + Math.random() * 6,
        c: colors[i % colors.length], a: 1, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      });
    }
    var t0 = Date.now();
    (function loop() {
      ctx.clearRect(0, 0, c.width, c.height);
      for (var k = 0; k < P.length; k++) {
        var p = P[k];
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.a -= 0.008;
        ctx.save(); ctx.globalAlpha = Math.max(p.a, 0); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 1.6); ctx.restore();
      }
      if (Date.now() - t0 < 2400) requestAnimationFrame(loop);
      else c.remove();
    })();
  }
})();
