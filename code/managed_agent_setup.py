"""
managed_agent_setup.py — Een Managed Agent opzetten en aansturen (24/7, op Anthropic's infra).

Toont de gouden volgorde:
  SETUP (één keer)  : environment + agent aanmaken, id's bewaren.
  RUNTIME (elke run): session starten, opdracht sturen, gebeurtenissen streamen.

Draai SETUP één keer en zet de geprinte id's in code/.env:
    AGENT_ID=agent_...
    ENV_ID=env_...

Daarna draai je RUNTIME zo vaak je wilt.

    python code/managed_agent_setup.py setup     # eenmalig
    python code/managed_agent_setup.py run "Onderzoek de top 5 meubeltrends en maak een Excel."

Let op: Managed Agents is een beta-functie. Je hebt API-toegang nodig en een recente
'anthropic' SDK. Hoort bij module 07 van "De Autonome Onderneming".
"""

import os
import sys

from dotenv import load_dotenv

HIER = os.path.dirname(__file__)
ENV_PAD = os.path.join(HIER, ".env")
load_dotenv(ENV_PAD)

try:
    import anthropic
except ImportError:
    sys.exit("❌ Draai eerst: pip install -r code/requirements.txt")

client = anthropic.Anthropic()

SYSTEM_PROMPT = """\
Je bent een grondige Nederlandse marktonderzoeker en rapporteur.
Je zoekt actuele, betrouwbare informatie op het web, controleert je bronnen, en levert
beknopte, onderbouwde rapporten. Waar gevraagd lever je een net Excel-overzicht.
Vermeld altijd je bronnen. Verzin nooit cijfers.
"""


def setup() -> None:
    """Maak environment + agent EENMALIG aan. Bewaar de geprinte id's in .env."""
    print("🏗️  Environment aanmaken...")
    environment = client.beta.environments.create(
        name="autonome-onderneming-env",
        config={"type": "cloud", "networking": {"type": "unrestricted"}},
    )

    print("🤖 Agent aanmaken...")
    agent = client.beta.agents.create(
        name="Onderzoeks- en rapportage-agent",
        model="claude-opus-4-8",
        system=SYSTEM_PROMPT,
        tools=[{"type": "agent_toolset_20260401"}],          # bash, files, web search, etc.
        skills=[{"type": "anthropic", "skill_id": "xlsx"}],  # kan Excel maken
    )

    print("\n✅ Klaar! Zet deze regels in code/.env:\n")
    print(f"AGENT_ID={agent.id}")
    print(f"ENV_ID={environment.id}")
    print("\n(De agent is geversioneerd en herbruikbaar. Maak hem niet bij elke run opnieuw aan.)")


def run(opdracht: str) -> None:
    """Start een session voor de bewaarde agent en voer een opdracht uit."""
    agent_id = os.environ.get("AGENT_ID")
    env_id = os.environ.get("ENV_ID")
    if not agent_id or not env_id:
        sys.exit("❌ AGENT_ID en/of ENV_ID ontbreken in .env. Draai eerst: ... setup")

    print(f"🚀 Sessie starten voor agent {agent_id}...")
    session = client.beta.sessions.create(
        agent=agent_id,
        environment_id=env_id,
        title="Onderzoeksopdracht",
    )
    print(f"   Volg live in de console: "
          f"https://platform.claude.com/workspaces/default/sessions/{session.id}\n")

    # Stream-first: open de stream VOORDAT je de opdracht stuurt.
    stream = client.beta.sessions.events.stream(session_id=session.id)
    client.beta.sessions.events.send(
        session_id=session.id,
        events=[{"type": "user.message", "content": [{"type": "text", "text": opdracht}]}],
    )

    print("📡 Live uitvoer van de agent:\n")
    for event in stream:
        if event.type == "agent.message":
            for block in event.content:
                if block.type == "text":
                    print(block.text, end="", flush=True)
        elif event.type == "session.status_idle":
            # Idle met een terminale stop_reason = klaar. (requires_action = wacht op jou.)
            if getattr(event.stop_reason, "type", "") != "requires_action":
                break
        elif event.type == "session.status_terminated":
            break

    # Eventuele bestanden die de agent maakte (Excel, rapporten) staan in /mnt/session/outputs/.
    print("\n\n📁 Gemaakte bestanden ophalen...")
    try:
        bestanden = client.beta.files.list(
            scope_id=session.id, betas=["managed-agents-2026-04-01"]
        )
        for f in bestanden.data:
            print(f"   • {f.filename} ({f.size_bytes} bytes)")
            inhoud = client.beta.files.download(f.id)
            doelpad = os.path.join(HIER, "outputs", f.filename)
            os.makedirs(os.path.dirname(doelpad), exist_ok=True)
            inhoud.write_to_file(doelpad)
            print(f"     ↳ opgeslagen in {doelpad}")
    except Exception as e:  # noqa: BLE001
        print(f"   (Geen bestanden of fout bij ophalen: {e})")

    print("\n🏁 Sessie klaar.")


def main() -> None:
    if len(sys.argv) < 2 or sys.argv[1] not in {"setup", "run"}:
        sys.exit("Gebruik:\n  python code/managed_agent_setup.py setup\n"
                 '  python code/managed_agent_setup.py run "<opdracht>"')
    if sys.argv[1] == "setup":
        setup()
    else:
        opdracht = " ".join(sys.argv[2:]) or "Onderzoek de top 5 meubeltrends en maak een Excel-overzicht."
        run(opdracht)


if __name__ == "__main__":
    main()
