#!/usr/bin/env python3
"""
build_site.py — Genereert de futuristische website uit de Markdown-modules.

Zet elke module uit modules/ om naar een schitterende, statische HTML-pagina
(module-XX.html) en bouwt de landingspagina (index.html). Volledig vooraf
gerenderd: geen server of internet nodig om de inhoud te tonen.

Draai (geen externe pakketten nodig):
    python3 build_site.py

Hoort bij "De Autonome Onderneming".
"""

import html
import os
import re

HIER = os.path.dirname(os.path.abspath(__file__))
MOD_DIR = os.path.join(HIER, "modules")

# Merk / domein
SITE_NAME = "MyAIAgent.tech"
SITE_DOMAIN = "myaiagent.tech"
SITE_URL = "https://myaiagent.tech"

# Volgorde + korte omschrijving + icoon per module (voor de landingspagina).
MODULES = [
    ("00-introductie-en-mindset",   "Introductie & mindset",        "Realistische verwachtingen en hoe agents écht geld verdienen.", "🧭"),
    ("01-wat-is-een-ai-agent",      "Wat is een AI-agent?",          "Het verschil tussen prompt, workflow en een echte agent.",      "🤖"),
    ("02-business-model-kiezen",    "Kies je business-model",        "7 modellen die werken met agents — plus hoe je kiest.",         "💡"),
    ("03-tech-stack-en-setup",      "Tech stack & setup",            "API-sleutel, Python, omgeving en kosten begrijpen.",            "⚙️"),
    ("04-je-eerste-agent-bouwen",   "Je eerste agent bouwen",        "Je eerste werkende agent met de Claude API.",                   "🚀"),
    ("05-tools-en-acties",          "Tools geven aan je agent",      "Hoe je agent echte acties uitvoert in de wereld.",              "🛠️"),
    ("06-de-autonome-loop",         "De autonome loop",              "Een agent die zelfstandig blijft doorwerken — veilig.",         "🔁"),
    ("07-managed-agents",           "Managed Agents & opschalen",    "Agents die 24/7 op Anthropic's infrastructuur draaien.",        "🛰️"),
    ("08-monetisatie",              "Geld verdienen: monetisatie",   "Prijsmodellen, waarde leveren en je eerste euro.",              "💰"),
    ("09-betalingen-en-integraties","Betalingen & integraties",      "Stripe, e-mail, Zapier en facturen.",                           "💳"),
    ("10-veiligheid-en-guardrails", "Veiligheid & guardrails",       "Budgetten, mens-in-de-loop en fouten opvangen.",                "🛡️"),
    ("11-juridisch-en-ethiek",      "Juridisch, belasting & ethiek", "KvK, btw, AVG, AI Act en aansprakelijkheid.",                   "⚖️"),
    ("12-launch-en-groei",          "Launch-checklist & groei",      "Van prototype naar een draaiend bedrijf.",                      "📈"),
]


# ───────────────────────── Markdown → HTML ──────────────────────────────────
def inline(text: str) -> str:
    """Inline-markdown: code, bold, links. Tekst wordt ge-escaped."""
    # Verwerk inline code eerst en bescherm het met placeholders.
    codes = []

    def stash(m):
        codes.append(m.group(1))
        return f"\x00{len(codes) - 1}\x00"

    text = re.sub(r"`([^`]+)`", stash, text)
    text = html.escape(text, quote=False)
    # bold
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    # links [tekst](url) — vertaal .md-links naar .html-pagina's
    def link(m):
        label, href = m.group(1), m.group(2)
        href = re.sub(r"(?:\.\./)?modules/([0-9]{2}-[a-z0-9-]+)\.md", r"module-\1.html", href)
        href = re.sub(r"(?:\.\./)?README\.md", "index.html", href)
        href = href.replace("../templates/", "templates/").replace("../code/", "code/")
        return f'<a href="{href}">{label}</a>'

    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, text)
    # herstel code
    for i, c in enumerate(codes):
        text = text.replace(f"\x00{i}\x00", f"<code>{html.escape(c, quote=False)}</code>")
    return text


