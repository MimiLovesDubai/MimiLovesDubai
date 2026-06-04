"""
test_verbinding.py — Controleer of je Claude API-sleutel werkt.

Draai dit als allereerste, na het invullen van code/.env:
    python code/test_verbinding.py

Hoort bij module 03 van "De Autonome Onderneming".
"""

import os
import sys

from dotenv import load_dotenv

# Laad .env uit dezelfde map als dit script.
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

try:
    import anthropic
except ImportError:
    sys.exit("❌ Pakket 'anthropic' niet gevonden. Draai: pip install -r code/requirements.txt")

api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key or api_key.startswith("sk-ant-vul"):
    sys.exit(
        "❌ Geen geldige ANTHROPIC_API_KEY gevonden.\n"
        "   Kopieer code/.env.example naar code/.env en vul je echte sleutel in.\n"
        "   Haal een sleutel op via https://console.anthropic.com"
    )

client = anthropic.Anthropic()  # leest ANTHROPIC_API_KEY automatisch uit de omgeving

print("🔌 Verbinding maken met de Claude API...\n")

try:
    response = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=300,
        messages=[
            {
                "role": "user",
                "content": (
                    "Je bent de motor van een AI-agent-cursus. Schrijf in het Nederlands één "
                    "korte, opbeurende zin (max 25 woorden) die de cursist motiveert om zijn "
                    "eerste autonome bedrijfsagent te bouwen."
                ),
            }
        ],
    )
except anthropic.AuthenticationError:
    sys.exit("❌ Sleutel afgewezen. Controleer ANTHROPIC_API_KEY in code/.env.")
except anthropic.APIConnectionError:
    sys.exit("❌ Geen verbinding. Controleer je internet.")
except anthropic.APIStatusError as e:
    sys.exit(f"❌ API-fout {e.status_code}: {e.message}")

tekst = next((b.text for b in response.content if b.type == "text"), "")
print("✅ Het werkt! Claude zegt:\n")
print(f"   « {tekst.strip()} »\n")

gebruik = response.usage
print(
    f"📊 Tokens — invoer: {gebruik.input_tokens}, uitvoer: {gebruik.output_tokens}. "
    "Dit kostte je een fractie van een cent."
)
print("\n➡️  Ga door naar module 04 en bouw je eerste agent.")
