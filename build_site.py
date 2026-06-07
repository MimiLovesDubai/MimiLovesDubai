#!/usr/bin/env python3
"""
build_site.py — Genereert de tweetalige futuristische website uit de Markdown-modules.

Nederlands -> hoofdmap (index.html, module-*.html)
Engels     -> /en/ (en/index.html, en/module-*.html)
Met een taalwisselaar in de navigatie. Volledig vooraf gerenderd; geen server nodig.

Draai (geen externe pakketten nodig):
    python3 build_site.py
"""

import html
import os
import re

HIER = os.path.dirname(os.path.abspath(__file__))

# Merk / domein
SITE_NAME = "MyAIAgent.tech"
SITE_URL = "https://myaiagent.tech"

# Verkoop — vervang BUY_URL door je eigen Gumroad-productlink zodra die klaar is.
PRICE = "€149"
ORIG_PRICE = "€299"
BUY_URL = "https://gumroad.com"  # ← VERVANG: jouw Gumroad-link
DOWNLOAD_ZIP = "downloads/myaiagent-cursus.zip"

# Merkbeelden (rechtstreeks van de beeld-CDN; taal-onafhankelijk).
HERO_IMG = "https://d8j0ntlcm91z4.cloudfront.net/user_3EV64GaphhBt3vnsJcygYZCjJZa/hf_20260606_152320_c81ed183-7881-46fb-8a7f-7f5d8d6acafa.png"
OG_IMG = "https://d8j0ntlcm91z4.cloudfront.net/user_3EV64GaphhBt3vnsJcygYZCjJZa/hf_20260606_152832_ced37d1b-044a-4c0f-97f3-fd873371a7da.png"
ICON_IMG = "https://d8j0ntlcm91z4.cloudfront.net/user_3EV64GaphhBt3vnsJcygYZCjJZa/hf_20260606_152841_53f4de5c-cd0b-4fd3-8794-1649a152eb1c.png"


# Elegante line-art iconen (SVG, stroke = currentColor) — chique i.p.v. emoji.
def _svg(inner: str) -> str:
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" '
            'stroke-linecap="round" stroke-linejoin="round">' + inner + "</svg>")


ICONS = {
    "cpu": _svg('<rect x="4" y="4" width="16" height="16" rx="2.5"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 1.5v2.5M15 1.5v2.5M9 20v2.5M15 20v2.5M20 9h2.5M20 14h2.5M1.5 9H4M1.5 14H4"/>'),
    "shield": _svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/>'),
    "coin": _svg('<circle cx="12" cy="12" r="9"/><path d="M15 9.2A4 4 0 1 0 15 15M8 11h5M8 13.2h5"/>'),
    "orbit": _svg('<circle cx="12" cy="12" r="3.2"/><ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(-28 12 12)"/><circle cx="20" cy="8.4" r="1.1" fill="currentColor"/>'),
    "code": _svg('<path d="M8.5 17l-5-5 5-5M15.5 7l5 5-5 5M13 4.5l-2 15"/>'),
    "scale": _svg('<path d="M12 3v18M7 21h10M5 7h14M5 7l-2.5 6a3 3 0 0 0 5 0L5 7zM19 7l-2.5 6a3 3 0 0 0 5 0L19 7zM12 4.5l-5 2.2M12 4.5l5 2.2"/>'),
    "spark": _svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2 2M15.7 15.7l2 2M17.7 6.3l-2 2M8.3 15.7l-2 2"/>'),
    "check": _svg('<path d="M5 12.5l4.2 4.2L19 7"/>'),
    "lock": _svg('<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>'),
    "sparkle": _svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>'),
    "globe": _svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>'),
}

# Iconen voor de feature-kaarten (zelfde volgorde NL/EN).
FEATURE_ICONS = ["cpu", "shield", "coin", "orbit", "code", "scale"]

