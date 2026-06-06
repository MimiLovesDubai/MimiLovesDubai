"""
agent_company.py — Een klein, draaiend "AI-agent-bedrijf": meerdere samenwerkende agents
die zelfstandig binnenkomende opdrachten verwerken, controleren, leveren en de omzet bijhouden.

Dit is de blauwdruk-capstone van de cursus. Het brengt alles samen:
  • COÖRDINATOR  — haalt opdrachten op en stuurt de pijplijn aan
  • SCHRIJVER    — produceert de deliverable (een agent)
  • CONTROLEUR   — beoordeelt de kwaliteit en vraagt zo nodig om revisie (een agent)
  • KLANTCONTACT — stelt de oplevermail op
  • Mens         — geeft akkoord vóór er iets de deur uit gaat (guardrail)
  • Grootboek    — houdt omzet, kosten en marge bij

Het bedrijf in dit voorbeeld levert SEO-productteksten. Vervang de rollen/prompts en je hebt
een bedrijf in jouw niche.

Draai:
    python code/agent_company.py            # met menselijk akkoord per levering
    python code/agent_company.py --auto      # onbewaakt (bijv. via een cron-taak)

Plan het in (24/7) met cron (Linux/Mac) of Taakplanner (Windows). Zie module
'agent-bedrijf-blauwdruk' voor de uitleg.

Hoort bij de cursus "De Autonome Onderneming / MyAIAgent".
"""

import json
import os
import sys
from datetime import datetime

from dotenv import load_dotenv
from pydantic import BaseModel

HIER = os.path.dirname(__file__)
load_dotenv(os.path.join(HIER, ".env"))

try:
    import anthropic
except ImportError:
    sys.exit("❌ Draai eerst: pip install -r code/requirements.txt")

# ── Bedrijfsinstellingen ─────────────────────────────────────────────────────
MODEL_SLIM = "claude-opus-4-8"     # voor schrijven en beoordelen (kwaliteit)
MODEL_SNEL = "claude-haiku-4-5"    # voor simpele deeltaken (goedkoop)
PRIJS_PER_OPDRACHT = 2.00          # wat je de klant per tekst rekent (€)
MAX_REVISIES = 2                   # hoe vaak de controleur om verbetering mag vragen
MAX_KOSTEN_USD = float(os.environ.get("MAX_DAGELIJKSE_KOSTEN_USD", "5.00"))
AUTO = "--auto" in sys.argv        # onbewaakt draaien (geen menselijk akkoord)

PRIJS_IN, PRIJS_UIT = 5.00, 25.00  # richtprijzen Opus 4.8 per 1M tokens
JOBS_BESTAND = os.path.join(HIER, "jobs.json")
GROOTBOEK = os.path.join(HIER, "grootboek.json")
LOGBESTAND = os.path.join(HIER, "company.log")
OUTPUT_MAP = os.path.join(HIER, "outputs")

client = anthropic.Anthropic()


# ── Hulpfuncties ─────────────────────────────────────────────────────────────
def log(msg: str) -> None:
    regel = f"[{datetime.now().isoformat(timespec='seconds')}] {msg}"
    print(regel)
    with open(LOGBESTAND, "a", encoding="utf-8") as f:
        f.write(regel + "\n")


class Kosten:
    def __init__(self, limiet): self.limiet, self.totaal = limiet, 0.0
    def tel(self, u): self.totaal += u.input_tokens / 1e6 * PRIJS_IN + u.output_tokens / 1e6 * PRIJS_UIT
    def over(self): return self.totaal >= self.limiet


