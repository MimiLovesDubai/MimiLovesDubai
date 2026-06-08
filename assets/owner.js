/* MyAIAgent — owner-only visit counter.
   Counts page views with a cookieless, anonymous aggregate counter (Abacus).
   The little badge shows ONLY to the owner, who unlocks it once per device via
   ?owner=<secret>. Visitors are counted but never see anything. */
(function () {
  var NS = "myaiagent-tech", KEY = "views";
  var SECRET = "mimi2240";                 // unlock: https://myaiagent.tech/?owner=mimi2240
  var API = "https://abacus.jasoncameron.dev";

  // --- owner unlock / lock via URL ---
  try {
    var p = new URLSearchParams(location.search);
    if (p.get("owner") === SECRET) {
      localStorage.setItem("myaiagent_owner", "1");
      p.delete("owner");
      history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p.toString() : "") + location.hash);
    } else if (p.get("owner") === "off") {
      localStorage.removeItem("myaiagent_owner");
      p.delete("owner");
      history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p.toString() : "") + location.hash);
    }
  } catch (e) {}

  var isOwner = false;
  try { isOwner = localStorage.getItem("myaiagent_owner") === "1"; } catch (e) {}

  // Owner only reads the total (no increment); visitors increment it.
  var url = API + (isOwner ? "/get/" : "/hit/") + NS + "/" + KEY;
  fetch(url).then(function (r) { return r.json(); })
    .then(function (d) { if (isOwner) badge(d && typeof d.value === "number" ? d.value : null); })
    .catch(function () { if (isOwner) badge(null); });

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  function badge(n) {
    ready(function () {
      if (document.querySelector(".owner-counter")) return;
      var en = (document.documentElement.lang || "nl").slice(0, 2) === "en";
      var b = document.createElement("div");
      b.className = "owner-counter";
      b.title = en ? "Visible only to you" : "Alleen voor jou zichtbaar";
      b.innerHTML = '<span class="oc-ico">👁</span>' +
        '<span class="oc-n">' + (n == null ? "—" : n.toLocaleString()) + '</span>' +
        '<span class="oc-lbl">' + (en ? "views" : "weergaven") + '</span>';
      b.addEventListener("click", function () { b.classList.toggle("min"); });
      document.body.appendChild(b);
    });
  }
})();