# ── Modules per taal: (slug, badge, titel, korte omschrijving) ───────────────
# De Claude.ai-bonusmodule staat na module 03.
MODULES_NL = [
    ("00-introductie-en-mindset",    "MODULE 00", "Introductie & mindset",        "Realistische verwachtingen en hoe agents écht geld verdienen."),
    ("01-wat-is-een-ai-agent",       "MODULE 01", "Wat is een AI-agent?",          "Het verschil tussen prompt, workflow en een echte agent."),
    ("02-business-model-kiezen",     "MODULE 02", "Kies je business-model",        "7 modellen die werken met agents — plus hoe je kiest."),
    ("03-tech-stack-en-setup",       "MODULE 03", "Tech stack & setup",            "API-sleutel, Python, omgeving en kosten begrijpen."),
    ("claude-ai-route",              "BONUS",     "Bouwen met Claude.ai",          "Ontwerp, test en genereer je agent in de claude.ai-chatapp."),
    ("04-je-eerste-agent-bouwen",    "MODULE 04", "Je eerste agent bouwen",        "Je eerste werkende agent met de Claude API."),
    ("05-tools-en-acties",           "MODULE 05", "Tools geven aan je agent",      "Hoe je agent echte acties uitvoert in de wereld."),
    ("06-de-autonome-loop",          "MODULE 06", "De autonome loop",              "Een agent die zelfstandig blijft doorwerken — veilig."),
    ("07-managed-agents",            "MODULE 07", "Managed Agents & opschalen",    "Agents die 24/7 op Anthropic's infrastructuur draaien."),
    ("08-monetisatie",               "MODULE 08", "Geld verdienen: monetisatie",   "Prijsmodellen, waarde leveren en je eerste euro."),
    ("09-betalingen-en-integraties", "MODULE 09", "Betalingen & integraties",      "Stripe, e-mail, Zapier en facturen."),
    ("10-veiligheid-en-guardrails",  "MODULE 10", "Veiligheid & guardrails",       "Budgetten, mens-in-de-loop en fouten opvangen."),
    ("11-juridisch-en-ethiek",       "MODULE 11", "Juridisch, belasting & ethiek", "KvK, btw, AVG, AI Act en aansprakelijkheid."),
    ("12-launch-en-groei",           "MODULE 12", "Launch-checklist & groei",      "Van prototype naar een draaiend bedrijf."),
    ("praktijkvoorbeeld",            "PRAKTIJK",  "Praktijkvoorbeeld: 7-dagen-plan", "Eén volledig uitgewerkt voorbeeld — van nul naar je eerste klant."),
    ("agent-bedrijf-blauwdruk",      "BLAUWDRUK", "Bouw je autonome agent-bedrijf",  "De capstone: een groep samenwerkende agents die zelf een bedrijf runt."),
    ("creatieve-virale-agents",      "VIRAAL",    "Creatieve & virale agent-bedrijven", "Gen Z-niches die viraal gaan — met hoe je er echt geld mee verdient."),
]

MODULES_EN = [
    ("00-introductie-en-mindset",    "MODULE 00", "Introduction & mindset",        "Realistic expectations and how agents really make money."),
    ("01-wat-is-een-ai-agent",       "MODULE 01", "What is an AI agent?",          "The difference between a prompt, a workflow and a real agent."),
    ("02-business-model-kiezen",     "MODULE 02", "Choose your business model",    "7 models that work with agents — and how to pick one."),
    ("03-tech-stack-en-setup",       "MODULE 03", "Tech stack & setup",            "API key, Python, environment and understanding costs."),
    ("claude-ai-route",              "BONUS",     "Build it with Claude.ai",       "Design, test and generate your agent in the claude.ai chat app."),
    ("04-je-eerste-agent-bouwen",    "MODULE 04", "Build your first agent",        "Your first working agent with the Claude API."),
    ("05-tools-en-acties",           "MODULE 05", "Give your agent tools",         "How your agent performs real actions in the world."),
    ("06-de-autonome-loop",          "MODULE 06", "The autonomous loop",           "An agent that keeps working on its own — safely."),
    ("07-managed-agents",            "MODULE 07", "Managed Agents & scaling",      "Agents that run 24/7 on Anthropic's infrastructure."),
    ("08-monetisatie",               "MODULE 08", "Making money: monetization",    "Pricing models, delivering value and your first sale."),
    ("09-betalingen-en-integraties", "MODULE 09", "Payments & integrations",       "Stripe, email, Zapier and invoices."),
    ("10-veiligheid-en-guardrails",  "MODULE 10", "Safety & guardrails",           "Budgets, human-in-the-loop and catching errors."),
    ("11-juridisch-en-ethiek",       "MODULE 11", "Legal, tax & ethics",           "Registration, VAT, GDPR, the AI Act and liability."),
    ("12-launch-en-groei",           "MODULE 12", "Launch checklist & growth",     "From prototype to a running business."),
    ("praktijkvoorbeeld",            "HANDS-ON",  "Worked example: 7-day plan",    "One fully worked example — from zero to your first customer."),
    ("agent-bedrijf-blauwdruk",      "BLUEPRINT", "Build your autonomous agent company", "The capstone: a group of collaborating agents that runs a business itself."),
    ("creatieve-virale-agents",      "VIRAL",     "Creative & viral agent businesses", "Gen Z niches that go viral — and how you actually make money with them."),
]

