# Module 06 — The Autonomous Loop

> Goal: build an agent that keeps working toward a goal on its own — robustly, affordably, and
> safely. This is the transition from "agent that does one task" to "agent that runs a process".

Associated code: [`code/business_agent.py`](../code/business_agent.py).

---

## What is "the loop"?

An autonomous agent runs in a cycle until its goal is reached:

```
        ┌──────────────────────────────────────────┐
        │                                          │
   ┌────▼─────┐   ┌──────────┐   ┌──────────────┐  │
   │ Think     │──▶│ Choose   │──▶│ Process      │──┘
   │ (plan)    │   │ a tool   │   │ result       │
   └───────────┘   └──────────┘   └──────────────┘
        │
        ▼ (goal reached?)
     Done ✅
```

The challenge isn't the loop itself (that's straightforward) — it's keeping it **safe and
affordable**. An uncontrolled loop is the single biggest risk with agents.

---

## The four laws of a safe loop

### Law 1 — Always a hard step limit

An agent must never run forever. Build in a counter:

```python
MAX_STEPS = 25
for step in range(MAX_STEPS):
    ...
else:
    log("Step limit reached — stopped.")
```

This prevents a stuck agent from draining your entire budget.

### Law 2 — Always a budget limit

Add up costs after every API call; stop at the limit. (See `CostMeter` in `agent_mvp.py` and
`business_agent.py`.) Also set a **hard limit in the Anthropic console** as a safety net.

### Law 3 — Always log

Log every decision, tool call, and result — with timestamp and cost. Without a log you'll never
know what your agent did when something goes wrong. An agent without logs is an agent you
cannot trust.

### Law 4 — Checkpoints on risky actions

Spending money, publishing something, anything irreversible: have the agent ask for approval
first (see modules 05 and 10). Autonomy is a sliding scale; start strict, relax as you build
trust in the agent.

---

## The loop at a glance

```
  ┌────────────────────────────────────────────────────┐
  │              Autonomous agent loop                 │
  │                                                    │
  │  ┌─────────┐                                       │
  │  │  Start  │                                       │
  │  └────┬────┘                                       │
  │       │                                            │
  │       ▼                         step > MAX_STEPS?  │
  │  ┌──────────┐  tool_use   ┌──────────┐  yes        │
  │  │  Model   │────────────▶│  Run     │──────► 🛑   │
  │  │  thinks  │◀────────────│  tool    │             │
  │  └──────────┘  result     └──────────┘             │
  │       │                        ▲                   │
  │       │ end_turn               │ risky action?     │
  │       ▼                        └── ask human ✋    │
  │  ┌──────────┐                                      │
  │  │  Done ✅ │                                      │
  │  └──────────┘                                      │
  └────────────────────────────────────────────────────┘
```

---

## Stopping at the right moment

The model signals why it stopped via `stop_reason`:

| `stop_reason` | Meaning | What you do |
|---------------|---------|-------------|
| `end_turn` | Model is done | Exit the loop |
| `tool_use` | Model wants to use a tool | Run the tool, return the result |
| `max_tokens` | Response was cut off | Increase `max_tokens` |
| `pause_turn` | Server-side tool paused | Resend to resume |
| `refusal` | Model refused (safety) | Do not retry; investigate |

Your loop keeps going as long as the model wants to use tools, and exits cleanly on `end_turn`.

---

## Controlling costs in a long loop: prompt caching

With an agent that has a large, fixed system prompt and many tools, you pay for that context on
every single step — unless you use **prompt caching**. With caching, repeated context becomes
nearly free (~90% cheaper). You mark your fixed context once:

```python
system=[
    {
        "type": "text",
        "text": LARGE_SYSTEM_PROMPT,
        "cache_control": {"type": "ephemeral"},   # cache this fixed context
    }
]
```

For long-running agents this can dramatically cut costs. Keep your system prompt and tool set
**stable** within a session — any change breaks the cache.

---

## Very long tasks: compaction

If an agent works for hours, the conversation grows until the context window fills up.
**Compaction** (beta) automatically summarizes older context so the agent can keep going. You
enable it and pass the summary blocks back each time. For most beginners this isn't needed yet —
just remember it exists for when your agents really start running long.

---

## Memory between sessions

A loop remembers nothing by default once it finishes. For a business you often want the agent to
learn and remember (customer preferences, past decisions). Three options:

1. **Your own storage** — write important facts to a file or database, and load them as context
   at startup. Simple and effective. (Used in `business_agent.py`.)
2. **Memory tool** — a tool that lets the agent write to and read from a memory store itself.
3. **Managed Agents with memory stores** — Anthropic manages persistent memory (module 07).

Start with option 1: a simple `memory.json` file you read in at the start and write out at the end.

> 💡 **In Claude.ai:** The claude.ai web chat gives Claude a short-term memory within one
> conversation, but it resets when you start a new chat. For persistent memory across sessions
> (customer preferences, running totals, decision history) you need the API with your own
> storage solution. Think of claude.ai as a great place to prototype and test logic, not as a
> long-running autonomous business agent.

---

## The complete business agent

[`code/business_agent.py`](../code/business_agent.py) brings everything together:

- An autonomous loop with step and budget limits (laws 1 & 2).
- Tools for reading, writing, and acting (module 05).
- Logging to file (law 3).
- A human-in-the-loop checkpoint on spending (law 4).
- Simple cross-run memory via a JSON file.

The scenario: an agent that handles daily customer inquiries for a service business — it
qualifies leads, answers standard questions on its own, and escalates complex or costly requests
to you. Run it:

```bash
python code/business_agent.py
```

Study the code line by line. This is the skeleton on which you build your own business agent.

---

## Your assignment

1. Run `business_agent.py` and follow the log lines.
2. Adjust the tools, system prompt, and checkpoint threshold to fit your business.
3. Deliberately apply all four laws when you write your own agent.
4. Let it run alongside your manual work for a day and compare the outcomes.

---

## Next up

→ [Module 07 — Managed Agents & scaling up](07-managed-agents.md)
