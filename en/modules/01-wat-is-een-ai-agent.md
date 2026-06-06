# Module 01 — What is an AI agent?

> Goal: understand what an agent is technically, so you know what you're building and when you
> should or shouldn't use one.

---

## The spectrum: from prompt to agent

Not everything that uses AI is an "agent." There's a spectrum, and choosing the right level
saves you money and headaches.

### Level 1 — A single prompt (one question, one answer)

You send text to the model, you get text back. Done.

> "Write a product description for this chair." → description.

Good for: classifying, summarizing, translating, generating. Cheap and predictable. **Start
here if you can.** Many "AI businesses" don't need an agent at all — a smart sequence of
standalone prompts is enough.

### Level 2 — A workflow (you control the steps)

You write the code that defines the steps: step A → step B → decision → step C. The model
does one thing per step; your code stays in control.

> Fetch product → generate description → check length → save to database.

Good for: predictable, repeatable processes. Reliable because you define the logic.

### Level 3 — An agent (the model decides the steps)

Now the model is given **tools** (actions it can perform) and a **goal**. The model decides
for itself which steps to take, in what order, and when it's done. It runs in a
**loop**: think → choose tool → check result → next step → ... → done.

> Goal: "Process all new orders from today." The agent looks up which orders exist,
> decides what's needed for each one, uses the right tools, and stops when everything is finished.

Good for: tasks you can't fully script in advance, where judgment and flexibility are needed.
More powerful, but more expensive and less predictable — so use guardrails.

---

## When do you choose a real agent?

Use these four questions (from Anthropic's own agent design guidelines):

1. **Complexity** — Is the task multi-step and hard to fully specify in advance? (Yes → an agent
   may make sense. No → use a workflow or a standalone prompt.)
2. **Value** — Does the outcome justify the higher cost and latency of an agent?
3. **Feasibility** — Is the model good at this type of task?
4. **Cost of mistakes** — Can you catch and recover from errors (review, rollback, tests)?

If any answer is "no," stay at a simpler level. **An agent is not the goal —
delivering value is the goal.** Most profitable automations are workflows with the occasional
agentic step.

---

## The anatomy of an agent

Every agent consists of five components:

```
┌─────────────────────────────────────────────────┐
│  1. MODEL        the brain (Claude Opus 4.8)     │
│  2. SYSTEM PROMPT who the agent is + its rules   │
│  3. TOOLS        what the agent can DO           │
│  4. LOOP         think → act → repeat            │
│  5. GUARDRAILS   limits, checkpoints, logging    │
└─────────────────────────────────────────────────┘
```

- **Model** — the reasoning engine. We use `claude-opus-4-8` for heavy lifting and
  `claude-haiku-4-5` for simple, fast subtasks.
- **System prompt** — the instruction that defines the role, goal, and boundaries. This is your
  most important control mechanism. (Template in [`templates/agent-system-prompt-template.md`](../templates/agent-system-prompt-template.md).)
- **Tools** — functions the agent can call: a store API, an email sender, a
  database, a payment system. Without tools an agent can only talk; with tools it can act. (Module 05.)
- **Loop** — the cycle in which the agent works autonomously until the goal is reached. (Module 06.)
- **Guardrails** — the safety layer that stops it from burning money or causing harm.
  (Module 10.)

---

## The agentic loop — step by step

```
         ┌──────────────────────┐
         │   GOAL (from user)   │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
    ┌───►│  THINK (model reads  │
    │    │  context + tools)    │
    │    └──────────┬───────────┘
    │               │
    │    ┌──────────▼───────────┐
    │    │  CHOOSE A TOOL       │
    │    │  (or finish)         │
    │    └──────────┬───────────┘
    │               │
    │    ┌──────────▼───────────┐
    │    │  EXECUTE TOOL        │
    │    │  (real-world action) │
    │    └──────────┬───────────┘
    │               │
    │    ┌──────────▼───────────┐
    │    │  READ RESULT         │
    └────┤  (add to context)    │  ← loop continues
         └──────────┬───────────┘
                    │  (goal reached?)
                    ▼
         ┌──────────────────────┐
         │   DONE — return      │
         │   final output       │
         └──────────────────────┘
```

> 💡 **In Claude.ai:** You can simulate the agentic loop manually in claude.ai to test your
> system prompt before writing any code. Paste your draft system prompt at the top of the
> conversation, then describe a scenario and see how Claude responds. Iterate until the behavior
> feels right. Note: actually running the loop autonomously (calling real tools, repeating
> automatically) requires the API or Claude Code — claude.ai handles one turn at a time.

---

## A concrete example

Suppose: an agent that manages the inventory of an online store.

| Component | Details |
|-----------|---------|
| Model | `claude-opus-4-8` |
| System prompt | "You are an inventory manager. Keep stock healthy, reorder below 10 units, ask for approval above $500." |
| Tools | `get_inventory()`, `get_sales_data()`, `place_order()`, `ask_human()` |
| Loop | Check inventory → analyze sales → decide per product → order or request approval → log |
| Guardrails | Max $500 per order without approval; log everything; daily spending cap |

This agent saves hours of manual inventory work every day — that's the "saving time" lever
from module 00, translated into concrete money.

---

## Key terms (glossary)

- **Token** — the unit in which text is counted and billed. Roughly ¾ of a word. You pay
  per million tokens in and out.
- **Context window** — how much text the model can "see" at once. Opus 4.8 has a 1 million token
  context window — very generous.
- **Tool use / function calling** — the mechanism by which the model calls your functions.
- **System prompt** — the overarching instruction that sits outside the conversation.
- **Agentic loop** — the repeating cycle of thinking and acting.
- **Managed Agent** — an agent that runs entirely on Anthropic's infrastructure (module 07).

---

## Your assignment

For your idea (from module 00), decide which level you need:
- Can it be done with **standalone prompts**? → Cheap, start there.
- Do you have a **fixed workflow**? → Write out the steps.
- Do you genuinely need **flexible autonomy**? → Agent.

Be honest. Most first products start at level 1 or 2 and only grow to level 3 later.

---

## Up next

→ [Module 02 — Choose your business model](02-business-model-kiezen.md)
