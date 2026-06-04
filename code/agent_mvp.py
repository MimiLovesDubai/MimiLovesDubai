"""
agent_mvp.py — Je eerste werkende bedrijfsagent (MVP).

Deze agent verwerkt zelfstandig een werklijst van taken (hier: productbeschrijvingen
genereren voor een webshop), levert gestructureerde, gevalideerde uitvoer, logt alles,
en houdt de kosten bij met een ingebouwde dagbudget-guardrail.

Draai:
    python code/agent_mvp.py

Pas de WERKLIJST en SYSTEM_PROMPT aan naar jouw eigen bedrijfstaak (module 02/04).

Hoort bij module 04 van "De Autonome Onderneming".
"""

import os
import sys
from datetime import datetime

from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

try:
    import anthropic
except ImportError:
    sys.exit("❌ Draai eerst: pip install -r code/requirements.txt")

# ── Configuratie ────────────────────────────────────────────────────────────
MODEL = "claude-opus-4-8"                 # zwaar werk; gebruik haiku voor simpel werk
MAX_KOSTEN_USD = float(os.environ.get("MAX_DAGELIJKSE_KOSTEN_USD", "5.00"))

# Richtprijzen per 1M tokens (controleer actuele prijzen op platform.claude.com/pricing)
PRIJS_IN_PER_M = 5.00
PRIJS_UIT_PER_M = 25.00

SYSTEM_PROMPT = """\
Je bent een ervaren Nederlandse e-commerce copywriter, gespecialiseerd in meubels.
Je schrijft wervende én eerlijke productteksten die converteren.

Regels:
- Toon: warm, deskundig, to-the-point. Geen overdrijving, geen loze superlatieven.
- Verzin nooit specificaties (afmetingen, materiaal) die niet in de opdracht staan.
- Lever altijd: een pakkende titel, een vloeiende beschrijving van 2-4 zinnen,
  3 tot 5 verkoop-bullets, en 3 tot 6 SEO-zoekwoorden.
"""

# Jouw werklijst — vervang dit door je eigen taken.
WERKLIJST = [
    "Eiken eettafel, 200x100 cm, massief, natuurlijke olie-afwerking.",
    "Fluwelen fauteuil, donkergroen, met houten poten.",
    "Industriële boekenkast, staal en gerecycled hout, 180 cm hoog.",
]


# ── Gestructureerd uitvoerschema ────────────────────────────────────────────
class Producttekst(BaseModel):
    titel: str
    beschrijving: str
    bullets: list[str]
    seo_keywords: list[str]


# ── Kostenteller (guardrail) ────────────────────────────────────────────────
class Kostenmeter:
    def __init__(self, limiet_usd: float):
        self.limiet = limiet_usd
        self.totaal = 0.0

    def tel_op(self, usage) -> float:
        kost = (
            usage.input_tokens / 1_000_000 * PRIJS_IN_PER_M
            + usage.output_tokens / 1_000_000 * PRIJS_UIT_PER_M
        )
        self.totaal += kost
        return kost

    def over_limiet(self) -> bool:
        return self.totaal >= self.limiet


def log(boodschap: str) -> None:
    tijd = datetime.now().strftime("%H:%M:%S")
    print(f"[{tijd}] {boodschap}")


def verwerk_taak(client, taak: str) -> Producttekst:
    """Eén taak laten uitvoeren door het model, met gegarandeerde structuur."""
    response = client.messages.parse(
        model=MODEL,
        max_tokens=1500,
        thinking={"type": "adaptive"},
        output_config={"effort": "high"},
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": f"Maak een webshop-listing voor: {taak}"}],
        output_format=Producttekst,
    )
    return response.parsed_output, response.usage


def main() -> None:
    client = anthropic.Anthropic()
    meter = Kostenmeter(MAX_KOSTEN_USD)
    resultaten = []

    log(f"🤖 Agent gestart. Dagbudget: ${MAX_KOSTEN_USD:.2f}. Taken: {len(WERKLIJST)}.")

    for i, taak in enumerate(WERKLIJST, 1):
        if meter.over_limiet():
            log(f"🛑 Budgetlimiet bereikt (${meter.totaal:.4f}). Stop voor de veiligheid.")
            break

        log(f"▶️  Taak {i}/{len(WERKLIJST)}: {taak[:50]}...")
        try:
            tekst, usage = verwerk_taak(client, taak)
        except anthropic.APIStatusError as e:
            log(f"⚠️  API-fout bij taak {i}: {e.message}. Overslaan.")
            continue

        kost = meter.tel_op(usage)
        resultaten.append(tekst)
        log(f"✅ Klaar: «{tekst.titel}»  (kosten: ${kost:.4f})")

    # ── Rapportage ──────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print(f"📦 {len(resultaten)} producttekst(en) gegenereerd.")
    print(f"💸 Totale kosten: ${meter.totaal:.4f}")
    print("=" * 60 + "\n")

    for r in resultaten:
        print(f"## {r.titel}\n")
        print(r.beschrijving + "\n")
        for b in r.bullets:
            print(f"  • {b}")
        print(f"\n  🔎 SEO: {', '.join(r.seo_keywords)}\n")
        print("-" * 60)

    log("🏁 Agent klaar. Bewaar of upload deze teksten naar je webshop.")


if __name__ == "__main__":
    main()
