# Praktijkvoorbeeld — Van nul naar je eerste klant in 7 dagen

> Doel: één compleet, na te volgen voorbeeld dat alle modules samenbrengt. Letterlijk te kopiëren
> berichten, prompts en een dag-voor-dag plan. Pas het aan naar jouw niche en ga aan de slag.

Dit is geen theorie meer. We pakken één concreet bedrijfje en lopen het helemaal door: van idee
tot de eerste betaalde factuur. Het voorbeeld: **SEO-productteksten voor meubelwebshops.** Hetzelfde
patroon werkt voor honderden niches — vervang "meubels" door jouw markt.

---

## Het aanbod (module 02 & 08)

> Ik help **meubelwebshops** die te weinig tijd hebben om goede productteksten te schrijven, door
> **met een AI-agent wervende, SEO-vriendelijke beschrijvingen te leveren — klaar om te plaatsen.**

Prijs: **€99 per maand voor 50 teksten** (of €2 per stuk om te starten).

### De cijfers (ken je marge)

```
Verkoop: 50 teksten × €2          = €100,00
- API-kosten (±€0,02 per tekst)   = €  1,00
- Overige (e-mail, hosting)       = €  4,00
─────────────────────────────────────────
Brutomarge per pakket             = €95,00  (95%)
```

Gezond. Je tijd zit vooral in kwaliteitscontrole en klantcontact — niet in het schrijven.

---

## Dag 1 — Valideren vóór je bouwt (module 02)

Bouw nog niets. Zoek eerst 5 potentiële klanten en peil de interesse. Stuur dit bericht (LinkedIn,
e-mail, of een webshop-ondernemersgroep). **Kopieer en pas aan:**

> Onderwerp: snelle vraag over je productteksten
>
> Hoi [naam], ik zag jullie webshop [naam] — mooie collectie. Korte vraag: kost het schrijven van
> productteksten jullie veel tijd? Ik help meubelwebshops met SEO-vriendelijke beschrijvingen,
> klaar om te plaatsen, voor een vast bedrag per maand. Zou je daar interesse in hebben, en wat
> zou het je waard zijn? Geen verkooppraatje — ik wil gewoon weten of dit een echt probleem is.

Doel van dag 1: **3–5 reacties** en minstens één "ja, daar zou ik voor betalen". Luister naar de
bezwaren — die gebruik je morgen.

---

## Dag 2 — De agent ontwerpen (module 04 + de Claude.ai-route)

Open claude.ai en verfijn samen je instructie. Dit is de **system prompt** — letterlijk te
kopiëren in `agent_mvp.py`:

```
Je bent een ervaren Nederlandse e-commerce copywriter, gespecialiseerd in meubels.
Je schrijft wervende én eerlijke productteksten die converteren.

Regels:
- Toon: warm, deskundig, to-the-point. Geen overdrijving, geen loze superlatieven.
- Verzin nooit specificaties (afmetingen, materiaal) die niet in de opdracht staan.
- Lever altijd: een pakkende titel, een vloeiende beschrijving van 2-4 zinnen,
  3 tot 5 verkoop-bullets, en 3 tot 6 SEO-zoekwoorden.
```

Test hem in claude.ai met een echt product van je prospect. Goed genoeg? Door naar morgen.

---

## Dag 3 — Eén keer met de hand leveren (module 04)

Gebruik `agent_mvp.py` (uit de `code/`-map) met bovenstaande prompt. Vul de `WERKLIJST` met 5
echte producten van je prospect en draai:

```bash
python code/agent_mvp.py
```

Controleer elke tekst met de hand, poets bij waar nodig, en zet ze in een nette Google Doc of
spreadsheet. Dit is je **gratis proeflevering** — kwaliteit is hier belangrijker dan snelheid.

---

## Dag 4 — Het verkoopgesprek (module 08)

Stuur je proeflevering naar de prospect die het meest geïnteresseerd was. **Kopieer en pas aan:**