def md_to_html(md: str) -> str:
    lines = md.split("\n")
    out = []
    i = 0
    n = len(lines)

    def close_list(stack):
        while stack:
            out.append(f"</{stack.pop()}>")

    list_stack = []

    while i < n:
        line = lines[i]

        # fenced code block
        if line.startswith("```"):
            close_list(list_stack)
            i += 1
            buf = []
            while i < n and not lines[i].startswith("```"):
                buf.append(html.escape(lines[i], quote=False))
                i += 1
            i += 1
            out.append("<pre><code>" + "\n".join(buf) + "</code></pre>")
            continue

        # table
        if "|" in line and i + 1 < n and re.match(r"^\s*\|?[\s:|-]+\|[\s:|-]*$", lines[i + 1]):
            close_list(list_stack)
            header = [c.strip() for c in line.strip().strip("|").split("|")]
            i += 2
            rows = []
            while i < n and "|" in lines[i] and lines[i].strip():
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")])
                i += 1
            thead = "".join(f"<th>{inline(c)}</th>" for c in header)
            tbody = ""
            for r in rows:
                tds = "".join(f"<td>{inline(c)}</td>" for c in r)
                tbody += f"<tr>{tds}</tr>"
            out.append(f"<table><thead><tr>{thead}</tr></thead><tbody>{tbody}</tbody></table>")
            continue

        # heading
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            close_list(list_stack)
            lvl = len(m.group(1))
            out.append(f"<h{lvl}>{inline(m.group(2))}</h{lvl}>")
            i += 1
            continue

        # hr
        if re.match(r"^\s*---\s*$", line):
            close_list(list_stack)
            out.append("<hr>")
            i += 1
            continue

        # blockquote (mogelijk meerdere regels)
        if line.startswith(">"):
            close_list(list_stack)
            buf = []
            while i < n and lines[i].startswith(">"):
                buf.append(lines[i][1:].lstrip())
                i += 1
            # behoud paragraaf-breaks binnen quote
            text = "<br>".join(inline(b) if b else "" for b in buf)
            out.append(f"<blockquote><p>{text}</p></blockquote>")
            continue

        # lists (ordered / unordered, incl. checkboxes), met 1 niveau inspringing
        m = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)$", line)
        if m:
            indent = len(m.group(1))
            ordered = bool(re.match(r"\d+\.", m.group(2)))
            tag = "ol" if ordered else "ul"
            # open lijst indien nodig
            if not list_stack:
                out.append(f"<{tag}>")
                list_stack.append(tag)
            content = m.group(3)
            # checkbox
            cb = re.match(r"^\[([ xX])\]\s+(.*)$", content)
            if cb:
                checked = "checked" if cb.group(1).lower() == "x" else ""
                content = f'<input type="checkbox" disabled {checked}> {cb.group(2)}'
                out.append(f"<li style='list-style:none;margin-left:-18px'>{inline_keepcb(content)}</li>")
            else:
                out.append(f"<li>{inline(content)}</li>")
            i += 1
            continue

        # blank line
        if not line.strip():
            close_list(list_stack)
            i += 1
            continue

        # paragraph (verzamel opvolgende niet-lege regels)
        close_list(list_stack)
        buf = [line]
        i += 1
        while i < n and lines[i].strip() and not re.match(r"^(#{1,6}\s|```|>|\s*[-*]\s|\s*\d+\.\s|\s*---\s*$)", lines[i]) and "|" not in lines[i]:
            buf.append(lines[i])
            i += 1
        out.append(f"<p>{inline(' '.join(buf))}</p>")

    close_list(list_stack)
    return "\n".join(out)


def inline_keepcb(text: str) -> str:
    """Zoals inline(), maar laat een al-ingevoegd <input>-checkbox staan."""
    parts = re.split(r"(<input[^>]*>)", text)
    return "".join(p if p.startswith("<input") else inline(p) for p in parts)


# ───────────────────────── Paginasjablonen ─────────────────────────────────
HEAD = """<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="MyAIAgent.tech">
<meta property="og:image" content="https://myaiagent.tech/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://myaiagent.tech/assets/img/og.png">
<meta name="theme-color" content="#07060a">
<link rel="icon" href="{root}assets/img/brand-square.png">
<link rel="apple-touch-icon" href="{root}assets/img/brand-square.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{root}assets/styles.css">
</head>
<body>
<div class="bg-fx"></div><div class="bg-grid"></div>
<div class="orb a"></div><div class="orb b"></div><div class="orb c"></div>
"""

NAV = """<nav class="nav"><div class="wrap">
<a class="brand" href="{root}index.html"><span class="mark">◆</span> {site}</a>
<div class="nav-links">
  <a href="{root}index.html#modules">Modules</a>
  <a href="{root}index.html#waarom">Waarom</a>
  <a href="{root}module-00-introductie-en-mindset.html">Start de cursus</a>
</div></div></nav>
"""

