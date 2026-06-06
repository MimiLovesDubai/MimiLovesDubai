# Module 01 — What is an AI agent?

> Goal: understand what an agent is technically, so you know what you're building and when you should
> or shouldn't use one.

---

## The spectrum: from prompt to agent

Not everything that uses AI is an "agent." There is a spectrum, and choosing the right level
saves you money and headaches.

### Level 1 — A single prompt (one question, one answer)

You send text to the model, you get text back. Done.

> "Write a product description for this chair." → description.

Good for: classifying, summarizing, translating, generating. Cheap and predictable. **Start
here if you can.** Many "AI businesses" don't need an agent at all — a smart sequence of
individual prompts is enough.

### Level 2 — A workflow (you control the steps)

You write the code that defines the steps: step A → step B → decision → step C. The model
does one thing per step; your code stays in charge.

> Fetch product → generate description → check length → save to database.

Good for: predictable, repeatable processes. Reliable because you hard-code the logic.

### Level 3 — An agent (the model decides the steps)

Now the model gets **tools** (actions it can take) and a **goal**. The model itself decides
which steps to take, in what order, and when it's done. It runs in a **loop**: think → choose tool → review result → next step → ... → done.

> Goal: "Process all new orders from today." The agent checks which orders exist, decides
> what's needed for each one, uses the right tools, and stops when everything is handled.

Good for: tasks you can't fully script in advance, where judgment and flexibility are needed.
More powerful, but more expensive and less predictable — so use guardrails.

```
Level 1 — Single Prompt
─────────────────────────
  You ──► [Prompt] ──► Model ──► Answer

Level 2 — Workflow
─────────────────────────────────────────────
  Your code controls the sequence:
  [Step A] ──► [Step B] ──► [Decision?]
                                 │yes          │no
                              [Step C]      [Step D]

Level 3 — Agent (agentic loop)
──────────────────────────────────────────────────
  Goal given by you
       │
       ▼
  ┌─────────────────────────────────────────────┐
  │  Model THINKS: what's the next step?        │◄─┐
  │       │                                     │  │
  │       ▼                                     │  │
  │  Model ACTS: calls a Tool                   │  │
  │       │                                     │  │
  │       ▼                                     │  │
  │  Tool runs, returns result                  │──┘
  │       │                                     │
  │  Done? ──yes──► Return final output         │
  └─────────────────────────────────────────────┘
```

> 💡 **In Claude.ai:** You can prototype an agent's reasoning at Level 1 or 2 right in the chat — paste your data, describe the task, and watch how Claude approaches it. This is a fast way to validate your logic before writing any code.

---

## When should you use a real agent?

Use these four questions (from Anthropic's own agent design guidelines):

1. **Complexity** — Is the task multi-step and hard to fully specify in advance? (Yes → an agent
   may make sense. No → use a workflow or a single prompt.)
2. **Value** — Does the outcome justify the higher cost and latency of an agent?
3. **Feasibility** — Is the model good at this type of task?
4. **Cost of errors** — Can you catch and recover from mistakes (review, rollback, tests)?

If any answer is "no," stay at a simpler level. **An agent is not the goal —
delivering value is the goal.** Most profitable automations are workflows with an occasional
agentic step.

---

## The anatomy of an agent

Every agent consists of five parts:

```
┌─────────────────────────────────────────────────┐
│  1. MODEL         the brain (Claude Opus 4.8)    │
│  2. SYSTEM PROMPT who the agent is + its rules   │
│  3. TOOLS         what the agent can DO           │
│  4. LOOP          think → act → repeat            │
│  5. GUARDRAILS    limits, checkpoints, logging    │
└─────────────────────────────────────────────────┘
```

- **Model** — the reasoning engine. We use `claude-opus-4-8` for heavy lifting and
  `claude-haiku-4-5` for simple, fast subtasks.
- **System prompt** — the instruction that defines the role, goal, and boundaries. This is your
  most important control lever. (Template in [`templates/agent-system-prompt-template.md`](../templates/agent-system-prompt-template.md).)
- **Tools** — functions the agent can call: a store API, an email sender, a database, a payment
  system. Without tools an agent can only talk; with tools it can act. (Module 05.)
- **Loop** — the cycle in which the agent works autonomously until the goal is reached. (Module 06.)
- **Guardrails** — the safety layer that prevents it from burning money or causing damage.
  (Module 10.)

> 💡 **In Claude.ai:** Use a Claude.ai Project to write and refine your system prompt interactively. Paste draft instructions, test them with realistic scenarios in the chat, and iterate quickly — no code required. Once the prompt is solid, copy it into your Python code.

---

## A concrete example

Suppose: an agent that manages the inventory of an online store.

| Component | Details |
|-----------|---------|
| Model | `claude-opus-4-8` |
| System prompt | "You are an inventory manager. Keep stock healthy, reorder when below 10 units, ask for approval above $500." |
| Tools | `get_inventory()`, `get_sales_data()`, `place_order()`, `ask_human()` |
| Loop | Check inventory → analyze sales → decide per product → order or request approval → log |
| Guardrails | Max $500 per order without approval; log everything; daily spend limit |

This agent saves hours of manual inventory work every day — that is the "save time" lever
from module 00, translated into concrete money.

---

## Key terms (glossary)

- **Token** — the unit in which text is counted and billed. Roughly ¾ of a word. You pay
  per million tokens in and out.
- **Context window** — how much text the model can "see" at once. Opus 4.8 has a 1 million token
  context — very generous.
- **Tool use / function calling** — the mechanism by which the model calls your functions.
- **System prompt** — the overarching instruction that sits outside the conversation.
- **Agentic loop** — the repeating cycle of thinking and acting.
- **Managed Agent** — an agent that runs entirely on Anthropic's infrastructure (module 07).

---

## Your assignment

For your idea (from module 00), determine which level you need:
- Can it be done with **single prompts**? → Cheap, start there.
- Do you have a **fixed workflow**? → Write out the steps.
- Do you truly need **flexible autonomy**? → Agent.

Be honest. Most first products start at level 1 or 2 and only grow to level 3 later.

---

## Next

→ [Module 02 — Choose your business model](02-business-model-kiezen.md)
