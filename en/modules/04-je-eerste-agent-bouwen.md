# Module 04 — Building Your First Agent

> Goal: run a working agent that performs a real business task. We build up from a
> single prompt to a simple agent.

Associated code: [`code/agent_mvp.py`](../code/agent_mvp.py).

---

## First: a single prompt (the building block)

Everything starts with one API call. This is the core you'll use hundreds of times:

```python
import os
from dotenv import load_dotenv
import anthropic

load_dotenv("code/.env")
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1000,
    system="You are an experienced e-commerce copywriter. Write compelling, honest copy.",
    messages=[
        {"role": "user", "content": "Write a product description for an oak dining table."}
    ],
)

for block in response.content:
    if block.type == "text":
        print(block.text)
```

Three things to remember:
- **`system`** = who the agent is and what the rules are (your most important control lever).
- **`messages`** = the conversation; always starts with a `user` message.
- **`response.content`** = a list of blocks; extract the `text` blocks.

This is not an agent — it's one question, one answer. But it is the engine behind everything.

---

## Turning on adaptive thinking & effort

For more serious work, you let the model think before it responds. With Opus 4.8 you do this with
**adaptive thinking** (the model decides how deeply to think) and the **effort** level:

```python
response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=2000,
    thinking={"type": "adaptive"},          # model thinks where needed
    output_config={"effort": "high"},        # depth/cost level: low|medium|high|xhigh|max
    system="...",
    messages=[...],
)
```

> Note (Opus 4.8/4.7): do NOT use `temperature`, `top_p`, or `budget_tokens` — these have been
> removed and will produce an error. You steer the model through your prompt and the `effort` level.

---

## From prompt to agent: structured output

An agent often needs to return a **reliable, machine-readable** result, not just free-form text.
For that you use `messages.parse()` with a schema (via Pydantic). This gives you guaranteed valid,
structured data back:

```python
from pydantic import BaseModel

class ProductListing(BaseModel):
    title: str
    description: str
    bullets: list[str]
    seo_keywords: list[str]

response = client.messages.parse(
    model="claude-opus-4-8",
    max_tokens=2000,
    messages=[{"role": "user", "content": "Create a listing for an oak dining table."}],
    output_format=ProductListing,
)

result = response.parsed_output   # a validated ProductListing object
print(result.title)
print(result.bullets)
```

This is enormously powerful for a business: you can feed the output directly into a database,
webshop, or email without wrestling with text parsing.

---

## What makes an agent different: handling multiple tasks autonomously

`agent_mvp.py` shows a first form of autonomy: you give the agent a **task list** and
a **role**, and it processes them one by one, with logging and a cost counter. It's not yet a
full tool-using loop (that's modules 05 and 06), but it shows the pattern:

```
for each task in the work list:
    let the agent execute the task
    validate and store the result
    add up the cost
    stop if the daily budget limit is reached
```

Run it:

```bash
python code/agent_mvp.py
```

You'll see the agent generate a set of product descriptions, neatly structured, with a cost
summary at the end. Adjust the `WORK_LIST` at the top of the file to match your own business task.

---

## How a single prompt becomes an agent

```
  ┌──────────────────────────────────────────────────────┐
  │                   agent_mvp.py                       │
  │                                                      │
  │  WORK_LIST                                           │
  │     │                                                │
  │     ├──► Task 1 ──► API call ──► Result 1 ──► log  │
  │     ├──► Task 2 ──► API call ──► Result 2 ──► log  │
  │     └──► Task 3 ──► API call ──► Result 3 ──► log  │
  │                                       │              │
  │                                  Cost counter        │
  │                               (stop at budget) 🛑   │
  └──────────────────────────────────────────────────────┘
```

Each task runs through the same API call. The model doesn't yet decide what to do next on its
own — that's the agentic loop in modules 05 and 06. But it's already doing real, automated work.

> 💡 **In Claude.ai:** The system prompt is the perfect thing to design and refine in the
> claude.ai web chat. Paste your draft system prompt, then test it with sample user messages.
> Once the output looks right, copy the prompt into your Python script. Running the full
> automated task list requires the Python API — claude.ai handles one conversation at a time.

---

## The system prompt: your most important tool

90% of your agent's quality lives in the system prompt. A good system prompt contains:

1. **Role** — "You are an experienced e-commerce copywriter specializing in furniture."
2. **Goal** — "Write copy that converts and is honest."
3. **Style & rules** — "Tone: warm and knowledgeable. Never exaggerate. Always 3–5 bullets."
4. **Boundaries** — "Don't invent specs you don't know. When in doubt: leave it out."
5. **Output format** — "Provide a title, description, bullets, and keywords."

Use the [template](../templates/agent-system-prompt-template.md) as a starting point. Iterate:
run, review the output, improve the prompt, repeat. This "prompt tuning" is a core skill.

> Tip for Opus 4.8: the model follows instructions very literally and is cautious about
> overstating things. Write your instructions as clear facts and guidelines, not as shouty
> "YOU MUST ALWAYS..."-commands — that tends to backfire.

---

## Common beginner mistakes

- **`max_tokens` too low** → response gets cut off. Set it generously (1,000–4,000 for text).
- **No `.env` file** → API key hardcoded in your script. Never do this.
- **Everything on Opus** → expensive. Use Haiku for simple tasks (module 03).
- **No logging** → you don't know what your agent did or what it cost. Always log (module 10).

---

## Your assignment

1. Run `agent_mvp.py` unchanged.
2. Replace the `WORK_LIST` and the system prompt with your own business task from module 02.
3. Iterate on the system prompt until the output is good enough to show a client.
4. Deliver the output once "by hand" to a real (potential) client — feedback is gold.

---

## Next up

→ [Module 05 — Giving Tools to Your Agent](05-tools-en-acties.md)

There you'll learn the difference between talking and doing: how your agent performs real
actions in the world using tools.
