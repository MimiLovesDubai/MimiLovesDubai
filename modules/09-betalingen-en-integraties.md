# Module 09 — Betalingen & integraties

> Doel: geld daadwerkelijk laten binnenkomen en je agent koppelen aan de echte wereld — betalingen,
> e-mail, en honderden andere apps.

---

## Geld innen: de opties

Je hoeft geen complexe betaalinfrastructuur te bouwen. Kies naar gelang je product:

| Methode | Goed voor | Gemak |
|---------|-----------|-------|
| **Handmatige facturen** | Eerste klanten, diensten, retainers | Zeer eenvoudig — stuur een factuur, ontvang via bank/Tikkie |
| **Stripe Payment Links** | Per-stuk of eenmalig, zonder code | Maak een betaallink in het Stripe-dashboard, deel hem |
| **Stripe Subscriptions** | Abonnementen | Iets meer werk, maar automatische maandelijkse incasso |
| **Marktplaats** | Diensten verkopen | Het platform regelt betaling (tegen een fee) |

> 💡 **Begin handmatig.** Voor je eerste klanten is een nette factuur of een Stripe Payment Link
> meer dan genoeg. Bouw pas geautomatiseerde betalingen als je terugkerende klanten hebt.

---

## Stripe in het kort (voor abonnementen)

Stripe is de standaard voor online betalingen. Globaal werkt het zo:

1. Maak een (test-)account op [stripe.com](https://stripe.com) en haal je API-sleutels.
2. Maak een **Product** met een **Price** (bijv. €99/maand).
3. Stuur klanten naar een **Checkout** of **Payment Link**.
4. Stripe stuurt een **webhook** naar jouw server wanneer er betaald is — daar geef je toegang.

Een minimale webhook-handler (concept):

```python
import stripe, os
from flask import Flask, request

stripe.api_key = os.environ["STRIPE_API_KEY"]
app = Flask(__name__)

@app.route("/webhook", methods=["POST"])
def webhook():
    event = stripe.Webhook.construct_event(
        request.data, request.headers["Stripe-Signature"],
        os.environ["STRIPE_WEBHOOK_SECRET"],
    )
    if event["type"] == "checkout.session.completed":
        klant_email = event["data"]["object"]["customer_details"]["email"]
        # → geef toegang, start de agent-dienst voor deze klant, stuur welkomstmail
        activeer_klant(klant_email)
    return "", 200
```

Zet `stripe` en `flask` aan in `requirements.txt` (ze staan er uitgecommentarieerd) als je dit
gaat gebruiken. Test altijd eerst met Stripe's testmodus en testkaarten.

> 🔐 Verifieer **altijd** de webhook-handtekening (zoals hierboven). Anders kan iemand nep-
> "betaald"-events sturen.

---

## Je agent koppelen aan e-mail

Veel agent-bedrijven draaien op e-mail: vragen komen binnen, antwoorden gaan uit. Twee routes:

- **Eenvoudig:** gebruik een transactionele e-maildienst (bijv. via hun API) om mails te
  versturen vanuit je agent als tool (`verstuur_email` uit module 05).
- **Inkomende mail verwerken:** laat mail binnenkomen via een dienst die een webhook naar je
  server stuurt, en geef de inhoud aan je agent.

Voor een klantenservice-agent (zoals `business_agent.py`) is dit de natuurlijke koppeling: inbox
in, agent verwerkt, antwoord uit, escalatie naar jou waar nodig.

---

## Honderden apps zonder code: Zapier

Wil je je agent koppelen aan Gmail, Google Sheets, Slack, je CRM, agenda's — zonder voor elk een
integratie te bouwen? Gebruik **Zapier**, dat 9.000+ apps verbindt. Patroon:

- Een trigger in een app (nieuwe e-mail, nieuw formulier, nieuwe rij) start je agent.
- Je agent doet het werk.
- De uitkomst gaat via Zapier weer een app in (rij toevoegen, bericht sturen, taak aanmaken).

Dit is de snelste manier om je agent in een bestaande bedrijfsflow te hangen. Begin met één
trigger en één actie; breid later uit.

---

## Een complete inkomstenflow

Zo ziet een werkend geautomatiseerd bedrijf eruit:

```
Klant betaalt (Stripe)
      │  webhook
      ▼
Toegang geactiveerd ──▶ Klantgegevens in database/Sheet
      │
      ▼
Werk komt binnen (formulier / e-mail / API)
      │
      ▼
🤖 Agent verwerkt het werk  ◀── guardrails (budget, checkpoints)
      │
      ▼
Resultaat geleverd (e-mail / dashboard / bestand)
      │
      ▼
Maandelijkse rapportage ──▶ klant blijft, jij groeit
```

Je hoeft dit niet in één keer te bouwen. Begin met de middelste stap (de agent), doe de rest
handmatig, en automatiseer stap voor stap naarmate je groeit.

---

## Boekhouding: houd het vanaf dag één bij

Zodra er geld binnenkomt, registreer je:
- **Inkomsten** per klant/factuur.
- **Kosten** (API, tools, hosting, betaal-fees).
- **Btw** waar van toepassing (module 11).

Een simpele spreadsheet of boekhoudtool volstaat in het begin. Niet bijhouden = problemen bij de
belasting. Module 11 gaat dieper op de regels in.

---

## Jouw opdracht

1. Kies je betaalmethode voor de eerste klanten (start: handmatige factuur of Payment Link).
2. Bepaal welke integraties je echt nodig hebt (e-mail? Sheet? Slack?) — niet meer dan dat.
3. Teken jouw inkomstenflow op papier, van betaling tot levering.

---

## Verder

→ [Module 10 — Veiligheid & guardrails](10-veiligheid-en-guardrails.md)
