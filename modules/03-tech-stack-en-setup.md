# Module 03 — Tech stack & setup

> Doel: je werkomgeving opzetten, je API-sleutel regelen, en begrijpen wat het kost — zodat je
> in module 04 meteen kunt bouwen.

---

## De stack die we gebruiken

We houden het bewust simpel en productie-waardig:

| Onderdeel | Keuze | Waarom |
|-----------|-------|--------|
| Taal | **Python 3.10+** | Meest gebruikte taal voor AI, leesbaar |
| Model-API | **Claude API** (Anthropic) | Sterk in agent-werk, tool use, lange taken |
| Hoofdmodel | **Claude Opus 4.8** (`claude-opus-4-8`) | Meest capabel voor autonoom werk |
| Goedkoop model | **Claude Haiku 4.5** (`claude-haiku-4-5`) | Snel & goedkoop voor simpele deeltaken |
| SDK | `anthropic` (officieel) | Officieel ondersteund, betrouwbaar |
| Secrets | `.env` + `python-dotenv` | Sleutels nooit in code |

Later (module 09) komen er integraties bij: Stripe (betalingen), e-mail, en eventueel Zapier
voor 9.000+ apps zonder code.

---

## Stap 1 — Python installeren

Controleer of je Python 3.10 of hoger hebt:

```bash
python3 --version
```

Geen Python of te oud? Download via [python.org](https://www.python.org/downloads/).

---

## Stap 2 — Project opzetten

```bash
# In de cursusmap:
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r code/requirements.txt
```

De virtuele omgeving (`.venv`) houdt je afhankelijkheden netjes per project.

---

## Stap 3 — Een Anthropic API-sleutel halen

1. Ga naar [console.anthropic.com](https://console.anthropic.com).
2. Maak een account en log in.
3. Voeg een betaalmethode toe en zet een **uitgavenlimiet** (Settings → Limits). Doe dit echt —
   het is je eerste guardrail.
4. Ga naar **API Keys** → **Create Key**. Kopieer de sleutel (`sk-ant-...`). Je ziet hem maar
   één keer.

> 🔐 **Veiligheid:** deel je sleutel nooit, commit hem nooit naar Git, zet hem nooit in
> frontend-code. Wie je sleutel heeft, geeft jouw geld uit.

---

## Stap 4 — Sleutel in een `.env`-bestand

```bash
cp code/.env.example code/.env
```

Open `code/.env` en vul in:

```
ANTHROPIC_API_KEY=sk-ant-jouw-sleutel-hier
```

Het bestand `.env` staat in `.gitignore` en wordt dus nooit meegecommit. Goed zo.

---

## Stap 5 — Testen of het werkt

```bash
python code/test_verbinding.py
```

Zie je een vriendelijk antwoord van Claude? Dan staat je fundament. Zo niet: controleer je
sleutel en je internetverbinding, en lees de foutmelding (vaak een typefout in de sleutel of
geen saldo).

---

## Wat kost dit? (kosten begrijpen)

Je betaalt per **token** (ruwweg ¾ woord), apart voor invoer en uitvoer. Actuele richtprijzen:

| Model | Invoer ($/1M tokens) | Uitvoer ($/1M tokens) | Gebruik |
|-------|---------------------:|----------------------:|---------|
| Claude Opus 4.8 (`claude-opus-4-8`) | $5,00 | $25,00 | Zwaar agent-werk |
| Claude Sonnet 4.6 (`claude-sonnet-4-6`) | $3,00 | $15,00 | Balans snelheid/intelligentie |
| Claude Haiku 4.5 (`claude-haiku-4-5`) | $1,00 | $5,00 | Simpele, snelle taken |

> Prijzen kunnen wijzigen — check altijd [de actuele prijspagina](https://platform.claude.com/docs/en/pricing).

### Een rekenvoorbeeld

Een agent die één productbeschrijving maakt gebruikt bijv. ~2.000 tokens in en ~500 uit op
Opus 4.8:
- Invoer: 2.000 / 1.000.000 × $5 = $0,01
- Uitvoer: 500 / 1.000.000 × $25 = $0,0125
- **Totaal: ~$0,02 per beschrijving.**

Verkoop je die voor €2, dan is je marge 100×. Dít is waarom prijzen-per-stuk gezond moeten zijn.

### Drie manieren om kosten laag te houden

1. **Kies het juiste model per taak.** Gebruik Haiku 4.5 voor simpel werk, Opus 4.8 alleen waar
   het ertoe doet.
2. **Prompt caching** — herhaal je grote, vaste context (instructies, voorbeelden) goedkoop.
   Bespaart tot ~90% op herhaalde invoer. (Komt terug in module 06.)
3. **Tel tokens vooraf** met de `count_tokens`-functie als je twijfelt over de grootte van een
   taak.

En altijd: een **harde uitgavenlimiet** in de console én in je code (module 10).

---

## Het effort-niveau: intelligentie vs. kosten

Bij Opus 4.8 kun je instellen hoe diep het model nadenkt en hoeveel het "uitvoert" via
`output_config={"effort": ...}`:

- `low` — snel en goedkoop, voor eenvoudige taken.
- `medium` — goede balans.
- `high` — standaard; voor de meeste serieuze taken (aanrader bij agent-werk).
- `xhigh` / `max` — voor de moeilijkste, meest waardevolle taken (duurder).

Combineer met "adaptive thinking" (`thinking={"type": "adaptive"}`): het model bepaalt zelf
wanneer en hoeveel het nadenkt. Dit zie je terug in de code vanaf module 04.

---

## Jouw opdracht

1. Werk de stappen 1–5 af tot `test_verbinding.py` werkt.
2. Zet een uitgavenlimiet in de console (bijv. €20 voor deze cursus).
3. Lees de foutmelding áls er iets misgaat — leren debuggen is deel van het vak.

---

## Verder

→ [Module 04 — Je eerste agent bouwen](04-je-eerste-agent-bouwen.md)
