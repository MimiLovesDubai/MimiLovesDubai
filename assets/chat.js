/* MyAIAgent — "Aria", a client-side sales assistant. No backend, no API key.
   Explains what the course delivers and persuades visitors to buy. Bilingual. */
(function () {
  var LANG = (document.documentElement.lang || "nl").slice(0, 2) === "en" ? "en" : "nl";
  var buyEl = document.querySelector(".btn-buy");
  var BUY = buyEl ? buyEl.getAttribute("href") : "index.html#koop";
  var PRICE = "€149", OLD = "€299";

  function buyBtn(label) { return '<a class="chat-cta" href="' + BUY + '">🔓 ' + label + "</a>"; }

  var T = {
    nl: {
      name: "Aria", role: "AI-gids",
      hello: "Hoi! Ik ben Aria 👋 Ik leg je in 30 seconden uit wat je met deze cursus bouwt en waarom het zichzelf terugverdient. Waar ben je benieuwd naar?",
      placeholder: "Stel je vraag…",
      send: "Stuur", open: "Vragen? Chat met Aria", close: "Sluiten",
      chips: [
        ["learn", "Wat leer ik?"], ["why", "Waarom kopen?"], ["money", "Hoe verdien ik geld?"],
        ["price", "Wat kost het?"], ["time", "Hoeveel tijd kost het?"], ["nocode", "Kan het zonder programmeren?"],
        ["who", "Voor wie is dit?"], ["included", "Wat krijg ik?"], ["start", "Hoe begin ik?"],
      ],
      fallback: "Goede vraag! Ik weet het meeste over: wat je leert, waarom het de moeite waard is, het geld verdienen, de prijs, de tijd, en hoe je begint. Tik op een knop hieronder, of " + buyBtn("bekijk de cursus — " + PRICE),
    },
    en: {
      name: "Aria", role: "AI guide",
      hello: "Hi! I'm Aria 👋 In 30 seconds I'll show you what you build with this course and why it pays for itself. What would you like to know?",
      placeholder: "Ask your question…",
      send: "Send", open: "Questions? Chat with Aria", close: "Close",
      chips: [
        ["learn", "What will I learn?"], ["why", "Why buy?"], ["money", "How do I earn money?"],
        ["price", "What's the price?"], ["time", "How much time?"], ["nocode", "No coding needed?"],
        ["who", "Who is it for?"], ["included", "What do I get?"], ["start", "How do I start?"],
      ],
      fallback: "Great question! I know most about: what you'll learn, why it's worth it, earning money, the price, time needed, and how to start. Tap a button below, or " + buyBtn("see the course — " + PRICE),
    },
  }[LANG];

  // Knowledge base: id -> {k:[keywords], a:answer-html}
  var KB = {
    nl: [
      { id: "learn", k: ["leer", "leren", "kan ik", "wat doe", "inhoud", "curriculum", "modules", "skills", "vaardig"],
        a: "Je leert stap voor stap een <strong>autonome AI-agent</strong> bouwen die écht werk doet: klanten te woord staat, opdrachten uitvoert, levert en de omzet bijhoudt — 24/7. Concreet: het juiste business-model kiezen, een werkende agent bouwen met de Claude API (met tools en gestructureerde output), een veilige autonome lus draaien (met budgetlimieten en mens-in-de-loop), en netjes lanceren met een 30-dagen-plan. Alles met <strong>werkende code</strong>, geen vage theorie." },
      { id: "why", k: ["waarom", "overtuig", "twijfel", "waard", "moet ik", "voordeel", "beter dan", "uniek"],
        a: "Omdat je hier geen hype koopt maar een <strong>compleet draaiboek</strong>: van idee → werkende agent → eerste betalende klant. Drie redenen: <br>① <strong>Je bouwt iets dat geld kan verdienen terwijl jij andere dingen doet</strong> — een agent die 24/7 draait.<br>② <strong>Werkende code & sjablonen</strong> die je direct kopieert en aanpast — je hoeft het wiel niet uit te vinden.<br>③ <strong>Veilig & juridisch op orde</strong> (budgetlimieten, AVG, EU AI Act). Eén keer betalen, levenslang toegang en updates. " + buyBtn("Start vandaag — " + PRICE) },
      { id: "money", k: ["geld", "verdien", "omzet", "winst", "betaal", "inkomen", "verdienmodel", "monetisat"],
        a: "Je laat een AI-agent (of een team agents) werk leveren waar mensen voor betalen — denk aan content, klantenservice, onderzoek, leads of kleine diensten. De cursus geeft je een <strong>verdienmodel-keuze</strong>, een validatie­stap vóór je bouwt, en een <strong>30-dagen-plan</strong> naar je eerste betalende klant. Eerlijk: je eerste euro kost inzet en goede distributie — maar het pad ligt klaar." },
      { id: "price", k: ["kost", "prijs", "euro", "duur", "geld kwijt", "betalen", "hoeveel", "korting", "aanbieding"],
        a: "Nu <strong>" + PRICE + "</strong> (in plaats van " + OLD + ", lanceeraanbieding) — <strong>één keer betalen, levenslang toegang</strong> en gratis updates. Eén klant of één bespaarde werkdag verdient dat zo terug. Veilig betalen via Gumroad, direct downloaden. " + buyBtn("Koop & download nu — " + PRICE) },
      { id: "time", k: ["tijd", "lang", "uur", "uren", "weken", "snel", "duurt", "investering"],
        a: "Eerlijk ingeschat: de cursus doorwerken kost een <strong>weekend tot 2 weken</strong>. Je <strong>eerste werkende agent</strong> kan al in een avond–weekend staan. Je eerste betalende klant: weken tot maanden, afhankelijk van je inzet en distributie. Je werkt in je eigen tempo — levenslang toegang." },
      { id: "nocode", k: ["programmeren", "coderen", "code", "zonder", "technisch", "moeilijk", "beginner", "geen ervaring"],
        a: "Je hoeft géén ervaren programmeur te zijn. De cursus begint bij de basis en geeft je <strong>5 werkende code-voorbeelden</strong> die je kopieert, draait en aanpast — plus kant-en-klare sjablonen. Je leert genoeg om het zelf te begrijpen en te sturen, zonder dat je from scratch hoeft te bouwen." },
      { id: "who", k: ["voor wie", "geschikt", "doelgroep", "ondernemer", "student", "bedrijf", "freelanc"],
        a: "Voor ondernemers, freelancers, makers en nieuwsgierige beginners die met AI iets willen bouwen dat echt geld oplevert — zonder eindeloos te studeren. Of je nu wilt automatiseren, een dienst wilt starten of gewoon vooroplopen: dit geeft je een concreet pad." },
      { id: "included", k: ["krijg", "inbegrepen", "bevat", "ontvang", "download", "pakket", "wat zit"],
        a: "Je krijgt: <strong>alle modules</strong> (van mindset tot launch), <strong>5 werkende code-voorbeelden</strong>, <strong>sjablonen</strong> (business-plan & system-prompt), de <strong>complete cursus als download</strong> (offline + de hele website) én <strong>levenslange gratis updates</strong>. " + buyBtn("Krijg alles — " + PRICE) },
      { id: "start", k: ["begin", "starten", "hoe koop", "aankoop", "aanschaf", "downloaden", "toegang"],
        a: "Simpel: klik op kopen, reken veilig af via Gumroad en je downloadt direct alles. Daarna werk je in je eigen tempo de modules door en bouw je je eerste agent. " + buyBtn("Begin nu — " + PRICE) },
      { id: "guarantee", k: ["garantie", "geld terug", "terugbetaling", "refund", "risico", "veilig"],
        a: "Je betaalt veilig via Gumroad en downloadt meteen na aankoop. Je krijgt levenslang toegang en gratis updates, dus de cursus groeit met de techniek mee. Vragen vooraf? Stel ze hier gerust." },
      { id: "challenge", k: ["challenge", "game", "spel", "levels", "30 dagen", "gamif"],
        a: "Naast de diepere cursus is er de <strong>AI Company Challenge</strong>: een gamified pad met levels waarin je in 30 dagen je eigen AI-bedrijf opbouwt — met XP, missies en duidelijke stappen. Leuk én resultaatgericht." },
      { id: "tools", k: ["claude", "chatgpt", "welke ai", "tools", "anthropic", "api", "abonnement"],
        a: "Je werkt met toonaangevende AI zoals de <strong>Claude API</strong> (en je kunt ChatGPT-achtige tools inzetten). De cursus laat zien hoe je agents bouwt met tools, gestructureerde output en — als je wilt — Managed Agents die in de cloud draaien zonder serverbeheer." },
    ],
    en: [
      { id: "learn", k: ["learn", "teach", "content", "curriculum", "modules", "skills", "what do", "able to"],
        a: "You'll learn, step by step, to build an <strong>autonomous AI agent</strong> that does real work: handles customers, runs tasks, delivers and tracks revenue — 24/7. Concretely: choose the right business model, build a working agent with the Claude API (tools + structured output), run a safe autonomous loop (budget limits + human-in-the-loop), and launch with a 30-day plan. All with <strong>working code</strong>, not vague theory." },
      { id: "why", k: ["why", "convince", "worth", "should i", "benefit", "better", "unique", "doubt"],
        a: "Because you're not buying hype but a <strong>complete playbook</strong>: idea → working agent → first paying customer. Three reasons:<br>① <strong>You build something that can earn while you do other things</strong> — an agent that runs 24/7.<br>② <strong>Working code & templates</strong> you copy and adapt — no reinventing the wheel.<br>③ <strong>Safe & legally sound</strong> (budget limits, GDPR, EU AI Act). Pay once, lifetime access and updates. " + buyBtn("Start today — " + PRICE) },
      { id: "money", k: ["money", "earn", "income", "revenue", "profit", "pay", "moneti"],
        a: "You have an AI agent (or a team of agents) deliver work people pay for — content, support, research, leads or small services. The course gives you a <strong>business-model choice</strong>, a validation step before you build, and a <strong>30-day plan</strong> to your first paying customer. Honestly: the first euro takes effort and good distribution — but the path is laid out." },
      { id: "price", k: ["price", "cost", "much", "euro", "expensive", "pay", "discount", "offer"],
        a: "Now <strong>" + PRICE + "</strong> (instead of " + OLD + ", launch offer) — <strong>pay once, lifetime access</strong> and free updates. One client or one saved workday earns it back. Secure payment via Gumroad, instant download. " + buyBtn("Buy & download now — " + PRICE) },
      { id: "time", k: ["time", "long", "hours", "weeks", "fast", "quick", "investment"],
        a: "Honest estimate: working through the course takes a <strong>weekend to 2 weeks</strong>. Your <strong>first working agent</strong> can be live in an evening–weekend. First paying customer: weeks to months, depending on your effort and distribution. Go at your own pace — lifetime access." },
      { id: "nocode", k: ["coding", "code", "program", "without", "technical", "hard", "beginner", "no experience"],
        a: "You don't need to be an experienced programmer. The course starts from the basics and gives you <strong>5 working code examples</strong> you copy, run and adapt — plus ready-made templates. You learn enough to understand and steer it, without building from scratch." },
      { id: "who", k: ["who is", "for whom", "suitable", "audience", "entrepreneur", "student", "freelanc", "business"],
        a: "For entrepreneurs, freelancers, makers and curious beginners who want to build something with AI that actually earns — without endless studying. Whether you want to automate, start a service or simply stay ahead: this gives you a concrete path." },
      { id: "included", k: ["get", "included", "contain", "receive", "download", "package", "what's in"],
        a: "You get: <strong>all modules</strong> (mindset to launch), <strong>5 working code examples</strong>, <strong>templates</strong> (business plan & system prompt), the <strong>complete course as a download</strong> (offline + the whole website) and <strong>lifetime free updates</strong>. " + buyBtn("Get everything — " + PRICE) },
      { id: "start", k: ["start", "begin", "how buy", "purchase", "get access", "download"],
        a: "Simple: click buy, pay securely via Gumroad and download everything instantly. Then work through the modules at your own pace and build your first agent. " + buyBtn("Start now — " + PRICE) },
      { id: "guarantee", k: ["guarantee", "refund", "money back", "risk", "safe", "secure"],
        a: "You pay securely via Gumroad and download immediately after purchase. You get lifetime access and free updates, so the course keeps up with the technology. Questions first? Ask away right here." },
      { id: "challenge", k: ["challenge", "game", "levels", "30 days", "gamif"],
        a: "Alongside the deeper course there's the <strong>AI Company Challenge</strong>: a gamified path with levels where you build your own AI company in 30 days — with XP, missions and clear steps. Fun and results-driven." },
      { id: "tools", k: ["claude", "chatgpt", "which ai", "tools", "anthropic", "api", "subscription"],
        a: "You work with leading AI such as the <strong>Claude API</strong> (and you can use ChatGPT-style tools). The course shows how to build agents with tools, structured output and — if you want — Managed Agents that run in the cloud with no server management." },
    ],
  }[LANG];

  function find(text) {
    var t = (" " + text.toLowerCase() + " ").replace(/[^\wàáâäéèêëíïóôöúûü\s]/gi, " ");
    var best = null, bestScore = 0;
    KB.forEach(function (e) {
      var s = 0; e.k.forEach(function (kw) { if (t.indexOf(kw.toLowerCase()) >= 0) s += kw.length > 4 ? 2 : 1; });
      if (s > bestScore) { bestScore = s; best = e; }
    });
    return bestScore > 0 ? best.a : T.fallback;
  }
  function byId(id) { for (var i = 0; i < KB.length; i++) if (KB[i].id === id) return KB[i].a; return T.fallback; }

  // ---------------- UI ----------------
  document.addEventListener("DOMContentLoaded", function () {
    var launch = document.createElement("button");
    launch.className = "chat-launch"; launch.type = "button";
    launch.innerHTML = '<span class="cl-ico">💬</span><span class="cl-txt">' + T.open + "</span>";
    document.body.appendChild(launch);

    var panel = document.createElement("div"); panel.className = "chat-panel"; panel.setAttribute("role", "dialog");
    panel.innerHTML =
      '<div class="chat-head"><div class="chat-id"><span class="chat-av">✦</span><div>' +
      '<div class="chat-name">' + T.name + '</div><div class="chat-role">' + T.role + ' · MyAIAgent</div></div></div>' +
      '<button class="chat-x" type="button" aria-label="' + T.close + '">✕</button></div>' +
      '<div class="chat-log"></div>' +
      '<div class="chat-chips"></div>' +
      '<form class="chat-form"><input class="chat-in" type="text" placeholder="' + T.placeholder + '" autocomplete="off">' +
      '<button class="chat-send" type="submit" aria-label="' + T.send + '">➤</button></form>';
    document.body.appendChild(panel);

    var log = panel.querySelector(".chat-log");
    var chips = panel.querySelector(".chat-chips");
    var form = panel.querySelector(".chat-form");
    var input = panel.querySelector(".chat-in");
    var greeted = false;

    function scroll() { log.scrollTop = log.scrollHeight; }
    function bubble(html, who) {
      var d = document.createElement("div"); d.className = "chat-msg " + who; d.innerHTML = html; log.appendChild(d); scroll(); return d;
    }
    function escapeHtml(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function botSay(html) {
      var d = bubble('<span class="typing"><i></i><i></i><i></i></span>', "bot");
      setTimeout(function () { d.innerHTML = html; scroll(); }, 380 + Math.random() * 300);
    }
    function renderChips() {
      chips.innerHTML = "";
      T.chips.forEach(function (c) {
        var b = document.createElement("button"); b.className = "chat-chip"; b.type = "button"; b.textContent = c[1];
        b.addEventListener("click", function () { bubble(escapeHtml(c[1]), "me"); botSay(byId(c[0])); });
        chips.appendChild(b);
      });
    }
    function greet() { if (greeted) return; greeted = true; botSay(T.hello); renderChips(); }

    function openChat() { panel.classList.add("open"); launch.classList.add("hidden"); greet(); setTimeout(function () { input.focus(); }, 200); }
    function closeChat() { panel.classList.remove("open"); launch.classList.remove("hidden"); }

    launch.addEventListener("click", openChat);
    panel.querySelector(".chat-x").addEventListener("click", closeChat);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) closeChat(); });
    document.addEventListener("click", function (e) {
      if (panel.classList.contains("open") && !panel.contains(e.target) && !launch.contains(e.target)) closeChat();
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault(); var v = input.value.trim(); if (!v) return;
      bubble(escapeHtml(v), "me"); input.value = ""; botSay(find(v));
    });
  });
})();
