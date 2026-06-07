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
    "rocket": _svg('<path d="M12 3c3 0 5.5 3 5.5 6.5 0 2.2-1 4-2.7 5.2L12 17l-2.8-2.3C7.5 13.5 6.5 11.7 6.5 9.5 6.5 6 9 3 12 3z"/><circle cx="12" cy="9" r="1.6"/><path d="M9.5 16l-2.5 4 4-1.6M14.5 16l2.5 4-4-1.6"/>'),
    "box": _svg('<path d="M3 8l9-5 9 5v8l-9 5-9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/>'),
    "megaphone": _svg('<path d="M4 10v4l11 5V5L4 10z"/><path d="M4 10H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1M18 8.5a5 5 0 0 1 0 7"/>'),
    "target": _svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>'),
    "refresh": _svg('<path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 4v4h-4M21 12a9 9 0 0 1-15.5 6.3L3 16M3 20v-4h4"/>'),
    "crown": _svg('<path d="M4 18h16M4 18l-1.2-9 5 3.5L12 5l4.2 7.5 5-3.5L20 18"/>'),
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
    "show_k": "De vibe", "show_h": "Zo voelt de toekomst die je bouwt", "scroll": "Scroll",
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
    "show_k": "The vibe", "show_h": "This is the future you're building", "scroll": "Scroll",
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

# ── THE AI COMPANY CHALLENGE (gamified track) ────────────────────────────────
REPO_BLOB = "https://github.com/MimiLovesDubai/MimiLovesDubai/blob/claude/ai-agent-business-course-RZJxN/"

# (slug, level-label, icon, title_nl, title_en, unlock_nl, unlock_en)
CHALLENGE_LEVELS = [
    ("level-00", "0",  "rocket",    "Wat als AI je eerste werknemer was?", "What if AI was your first employee?", "Bedrijfs-HQ + AI-strateeg", "Company HQ + AI Strategist"),
    ("level-01", "1",  "spark",     "Geef AI z'n eerste missie", "Give AI its first mission", "Opportunity Finder", "Opportunity Finder"),
    ("level-02", "2",  "orbit",     "Huur de Trend Hunter", "Hire the Trend Hunter", "AI Research Team", "AI Research Team"),
    ("level-03", "3",  "box",       "Laat AI een product ontwerpen", "Let AI design a product", "Product Creator", "Product Creator"),
    ("level-04", "4",  "sparkle",   "Laat AI een merk bouwen", "Let AI build a brand", "Brand Director", "Brand Director"),
    ("level-05", "5",  "megaphone", "Kan AI klanten vinden?", "Can AI find customers?", "Marketing-motor", "Marketing engine"),
    ("level-06", "6",  "cpu",       "Bouw je AI-managementteam", "Build your AI management team", "AI Workforce", "AI Workforce"),
    ("level-07", "7",  "coin",      "De Eerste Verkoop Challenge", "The First Sale Challenge", "Sales Agent", "Sales Agent"),
    ("level-08", "8",  "target",    "De €1.000 Challenge", "The €1,000 Challenge", "Omzetsysteem", "Revenue system"),
    ("level-09", "9",  "refresh",   "Run het bedrijf 7 dagen", "Run the company for 7 days", "AI Business System", "AI Business System"),
    ("level-10", "10", "crown",     "Het AI-imperium", "The AI Empire", "🏆 Je wint", "🏆 You win"),
]

