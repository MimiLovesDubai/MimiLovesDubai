# Bonus — Bouwen met Claude.ai (de snelle route, met weinig code)

> Doel: begrijpen hoe je **claude.ai** (de chat-app in je browser) gebruikt om je agent te
> ontwerpen, te testen en de code te laten schrijven — ook als je geen programmeur bent.

Veel mensen denken dat je meteen moet programmeren. Dat hoeft niet. Je kunt het grootste deel
in gewone taal doen via claude.ai, en Claude het zware werk laten opknappen. Deze module laat
zien hoe.

---

## Drie manieren om met Claude te bouwen

Er zijn drie "oppervlakken". Je kiest per taak welke je gebruikt.

```
┌──────────────────────────────────────────────────────────────┐
│  1. claude.ai (browser-chat)                                  │
│     Ontwerpen, testen, code laten schrijven, kleine tools.    │
│     → Makkelijkst. Hier begin je.                             │
├──────────────────────────────────────────────────────────────┤
│  2. Claude Code (in je terminal)                              │
│     Claude bouwt en draait code mét je mee, op je computer.   │
│     → Voor het echte bouwen, zonder zelf alles te typen.      │
├──────────────────────────────────────────────────────────────┤
│  3. De Claude API (in je eigen script)                        │
│     De motor die je agent 24/7 laat draaien.                  │
│     → Voor de autonome agent die echt werk doet.              │
└──────────────────────────────────────────────────────────────┘
```

De kunst: **ontwerp en test in claude.ai, en gebruik daarna de API/Claude Code om het echt te
laten draaien.** Claude.ai is je werkbank; de API is de fabriek.

---

## Wat kun je in claude.ai?

- **Chatten** — gewoon praten met Claude: vragen stellen, laten meedenken, teksten maken.
- **Projects** — een werkruimte met vaste instructies en eigen kennis (bestanden, notities) die
  Claude steeds meeneemt. Ideaal om je bedrijfscontext één keer te geven.
- **Artifacts** — Claude bouwt direct iets bruikbaars in een zijpaneel: een tekst, een
  rekenblad-achtig overzicht, of zelfs een klein werkend mini-appje.
- **Bestanden uploaden** — geef Claude een document, spreadsheet of afbeelding om mee te werken.
- **Web search** — laat Claude actuele informatie opzoeken.

> 💡 **In Claude.ai:** maak één **Project** aan voor je bedrijf. Zet in de project-instructies
> wie je bent, wat je verkoopt en aan wie. Dan hoef je dat niet bij elk gesprek opnieuw uit te
> leggen — precies zoals een system prompt dat doet voor een agent.

---

## De gouden werkwijze (prototype → code → draaien)

```
   Jij beschrijft je idee in gewone taal
                │
                ▼
   ┌─────────────────────────────┐
   │ claude.ai                   │   1) Ontwerp de "rol + regels" (system prompt)
   │  (ontwerpen & testen)       │   2) Test door te rollenspelen
   └──────────────┬──────────────┘   3) Laat Claude de Python-code schrijven
                  │ kopieer de code
                  ▼
   ┌─────────────────────────────┐
   │ je computer / de API        │   4) Draai de code (module 03 & 04)
   │  (echt laten werken)        │   5) Of gebruik Claude Code / Managed Agents
   └─────────────────────────────┘
```

---

## Stap voor stap

### Stap 1 — Ontwerp je agent in gewone taal
Open claude.ai en beschrijf wat je wilt. Bijvoorbeeld:

> "Ik wil een agent die productbeschrijvingen schrijft voor mijn meubelwebshop. Help me een
> heldere instructie (system prompt) op te stellen: rol, doel, stijl, en grenzen."

Claude helpt je de instructie aan te scherpen. Dit is exact de `system prompt` uit module 04 —
maar je schrijft hem samen met Claude, in gewone taal.

### Stap 2 — Test de agent door te rollenspelen
Plak je instructie in een nieuw gesprek en geef Claude een echte taak. Zo zie je meteen of de
output goed is, vóór je ook maar één regel code schrijft. Pas de instructie aan en herhaal.

> 💡 **In Claude.ai:** dit "prompt-tunen" is het belangrijkste werk. Je verbetert de instructie
> tot de uitvoer goed genoeg is om aan een klant te tonen. Bewaar de beste versie in je Project.

### Stap 3 — Laat Claude de code schrijven
Als je instructie staat, vraag je Claude om er werkende code van te maken. Bijvoorbeeld:

> "Schrijf een Python-script met de Anthropic SDK dat met deze system prompt productteksten
> genereert voor een lijst producten, met model `claude-opus-4-8`. Voeg een kostenteller en een
> dagbudget-limiet toe."

Je krijgt code die lijkt op `agent_mvp.py` uit deze cursus. Je hoeft het niet zelf te bedenken —
alleen te draaien (module 03 legt uit hoe).

### Stap 4 — Laat het echt draaien
De chat zelf draait je agent niet 24/7. Om dat te doen:
- **Draai de code** op je computer (module 03 & 04), of
- **gebruik Claude Code** in je terminal — dan bouwt en draait Claude het mét je mee, of
- **gebruik Managed Agents** (module 07) voor een agent die 24/7 in de cloud draait.

### Stap 5 — Bouw kleine hulpmiddelen met Artifacts
Voor losse tools (een rekenhulp, een dashboard, een formulier) kun je Claude in claude.ai een
**Artifact** laten maken — een klein werkend appje, zonder dat je host of code beheert.

---

## Eerlijke grenzen van claude.ai

claude.ai is fantastisch om te ontwerpen, te testen en code te genereren. Maar:

- Het is een **chat**, geen server. Het draait je agent niet **vanzelf, 24/7, op de achtergrond**.
- Het voert niet **zelfstandig acties uit in jouw systemen** (bestellingen plaatsen, mails sturen)
  zoals een agent met tools dat doet — daarvoor heb je de API/Claude Code/Managed Agents nodig.

Kort gezegd: **claude.ai bedenkt en bouwt; de API laat het draaien.** Gebruik ze samen.

---

## Welk oppervlak wanneer?

| Wat je wilt | Gebruik |
|-------------|---------|
| Idee ontwerpen, prompt testen, tekst maken | **claude.ai** |
| Vaste bedrijfscontext bewaren | **claude.ai → Projects** |
| Een klein tooltje/dashboard | **claude.ai → Artifacts** |
| Code laten bouwen én draaien op je pc | **Claude Code** |
| Een agent die 24/7 echt werk doet | **De API / Managed Agents** (module 04–07) |

---

## Jouw opdracht

1. Maak een Project aan op claude.ai voor jouw bedrijf (met je kernzin uit module 02).
2. Ontwerp samen met Claude je eerste system prompt en test hem door te rollenspelen.
3. Laat Claude de bijbehorende Python-code schrijven, en draai die met de stappen uit module 03.

> Je hebt nu de snelste route: ontwerpen in claude.ai, draaien met de code. Ga daarna verder met
> module 04 om alles echt werkend te krijgen.

---

## Verder

→ [Module 04 — Je eerste agent bouwen](04-je-eerste-agent-bouwen.md)
