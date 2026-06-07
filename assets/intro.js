/* MyAIAgent — cinematic intro splash.
   Shows once per session on the home page. A single "Enter" gesture plays the
   film WITH sound, then fades gracefully into the site and hands off to the
   ambient player. Browsers only allow sound after a gesture, hence the button. */
(function () {
  var KEY = "myaiagent_intro_seen";

  document.addEventListener("DOMContentLoaded", function () {
    var ov = document.getElementById("intro");
    if (!ov) return;

    // Only once per browser session.
    if (sessionStorage.getItem(KEY) === "1") { remove(); return; }

    document.documentElement.classList.add("intro-lock");
    var vid = ov.querySelector(".intro-video");
    var enter = ov.querySelector(".intro-enter");
    var skip = ov.querySelector(".intro-skip");

    function remove() { if (ov && ov.parentNode) ov.parentNode.removeChild(ov); }

    function finish() {
      if (ov.classList.contains("done")) return;
      ov.classList.add("done");
      try { vid.pause(); } catch (e) {}
      sessionStorage.setItem(KEY, "1");
      document.documentElement.classList.remove("intro-lock");
      window.dispatchEvent(new Event("intro:done")); // let the ambient player take over
      setTimeout(remove, 1300);
    }

    enter.addEventListener("click", function () {
      ov.classList.add("playing");
      try { vid.currentTime = 0; } catch (e) {}
      vid.muted = false; vid.volume = 1;
      var p = vid.play();
      if (p && p.catch) p.catch(function () { finish(); }); // if blocked, just enter the site
    });
    skip.addEventListener("click", finish);
    vid.addEventListener("ended", finish);
  });
})();