# ── UI-teksten per taal ──────────────────────────────────────────────────────
STR_NL = {
    "lang": "nl", "src": "modules", "dir": "", "asset_root": "", "switch_prefix": "en/",
    "switch_label": "EN", "other_name": "English",
    "nav": ["Modules", "Waarom", "Koop de cursus"],
    "eyebrow": "{n} modules · werkende code · 100% Nederlands",
    "h1": 'Bouw een <span class="gradient-text">AI-agent</span> die zélf een bedrijf runt',
    "lead": "Geen hype. Een eerlijk, technisch draaiboek waarmee je een grotendeels autonome AI-agent bouwt die echt werk doet, klanten bedient en geld voor je verdient — terwijl jij de regie houdt.",
    "cta1": "Start de cursus", "cta2": "Bekijk alle modules",
    "hero_alt": "Futuristische gouden AI-figuur in een luxe ruimteschip-lounge",
    "stats": [("{n}", "complete modules"), ("5", "draaibare code-voorbeelden"),
              ("24/7", "autonoom te draaien"), ("∞", "schaalbaar")],
    "why_k": "Waarom deze cursus", "why_h": "Van idee naar draaiende onderneming",
    "why_p": "Alles wat je nodig hebt om verantwoord een AI-gedreven bedrijf te bouwen — techniek, monetisatie en de wet, in één pad.",
    "features": [
        ("Echte autonome agents", "Bouw agents die zelf denken, tools gebruiken en doorwerken tot het doel bereikt is — met de Claude API."),
        ("Veilig & verantwoord", "Budgetlimieten, mens-in-de-loop en guardrails ingebouwd. Geen geld verbranden, geen ongelukken."),
        ("Gebouwd om te verdienen", "Van business-model tot betalingen: een compleet draaiboek om je eerste euro binnen te halen."),
        ("24/7 schaalbaar", "Stap door naar Managed Agents die op Anthropic's infrastructuur draaien — zonder serverbeheer."),
        ("Werkende code, geen pseudocode", "Vijf draaibare Python-voorbeelden. Kopiëren, draaien, aanpassen naar jouw bedrijf."),
        ("Juridisch op orde", "KvK, btw, AVG en de EU AI Act — helder uitgelegd zodat je veilig onderneemt."),
    ],
    "mod_k": "Het curriculum", "mod_h": "{n} modules, één duidelijk pad",
    "mod_p": "Werk in volgorde — van mindset tot launch. Elke module bouwt op de vorige.",
    "read": "Lees module",
    "leer_k": "Resultaat", "leer_h": "Wat je na de cursus kunt",
    "leer_p": "Geen theorie om de theorie — je krijgt de vaardigheden én een concreet pad om ze in praktijk te brengen.",
    "outcomes": [
        "Begrijpen wanneer je een agent inzet — prompt, workflow of een echte agent",
        "Een verkoopbaar business-model kiezen en valideren vóór je bouwt",
        "Een werkende agent bouwen met de Claude API — met tools en gestructureerde output",
        "Een veilige autonome lus draaien met budgetlimieten, mens-in-de-loop en logging",
        "Een groep samenwerkende agents draaien die zelf opdrachten verwerkt, levert en de omzet bijhoudt — 24/7 in te plannen",
        "Juridisch netjes ondernemen en lanceren met een concreet 30-dagen-plan",
    ],
    "time_h": "Tijdsinvestering",
    "time_p": "Eerlijk ingeschat — het resultaat hangt vooral af van je inzet en je distributie.",
    "phases": [
        ("01", "Cursus doorwerken", "Weekend – 2 weken"),
        ("02", "Eerste werkende agent", "Avond – weekend"),
        ("03", "Eerste betalende klant", "Weken – maanden"),
        ("04", "Grotendeels vanzelf", "Maanden bijsturen"),
    ],
    "buy_k": "Toegang", "buy_h": "Krijg de volledige cursus",
    "buy_p": "Koop één keer, download alles, en bouw in je eigen tempo je eerste geld-verdienende AI-agent.",
    "badge": "Lanceeraanbieding · levenslang toegang",
    "buy_list": [
        "Alle <strong>{n} modules</strong> — van mindset tot launch",
        "<strong>5 werkende code-voorbeelden</strong> — kopiëren, draaien, aanpassen",
        "<strong>Sjablonen</strong>: business-plan &amp; system-prompt",
        "Complete cursus als <strong>download</strong> — offline &amp; de volledige website",
        "<strong>Levenslange updates</strong> — gratis",
    ],
    "buy_btn": "Koop &amp; download nu — " + PRICE, "free_btn": "Eerst gratis lezen",
    "guarantee": "Veilig betalen via Gumroad · direct downloaden na aankoop",
    "title": "De Autonome Onderneming · Bouw een AI-agent die zélf een bedrijf runt",
    "desc": "De complete, futuristische cursus: bouw stap voor stap een autonome AI-agent die echt bedrijfswerk doet en geld voor je verdient — met de mens op de juiste plek.",
    "mod_title_suffix": "De Autonome Onderneming",
    "disclaimer": "Educatief materiaal — geen financieel, juridisch of fiscaal advies. Jij bent verantwoordelijk voor wat je agent doet. Bouw verantwoord.",
    "foot_built": "Gebouwd met de Claude API · Opus 4.8",
    "prev": "← Vorige", "next": "Volgende →", "done": "Voltooid →",
    "back": "Terug naar overzicht", "toc": "☰ Alle modules",
}

