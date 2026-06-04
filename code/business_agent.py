"""
business_agent.py — Een complete autonome bedrijfsagent (klantvraag-afhandeling).

Brengt alle vier "wetten van een veilige loop" samen:
  1. Harde stap-limiet
  2. Budget-limiet (Kostenmeter)
  3. Logging naar bestand én scherm
  4. Mens-in-de-loop checkpoint op risicovolle/dure acties
Plus eenvoudig geheugen tussen runs via geheugen.json.

Scenario: de agent verwerkt binnengekomen klantvragen. Hij beantwoordt standaardvragen zelf,
kwalificeert leads, en escaleert complexe of financieel risicovolle verzoeken naar een mens.

Draai:
    python code/business_agent.py

Hoort bij module 06 van "De Autonome Onderneming".
"""

import json
import os
import sys
from datetime import datetime

from dotenv import load_dotenv

HIER = os.path.dirname(__file__)
load_dotenv(os.path.join(HIER, ".env"))

try:
    import anthropic
except ImportError:
    sys.exit("❌ Draai eerst: pip install -r code/requirements.txt")

# ── Configuratie & guardrails ────────────────────────────────────────────────
MODEL = "claude-opus-4-8"
MAX_STAPPEN = 20
MAX_KOSTEN_USD = float(os.environ.get("MAX_DAGELIJKSE_KOSTEN_USD", "5.00"))
PRIJS_IN_PER_M, PRIJS_UIT_PER_M = 5.00, 25.00

LOGBESTAND = os.path.join(HIER, "agent.log")
GEHEUGENBESTAND = os.path.join(HIER, "geheugen.json")

# Binnengekomen klantvragen (zou uit je inbox/CRM/formulier komen).
KLANTVRAGEN = [
    {"van": "anna@example.com", "tekst": "Wat zijn jullie openingstijden?"},
    {"van": "bedrijf@example.com", "tekst": "We willen 500 producten op maat. Offerte mogelijk?"},
    {"van": "jan@example.com", "tekst": "Mijn bestelling #1234 is nog niet geleverd, kan je helpen?"},
]

SYSTEM_PROMPT_BASIS = """\
Je bent de klantenservice-agent van een klein dienstverlenend bedrijf.
Doel: klanten snel, vriendelijk en correct helpen.

Werkwijze:
- Beantwoord standaardvragen (openingstijden, status, beleid) zelf met de kennisbank-tool.
- Kwalificeer zakelijke aanvragen en grote orders, maar BELOOF nooit prijzen of kortingen zelf.
- Escaleer naar een mens (escaleer_naar_mens) bij: offertes/maatwerk, klachten over geld,
  juridische vragen, of alles wat je niet zeker weet.
- Houd antwoorden kort en concreet. Schrijf in het Nederlands.
"""


# ── Geheugen tussen runs ─────────────────────────────────────────────────────
def laad_geheugen() -> dict:
    if os.path.exists(GEHEUGENBESTAND):
        with open(GEHEUGENBESTAND, encoding="utf-8") as f:
            return json.load(f)
    return {"behandelde_klanten": [], "notities": []}


def bewaar_geheugen(geheugen: dict) -> None:
    with open(GEHEUGENBESTAND, "w", encoding="utf-8") as f:
        json.dump(geheugen, f, ensure_ascii=False, indent=2)


# ── Logging (wet 3) ──────────────────────────────────────────────────────────
def log(boodschap: str) -> None:
    regel = f"[{datetime.now().isoformat(timespec='seconds')}] {boodschap}"
    print(regel)
    with open(LOGBESTAND, "a", encoding="utf-8") as f:
        f.write(regel + "\n")


# ── Kostenmeter (wet 2) ──────────────────────────────────────────────────────
class Kostenmeter:
    def __init__(self, limiet: float):
        self.limiet, self.totaal = limiet, 0.0

    def tel_op(self, usage) -> None:
        self.totaal += (
            usage.input_tokens / 1_000_000 * PRIJS_IN_PER_M
            + usage.output_tokens / 1_000_000 * PRIJS_UIT_PER_M
        )

    def over_limiet(self) -> bool:
        return self.totaal >= self.limiet


# ── Tools ────────────────────────────────────────────────────────────────────
KENNISBANK = {
    "openingstijden": "Ma-vr 9:00-17:00, weekend gesloten.",
    "verzendbeleid": "Levering binnen 3-5 werkdagen in NL en BE.",
    "retourbeleid": "30 dagen retourrecht op ongebruikte producten.",
}


def zoek_kennisbank(onderwerp: str) -> str:
    for sleutel, waarde in KENNISBANK.items():
        if sleutel in onderwerp.lower() or onderwerp.lower() in sleutel:
            return waarde
    return "Niet gevonden in de kennisbank. Overweeg te escaleren naar een mens."


