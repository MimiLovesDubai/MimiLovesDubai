# Module 01 — Wat is een AI-agent?

> Doel: begrijpen wat een agent technisch is, zodat je weet wat je bouwt en wanneer je het wél
> of níet moet inzetten.

---

## Het spectrum: van prompt tot agent

Niet alles dat AI gebruikt is een "agent". Er is een spectrum, en het juiste niveau kiezen
bespaart je geld en kopzorgen.

### Niveau 1 — Eén enkele prompt (één vraag, één antwoord)

Je stuurt tekst naar het model, je krijgt tekst terug. Klaar.

> "Schrijf een productbeschrijving voor deze stoel." → beschrijving.

Goed voor: classificeren, samenvatten, vertalen, genereren. Goedkoop en voorspelbaar. **Begin
hier als het kan.** Veel "AI-businesses" hebben helemaal geen agent nodig — een slimme reeks
losse prompts is genoeg.

### Niveau 2 — Een workflow (jij bestuurt de stappen)

Jij schrijft de code die de stappen bepaalt: stap A → stap B → beslissing → stap C. Het model
doet per stap één ding; jouw code houdt de regie.

> Haal product op → genereer beschrijving → controleer lengte → sla op in database.

Goed voor: voorspelbare, herhaalbare processen. Betrouwbaar omdat jij de logica vastlegt.

### Niveau 3 — Een agent (het model bepaalt de stappen)

Nu krijgt het model **tools** (acties die het kan uitvoeren) en een **doel**. Het model beslist
zélf welke stappen het neemt, in welke volgorde, en wanneer het klaar is. Het draait in een
**lus**: denken → tool kiezen → resultaat bekijken → volgende stap → ... → klaar.

> Doel: "Verwerk alle nieuwe bestellingen van vandaag." De agent kijkt zelf welke bestellingen
> er zijn, beslist per stuk wat nodig is, gebruikt de juiste tools, en stopt als alles af is.

Goed voor: taken die je vooraf niet volledig kunt uitschrijven, waar oordeel en flexibiliteit
nodig zijn. Krachtiger, maar duurder en minder voorspelbaar — dus met guardrails.

---

## Wanneer kies je een echte agent?

Gebruik deze vier vragen (van Anthropic's eigen agent-ontwerprichtlijnen):

1. **Complexiteit** — Is de taak meerstaps en lastig vooraf volledig te specificeren? (Ja → agent
   kan zinvol zijn. Nee → workflow of losse prompt.)
2. **Waarde** — Rechtvaardigt de uitkomst de hogere kosten en latentie van een agent?
3. **Haalbaarheid** — Is het model goed in dit type taak?
4. **Kosten van fouten** — Kun je fouten opvangen en herstellen (review, terugdraaien, tests)?

Is een antwoord "nee", blijf dan op een eenvoudiger niveau. **Een agent is niet het doel —
waarde leveren is het doel.** De meeste winstgevende automatiseringen zijn workflows met hier en
daar een agentische stap.

---

## De anatomie van een agent

Elke agent bestaat uit vijf onderdelen:

```
┌─────────────────────────────────────────────────┐
│  1. MODEL        het brein (Claude Opus 4.8)      │
│  2. SYSTEM PROMPT wie de agent is + zijn regels   │
│  3. TOOLS        wat de agent kan dóen            │
│  4. LOOP         denken → handelen → herhalen     │
│  5. GUARDRAILS   limieten, checkpoints, logging   │
└─────────────────────────────────────────────────┘
```

- **Model** — de redeneermachine. Wij gebruiken `claude-opus-4-8` voor het zware werk en
  `claude-haiku-4-5` voor simpele, snelle deeltaken.
- **System prompt** — de instructie die de rol, het doel en de grenzen vastlegt. Dit is je
  belangrijkste stuurmiddel. (Sjabloon in [`templates/agent-system-prompt-template.md`](../templates/agent-system-prompt-template.md).)
- **Tools** — functies die de agent kan aanroepen: een webshop-API, een e-mailverzender, een
  database, een betaalsysteem. Zonder tools kan een agent alleen praten; mét tools kan hij
  handelen. (Module 05.)
- **Loop** — de cyclus waarin de agent autonoom doorwerkt tot het doel bereikt is. (Module 06.)
- **Guardrails** — de veiligheidslaag die voorkomt dat hij geld verbrandt of schade aanricht.
  (Module 10.)

---

## Een concreet voorbeeld

Stel: een agent die de voorraad van een webshop beheert.

| Onderdeel | Invulling |
|-----------|-----------|
| Model | `claude-opus-4-8` |
| System prompt | "Je bent voorraadbeheerder. Houd voorraad gezond, bestel bij onder 10 stuks, vraag toestemming boven €500." |
| Tools | `get_voorraad()`, `get_verkoopdata()`, `plaats_bestelling()`, `vraag_mens()` |
| Loop | Bekijk voorraad → analyseer verkoop → beslis per product → bestel of vraag toestemming → log |
| Guardrails | Max €500 per bestelling zonder goedkeuring; alles loggen; dagelijkse uitgavenlimiet |

Deze agent bespaart elke dag uren handmatig voorraadwerk — dat is de hefboom "tijd besparen"
uit module 00, vertaald naar concreet geld.

---

## Belangrijke termen (woordenlijst)

- **Token** — de eenheid waarin tekst wordt geteld en afgerekend. Ruwweg ¾ woord. Je betaalt
  per miljoen tokens in en uit.
- **Context window** — hoeveel tekst het model tegelijk "ziet". Opus 4.8 heeft 1 miljoen tokens
  context — heel ruim.
- **Tool use / function calling** — het mechanisme waarmee het model jouw functies aanroept.
- **System prompt** — de overkoepelende instructie die los staat van het gesprek.
- **Agentic loop** — de herhalende cyclus van denken en handelen.
- **Managed Agent** — een agent die volledig op Anthropic's infrastructuur draait (module 07).

---

## Jouw opdracht

Bepaal voor jouw idee (uit module 00) welk niveau je nodig hebt:
- Kan het met **losse prompts**? → Goedkoop, begin daar.
- Heb je een **vaste workflow**? → Schrijf de stappen uit.
- Heb je echt **flexibele autonomie** nodig? → Agent.

Wees eerlijk. De meeste eerste producten beginnen op niveau 1 of 2 en groeien pas later naar 3.

---

## Verder

→ [Module 02 — Kies je business-model](02-business-model-kiezen.md)