> Hoi [naam], ik heb als voorproefje meteen 5 productteksten voor je gemaakt — zie de bijlage.
> Plaats ze gerust en kijk wat het doet. Als dit bevalt, lever ik elke maand 50 van dit soort
> teksten voor €99. Eerste maand mag je vrijblijvend proberen. Zal ik je deze week inplannen?

### Drie veelvoorkomende bezwaren (en je antwoord)

| Bezwaar | Je antwoord |
|---------|-------------|
| "Het is toch gewoon AI?" | "Klopt, dáárom is het snel én betaalbaar. Maar ik controleer elke tekst zelf — je krijgt AI-snelheid mét menselijke kwaliteit." |
| "€99 is veel" | "Hoeveel uur kost het je nu zelf? Bij 50 teksten bespaar ik je makkelijk een hele werkdag per maand. Reken het eens om naar je uurtarief." |
| "Ik wil eerst zien of het werkt" | "Snap ik — daarom heb je nu al 5 gratis. Plaats ze, en betaal pas vanaf de volgende batch." |

---

## Dag 5 — Betaling regelen (module 09)

Houd het simpel voor klant nummer één:
- Stuur een **nette factuur** (of een **Stripe Payment Link** van €99).
- Btw apart zetten (module 11).
- Noteer de inkomsten en kosten in een spreadsheet vanaf euro één.

Geautomatiseerde betalingen en webhooks komen later — eerst bewijzen dat mensen betalen.

---

## Dag 6 — Leveren en guardrails (module 06 & 10)

Lever de eerste echte batch van 50 teksten. Zet bij het draaien je guardrails aan:
- een **dagbudget** in `agent_mvp.py` (staat er al in),
- een **uitgavenlimiet** in de Anthropic-console,
- en controleer een **steekproef** van de output voor je hem verstuurt.

Vraag na levering om feedback en een korte aanbeveling — die gebruik je voor klant twee.

---

## Dag 7 — Herhalen en automatiseren (module 12)

Nu je weet dat het werkt:
- Benader 5 nieuwe meubelwebshops met hetzelfde bericht van dag 1.
- Noteer elk handmatig stukje uit deze week — dat is je automatiserings-lijst.
- Automatiseer de saaiste stap eerst (bijv. de teksten automatisch in een Google Sheet zetten via
  Zapier, module 09).

Herhaal de cyclus. Drie tot vijf klanten in dezelfde niche is een echt, draaiend bedrijfje.

---

## De 7-dagen-checklist

- [ ] Dag 1 — 5 prospects benaderd, minstens 1 "ja, daarvoor zou ik betalen"
- [ ] Dag 2 — system prompt ontworpen en getest in claude.ai
- [ ] Dag 3 — 5 teksten met de hand geleverd als gratis voorproefje
- [ ] Dag 4 — verkoopbericht gestuurd, bezwaren beantwoord
- [ ] Dag 5 — betaalmethode geregeld (factuur of Payment Link)
- [ ] Dag 6 — eerste betaalde batch geleverd, guardrails aan, feedback gevraagd
- [ ] Dag 7 — 5 nieuwe prospects benaderd, eerste stap geautomatiseerd

---

## Handige tools (concreet)

| Functie | Begin hiermee |
|---------|---------------|
| AI-motor | Claude API (`claude-opus-4-8`), of claude.ai om te ontwerpen |
| Code draaien | Python op je eigen computer (module 03) |
| Betalingen | Handmatige factuur, Stripe Payment Link, of Gumroad |
| E-mail/levering | Google Docs/Sheets, een transactionele e-maildienst |
| Koppelingen | Zapier (9.000+ apps) — begin met 1 trigger + 1 actie |
| Boekhouding | Een simpele spreadsheet, later een boekhoudtool |

---

## De kern

Dit voorbeeld werkt omdat het **smal** is (één dienst, één niche), **gevalideerd vóór het bouwen**,
en **half-handmatig geleverd** tot je weet dat mensen betalen. Vervang de niche, houd het patroon,
en je hebt een draaiboek dat je elke week opnieuw kunt uitvoeren.

> Begin vandaag bij dag 1. Eén echt verzonden bericht is meer waard dan een week perfectioneren.

---

## Verder

→ [Terug naar het overzicht](../README.md)
