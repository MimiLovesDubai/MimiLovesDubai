# Module 07 — Managed Agents & opschalen

> Doel: je agent 24/7 laten draaien zonder dat je zelf de infrastructuur beheert, en meerdere
> agents laten samenwerken. Dit is hoe je van "draait op mijn laptop" naar "draait altijd" gaat.

Bijbehorende code: [`code/managed_agent_setup.py`](../code/managed_agent_setup.py).

---

## Het probleem met je eigen lus

De agents uit module 04–06 draaien op jouw computer, in jouw script. Dat is perfect om te leren
en te testen, maar voor een echt bedrijf wil je:

- **24/7 beschikbaarheid** (ook als je laptop uit staat).
- **Een veilige sandbox** waarin de agent bestanden kan lezen/schrijven en code kan draaien.
- **Geen serverbeheer** — geen Linux-servers, geen uptime-zorgen.

Hiervoor bestaan **Managed Agents**: Anthropic draait de agent-lus én een sandbox-container voor
je. Jij stuurt berichten in en krijgt een stroom gebeurtenissen terug.

---

## Hoe Managed Agents werken

Er zijn drie kernbegrippen:

| Begrip | Wat het is |
|--------|------------|
| **Agent** | Een opgeslagen, geversioneerde configuratie: model, system prompt, tools, skills. Eénmaal aanmaken, eindeloos hergebruiken. |
| **Environment** | Een sjabloon voor de container (sandbox) waarin de tools draaien. |
| **Session** | Eén draaiende uitvoering van een agent in een environment. Hier stuur je berichten naartoe. |

> ⚠️ **De gouden volgorde:** maak de **Agent één keer** aan (in een setup-script), bewaar zijn
> `id`, en start daarna bij elke run alleen een **Session** die naar dat id verwijst. Maak nooit
> bij elke run een nieuwe agent aan — dat is de meestgemaakte fout.

```
SETUP (één keer)                    RUNTIME (elke keer)
┌────────────────────┐             ┌──────────────────────────┐
│ environments.create │            │ sessions.create(          │
│ agents.create       │  ── id ──▶ │   agent=AGENT_ID,         │
│   → bewaar AGENT_ID │            │   environment_id=ENV_ID)  │
└────────────────────┘             │ events.send(...)          │
                                   │ events.stream(...)        │
                                   └──────────────────────────┘
```

---

## Wat een Managed Agent extra kan

- **Ingebouwde toolset** (`agent_toolset_20260401`): bash, bestanden lezen/schrijven/bewerken,
  zoeken in bestanden, web search, web fetch — kant-en-klaar.
- **Een echte werkmap (container)** waarin de agent bestanden maakt (rapporten, Excel, code).
- **Skills**: kant-en-klare expertise (bijv. `xlsx`, `docx`, `pptx`, `pdf`) die de agent
  automatisch inzet wanneer nodig.
- **MCP-servers**: koppel externe diensten (GitHub, je eigen tools) met veilige credential-opslag
  (vaults).
- **Persistent geheugen** (memory stores) dat sessies overleeft.
- **Automatische compaction & prompt caching** — lange taken blijven betaalbaar.

---

## Een Managed Agent opzetten (code)

Zie [`code/managed_agent_setup.py`](../code/managed_agent_setup.py) voor een volledig voorbeeld.
De kern:

```python
import anthropic
client = anthropic.Anthropic()

# 1. SETUP — één keer. Bewaar deze id's (in je .env, config of database).
environment = client.beta.environments.create(
    name="mijn-bedrijf-env",
    config={"type": "cloud", "networking": {"type": "unrestricted"}},
)

agent = client.beta.agents.create(
    name="Onderzoeks- en rapportage-agent",
    model="claude-opus-4-8",
    system="Je bent een grondige marktonderzoeker. Je levert beknopte, onderbouwde rapporten.",
    tools=[{"type": "agent_toolset_20260401"}],   # bash, files, web search, etc.
    skills=[{"type": "anthropic", "skill_id": "xlsx"}],  # kan Excel-bestanden maken
)
print("Bewaar deze:", agent.id, environment.id)
```