STR_EN = {
    "lang": "en", "src": "en/modules", "dir": "en", "asset_root": "../", "switch_prefix": "../",
    "switch_label": "NL", "other_name": "Nederlands",
    "nav": ["Modules", "Why", "Get the course"],
    "eyebrow": "{n} modules · working code · in English",
    "h1": 'Build an <span class="gradient-text">AI agent</span> that runs a business by itself',
    "lead": "No hype. An honest, technical playbook to build a largely autonomous AI agent that does real work, serves customers and earns money — while you stay in control.",
    "cta1": "Start the course", "cta2": "See all modules",
    "hero_alt": "Futuristic golden AI figure in a luxury spaceship lounge",
    "stats": [("{n}", "complete modules"), ("5", "runnable code examples"),
              ("24/7", "run autonomously"), ("∞", "scalable")],
    "why_k": "Why this course", "why_h": "From idea to a running business",
    "why_p": "Everything you need to responsibly build an AI-driven business — tech, monetization and the law, in one path.",
    "features": [
        ("Real autonomous agents", "Build agents that think for themselves, use tools and keep working until the goal is reached — with the Claude API."),
        ("Safe & responsible", "Budget limits, human-in-the-loop and guardrails built in. No burned budget, no accidents."),
        ("Built to earn", "From business model to payments: a complete playbook to land your first paying customer."),
        ("24/7 scalable", "Step up to Managed Agents running on Anthropic's infrastructure — with no server management."),
        ("Working code, no pseudocode", "Five runnable Python examples. Copy, run, adapt to your own business."),
        ("Legally sound", "Registration, VAT, GDPR and the EU AI Act — explained clearly so you operate safely."),
    ],
    "mod_k": "The curriculum", "mod_h": "{n} modules, one clear path",
    "mod_p": "Work in order — from mindset to launch. Each module builds on the last.",
    "read": "Read module",
    "leer_k": "Outcome", "leer_h": "What you'll be able to do",
    "leer_p": "Not theory for its own sake — you get the skills and a concrete path to put them into practice.",
    "outcomes": [
        "Know when to use an agent — a prompt, a workflow or a real agent",
        "Choose and validate a sellable business model before you build",
        "Build a working agent with the Claude API — with tools and structured output",
        "Run a safe autonomous loop with budget limits, human-in-the-loop and logging",
        "Run a group of collaborating agents that processes jobs, delivers and tracks revenue — schedulable 24/7",
        "Operate legally and launch with a concrete 30-day plan",
    ],
    "time_h": "Time investment",
    "time_p": "Honestly estimated — results depend mostly on your effort and your distribution.",
    "phases": [
        ("01", "Work through the course", "Weekend – 2 weeks"),
        ("02", "First working agent", "Evening – weekend"),
        ("03", "First paying customer", "Weeks – months"),
        ("04", "Mostly runs itself", "Months of tuning"),
    ],
    "buy_k": "Access", "buy_h": "Get the full course",
    "buy_p": "Buy once, download everything, and build your first money-making AI agent at your own pace.",
    "badge": "Launch offer · lifetime access",
    "buy_list": [
        "All <strong>{n} modules</strong> — from mindset to launch",
        "<strong>5 working code examples</strong> — copy, run, adapt",
        "<strong>Templates</strong>: business plan &amp; system prompt",
        "The complete course as a <strong>download</strong> — offline &amp; the full website",
        "<strong>Lifetime updates</strong> — free",
    ],
    "buy_btn": "Buy &amp; download now — " + PRICE, "free_btn": "Read it free first",
    "guarantee": "Secure payment via Gumroad · instant download after purchase",
    "title": "MyAIAgent.tech · Build an AI agent that runs a business by itself",
    "desc": "The complete, futuristic course: build a largely autonomous AI agent that does real business work and earns money for you — step by step, with a human in the loop.",
    "mod_title_suffix": "MyAIAgent.tech",
    "disclaimer": "Educational material — not financial, legal or tax advice. You are responsible for what your agent does. Build responsibly.",
    "foot_built": "Built with the Claude API · Opus 4.8",
    "prev": "← Previous", "next": "Next →", "done": "Completed →",
    "back": "Back to overview", "toc": "☰ All modules",
}

