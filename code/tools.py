"""
tools.py — Een agent die echte acties uitvoert via tools, met een mens-in-de-loop checkpoint.

Dit voorbeeld toont een voorraadbeheer-agent. Hij mag zelfstandig voorraad checken en
verkoopdata lezen, maar voor het plaatsen van een bestelling boven een drempelbedrag
moet hij EERST om menselijke goedkeuring vragen. Zo combineer je autonomie met veiligheid.

We gebruiken de HANDMATIGE lus (niet de tool runner) juist omdat we het checkpoint willen
inbouwen vóór risicovolle acties.

Draai:
    python code/tools.py

Hoort bij module 05 van "De Autonome Onderneming".
"""

import json
import os
import sys

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

try:
    import anthropic
except ImportError:
    sys.exit("❌ Draai eerst: pip install -r code/requirements.txt")

MODEL = "claude-opus-4-8"
GOEDKEURING_DREMPEL_EUR = 200.0  # bestellingen hierboven vereisen menselijke goedkeuring

# ── Nep-"database" (vervang door je echte webshop/leverancier-API) ───────────
VOORRAAD = {"stoel-001": 3, "tafel-002": 25, "lamp-003": 1}
INKOOPPRIJS = {"stoel-001": 80.0, "tafel-002": 150.0, "lamp-003": 45.0}
VERKOCHT_LAATSTE_30D = {"stoel-001": 40, "tafel-002": 12, "lamp-003": 22}


# ── Tool-implementaties (jouw code, jouw regie) ──────────────────────────────
def get_voorraad(product_id: str) -> str:
    aantal = VOORRAAD.get(product_id)
    if aantal is None:
        return f"Onbekend product: {product_id}"
    return f"{product_id}: {aantal} stuks op voorraad."


def get_verkoopdata(product_id: str) -> str:
    verkocht = VERKOCHT_LAATSTE_30D.get(product_id, 0)
    return f"{product_id}: {verkocht} stuks verkocht in de afgelopen 30 dagen."


def plaats_bestelling(product_id: str, aantal: int) -> str:
    prijs = INKOOPPRIJS.get(product_id, 0) * aantal
    # ── Mens-in-de-loop checkpoint ──
    if prijs > GOEDKEURING_DREMPEL_EUR:
        print(f"\n🔔 GOEDKEURING NODIG: bestel {aantal}x {product_id} voor €{prijs:.2f}")
        antwoord = input("   Goedkeuren? (j/n): ").strip().lower()
        if antwoord != "j":
            return f"Bestelling AFGEWEZEN door mens: {aantal}x {product_id}."
    VOORRAAD[product_id] = VOORRAAD.get(product_id, 0) + aantal
    return f"Bestelling geplaatst: {aantal}x {product_id} voor €{prijs:.2f}. Levering ~3 dagen."


TOOL_FUNCTIES = {
    "get_voorraad": get_voorraad,
    "get_verkoopdata": get_verkoopdata,
    "plaats_bestelling": plaats_bestelling,
}

TOOLS = [
    {
        "name": "get_voorraad",
        "description": "Haal de huidige voorraad (aantal stuks) op voor een product.",
        "input_schema": {
            "type": "object",
            "properties": {"product_id": {"type": "string"}},
            "required": ["product_id"],
        },
    },
    {
        "name": "get_verkoopdata",
        "description": "Haal het aantal verkochte stuks van de afgelopen 30 dagen op.",
        "input_schema": {
            "type": "object",
            "properties": {"product_id": {"type": "string"}},
            "required": ["product_id"],
        },
    },
    {
        "name": "plaats_bestelling",
        "description": (
            "Plaats een inkoopbestelling bij de leverancier. Gebruik dit pas nadat je "
            "voorraad en verkoopdata hebt bekeken en een onderbouwde hoeveelheid hebt bepaald."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "product_id": {"type": "string"},
                "aantal": {"type": "integer", "description": "Aantal te bestellen stuks"},
            },
            "required": ["product_id", "aantal"],
        },
    },
]

SYSTEM_PROMPT = """\
Je bent een zorgvuldige voorraadbeheerder voor een meubelwebshop.
Doel: zorg dat populaire producten niet uitverkocht raken, zonder onnodig in te kopen.

Werkwijze:
- Bekijk altijd EERST de voorraad én de verkoopdata voordat je iets bestelt.
- Bestel bij wanneer de voorraad lager is dan ongeveer een halve maand verkoop.
- Bestel een redelijke hoeveelheid (ongeveer een maand verkoop), niet meer.
- Leg kort uit waarom je een beslissing neemt.
- Als een product gezond op voorraad is, bestel je niets.
"""


def voer_tool_uit(naam: str, invoer: dict) -> str:
    functie = TOOL_FUNCTIES.get(naam)
    if functie is None:
        return f"Onbekende tool: {naam}"
    try:
        return functie(**invoer)
    except Exception as e:  # noqa: BLE001 — we geven fouten terug aan het model
        return f"Fout bij uitvoeren van {naam}: {e}"


def main() -> None:
    client = anthropic.Anthropic()
    opdracht = (
        "Controleer de producten stoel-001, tafel-002 en lamp-003. Bestel bij waar nodig "
        "op basis van voorraad en verkoop. Geef daarna een kort overzicht van je acties."
    )
    messages = [{"role": "user", "content": opdracht}]

    print("🤖 Voorraad-agent gestart...\n")
    stap = 0
    while True:
        stap += 1
        if stap > 15:  # harde lus-limiet (guardrail tegen oneindig doordraaien)
            print("🛑 Maximaal aantal stappen bereikt. Stop.")
            break

        response = client.messages.create(
            model=MODEL,
            max_tokens=4000,
            thinking={"type": "adaptive"},
            output_config={"effort": "high"},
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )

        # Toon eventuele tekst van het model.
        for block in response.content:
            if block.type == "text" and block.text.strip():
                print(f"💬 {block.text.strip()}\n")

        if response.stop_reason == "end_turn":
            break

        messages.append({"role": "assistant", "content": response.content})

        tool_resultaten = []
        for block in response.content:
            if block.type == "tool_use":
                print(f"🔧 Tool: {block.name}({json.dumps(block.input, ensure_ascii=False)})")
                resultaat = voer_tool_uit(block.name, block.input)
                print(f"   ↳ {resultaat}\n")
                tool_resultaten.append(
                    {"type": "tool_result", "tool_use_id": block.id, "content": resultaat}
                )

        messages.append({"role": "user", "content": tool_resultaten})

    print("🏁 Agent klaar.")


if __name__ == "__main__":
    main()