CH_NL = {
    "lang": "nl", "asset_root": "", "dir": "", "switch_prefix": "en/", "switch_label": "EN", "other_name": "English",
    "src": "challenge/levels-nl", "level_word": "LEVEL", "unlock_word": "Ontgrendelt",
    "nav": STR_NL["nav"], "nav_challenge": "🎮 Challenge",
    "kicker": "30-daagse challenge · geen code",
    "h1": 'Ik gaf een AI <span class="gradient-text">$50</span>.<br>3 dagen later had het z\'n eigen bedrijf.',
    "lead": "Huur een team van AI-werknemers en bouw in 30 dagen een echt online bedrijf — met Claude/ChatGPT. Geen code. Geen ervaring. Jij bent de oprichter, AI is je personeel.",
    "cta1": "Start bij Level 0", "cta2": "Bekijk de levelmap",
    "powered": "Aangedreven door de meest geavanceerde AI — Claude &amp; ChatGPT",
    "briefing": "MISSIE-BRIEFING",
    "xp_tpl": "LEVEL {n}/{t} VOLTOOID · {p}% XP",
    "complete_btn": "Markeer dit level als voltooid",
    "completed_btn": "✓ Voltooid! Goed bezig 🎉",
    "map_k": "De levelmap", "map_h": "11 levels. 11 werknemers. 1 bedrijf.",
    "map_p": "Elk level huur je een nieuwe AI-werknemer en ontgrendel je de volgende. Bouwen, niet studeren.",
    "start": "Start", "rules_h": "De regels (30 seconden)",
    "rules": [
        "Jij bent de oprichter. AI is je personeel — elk level komt er een werknemer bij.",
        "Bouwen, niet studeren. Elk level eindigt met een opdracht van 10–60 min en een screenshot-waardige win.",
        "Geen code, nooit. Claude/ChatGPT + Canva, Notion, Gumroad, MailerLite.",
        "Jij keurt geld + publiceren goed. Grotendeels autonoom, niet onbewaakt — zo blijf je veilig.",
        "Klaar verslaat perfect. Post de win. Momentum is het hele spel.",
    ],
    "back": "← Terug naar de challenge", "prev": "← Vorige level", "next": "Volgende level →",
    "title": "The AI Company Challenge · MyAIAgent.tech",
    "desc": "Ik gaf een AI $50. 3 dagen later had het z'n eigen bedrijf. Een no-code, gamified 30-dagen-challenge: huur AI-werknemers en bouw een echt online bedrijf.",
}
CH_EN = dict(CH_NL, **{
    "lang": "en", "asset_root": "../", "dir": "en", "switch_prefix": "../", "switch_label": "NL", "other_name": "Nederlands",
    "src": "challenge/levels", "unlock_word": "Unlocks",
    "nav": STR_EN["nav"], "nav_challenge": "🎮 Challenge",
    "kicker": "30-day challenge · no code",
    "h1": 'I gave an AI <span class="gradient-text">$50</span>.<br>3 days later it had its own company.',
    "lead": "Hire a team of AI employees and build a real online business in 30 days — with Claude/ChatGPT. No code. No experience. You're the founder, AI is your workforce.",
    "cta1": "Start at Level 0", "cta2": "See the level map",
    "powered": "Powered by the most advanced AI — Claude &amp; ChatGPT",
    "briefing": "MISSION BRIEFING",
    "xp_tpl": "LEVEL {n}/{t} CLEARED · {p}% XP",
    "complete_btn": "Mark this level complete",
    "completed_btn": "✓ Completed! Nice one 🎉",
    "map_k": "The level map", "map_h": "11 levels. 11 employees. 1 company.",
    "map_p": "Each level you hire a new AI employee and unlock the next. Build, don't study.",
    "rules_h": "The rules (30 seconds)",
    "rules": [
        "You're the founder. AI is your workforce — each level adds an employee.",
        "Build, don't study. Every level ends with a 10–60 min build and a screenshot-able win.",
        "No code, ever. Claude/ChatGPT + Canva, Notion, Gumroad, MailerLite.",
        "You approve money + publishing. Largely autonomous, not unattended — that keeps you safe.",
        "Done beats perfect. Post the win. Momentum is the whole game.",
    ],
    "back": "← Back to the challenge", "prev": "← Previous level", "next": "Next level →",
    "title": "The AI Company Challenge · MyAIAgent.tech",
    "desc": "I gave an AI $50. 3 days later it had its own company. A no-code, gamified 30-day challenge: hire AI employees and build a real online business.",
})
CHALLENGE = {"nl": CH_NL, "en": CH_EN}