```python
# 2. RUNTIME — elke keer dat je werk wilt laten doen.
session = client.beta.sessions.create(
    agent=AGENT_ID,                 # het bewaarde id
    environment_id=ENV_ID,
    title="Marktonderzoek meubeltrends",
)

# Open eerst de stream, stuur dan je opdracht (stream-first!).
stream = client.beta.sessions.events.stream(session_id=session.id)
client.beta.sessions.events.send(
    session_id=session.id,
    events=[{"type": "user.message",
             "content": [{"type": "text", "text": "Onderzoek de top 5 meubeltrends van dit jaar en maak een Excel-overzicht."}]}],
)

for event in stream:
    if event.type == "agent.message":
        for block in event.content:
            if block.type == "text":
                print(block.text, end="", flush=True)
    elif event.type == "session.status_idle":
        break
```

De agent zoekt zelf op het web, maakt een Excel-bestand in zijn container, en jij downloadt het
resultaat achteraf via de Files-API. Geen server, geen onderhoud.

---

## Outcomes: laat de agent doorwerken tot het écht af is

Een krachtig patroon voor bedrijfswerk is een **outcome**: je beschrijft wat "klaar" betekent
met een toetsbare rubriek, en een aparte beoordelaar laat de agent net zo lang itereren en
verbeteren tot het resultaat voldoet (of een limiet bereikt).

```python
client.beta.sessions.events.send(
    session_id=session.id,
    events=[{
        "type": "user.define_outcome",
        "description": "Maak een DCF-waarderingsmodel voor bedrijf X in Excel.",
        "rubric": {"type": "text", "content": RUBRIEK_MARKDOWN},
        "max_iterations": 5,
    }],
)
```

Voor diensten met een duidelijke "definitie van klaar" (rapporten, modellen, analyses) verhoogt
dit de kwaliteit enorm — de agent levert pas op als de checklist groen is.

---

## Meerdere agents laten samenwerken

Voor grotere operaties laat je een **coördinator-agent** delegeren aan gespecialiseerde
sub-agents (elk met eigen model, prompt en tools):

```python
orchestrator = client.beta.agents.create(
    name="Operations-lead",
    model="claude-opus-4-8",
    system="Jij coördineert. Delegeer onderzoek en schrijfwerk aan je specialisten.",
    tools=[{"type": "agent_toolset_20260401"}],
    multiagent={"type": "coordinator", "agents": [onderzoeker.id, schrijver.id]},
)
```

Begin hier níet mee. Eén agent die één ding goed doet is bijna altijd het juiste startpunt.
Multi-agent is voor als je een bewezen proces wilt opschalen.

---

## Wanneer gebruik je wat?

| Situatie | Kies |
|----------|------|
| Leren, testen, simpele taken | Eigen lus op je laptop (module 04–06) |
| 24/7 draaien, sandbox nodig, geen serverbeheer willen | **Managed Agents** |
| Vaste, voorspelbare stappen | Workflow (geen agent) |
| Bewezen proces opschalen | Multi-agent / meerdere sessies |

---

## Jouw opdracht

1. Lees `managed_agent_setup.py` door (draaien vereist API-toegang tot de Managed Agents-beta).
2. Beslis: heeft jouw bedrijf 24/7-draaien nodig, of is een geplande run op je eigen machine
   (bijv. via een cron-job of de cloud-taakplanner) voorlopig genoeg?
3. Schets welke ingebouwde tools/skills jouw agent zou gebruiken.

> 💡 Je hoeft Managed Agents niet meteen te gebruiken. Veel winstgevende agent-bedrijven draaien
> prima op een geplande run van een eigen script. Stap over wanneer je het écht nodig hebt.

---

## Verder

→ [Module 08 — Geld verdienen: monetisatie](08-monetisatie.md)