def laad_opdrachten() -> list:
    """Lees binnengekomen opdrachten. In het echt komt dit uit je inbox/CRM/formulier."""
    if not os.path.exists(JOBS_BESTAND):
        # Maak een voorbeeld-orderlijst zodat het voorbeeld meteen draait.
        voorbeeld = [
            {"id": "A-1001", "klant": "meubelhuis@example.com", "brief": "Eiken eettafel, 200x100 cm, massief, natuurlijke olie."},
            {"id": "A-1002", "klant": "meubelhuis@example.com", "brief": "Fluwelen fauteuil, donkergroen, houten poten."},
            {"id": "A-1003", "klant": "woonstijl@example.com",  "brief": "Industriële boekenkast, staal en gerecycled hout, 180 cm."},
        ]
        with open(JOBS_BESTAND, "w", encoding="utf-8") as f:
            json.dump(voorbeeld, f, ensure_ascii=False, indent=2)
        return voorbeeld
    with open(JOBS_BESTAND, encoding="utf-8") as f:
        return json.load(f)


def boek_in(regel: dict) -> None:
    grootboek = []
    if os.path.exists(GROOTBOEK):
        with open(GROOTBOEK, encoding="utf-8") as f:
            grootboek = json.load(f)
    grootboek.append(regel)
    with open(GROOTBOEK, "w", encoding="utf-8") as f:
        json.dump(grootboek, f, ensure_ascii=False, indent=2)


# ── Schemas ──────────────────────────────────────────────────────────────────
class Producttekst(BaseModel):
    titel: str
    beschrijving: str
    bullets: list[str]
    seo_keywords: list[str]


class Oordeel(BaseModel):
    goedgekeurd: bool
    score: int           # 1-10
    feedback: str        # wat er beter moet (leeg als goedgekeurd)


# ── De agents ────────────────────────────────────────────────────────────────
SCHRIJVER_PROMPT = """\
Je bent een ervaren Nederlandse e-commerce copywriter, gespecialiseerd in meubels.
Schrijf wervende, eerlijke productteksten die converteren. Verzin nooit specificaties
die niet in de brief staan. Lever titel, beschrijving (2-4 zinnen), 3-5 bullets en 3-6
SEO-zoekwoorden."""

CONTROLEUR_PROMPT = """\
Je bent een strenge maar eerlijke eindredacteur. Beoordeel de producttekst op: feitelijkheid
(geen verzonnen specs), wervendheid, correct Nederlands en volledigheid (titel, beschrijving,
bullets, keywords). Geef een score 1-10. Keur alleen goed (goedgekeurd=true) bij score >= 8.
Geef bij afkeuring concrete, korte feedback wat er beter moet."""


def schrijver(brief: str, feedback: str, meter: Kosten) -> Producttekst:
    extra = f"\n\nVerbeter op basis van deze feedback: {feedback}" if feedback else ""
    r = client.messages.parse(
        model=MODEL_SLIM, max_tokens=1500, thinking={"type": "adaptive"},
        output_config={"effort": "medium"}, system=SCHRIJVER_PROMPT,
        messages=[{"role": "user", "content": f"Maak een webshop-listing voor: {brief}{extra}"}],
        output_format=Producttekst,
    )
    meter.tel(r.usage)
    return r.parsed_output


def controleur(brief: str, tekst: Producttekst, meter: Kosten) -> Oordeel:
    r = client.messages.parse(
        model=MODEL_SLIM, max_tokens=800, output_config={"effort": "low"},
        system=CONTROLEUR_PROMPT,
        messages=[{"role": "user", "content": f"Brief: {brief}\n\nTekst:\n{tekst.model_dump_json(indent=2)}"}],
        output_format=Oordeel,
    )
    meter.tel(r.usage)
    return r.parsed_output


def klantcontact(klant: str, teksten: list[Producttekst], meter: Kosten) -> str:
    """Stelt een korte, vriendelijke oplevermail op (goedkoop model)."""
    r = client.messages.create(
        model=MODEL_SNEL, max_tokens=500, system="Je schrijft korte, professionele Nederlandse oplevermails.",
        messages=[{"role": "user", "content":
                   f"Schrijf een korte oplevermail aan {klant} voor {len(teksten)} geleverde productteksten. "
                   "Vriendelijk, zakelijk, vraag om feedback."}],
    )
    meter.tel(r.usage)
    return next((b.text for b in r.content if b.type == "text"), "")