LANGS = {"nl": STR_NL, "en": STR_EN}

# Globaal gezet per taal; gebruikt door inline() voor gedeelde-map-links.
ASSET_ROOT = ""


# ───────────────────────── Markdown → HTML ──────────────────────────────────
def inline(text: str) -> str:
    codes = []

    def stash(m):
        codes.append(m.group(1))
        return f"\x00{len(codes) - 1}\x00"

    text = re.sub(r"`([^`]+)`", stash, text)
    text = html.escape(text, quote=False)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)

    def link(m):
        label, href = m.group(1), m.group(2)
        # module-links (zelfde map) → module-<slug>.html
        href = re.sub(r"(?:\.\./)?modules/([a-z0-9-]+)\.md", r"module-\1.html", href)
        # README/home (zelfde map)
        href = re.sub(r"(?:\.\./)?README\.md", "index.html", href)
        # gedeelde mappen (repo-root): vanuit /en/ één niveau omhoog
        href = href.replace("../templates/", ASSET_ROOT + "templates/")
        href = href.replace("../code/", ASSET_ROOT + "code/")
        return f'<a href="{href}">{label}</a>'

    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, text)
    for i, c in enumerate(codes):
        text = text.replace(f"\x00{i}\x00", f"<code>{html.escape(c, quote=False)}</code>")
    return text


def inline_keepcb(text: str) -> str:
    parts = re.split(r"(<input[^>]*>)", text)
    return "".join(p if p.startswith("<input") else inline(p) for p in parts)