# emoji per 8-beat sectie (op volgnummer)
BEAT_EMOJI = {"1": "💡", "2": "👀", "3": "📋", "4": "🖱️", "5": "✨", "6": "🛠️", "7": "📦", "8": "✅"}

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
        # challenge level-links (zelfde map) → level-XX.html
        href = re.sub(r"(?:\.\./levels(?:-nl)?/)?level-(\d+)\.md", r"level-\1.html", href)
        # challenge README / overzicht → challenge.html (zelfde map)
        href = re.sub(r"(?:\.\./)?challenge/README\.md", "challenge.html", href)
        # kits / blueprint / viral-missions → openen op GitHub (niet als site-pagina gerenderd)
        href = re.sub(r"\.\./(kits/?[a-z0-9./-]*)", REPO_BLOB + r"challenge/\1", href)
        href = re.sub(r"\.\./(BLUEPRINT\.md|viral-missions\.md)", REPO_BLOB + r"challenge/\1", href)
        href = re.sub(r"\.\./modules/?", REPO_BLOB + "modules/", href)
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
<link rel="icon" href="{root}assets/favicon.png">
<link rel="apple-touch-icon" href="{root}assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{root}assets/styles.css">
<script defer src="{root}assets/fx.js"></script>
<script defer src="{root}assets/intro.js"></script>
<script defer src="{root}assets/ambient.js"></script>
</head>
<body>
<div class="bg-fx"></div><div class="bg-grid"></div>
<div class="orb a"></div><div class="orb b"></div><div class="orb c"></div>
"""


def nav_html(S, switch_url):
    links = (f'<a href="index.html#modules">{S["nav"][0]}</a>'
             f'<a href="index.html#waarom">{S["nav"][1]}</a>'
             f'<a href="index.html#koop">{S["nav"][2]}</a>'
             f'<a class="nav-game" href="challenge.html">🎮 Challenge</a>')
    switch = (f'<a class="lang-switch" href="{switch_url}" title="{S["other_name"]}">'
              f'{ICONS["globe"]} {S["switch_label"]}</a>')
    return (f'<nav class="nav"><div class="wrap">'
            f'<a class="brand" href="index.html"><img class="brand-logo" src="{S["asset_root"]}assets/media/logo.png" alt="" width="34" height="34"> {SITE_NAME}</a>'
            f'<div class="nav-right"><div class="nav-links">{links}</div>{switch}</div>'
            f'</div></nav>')


def foot_html(S):
    return (f'<footer><div class="wrap"><div>'
            f'<div class="brand" style="margin-bottom:6px"><img class="brand-logo" src="{S["asset_root"]}assets/media/logo.png" alt="" width="30" height="30"> {SITE_NAME}</div>'
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
    R = S["asset_root"]
    _en = S["lang"] == "en"
    intro_t = {
        "kicker": "MyAIAgent.tech presenteert" if not _en else "MyAIAgent.tech presents",
        "title":  "Een AI die jouw bedrijf runt" if not _en else "An AI that runs your business",
        "enter":  "Betreed de ervaring" if not _en else "Enter the experience",
        "skip":   "Overslaan" if not _en else "Skip",
    }
    intro_html = (
        f'<div id="intro" class="intro">'
        f'<video class="intro-logovid" muted playsinline preload="auto" poster="{R}assets/media/logo.png">'
        f'<source src="{R}assets/media/logo.mp4" type="video/mp4"></video>'
        f'<video class="intro-video" muted playsinline preload="auto" poster="{R}assets/media/intro.jpg">'
        f'<source src="{R}assets/media/intro.mp4" type="video/mp4"></video>'
        f'<div class="intro-veil"></div>'
        f'<div class="intro-inner">'
        f'<img class="intro-logo" src="{R}assets/media/logo.png" alt="MyAIAgent">'
        f'<div class="intro-kicker">{intro_t["kicker"]}</div>'
        f'<h1 class="intro-title">{intro_t["title"]}</h1>'
        f'<button class="intro-enter" type="button"><span class="ie-tri">▶</span> {intro_t["enter"]}</button>'
        f'</div>'
        f'<button class="intro-skip" type="button">{intro_t["skip"]} →</button>'
        f'</div>'
    )
    page = (
        HEAD.format(lang=S["lang"], title=S["title"], desc=S["desc"], root=S["asset_root"], og=OG_IMG, icon=ICON_IMG)
        + intro_html
        + nav_html(S, switch_url)
        # CINEMATISCHE OPENING — video op het volle scherm, titel eroverheen
        + '<header class="opening">'
        + '<div class="opening-bg opening-bg--feature">'
        + f'<video autoplay loop muted playsinline preload="auto" poster="{S["asset_root"]}assets/media/opening.jpg">'
        + f'<source src="{S["asset_root"]}assets/media/opening.mp4" type="video/mp4"></video>'
        + '<div class="opening-overlay"></div></div>'
        + '<div class="wrap opening-inner">'
        + f'<img class="opening-logo" src="{S["asset_root"]}assets/media/logo.png" alt="MyAIAgent">'
        + f'<div class="eyebrow"><span class="dot"></span> {S["eyebrow"].format(n=n)}</div>'
        + f'<h1 class="opening-h1">{S["h1"]}</h1>'
        + f'<p class="lead">{html.escape(S["lead"])}</p>'
        + '<div class="cta">'
        + f'<a class="btn btn-primary btn-game" href="{first}">{S["cta1"]} →</a>'
        + f'<a class="btn btn-ghost" href="#modules">{S["cta2"]}</a></div>'
        + f'<div class="stats">{stats_html}</div>'
        + f'<a class="scroll-cue" href="#vibe">{S["scroll"]}<span class="chev">⌄</span></a>'
        + '</div></header>'
        + '<section class="showcase" id="vibe"><div class="wrap"><div class="section-head reveal">'
        + f'<div class="kicker">{S["show_k"]}</div><h2>{html.escape(S["show_h"])}</h2></div>'
        + '<div class="showcase-grid">'
        + f'<figure class="show-frame reveal"><img src="{S["asset_root"]}assets/media/show-1.png" alt="{S["hero_alt"]}" loading="lazy"></figure>'
        + f'<figure class="show-frame reveal"><img src="{S["asset_root"]}assets/media/show-2.png" alt="{S["hero_alt"]}" loading="lazy"></figure>'
        + '</div>'
        + '<div class="reel-wrap reveal"><div class="reel">'
        + f'<video autoplay loop muted playsinline poster="{S["asset_root"]}assets/media/show-2.png">'
        + f'<source src="{S["asset_root"]}assets/media/show.mp4" type="video/mp4"></video></div></div>'
        + '</div></section>'
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


def _chrome_head(S, C, switch_url, reader_bar=False):
    head = HEAD.format(lang=S["lang"], title=C["title"], desc=C["desc"], root=S["asset_root"],
                       og=OG_IMG, icon=ICON_IMG)
    if reader_bar:
        head += '<div class="reader-top"><div class="bar" id="rbar"></div></div>'
    return head + nav_html(S, switch_url)


def build_challenge_level(code, idx):
    global ASSET_ROOT
    S, C = LANGS[code], CHALLENGE[code]
    ASSET_ROOT = C["asset_root"]
    slug, lvl, icon, t_nl, t_en, u_nl, u_en = CHALLENGE_LEVELS[idx]
    titel = t_nl if code == "nl" else t_en
    with open(os.path.join(HIER, C["src"], f"{slug}.md"), encoding="utf-8") as f:
        md = f.read()
    md = re.sub(r"^#\s+.*?\n", "", md, count=1)                    # eigen header
    md = re.sub(r"\n+→\s*\[Level.*$", "", md, flags=re.S)          # trailing next-link weg (pager regelt)
    # leuke icoontjes per 8-beat sectie
    md = re.sub(r"^(#{2})\s+(\d+)\.\s+(.*)$",
                lambda m: f'{m.group(1)} {BEAT_EMOJI.get(m.group(2), "")} {m.group(2)}. {m.group(3)}',
                md, flags=re.M)
    body = md_to_html(md.strip())

    prev_html = (f'<a class="prev" href="{CHALLENGE_LEVELS[idx-1][0]}.html"><div class="lbl">{C["prev"]}</div>'
                 f'<div class="ttl">{html.escape(CHALLENGE_LEVELS[idx-1][3] if code=="nl" else CHALLENGE_LEVELS[idx-1][4])}</div></a>'
                 if idx > 0 else f'<a class="prev disabled" href="#"><div class="lbl">{C["prev"]}</div><div class="ttl">—</div></a>')
    if idx < len(CHALLENGE_LEVELS) - 1:
        nx = CHALLENGE_LEVELS[idx + 1]
        next_html = (f'<a class="next" href="{nx[0]}.html"><div class="lbl">{C["next"]}</div>'
                     f'<div class="ttl">{html.escape(nx[3] if code=="nl" else nx[4])}</div></a>')
    else:
        next_html = f'<a class="next" href="challenge.html"><div class="lbl">{C["next"]}</div><div class="ttl">{C["back"][2:]}</div></a>'

    switch_url = C["switch_prefix"] + f"{slug}.html"
    page = (
        _chrome_head(S, C, switch_url, reader_bar=True)
        + '<article class="article challenge-article">'
        + f'<a class="crumb-link" href="challenge.html">{C["back"]}</a>'
        + '<div class="lvl-header">'
        + f'<div class="lvl-badge"><span class="lvl-ico">{ICONS[icon]}</span>{C["level_word"]} {lvl}</div>'
        + f'<h1>{html.escape(titel)}</h1></div><hr>'
        + body
        + f'<div class="lvl-complete-wrap"><button class="btn btn-primary complete-btn" '
        + f'data-complete="{slug}" data-done-label="{html.escape(C["completed_btn"])}">'
        + f'{ICONS["check"]} {html.escape(C["complete_btn"])}</button></div>'
        + f'<div class="pager">{prev_html}{next_html}</div></article>'
        + foot_html(S) + READER_JS
        + f'<script src="{S["asset_root"]}assets/game.js"></script>'
        + "</body></html>"
    )
    with open(out_path(S, f"{slug}.html"), "w", encoding="utf-8") as f:
        f.write(page)


def build_challenge_index(code):
    global ASSET_ROOT
    S, C = LANGS[code], CHALLENGE[code]
    ASSET_ROOT = C["asset_root"]
    n = len(CHALLENGE_LEVELS)
    nodes = ""
    for i, (slug, lvl, icon, t_nl, t_en, u_nl, u_en) in enumerate(CHALLENGE_LEVELS):
        titel = t_nl if code == "nl" else t_en
        unlock = u_nl if code == "nl" else u_en
        side = "left" if i % 2 == 0 else "right"
        extra = " start" if i == 0 else (" boss" if i == n - 1 else "")
        nodes += (
            f'<div class="road-node {side}{extra} reveal" data-level="{slug}">'
            f'<a class="node-badge" href="{slug}.html" aria-label="{C["level_word"]} {lvl}">'
            f'<span class="node-ico">{ICONS[icon]}</span><span class="node-num">{lvl}</span></a>'
            f'<a class="node-card" href="{slug}.html">'
            f'<span class="lvl-tag">{C["level_word"]} {lvl}</span>'
            f'<h3>{html.escape(titel)}</h3>'
            f'<div class="lvl-unlock">🔓 {C["unlock_word"]}: {html.escape(unlock)}</div></a>'
            f'</div>'
        )
    rules = "".join(f'<li><span class="chk">{ICONS["check"]}</span> {html.escape(r)}</li>' for r in C["rules"])
    switch_url = C["switch_prefix"] + "challenge.html"
    page = (
        _chrome_head(S, C, switch_url)
        + '<header class="hero hero-game">'
        + f'<div class="hero-bg-video"><video autoplay loop muted playsinline poster="{S["asset_root"]}assets/media/show-1.png">'
        + f'<source src="{S["asset_root"]}assets/media/show.mp4" type="video/mp4"></video><div class="hero-bg-overlay"></div></div>'
        + '<div class="wrap">'
        + f'<div class="eyebrow eyebrow-game"><span class="dot"></span> {C["briefing"]} · {C["kicker"]}</div>'
        + f'<h1 class="game-h1">{C["h1"]}</h1>'
        + f'<p class="lead">{html.escape(C["lead"])}</p>'
        + f'<div class="powered-badge">⚡ {C["powered"]}</div>'
        + f'<div class="cta"><a class="btn btn-primary btn-game" href="level-00.html">▶ {C["cta1"]}</a>'
        + f'<a class="btn btn-ghost" href="#map">{C["cta2"]}</a></div>'
        + '</div></header>'
        + '<section id="map"><div class="wrap"><div class="section-head reveal">'
        + f'<div class="kicker">{C["map_k"]}</div><h2>{html.escape(C["map_h"])}</h2><p>{html.escape(C["map_p"])}</p></div>'
        + f'<div class="xp-bar reveal"><div class="xp-fill"></div>'
        + f'<span class="xp-label" data-tpl="{C["xp_tpl"]}">{C["xp_tpl"].replace("{n}","0").replace("{t}",str(n)).replace("{p}","0")}</span></div>'
        + f'<div class="roadmap"><div class="road-line"></div>{nodes}</div>'
        + f'<div class="rules-card reveal"><h3>{html.escape(C["rules_h"])}</h3><ul class="outcome-list rules-list">{rules}</ul></div>'
        + '</div></section>'
        + foot_html(S) + REVEAL_JS
        + f'<script src="{S["asset_root"]}assets/game.js"></script>'
        + "</body></html>"
    )
    with open(out_path(S, "challenge.html"), "w", encoding="utf-8") as f:
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

    # The AI Company Challenge (gamified track, beide talen)
    for code in LANGS:
        build_challenge_index(code)
        for idx in range(len(CHALLENGE_LEVELS)):
            build_challenge_level(code, idx)
        loc = CHALLENGE[code]["dir"] or "(root)"
        print(f"🎮 {code.upper()}: challenge + {len(CHALLENGE_LEVELS)} levels → {loc}/")
    ASSET_ROOT = ""
    print(f"🎉 Tweetalige site gebouwd ({total} modulepagina's + {2*len(CHALLENGE_LEVELS)} levels).")


if __name__ == "__main__":
    main()
