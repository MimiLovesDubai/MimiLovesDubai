# Module 04 — Je eerste agent bouwen

> Doel: een werkende agent draaien die een echte bedrijfstaak uitvoert. We bouwen op van een
> losse prompt naar een eenvoudige agent.

Bijbehorende code: [`code/agent_mvp.py`](../code/agent_mvp.py).

---

## Eerst: een losse prompt (de bouwsteen)

Alles begint met één API-aanroep. Dit is de kern die je honderden keren zult gebruiken:

```python
import os
from dotenv import load_dotenv
import anthropic

load_dotenv("code/.env")
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1000,
    system="Je bent een ervaren e-commerce copywriter. Schrijf wervende, eerlijke teksten.",
    messages=[
        {"role": "user", "content": "Schrijf een productbeschrijving voor een eiken eettafel."}
    ],
)

for block in response.content:
    if block.type == "text":
        print(block.text)
```

Drie dingen om te onthouden:
- **`system`** = wie de agent is en wat de regels zijn (je belangrijkste stuurmiddel).
- **`messages`** = het gesprek; begint altijd met een `user`-bericht.
- **`response.content`** = een lijst blokken; pak de `text`-blokken eruit.

Dit is geen agent — het is één vraag, één antwoord. Maar het is wél de motor van alles.

---

## Adaptive thinking & effort aanzetten

Voor serieuzer werk laat je het model nadenken vóór het antwoordt. Bij Opus 4.8 doe je dat met
**adaptive thinking** (het model bepaalt zelf hoe diep) en het **effort**-niveau:

```python
response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=2000,
    thinking={"type": "adaptive"},          # model denkt na waar nodig
    output_config={"effort": "high"},        # diepte/kosten-niveau: low|medium|high|xhigh|max
    system="...",
    messages=[...],
)
```

> Let op (Opus 4.8/4.7): gebruik géén `temperature`, `top_p`, of `budget_tokens` — die zijn
> verwijderd en geven een foutmelding. Sturen doe je via je prompt en het `effort`-niveau.

---

## Van prompt naar agent: een gestructureerde uitvoer

Een agent moet vaak een **betrouwbaar, machine-leesbaar** resultaat geven, niet alleen losse
tekst. Daarvoor gebruik je `messages.parse()` met een schema (via Pydantic). Zo krijg je
gegarandeerd geldige, gestructureerde data terug:

```python
from pydantic import BaseModel

class Producttekst(BaseModel):
    titel: str
    beschrijving: str
    bullets: list[str]
    seo_keywords: list[str]

response = client.messages.parse(
    model="claude-opus-4-8",
    max_tokens=2000,
    messages=[{"role": "user", "content": "Maak een listing voor een eiken eettafel."}],
    output_format=Producttekst,
)

resultaat = response.parsed_output   # een gevalideerd Producttekst-object
print(resultaat.titel)
print(resultaat.bullets)
```

Dit is enorm krachtig voor een bedrijf: je kunt de uitvoer direct in een database, webshop of
e-mail stoppen, zonder gepruts met tekst parsen.

---

## Het verschil dat een agent maakt: meerdere taken zelfstandig

`agent_mvp.py` laat een eerste vorm van autonomie zien: je geeft de agent een **lijst taken** en
een **rol**, en hij verwerkt ze één voor één, met logging en een kostenteller. Het is nog geen
volledige tool-gebruikende loop (dat is module 05 en 06), maar het toont het patroon:

```
voor elke taak in de werklijst:
    laat de agent de taak uitvoeren
    valideer en bewaar het resultaat
    tel de kosten op
    stop als de dagbudget-limiet bereikt is
```

Draai het:

```bash
python code/agent_mvp.py
```

Je ziet de agent een setje productbeschrijvingen genereren, netjes gestructureerd, met een
kostenoverzicht aan het eind. Pas de `WERKLIJST` bovenin het bestand aan naar jouw eigen
bedrijfstaak.

---

## De system prompt: je belangrijkste gereedschap

90% van de kwaliteit van je agent zit in de system prompt. Een goede system prompt bevat:

1. **Rol** — "Je bent een ervaren e-commerce copywriter gespecialiseerd in meubels."
2. **Doel** — "Schrijf teksten die converteren én eerlijk zijn."
3. **Stijl & regels** — "Toon: warm en deskundig. Nooit overdrijven. Altijd 3–5 bullets."
4. **Grenzen** — "Verzin geen specificaties die je niet weet. Bij twijfel: vermeld het niet."
5. **Uitvoerformaat** — "Geef titel, beschrijving, bullets en keywords."

Gebruik het [sjabloon](../templates/agent-system-prompt-template.md) als startpunt. Itereer:
draai, bekijk de uitvoer, verbeter de prompt, herhaal. Dit "prompt-tunen" is een kernvaardigheid.

> Tip voor Opus 4.8: het model volgt instructies zeer letterlijk en is voorzichtig met
> overdrijven. Schrijf je instructies als heldere feiten en richtlijnen, niet als schreeuwerige
> "JE MOET ALTIJD..."-commando's — dat werkt averechts.

---

## Veelgemaakte beginnersfouten

- **`max_tokens` te laag** → antwoord wordt afgekapt. Zet ruim (1.000–4.000 voor tekst).
- **Geen `.env`** → sleutel hardcoded in je script. Doe dat nooit.
- **Alles op Opus** → duur. Gebruik Haiku voor simpel werk (module 03).
- **Geen logging** → je weet niet wat je agent deed of wat het kostte. Log altijd (module 10).

---

## Jouw opdracht

1. Draai `agent_mvp.py` ongewijzigd.
2. Vervang de `WERKLIJST` en de system prompt door jóuw bedrijfstaak uit module 02.
3. Itereer op de system prompt tot de uitvoer goed genoeg is om aan een klant te tonen.
4. Lever de uitvoer één keer "met de hand" aan een echte (potentiële) klant — feedback is goud.

---

## Verder

→ [Module 05 — Tools geven aan je agent](05-tools-en-acties.md)

Daar leer je het verschil tussen praten en doen: hoe je agent echte acties uitvoert in de
wereld via tools.
