# Module 07 — Managed Agents & Scaling Up

> Goal: run your agent 24/7 without managing any infrastructure yourself, and have multiple
> agents work together. This is how you go from "runs on my laptop" to "runs all the time."

Companion code: [`code/managed_agent_setup.py`](../code/managed_agent_setup.py).

---

## The Problem with Your Own Loop

The agents from modules 04–06 run on your computer, in your script. That's perfect for learning
and testing, but for a real business you want:

- **24/7 availability** (even when your laptop is off).
- **A secure sandbox** where the agent can read/write files and run code.
- **No server management** — no Linux servers, no uptime worries.

This is what **Managed Agents** are for: Anthropic runs the agent loop and a sandbox container
for you. You send messages in and get a stream of events back.

---

## How Managed Agents Work

There are three core concepts:

| Concept | What it is |
|---------|------------|
| **Agent** | A saved, versioned configuration: model, system prompt, tools, skills. Create once, reuse endlessly. |
| **Environment** | A template for the container (sandbox) in which the tools run. |
| **Session** | One running execution of an agent in an environment. This is where you send messages. |

> ⚠️ **The golden order:** create the **Agent once** (in a setup script), save its `id`, and
> then for every run just start a **Session** that references that id. Never create a new agent
> on every run — that's the most common mistake.

```
SETUP (once)                        RUNTIME (every run)
┌────────────────────┐             ┌──────────────────────────┐
│ environments.create │            │ sessions.create(          │
│ agents.create       │  ── id ──▶ │   agent=AGENT_ID,         │
│   → save AGENT_ID   │            │   environment_id=ENV_ID)  │
└────────────────────┘             │ events.send(...)          │
                                   │ events.stream(...)        │
                                   └──────────────────────────┘
```

> 💡 **In Claude.ai:** You can prototype your agent's system prompt and test instructions
> directly in the claude.ai chat interface before wiring them up via the API. It's a fast way to
> iterate on wording — just keep in mind that actually *running* a Managed Agent 24/7 requires
> the Anthropic API, not the web chat.

---

## What a Managed Agent Adds

- **Built-in toolset** (`agent_toolset_20260401`): bash, read/write/edit files,
  file search, web search, web fetch — ready to use out of the box.
- **A real working directory (container)** where the agent creates files (reports, Excel, code).
- **Skills**: ready-made expertise (e.g. `xlsx`, `docx`, `pptx`, `pdf`) that the agent
  uses automatically when needed.
- **MCP servers**: connect external services (GitHub, your own tools) with secure credential
  storage (vaults).
- **Persistent memory** (memory stores) that survives across sessions.
- **Automatic compaction & prompt caching** — long tasks stay affordable.

---

## Agent → Session: The Core Flow

This diagram shows how a single Agent config powers many independent Sessions:

```
  ┌──────────────────────────────────┐
  │            AGENT                 │
  │  model + system prompt + tools   │
  │  (created once, reused forever)  │
  └────────────────┬─────────────────┘
                   │  referenced by AGENT_ID
       ┌───────────┼───────────┐
       ▼           ▼           ▼
  ┌─────────┐ ┌─────────┐ ┌─────────┐
  │Session 1│ │Session 2│ │Session 3│   ← run in parallel
  │ task A  │ │ task B  │ │ task C  │
  │container│ │container│ │container│
  └────┬────┘ └────┬────┘ └────┬────┘
       │           │           │
       ▼           ▼           ▼
   result A    result B    result C
```

Each session is isolated — its own container and memory — so parallel jobs don't interfere.

---

## Setting Up a Managed Agent (Code)

See [`code/managed_agent_setup.py`](../code/managed_agent_setup.py) for a complete example.
The core:

```python
import anthropic
client = anthropic.Anthropic()

# 1. SETUP — once. Save these ids (in your .env, config, or database).
environment = client.beta.environments.create(
    name="my-business-env",
    config={"type": "cloud", "networking": {"type": "unrestricted"}},
)

agent = client.beta.agents.create(
    name="Research and reporting agent",
    model="claude-opus-4-8",
    system="You are a thorough market researcher. You deliver concise, well-supported reports.",
    tools=[{"type": "agent_toolset_20260401"}],   # bash, files, web search, etc.
    skills=[{"type": "anthropic", "skill_id": "xlsx"}],  # can create Excel files
)
print("Save these:", agent.id, environment.id)
```

