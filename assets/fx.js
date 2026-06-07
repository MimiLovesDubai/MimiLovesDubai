/* MyAIAgent — next-gen FX: neural-network particles + cursor spotlight. Lightweight, no deps. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  var touch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  // ---- Cursor spotlight (desktop only) ----
  if (!touch) {
    var sp = document.createElement("div");
    sp.className = "spotlight";
    document.body.appendChild(sp);
    window.addEventListener("pointermove", function (e) {
      sp.style.transform = "translate(" + (e.clientX - 320) + "px," + (e.clientY - 320) + "px)";
    }, { passive: true });
  }

  // ---- Neural-network particle field ----
  var c = document.createElement("canvas");
  c.className = "fx-net";
  document.body.appendChild(c);
  var ctx = c.getContext("2d"), W, H, pts;
  function init() {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
    var n = Math.max(28, Math.min(touch ? 38 : 80, Math.floor((W * H) / 22000)));
    pts = [];
    for (var i = 0; i < n; i++) {
      pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4 });
    }
  }
  init();
  window.addEventListener("resize", init);
  var LINK = 140 * 140;
  (function loop() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.3, 0, 6.283); ctx.fillStyle = "rgba(236,200,120,.55)"; ctx.fill();
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
        if (d < LINK) {
          ctx.globalAlpha = (1 - d / LINK) * 0.5;
          ctx.strokeStyle = "rgba(236,200,120,.5)"; ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    requestAnimationFrame(loop);
  })();
})();