def check_bestelstatus(bestelnummer: str) -> str:
    # Nepdata; vervang door je echte ordersysteem.
    return f"Bestelling {bestelnummer}: onderweg, verwachte levering morgen."


def escaleer_naar_mens(samenvatting: str, reden: str) -> str:
    # Wet 4: mens-in-de-loop. In productie stuur je dit naar Slack/e-mail/ticketsysteem.
    log(f"🔔 ESCALATIE naar mens — reden: {reden}")
    log(f"   Samenvatting: {samenvatting}")
    return "Doorgestuurd naar een menselijke collega; die neemt het over."


TOOL_FUNCTIES = {
    "zoek_kennisbank": zoek_kennisbank,
    "check_bestelstatus": check_bestelstatus,
    "escaleer_naar_mens": escaleer_naar_mens,
}

TOOLS = [
    {
        "name": "zoek_kennisbank",
        "description": "Zoek een standaardantwoord op (openingstijden, verzend-/retourbeleid).",
        "input_schema": {
            "type": "object",
            "properties": {"onderwerp": {"type": "string"}},
            "required": ["onderwerp"],
        },
    },
    {
        "name": "check_bestelstatus",
        "description": "Haal de status van een bestelling op aan de hand van het bestelnummer.",
        "input_schema": {
            "type": "object",
            "properties": {"bestelnummer": {"type": "string"}},
            "required": ["bestelnummer"],
        },
    },
    {
        "name": "escaleer_naar_mens",
        "description": (
            "Draag een verzoek over aan een menselijke collega. Gebruik dit bij offertes, "
            "maatwerk, klachten over geld, juridische vragen of twijfel."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "samenvatting": {"type": "string", "description": "Korte samenvatting van het verzoek"},
                "reden": {"type": "string", "description": "Waarom dit naar een mens moet"},
            },
            "required": ["samenvatting", "reden"],
        },
    },
]


def voer_tool_uit(naam: str, invoer: dict) -> str:
    functie = TOOL_FUNCTIES.get(naam)
    if functie is None:
        return f"Onbekende tool: {naam}"
    try:
        return functie(**invoer)
    except Exception as e:  # noqa: BLE001
        return f"Fout in {naam}: {e}"


# ── De autonome lus (wet 1) ──────────────────────────────────────────────────
def behandel_vraag(client, meter: Kostenmeter, vraag: dict, geheugen: dict) -> None:
    log(f"📨 Nieuwe vraag van {vraag['van']}: {vraag['tekst']!r}")

    system = [{"type": "text", "text": SYSTEM_PROMPT_BASIS, "cache_control": {"type": "ephemeral"}}]
    messages = [
        {"role": "user", "content": f"Klant {vraag['van']} schrijft: {vraag['tekst']}"}
    ]

    for stap in range(1, MAX_STAPPEN + 1):
        if meter.over_limiet():
            log(f"🛑 Budgetlimiet bereikt (${meter.totaal:.4f}). Stop.")
            return

        response = client.messages.create(
            model=MODEL,
            max_tokens=2000,
            thinking={"type": "adaptive"},
            output_config={"effort": "medium"},
            system=system,
            tools=TOOLS,
            messages=messages,
        )
        meter.tel_op(response.usage)

        for block in response.content:
            if block.type == "text" and block.text.strip():
                log(f"💬 Antwoord aan klant: {block.text.strip()}")

        if response.stop_reason == "end_turn":
            break

        messages.append({"role": "assistant", "content": response.content})
        resultaten = []
        for block in response.content:
            if block.type == "tool_use":
                log(f"🔧 {block.name}({json.dumps(block.input, ensure_ascii=False)})")
                uitkomst = voer_tool_uit(block.name, block.input)
                log(f"   ↳ {uitkomst}")
                resultaten.append(
                    {"type": "tool_result", "tool_use_id": block.id, "content": uitkomst}
                )
        messages.append({"role": "user", "content": resultaten})
    else:
        log("🛑 Stap-limiet bereikt zonder afronding.")

    geheugen["behandelde_klanten"].append(vraag["van"])


def main() -> None:
    client = anthropic.Anthropic()
    meter = Kostenmeter(MAX_KOSTEN_USD)
    geheugen = laad_geheugen()

    log(f"🤖 Bedrijfsagent gestart. Budget ${MAX_KOSTEN_USD:.2f}, {len(KLANTVRAGEN)} vragen.")

    for vraag in KLANTVRAGEN:
        if meter.over_limiet():
            break
        behandel_vraag(client, meter, vraag, geheugen)
        log("—" * 50)

    bewaar_geheugen(geheugen)
    log(f"🏁 Klaar. Totale kosten: ${meter.totaal:.4f}. Log: {LOGBESTAND}")


if __name__ == "__main__":
    main()
