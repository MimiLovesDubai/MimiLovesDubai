# 🤖 De Autonome Onderneming — Bouw een AI-Agent die zélf een bedrijf runt

> Een complete, praktische cursus waarin je stap voor stap een AI-agent bouwt die zelfstandig
> een klein bedrijf runt, taken uitvoert en geld voor je verdient — terwijl jij de regie houdt.

Deze cursus is geen hype-verhaal. Het is een eerlijk, technisch correct en uitvoerbaar
draaiboek. AI-agents kunnen vandaag écht werk overnemen: content maken, klanten beantwoorden,
leads opvolgen, producten beheren, rapporteren. Wat ze (nog) **niet** kunnen, is volledig
zonder toezicht een bedrijf runnen zonder risico. Deze cursus leert je het verschil — en hoe je
het maximale haalt uit wat wél werkt.

---

## Voor wie is dit?

- Ondernemers en freelancers die taken willen automatiseren en hun tijd willen terugwinnen.
- Makers die een "micro-SaaS" of geautomatiseerde dienst willen lanceren.
- Ontwikkelaars die willen leren hoe je productie-waardige agents bouwt met de Claude API.

Je hoeft geen senior developer te zijn. Wat je nodig hebt:
- Basiskennis van Python (variabelen, functies, een script draaien).
- Een terminal en een teksteditor.
- Bereidheid om te experimenteren én verantwoordelijk te ondernemen.

---

## Wat je gaat bouwen

Aan het einde heb je:

1. **Een werkende AI-agent** die zelfstandig een werk-loop draait (denken → tool gebruiken → resultaat).
2. **Een gekozen business-model** dat past bij agent-automatisering (geen luchtkasteel).
3. **Een monetisatie-pijplijn** met betalingen, facturen en rapportage.
4. **Guardrails**: budgetlimieten, mens-in-de-loop bij risicovolle acties, logging.
5. **Een opschalingsplan** met meerdere samenwerkende agents (Managed Agents).

---

## ⚠️ Eerlijk vooraf: de realiteit van "passief geld verdienen met AI"

Lees [`modules/00-introductie-en-mindset.md`](modules/00-introductie-en-mindset.md) eerst.
Korte versie:

- Een agent verdient geen geld uit het niets. Hij **versnelt en automatiseert** een echt
  bedrijf met echte klanten en echte waarde.
- "Volledig autonoom, nul toezicht" is een mythe — en juridisch/financieel riskant. Je bouwt
  een **grotendeels autonoom systeem met menselijke checkpoints**.
- Reken op een opstartperiode van weken, niet uren. De winst zit in volhouden en bijsturen.

Als iemand je "100% passief, gegarandeerd inkomen met AI-agents" verkoopt: loop weg. Deze
cursus verkoopt je geen droom — hij geeft je gereedschap.

---

## Cursusoverzicht (modules)

| # | Module | Wat je leert |
|---|--------|--------------|
| 00 | [Introductie & mindset](modules/00-introductie-en-mindset.md) | Realistische verwachtingen, hoe agents écht geld verdienen |
| 01 | [Wat is een AI-agent?](modules/01-wat-is-een-ai-agent.md) | Het verschil tussen prompt, workflow en agent |
| 02 | [Kies je business-model](modules/02-business-model-kiezen.md) | 7 modellen die werken met agents + hoe je kiest |
| 03 | [Tech stack & setup](modules/03-tech-stack-en-setup.md) | API-key, Python, omgeving, kosten begrijpen |
| 04 | [Je eerste agent bouwen](modules/04-je-eerste-agent-bouwen.md) | Eerste werkende agent met de Claude API |
| 05 | [Tools geven aan je agent](modules/05-tools-en-acties.md) | Hoe je agent acties uitvoert in de echte wereld |
| 06 | [De autonome loop](modules/06-de-autonome-loop.md) | Een agent die zelfstandig blijft werken |
| 07 | [Managed Agents & opschalen](modules/07-managed-agents.md) | Agents die op Anthropic's infra draaien, 24/7 |
| 08 | [Geld verdienen: monetisatie](modules/08-monetisatie.md) | Prijsmodellen, waarde leveren, eerste euro |
| 09 | [Betalingen & automatisering](modules/09-betalingen-en-integraties.md) | Stripe, e-mail, Zapier, facturen |
| 10 | [Veiligheid & guardrails](modules/10-veiligheid-en-guardrails.md) | Budgetten, mens-in-de-loop, fouten opvangen |
| 11 | [Juridisch, belasting & ethiek](modules/11-juridisch-en-ethiek.md) | KvK, btw, AVG, AI Act, aansprakelijkheid |
| 12 | [Launch-checklist & groei](modules/12-launch-en-groei.md) | Van prototype naar draaiend bedrijf |

Codevoorbeelden staan in [`code/`](code/), sjablonen in [`templates/`](templates/).

---

## Snelstart

```bash
# 1. Clone deze repo en ga erin
cd De-Autonome-Onderneming

# 2. Maak een Python-omgeving
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 3. Installeer afhankelijkheden
pip install -r code/requirements.txt

# 4. Zet je API-sleutel
cp code/.env.example code/.env
# open code/.env en vul je ANTHROPIC_API_KEY in (haal op via console.anthropic.com)

# 5. Draai je eerste agent
python code/agent_mvp.py
```

Begin daarna bij [module 00](modules/00-introductie-en-mindset.md) en werk in volgorde.

---

## Technische basis

Deze cursus gebruikt de **Claude API** van Anthropic als motor voor de agents. Standaardmodel
is **Claude Opus 4.8** (`claude-opus-4-8`) — het meest capabele model voor autonoom, langdurig
agent-werk. Voor goedkopere, snellere taken gebruiken we **Claude Haiku 4.5**.

Alle codevoorbeelden zijn geschreven om écht te draaien. Geen pseudocode.

---

## Disclaimer

Dit materiaal is educatief. Het is geen financieel, juridisch of fiscaal advies. Jij bent
verantwoordelijk voor wat je agent doet — voor de klanten die hij bedient, de uitgaven die hij
doet en de wetten waaraan je je moet houden. Module 11 helpt je op weg, maar raadpleeg bij
twijfel een boekhouder of jurist. Bouw verantwoord.