FOOT = """<footer><div class="wrap">
<div>
  <div class="brand" style="margin-bottom:6px"><span class="mark">◆</span> {site}</div>
  <div class="disclaimer">Educatief materiaal — geen financieel, juridisch of fiscaal advies. Jij bent verantwoordelijk voor wat je agent doet. Bouw verantwoord.</div>
</div>
<div style="text-align:right">
  <a href="{root}index.html">Home</a> &nbsp;·&nbsp;
  <a href="{root}module-00-introductie-en-mindset.html">Start</a><br>
  <span style="opacity:.6">Gebouwd met de Claude API · Opus 4.8</span>
</div>
</div></footer>
"""

REVEAL_JS = """<script>
const io=new IntersectionObserver((es)=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
</script>"""

READER_JS = """<script>
const bar=document.getElementById('rbar');
addEventListener('scroll',()=>{const h=document.documentElement;const p=h.scrollTop/(h.scrollHeight-h.clientHeight);bar.style.width=(p*100)+'%';},{passive:true});
</script>"""


def build_module(idx: int) -> None:
    slug, titel, desc, _ = MODULES[idx]
    src = os.path.join(MOD_DIR, f"{slug}.md")
    with open(src, encoding="utf-8") as f:
        md = f.read()

    # Verwijder de eerste H1 (we tonen een eigen mooie kop).
    md = re.sub(r"^#\s+.*?\n", "", md, count=1)
    # Knip de redundante "## Verder"-navigatiestaart weg (de pager regelt dat).
    md = re.split(r"\n#{2,3}\s+Verder\b", md)[0]
    # Knip een losse afsluitende "← Terug ..."-regel weg indien aanwezig.
    md = re.sub(r"\n+←\s*\[.*$", "", md, flags=re.S)
    body = md_to_html(md.strip())

    nummer = slug[:2]
    crumb = f"Module {nummer} / 12"

    # Pager
    prev_html = ""
    if idx > 0:
        p_slug, p_titel = MODULES[idx - 1][0], MODULES[idx - 1][1]
        prev_html = f'<a class="prev" href="module-{p_slug}.html"><div class="lbl">← Vorige</div><div class="ttl">{p_titel}</div></a>'
    else:
        prev_html = '<a class="prev disabled" href="#"><div class="lbl">← Vorige</div><div class="ttl">—</div></a>'

    if idx < len(MODULES) - 1:
        n_slug, n_titel = MODULES[idx + 1][0], MODULES[idx + 1][1]
        next_html = f'<a class="next" href="module-{n_slug}.html"><div class="lbl">Volgende →</div><div class="ttl">{n_titel}</div></a>'
    else:
        next_html = '<a class="next" href="index.html"><div class="lbl">Voltooid →</div><div class="ttl">Terug naar overzicht</div></a>'

    page = (
        HEAD.format(title=f"{titel} · De Autonome Onderneming", desc=desc, root="")
        + '<div class="reader-top"><div class="bar" id="rbar"></div></div>'
        + NAV.format(root="", site=SITE_NAME)
        + '<article class="article">'
        + f'<div class="crumb">{crumb}</div>'
        + f"<h1>{html.escape(titel)}</h1>"
        + f'<p style="color:var(--text-dim);font-size:1.12rem">{html.escape(desc)}</p>'
        + "<hr>"
        + body
        + f'<div class="pager">{prev_html}{next_html}</div>'
        + "</article>"
        + '<a class="toc-fab" href="index.html#modules">☰ Alle modules</a>'
        + FOOT.format(root="", site=SITE_NAME)
        + READER_JS
        + "</body></html>"
    )

    out = os.path.join(HIER, f"module-{slug}.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(page)


def build_index() -> None:
    feats = [
        ("🤖", "Echte autonome agents", "Bouw agents die zelf denken, tools gebruiken en doorwerken tot het doel bereikt is — met de Claude API."),
        ("🛡️", "Veilig & verantwoord", "Budgetlimieten, mens-in-de-loop en guardrails ingebouwd. Geen geld verbranden, geen ongelukken."),
        ("💰", "Gebouwd om te verdienen", "Van business-model tot betalingen: een compleet draaiboek om je eerste euro binnen te halen."),
        ("🛰️", "24/7 schaalbaar", "Stap door naar Managed Agents die op Anthropic's infrastructuur draaien — zonder serverbeheer."),
        ("⚡", "Werkende code, geen pseudocode", "Vijf draaibare Python-voorbeelden. Kopiëren, draaien, aanpassen naar jouw bedrijf."),
        ("⚖️", "Juridisch op orde", "KvK, btw, AVG en de EU AI Act — helder uitgelegd zodat je veilig onderneemt."),
    ]
    feat_html = "".join(
        f'<div class="feature reveal"><div class="ico">{i}</div><h3>{html.escape(t)}</h3><p>{html.escape(d)}</p></div>'
        for i, t, d in feats
    )

    mods_html = ""
    for slug, titel, desc, ico in MODULES:
        nummer = slug[:2]
        mods_html += (
            f'<a class="mod-card reveal" href="module-{slug}.html">'
            f'<div class="mod-num">{ico} &nbsp;MODULE {nummer}</div>'
            f"<h3>{html.escape(titel)}</h3><p>{html.escape(desc)}</p>"
            f'<span class="go">Lees module <span>→</span></span></a>'
        )

    page = (
        HEAD.format(
            title="De Autonome Onderneming · Bouw een AI-agent die zélf een bedrijf runt",
            desc="De complete, futuristische cursus: bouw stap voor stap een autonome AI-agent die echt bedrijfswerk doet en geld voor je verdient — met de mens op de juiste plek.",
            root="",
        )
        + NAV.format(root="", site=SITE_NAME)
        # HERO
        + '<header class="hero"><div class="wrap hero-grid">'
        + '<div class="hero-copy">'
        + '<div class="eyebrow"><span class="dot"></span> 13 modules · werkende code · 100% Nederlands</div>'
        + '<h1>Bouw een <span class="gradient-text">AI-agent</span> die zélf een bedrijf runt</h1>'
        + '<p class="lead">Geen hype. Een eerlijk, technisch draaiboek waarmee je een grotendeels autonome AI-agent bouwt die echt werk doet, klanten bedient en geld voor je verdient — terwijl jij de regie houdt.</p>'
        + '<div class="cta">'
        + '<a class="btn btn-primary" href="module-00-introductie-en-mindset.html">Start de cursus →</a>'
        + '<a class="btn btn-ghost" href="#modules">Bekijk alle modules</a>'
        + "</div></div>"
        + '<div class="hero-visual reveal"><div class="hero-frame">'
        + '<img src="assets/img/hero.png" alt="Futuristische gouden AI-figuur in een luxe ruimteschip-lounge" '
        + 'onerror="this.style.display=\'none\';this.parentNode.classList.add(\'empty\')">'
        + '<div class="hero-frame-glow"></div></div></div>'
        + "</div>"
        + '<div class="wrap"><div class="stats">'
        + '<div class="stat reveal"><div class="num">13</div><div class="lbl">complete modules</div></div>'
        + '<div class="stat reveal"><div class="num">5</div><div class="lbl">draaibare code-voorbeelden</div></div>'
        + '<div class="stat reveal"><div class="num">24/7</div><div class="lbl">autonoom te draaien</div></div>'
        + '<div class="stat reveal"><div class="num">∞</div><div class="lbl">schaalbaar</div></div>'
        + "</div></div></header>"
        # WAAROM
        + '<section id="waarom"><div class="wrap"><div class="section-head reveal">'
        + '<div class="kicker">Waarom deze cursus</div>'
        + "<h2>Van idee naar draaiende onderneming</h2>"
        + "<p>Alles wat je nodig hebt om verantwoord een AI-gedreven bedrijf te bouwen — techniek, monetisatie en de wet, in één pad.</p>"
        + '</div><div class="features">'
        + feat_html
        + "</div></div></section>"
        # MODULES
        + '<section id="modules"><div class="wrap"><div class="section-head reveal">'
        + '<div class="kicker">Het curriculum</div>'
        + "<h2>13 modules, één duidelijk pad</h2>"
        + "<p>Werk in volgorde — van mindset tot launch. Elke module bouwt op de vorige.</p>"
        + '</div><div class="modules">'
        + mods_html
        + "</div></div></section>"
        # CTA
        + '<section><div class="wrap"><div class="cta-band reveal">'
        + "<h2>Klaar om te bouwen?</h2>"
        + "<p>Begin bij module 00. Over 30 dagen heb je geen theorie, maar een echt, draaiend mini-bedrijf.</p>"
        + '<a class="btn btn-primary" href="module-00-introductie-en-mindset.html">Start nu →</a>'
        + "</div></div></section>"
        + FOOT.format(root="", site=SITE_NAME)
        + REVEAL_JS
        + "</body></html>"
    )

    with open(os.path.join(HIER, "index.html"), "w", encoding="utf-8") as f:
        f.write(page)


def main() -> None:
    for idx in range(len(MODULES)):
        build_module(idx)
    build_index()
    print(f"✅ Site gebouwd: index.html + {len(MODULES)} modulepagina's.")
    print("   Open index.html in je browser, of host de map (GitHub Pages / Netlify).")


if __name__ == "__main__":
    main()