# ── De coördinator: stuurt de pijplijn per opdracht aan ──────────────────────
def verwerk(opdracht: dict, meter: Kosten) -> Producttekst | None:
    log(f"📋 Coördinator pakt opdracht {opdracht['id']} op: {opdracht['brief'][:50]}...")
    feedback = ""
    for poging in range(1, MAX_REVISIES + 2):
        tekst = schrijver(opdracht["brief"], feedback, meter)
        oordeel = controleur(opdracht["brief"], tekst, meter)
        log(f"   ✍️  Schrijver leverde «{tekst.titel}» → controleur: score {oordeel.score}/10")
        if oordeel.goedgekeurd:
            log(f"   ✅ Goedgekeurd (poging {poging}).")
            return tekst
        feedback = oordeel.feedback
        log(f"   🔁 Revisie nodig: {feedback[:80]}")
    log("   ⚠️ Na max revisies niet goedgekeurd — gemarkeerd voor mens.")
    return None


def main() -> None:
    os.makedirs(OUTPUT_MAP, exist_ok=True)
    meter = Kosten(MAX_KOSTEN_USD)
    opdrachten = laad_opdrachten()
    log(f"🏢 AI-agent-bedrijf gestart. {len(opdrachten)} opdrachten, dagbudget ${MAX_KOSTEN_USD:.2f}, "
        f"modus: {'ONBEWAAKT' if AUTO else 'met menselijk akkoord'}.")

    per_klant: dict[str, list[Producttekst]] = {}
    geslaagd = 0
    for opdracht in opdrachten:
        if meter.over():
            log(f"🛑 Budgetlimiet bereikt (${meter.totaal:.4f}). Stop.")
            break
        tekst = verwerk(opdracht, meter)
        if tekst is None:
            continue
        # Bewaar de deliverable
        pad = os.path.join(OUTPUT_MAP, f"{opdracht['id']}.json")
        with open(pad, "w", encoding="utf-8") as f:
            f.write(tekst.model_dump_json(indent=2))
        per_klant.setdefault(opdracht["klant"], []).append(tekst)
        geslaagd += 1

    # Levering per klant — met menselijk akkoord (guardrail), tenzij --auto
    for klant, teksten in per_klant.items():
        mail = klantcontact(klant, teksten, meter)
        log(f"\n📧 Concept-oplevermail aan {klant} ({len(teksten)} teksten):\n{mail}\n")
        if not AUTO:
            akkoord = input(f"   Versturen naar {klant}? (j/n): ").strip().lower()
            if akkoord != "j":
                log("   ⏸️  Levering uitgesteld door mens.")
                continue
        # In het echt: hier verstuur je de mail via je e-mailtool (module 05/09).
        omzet = len(teksten) * PRIJS_PER_OPDRACHT
        boek_in({"datum": datetime.now().isoformat(timespec="seconds"), "klant": klant,
                 "aantal": len(teksten), "omzet_eur": omzet})
        log(f"   ✅ Geleverd aan {klant}. Omzet geboekt: €{omzet:.2f}")

    # Dagrapport
    log("\n" + "=" * 56)
    log(f"📦 {geslaagd}/{len(opdrachten)} opdrachten afgerond.")
    log(f"💸 API-kosten vandaag: ${meter.totaal:.4f}")
    if os.path.exists(GROOTBOEK):
        with open(GROOTBOEK, encoding="utf-8") as f:
            tot = sum(r["omzet_eur"] for r in json.load(f))
        log(f"💰 Totale geboekte omzet (grootboek): €{tot:.2f}")
    log("🏁 Bedrijf klaar voor vandaag. Plan dit script in voor een dagelijkse run.")
    log("=" * 56)


if __name__ == "__main__":
    main()