```python
# 2. RUNTIME — every time you want work done.
session = client.beta.sessions.create(
    agent=AGENT_ID,                 # the saved id
    environment_id=ENV_ID,
    title="Market research: furniture trends",
)

# Open the stream first, then send your request (stream-first!).
stream = client.beta.sessions.events.stream(session_id=session.id)
client.beta.sessions.events.send(
    session_id=session.id,
    events=[{"type": "user.message",
             "content": [{"type": "text", "text": "Research the top 5 furniture trends this year and create an Excel summary."}]}],
)

for event in stream:
    if event.type == "agent.message":
        for block in event.content:
            if block.type == "text":
                print(block.text, end="", flush=True)
    elif event.type == "session.status_idle":
        break
```

The agent searches the web on its own, creates an Excel file in its container, and you download
the result afterwards via the Files API. No server, no maintenance.

---

## Outcomes: Let the Agent Keep Working Until It's Truly Done

A powerful pattern for business work is an **outcome**: you describe what "done" means
with a testable rubric, and a separate evaluator has the agent iterate and improve until the
result meets the criteria (or a limit is reached).

```python
client.beta.sessions.events.send(
    session_id=session.id,
    events=[{
        "type": "user.define_outcome",
        "description": "Build a DCF valuation model for company X in Excel.",
        "rubric": {"type": "text", "content": RUBRIC_MARKDOWN},
        "max_iterations": 5,
    }],
)
```

For services with a clear "definition of done" (reports, models, analyses) this dramatically
improves quality — the agent only delivers when the checklist is green.

---

## Having Multiple Agents Work Together

For larger operations you have a **coordinator agent** delegate to specialized sub-agents
(each with their own model, prompt, and tools):

```python
orchestrator = client.beta.agents.create(
    name="Operations lead",
    model="claude-opus-4-8",
    system="You coordinate. Delegate research and writing to your specialists.",
    tools=[{"type": "agent_toolset_20260401"}],
    multiagent={"type": "coordinator", "agents": [researcher.id, writer.id]},
)
```

Don't start here. One agent that does one thing well is almost always the right starting point.
Multi-agent is for when you want to scale a proven process.

```
Single-agent flow (start here)         Multi-agent flow (scale later)
┌──────────────────────┐              ┌─────────────────────────────────────┐
│  User request        │              │  User request                       │
│        │             │              │        │                            │
│        ▼             │              │        ▼                            │
│  🤖 One agent        │              │  🤖 Coordinator agent               │
│   (does everything)  │              │     │           │                   │
│        │             │              │     ▼           ▼                   │
│  Result delivered    │              │  🤖 Researcher  🤖 Writer           │
└──────────────────────┘              │     │           │                   │
                                      │     └─────┬─────┘                   │
                                      │           ▼                         │
                                      │    Result delivered                 │
                                      └─────────────────────────────────────┘
```

---

## When to Use What

| Situation | Choose |
|-----------|--------|
| Learning, testing, simple tasks | Your own loop on your laptop (modules 04–06) |
| 24/7 running, sandbox needed, no server management | **Managed Agents** |
| Fixed, predictable steps | Workflow (not an agent) |
| Scaling a proven process | Multi-agent / multiple sessions |

---

## Your Assignment

1. Read through `managed_agent_setup.py` (running it requires API access to the Managed Agents beta).
2. Decide: does your business need 24/7 running, or is a scheduled run on your own machine
   (e.g. via a cron job or a cloud task scheduler) enough for now?
3. Sketch out which built-in tools and skills your agent would use.

> 💡 You don't need to use Managed Agents right away. Many profitable agent businesses run
> just fine on a scheduled script. Switch over when you actually need it.

---

## Next Up

→ [Module 08 — Making money: monetization](08-monetisatie.md)