def md_to_html(md: str) -> str:
    lines = md.split("\n")
    out, i, n = [], 0, len(md.split("\n"))
    list_stack = []

    def close_list():
        while list_stack:
            out.append(f"</{list_stack.pop()}>")

    while i < n:
        line = lines[i]
        if line.startswith("```"):
            close_list()
            i += 1
            buf = []
            while i < n and not lines[i].startswith("```"):
                buf.append(html.escape(lines[i], quote=False))
                i += 1
            i += 1
            out.append("<pre><code>" + "\n".join(buf) + "</code></pre>")
            continue
        if "|" in line and i + 1 < n and re.match(r"^\s*\|?[\s:|-]+\|[\s:|-]*$", lines[i + 1]):
            close_list()
            header = [c.strip() for c in line.strip().strip("|").split("|")]
            i += 2
            rows = []
            while i < n and "|" in lines[i] and lines[i].strip():
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")])
                i += 1
            thead = "".join(f"<th>{inline(c)}</th>" for c in header)
            tbody = "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows)
            out.append(f"<table><thead><tr>{thead}</tr></thead><tbody>{tbody}</tbody></table>")
            continue
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            close_list()
            lvl = len(m.group(1))
            out.append(f"<h{lvl}>{inline(m.group(2))}</h{lvl}>")
            i += 1
            continue
        if re.match(r"^\s*---\s*$", line):
            close_list()
            out.append("<hr>")
            i += 1
            continue
        if line.startswith(">"):
            close_list()
            buf = []
            while i < n and lines[i].startswith(">"):
                buf.append(lines[i][1:].lstrip())
                i += 1
            out.append("<blockquote><p>" + "<br>".join(inline(b) if b else "" for b in buf) + "</p></blockquote>")
            continue
        m = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)$", line)
        if m:
            ordered = bool(re.match(r"\d+\.", m.group(2)))
            tag = "ol" if ordered else "ul"
            if not list_stack:
                out.append(f"<{tag}>")
                list_stack.append(tag)
            content = m.group(3)
            cb = re.match(r"^\[([ xX])\]\s+(.*)$", content)
            if cb:
                checked = "checked" if cb.group(1).lower() == "x" else ""
                content = f'<input type="checkbox" disabled {checked}> {cb.group(2)}'
                out.append(f"<li style='list-style:none;margin-left:-18px'>{inline_keepcb(content)}</li>")
            else:
                out.append(f"<li>{inline(content)}</li>")
            i += 1
            continue
        if not line.strip():
            close_list()
            i += 1
            continue
        close_list()
        buf = [line]
        i += 1
        while i < n and lines[i].strip() and not re.match(r"^(#{1,6}\s|```|>|\s*[-*]\s|\s*\d+\.\s|\s*---\s*$)", lines[i]) and "|" not in lines[i]:
            buf.append(lines[i])
            i += 1
        out.append(f"<p>{inline(' '.join(buf))}</p>")
    close_list()
    return "\n".join(out)


# ───────────────────────── Paginasjablonen ─────────────────────────────────
HEAD = """<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="MyAIAgent.tech">
<meta property="og:image" content="{og}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{og}">
<meta name="theme-color" content="#07060a">
<link rel="icon" href="{icon}">
<link rel="apple-touch-icon" href="{icon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{root}assets/styles.css">
</head>
<body>
<div class="bg-fx"></div><div class="bg-grid"></div>
<div class="orb a"></div><div class="orb b"></div><div class="orb c"></div>
"""


def nav_html(S, switch_url):
    links = (f'<a href="index.html#modules">{S["nav"][0]}</a>'
             f'<a href="index.html#waarom">{S["nav"][1]}</a>'
             f'<a href="index.html#koop">{S["nav"][2]}</a>')
    switch = (f'<a class="lang-switch" href="{switch_url}" title="{S["other_name"]}">'
              f'{ICONS["globe"]} {S["switch_label"]}</a>')
    return (f'<nav class="nav"><div class="wrap">'
            f'<a class="brand" href="index.html"><span class="mark">◆</span> {SITE_NAME}</a>'
            f'<div class="nav-right"><div class="nav-links">{links}</div>{switch}</div>'
            f'</div></nav>')


def foot_html(S):
    return (f'<footer><div class="wrap"><div>'
            f'<div class="brand" style="margin-bottom:6px"><span class="mark">◆</span> {SITE_NAME}</div>'
            f'<div class="disclaimer">{S["disclaimer"]}</div></div>'
            f'<div style="text-align:right"><a href="index.html">Home</a> &nbsp;·&nbsp; '
            f'<a href="module-00-introductie-en-mindset.html">Start</a><br>'
            f'<span style="opacity:.6">{S["foot_built"]}</span></div></div></footer>')


REVEAL_JS = ('<script>const io=new IntersectionObserver((es)=>es.forEach(e=>{if(e.isIntersecting)'
             '{e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.12});'
             'document.querySelectorAll(".reveal").forEach(el=>io.observe(el));</script>')

READER_JS = ('<script>const bar=document.getElementById("rbar");addEventListener("scroll",()=>'
             '{const h=document.documentElement;const p=h.scrollTop/(h.scrollHeight-h.clientHeight);'
             'bar.style.width=(p*100)+"%";},{passive:true});</script>')


