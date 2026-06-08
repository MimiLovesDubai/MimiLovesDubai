/* MyAIAgent — owner-only visit counter with a country breakdown.
   Cookieless & anonymous: each visit increments a total and a per-country tally
   (country detected via GeoJS, counted via Abacus). The badge — with an
   expandable top-countries list — shows ONLY to the owner, who unlocks it once
   per device via ?owner=<secret>. Visitors are counted but see nothing. */
(function () {
  var NS = "myaiagent-tech", API = "https://abacus.jasoncameron.dev";
  var SECRET = "mimi2240";                 // unlock: https://myaiagent.tech/?owner=mimi2240
  // Countries the owner badge looks up (visitors elsewhere are still counted in the total).
  var CC = ["NL", "BE", "DE", "FR", "GB", "US", "ES", "IT", "PT", "IE", "SE", "NO", "DK", "FI",
            "PL", "AT", "CH", "LU", "CA", "AU", "NZ", "ZA", "IN", "BR", "MX", "AE", "SA", "TR",
            "GR", "CZ", "RO", "HU", "MA", "ID", "PH", "SG", "JP", "CN", "RU", "UA"];
  function noop() {}

  // --- owner unlock / lock via URL ---
  try {
    var p = new URLSearchParams(location.search);
    if (p.get("owner") === SECRET) { localStorage.setItem("myaiagent_owner", "1"); clean(p); }
    else if (p.get("owner") === "off") { localStorage.removeItem("myaiagent_owner"); clean(p); }
    function clean(q) { q.delete("owner"); history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q.toString() : "") + location.hash); }
  } catch (e) {}

  var isOwner = false;
  try { isOwner = localStorage.getItem("myaiagent_owner") === "1"; } catch (e) {}

  if (!isOwner) {
    // Count this visit: total + (after detecting country) per-country tally.
    fetch(API + "/hit/" + NS + "/views").catch(noop);
    fetch("https://get.geojs.io/v1/ip/country.json").then(function (r) { return r.json(); })
      .then(function (g) {
        var c = g && g.country ? String(g.country).toUpperCase() : "";
        if (/^[A-Z]{2}$/.test(c)) fetch(API + "/hit/" + NS + "/c-" + c).catch(noop);
      }).catch(noop);
    return;
  }

  // --- owner: read totals (no increment) and render the badge ---
  function getVal(key) {
    return fetch(API + "/get/" + NS + "/" + key)
      .then(function (r) { return r.ok ? r.json() : { value: 0 }; })
      .then(function (d) { return d && typeof d.value === "number" ? d.value : 0; })
      .catch(function () { return 0; });
  }
  Promise.all([getVal("views")].concat(CC.map(function (c) { return getVal("c-" + c); })))
    .then(function (vals) {
      var total = vals[0];
      var rows = CC.map(function (c, i) { return { c: c, n: vals[i + 1] }; })
        .filter(function (r) { return r.n > 0; }).sort(function (a, b) { return b.n - a.n; });
      render(total, rows);
    }).catch(function () { render(null, []); });

  function flag(cc) { return cc.replace(/./g, function (ch) { return String.fromCodePoint(127397 + ch.charCodeAt(0)); }); }

  function render(total, rows) {
    ready(function () {
      if (document.querySelector(".owner-counter")) return;
      var lang = (document.documentElement.lang || "nl").slice(0, 2) === "en" ? "en" : "nl";
      var dn; try { dn = new Intl.DisplayNames([lang], { type: "region" }); } catch (e) { dn = null; }
      function nm(c) { try { return dn ? dn.of(c) : c; } catch (e) { return c; } }
      var lbl = lang === "en" ? "views" : "weergaven";
      var none = lang === "en" ? "No country data yet" : "Nog geen landdata";
      var geo = rows.length
        ? rows.slice(0, 8).map(function (r) {
            return '<div class="oc-row"><span class="oc-fl">' + flag(r.c) + '</span>' +
              '<span class="oc-cn">' + nm(r.c) + '</span><span class="oc-cv">' + r.n.toLocaleString() + '</span></div>';
          }).join("")
        : '<div class="oc-empty">' + none + '</div>';
      var b = document.createElement("div");
      b.className = "owner-counter";
      b.title = lang === "en" ? "Visible only to you" : "Alleen voor jou zichtbaar";
      b.innerHTML =
        '<div class="oc-main"><span class="oc-ico">👁</span>' +
        '<span class="oc-n">' + (total == null ? "—" : total.toLocaleString()) + '</span>' +
        '<span class="oc-lbl">' + lbl + '</span><span class="oc-caret">⌄</span></div>' +
        '<div class="oc-geo">' + geo + '</div>';
      b.querySelector(".oc-main").addEventListener("click", function () { b.classList.toggle("open"); });
      document.body.appendChild(b);
    });
  }

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn();
  }
})();
