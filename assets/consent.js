/* MyAIAgent — GDPR cookie consent for Google Analytics.
   GA (which sets cookies) loads ONLY after the visitor accepts. The choice is
   remembered; declining keeps GA off. No banner if no GA ID is configured. */
(function () {
  var GA = window.__GA_ID;
  if (!GA) return;
  var KEY = "myaiagent_consent";
  var EN = (document.documentElement.lang || "nl").slice(0, 2) === "en";

  function loadGA() {
    if (window.__gaLoaded) return; window.__gaLoaded = true;
    var s = document.createElement("script"); s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); } window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA, { anonymize_ip: true });
  }

  var T = EN ? {
    txt: "We use cookies to measure visits (Google Analytics) and improve the site. No tracking until you agree.",
    ok: "Accept", no: "Decline", more: "Privacy"
  } : {
    txt: "We gebruiken cookies om bezoeken te meten (Google Analytics) en de site te verbeteren. Geen tracking totdat je akkoord gaat.",
    ok: "Accepteren", no: "Weigeren", more: "Privacy"
  };

  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) {}
  if (choice === "granted") { loadGA(); return; }
  if (choice === "denied") { return; }

  document.addEventListener("DOMContentLoaded", function () {
    var bar = document.createElement("div");
    bar.className = "cookie-bar";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", EN ? "Cookie consent" : "Cookie-toestemming");
    bar.innerHTML =
      '<span class="cookie-ico">🍪</span>' +
      '<p class="cookie-txt">' + T.txt + '</p>' +
      '<div class="cookie-btns">' +
      '<button class="cookie-no" type="button">' + T.no + '</button>' +
      '<button class="cookie-ok" type="button">' + T.ok + '</button>' +
      '</div>';
    document.body.appendChild(bar);
    requestAnimationFrame(function () { bar.classList.add("show"); });

    function done(v) {
      try { localStorage.setItem(KEY, v); } catch (e) {}
      bar.classList.remove("show");
      setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 400);
      if (v === "granted") loadGA();
    }
    bar.querySelector(".cookie-ok").addEventListener("click", function () { done("granted"); });
    bar.querySelector(".cookie-no").addEventListener("click", function () { done("denied"); });
  });
})();