def out_path(S, filename):
    d = os.path.join(HIER, S["dir"]) if S["dir"] else HIER
    os.makedirs(d, exist_ok=True)
    return os.path.join(d, filename)


def build_module(S, modules, idx):
    slug, badge, titel, desc = modules[idx]
    with open(os.path.join(HIER, S["src"], f"{slug}.md"), encoding="utf-8") as f:
        md = f.read()
    md = re.sub(r"^#\s+.*?\n", "", md, count=1)                       # eigen H1
    md = re.split(r"\n#{2,3}\s+(?:Verder|Next)\b", md)[0]             # navigatie-staart weg
    md = re.sub(r"\n+[←]\s*\[.*$", "", md, flags=re.S)                # losse terug-link weg
    body = md_to_html(md.strip())

    if idx > 0:
        p = modules[idx - 1]
        prev_html = f'<a class="prev" href="module-{p[0]}.html"><div class="lbl">{S["prev"]}</div><div class="ttl">{html.escape(p[2])}</div></a>'
    else:
        prev_html = f'<a class="prev disabled" href="#"><div class="lbl">{S["prev"]}</div><div class="ttl">—</div></a>'
    if idx < len(modules) - 1:
        nx = modules[idx + 1]
        next_html = f'<a class="next" href="module-{nx[0]}.html"><div class="lbl">{S["next"]}</div><div class="ttl">{html.escape(nx[2])}</div></a>'
    else:
        next_html = f'<a class="next" href="index.html"><div class="lbl">{S["done"]}</div><div class="ttl">{S["back"]}</div></a>'

    switch_url = S["switch_prefix"] + f"module-{slug}.html"
    page = (
        HEAD.format(lang=S["lang"], title=f"{titel} · {S['mod_title_suffix']}", desc=desc,
                    root=S["asset_root"], og=OG_IMG, icon=ICON_IMG)
        + '<div class="reader-top"><div class="bar" id="rbar"></div></div>'
        + nav_html(S, switch_url)
        + '<article class="article">'
        + f'<div class="crumb">{html.escape(badge)}</div>'
        + f"<h1>{html.escape(titel)}</h1>"
        + f'<p style="color:var(--text-dim);font-size:1.12rem">{html.escape(desc)}</p><hr>'
        + body
        + f'<div class="pager">{prev_html}{next_html}</div></article>'
        + f'<a class="toc-fab" href="index.html#modules">{S["toc"]}</a>'
        + foot_html(S) + READER_JS + "</body></html>"
    )
    with open(out_path(S, f"module-{slug}.html"), "w", encoding="utf-8") as f:
        f.write(page)


def build_index(S, modules):
    n = len(modules)
    feat_html = "".join(
        f'<div class="feature reveal"><div class="ico">{ICONS[FEATURE_ICONS[k]]}</div>'
        f'<h3>{html.escape(t)}</h3><p>{html.escape(d)}</p></div>'
        for k, (t, d) in enumerate(S["features"])
    )
    mods_html = "".join(
        f'<a class="mod-card reveal" href="module-{slug}.html">'
        f'<div class="mod-num"><span class="mod-dot"></span> {html.escape(badge)}</div>'
        f'<h3>{html.escape(titel)}</h3><p>{html.escape(desc)}</p>'
        f'<span class="go">{S["read"]} <span>→</span></span></a>'
        for slug, badge, titel, desc in modules
    )
    stats_html = "".join(
        f'<div class="stat reveal"><div class="num">{num.format(n=n)}</div><div class="lbl">{lbl}</div></div>'
        for num, lbl in S["stats"]
    )
    buy_list = "".join(
        f'<li><span class="chk">{ICONS["check"]}</span> {item.format(n=n)}</li>' for item in S["buy_list"]
    )
    first = "module-00-introductie-en-mindset.html"
    switch_url = S["switch_prefix"] + "index.html"
    page = (
        HEAD.format(lang=S["lang"], title=S["title"], desc=S["desc"], root=S["asset_root"], og=OG_IMG, icon=ICON_IMG)
        + nav_html(S, switch_url)
        + '<header class="hero"><div class="wrap hero-grid"><div class="hero-copy">'
        + f'<div class="eyebrow"><span class="dot"></span> {S["eyebrow"].format(n=n)}</div>'
        + f'<h1>{S["h1"]}</h1><p class="lead">{html.escape(S["lead"])}</p><div class="cta">'
        + f'<a class="btn btn-primary" href="{first}">{S["cta1"]} →</a>'
        + f'<a class="btn btn-ghost" href="#modules">{S["cta2"]}</a></div></div>'
        + '<div class="hero-visual reveal"><div class="hero-frame">'
        + f'<img src="{HERO_IMG}" alt="{S["hero_alt"]}" '
        + 'onerror="this.style.display=\'none\';this.parentNode.classList.add(\'empty\')">'
        + '<div class="hero-frame-glow"></div></div></div></div>'
        + f'<div class="wrap"><div class="stats">{stats_html}</div></div></header>'
        + '<section id="waarom"><div class="wrap"><div class="section-head reveal">'
        + f'<div class="kicker">{S["why_k"]}</div><h2>{html.escape(S["why_h"])}</h2><p>{html.escape(S["why_p"])}</p>'
        + f'</div><div class="features">{feat_html}</div></div></section>'
        + '<section id="modules"><div class="wrap"><div class="section-head reveal">'
        + f'<div class="kicker">{S["mod_k"]}</div><h2>{S["mod_h"].format(n=n)}</h2><p>{html.escape(S["mod_p"])}</p>'
        + f'</div><div class="modules">{mods_html}</div></div></section>'
        + '<section id="leer"><div class="wrap"><div class="section-head reveal">'
        + f'<div class="kicker">{S["leer_k"]}</div><h2>{html.escape(S["leer_h"])}</h2><p>{html.escape(S["leer_p"])}</p></div>'
        + '<ul class="outcome-list reveal">'
        + "".join(f'<li><span class="chk">{ICONS["check"]}</span> {html.escape(o)}</li>' for o in S["outcomes"])
        + "</ul>"
        + f'<div class="time-head reveal"><h3>{html.escape(S["time_h"])}</h3><p>{html.escape(S["time_p"])}</p></div>'
        + '<div class="timeline">'
        + "".join(
            f'<div class="phase reveal"><div class="ph-num">{ph[0]}</div>'
            f'<div class="ph-title">{html.escape(ph[1])}</div>'
            f'<div class="ph-time">{html.escape(ph[2])}</div></div>'
            for ph in S["phases"]
        )
        + "</div></div></section>"
        + '<section id="koop"><div class="wrap"><div class="section-head reveal">'
        + f'<div class="kicker">{S["buy_k"]}</div><h2>{html.escape(S["buy_h"])}</h2><p>{html.escape(S["buy_p"])}</p></div>'
        + '<div class="price-card glow-ring reveal">'
        + '<span class="hud tl"></span><span class="hud tr"></span><span class="hud bl"></span><span class="hud br"></span>'
        + f'<div class="price-badge">{ICONS["sparkle"]} {S["badge"]}</div>'
        + f'<div class="price"><span class="price-old">{ORIG_PRICE}</span> {PRICE}</div>'
        + f'<ul class="price-list">{buy_list}</ul>'
        + f'<a class="btn btn-primary btn-buy" href="{BUY_URL}">{ICONS["lock"]} {S["buy_btn"]}</a>'
        + f'<a class="btn btn-ghost" href="{first}">{ICONS["sparkle"]} {S["free_btn"]}</a>'
        + f'<p class="guarantee">{S["guarantee"]}</p></div></div></section>'
        + foot_html(S) + REVEAL_JS + "</body></html>"
    )
    with open(out_path(S, "index.html"), "w", encoding="utf-8") as f:
        f.write(page)


def main() -> None:
    global ASSET_ROOT
    total = 0
    modules_by_lang = {"nl": MODULES_NL, "en": MODULES_EN}
    for code, S in LANGS.items():
        ASSET_ROOT = S["asset_root"]
        modules = modules_by_lang[code]
        for idx in range(len(modules)):
            build_module(S, modules, idx)
        build_index(S, modules)
        total += len(modules)
        loc = S["dir"] or "(root)"
        print(f"✅ {code.upper()}: index + {len(modules)} modulepagina's → {loc}/")
    print(f"🎉 Tweetalige site gebouwd ({total} modulepagina's totaal).")


if __name__ == "__main__":
    main()
