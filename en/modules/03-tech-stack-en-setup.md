# Module 03 — Tech stack & setup

> Goal: set up your working environment, get your API key, and understand what it costs — so you
> can start building immediately in module 04.

---

## The stack we use

We deliberately keep it simple and production-ready:

| Component | Choice | Why |
|-----------|--------|-----|
| Language | **Python 3.10+** | Most widely used language for AI, readable |
| Model API | **Claude API** (Anthropic) | Strong at agent work, tool use, long-running tasks |
| Primary model | **Claude Opus 4.8** (`claude-opus-4-8`) | Most capable for autonomous work |
| Lightweight model | **Claude Haiku 4.5** (`claude-haiku-4-5`) | Fast & cheap for simple subtasks |
| SDK | `anthropic` (official) | Officially supported, reliable |
| Secrets | `.env` + `python-dotenv` | Keys never in code |

Later (module 09) integrations are added: Stripe (payments), email, and optionally Zapier
for 9,000+ apps without custom code.

```
How the pieces fit together
─────────────────────────────────────────────────────────

  ┌─────────────┐       API call        ┌──────────────────┐
  │  Your       │ ───────────────────► │  Anthropic       │
  │  Python     │                      │  Claude API      │
  │  script     │ ◄─────────────────── │  (Opus / Haiku)  │
  └──────┬──────┘       response        └──────────────────┘
         │
         │ reads
         ▼
  ┌─────────────┐
  │  .env file  │  ← ANTHROPIC_API_KEY (never commit this)
  └─────────────┘
         │
         │ calls
         ▼
  ┌──────────────────────────────────┐
  │  Tools (your functions)          │
  │  e.g. get_inventory(), send_email│
  └──────────────────────────────────┘
```

---

## Step 1 — Install Python

Check whether you have Python 3.10 or higher:

```bash
python3 --version
```

No Python or an outdated version? Download from [python.org](https://www.python.org/downloads/).

---

## Step 2 — Set up the project

```bash
# Inside the course directory:
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r code/requirements.txt
```

The virtual environment (`.venv`) keeps your dependencies neatly isolated per project.

---

## Step 3 — Get an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com).
2. Create an account and log in.
3. Add a payment method and set a **spending limit** (Settings → Limits). Do this now —
   it's your first guardrail.
4. Go to **API Keys** → **Create Key**. Copy the key (`sk-ant-...`). You'll only see it once.

> 🔐 **Security:** never share your key, never commit it to Git, never put it in
> frontend code. Whoever has your key spends your money.

---

## Step 4 — Store the key in a `.env` file

```bash
cp code/.env.example code/.env
```

Open `code/.env` and fill in:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

The `.env` file is listed in `.gitignore` and will never be committed. Good.

---

## Step 5 — Test that it works

```bash
python code/test_verbinding.py
```

Do you see a friendly response from Claude? Then your foundation is solid. If not: check your
key and your internet connection, and read the error message (usually a typo in the key or
insufficient account balance).

> 💡 **In Claude.ai:** Before running any Python code, you can test your ideas directly in the claude.ai web app — paste a system prompt, describe a task, and see how the model responds. This is perfect for validating your agent's instructions. When you're ready to run a fully autonomous 24/7 agent, you'll need the API (which you're setting up right now).

---

## What does this cost? (understanding pricing)

You pay per **token** (roughly ¾ of a word), separately for input and output. Current reference prices:

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Use case |
|-------|--------------------:|---------------------:|----------|
| Claude Opus 4.8 (`claude-opus-4-8`) | $5.00 | $25.00 | Heavy agent work |
| Claude Sonnet 4.6 (`claude-sonnet-4-6`) | $3.00 | $15.00 | Balanced speed/intelligence |
| Claude Haiku 4.5 (`claude-haiku-4-5`) | $1.00 | $5.00 | Simple, fast tasks |

> Prices may change — always check [the current pricing page](https://platform.claude.com/docs/en/pricing).

### A worked example

An agent that writes one product description uses roughly ~2,000 tokens in and ~500 out on
Opus 4.8:
- Input: 2,000 / 1,000,000 × $5 = $0.01
- Output: 500 / 1,000,000 × $25 = $0.0125
- **Total: ~$0.02 per description.**

If you sell that for $2, your margin is 100×. This is exactly why per-unit pricing needs to
be healthy.

```
Cost vs. price sanity check
────────────────────────────────────────
  API cost per task:  ~$0.02
                         │
                         ▼  multiply by your margin target
  Minimum sell price: ~$0.20  (10× — thin but viable)
  Healthy sell price: ~$2.00  (100× — strong margin)
  Premium sell price: ~$5.00+ (250×+ — consultancy / high-value output)

  Rule: know your cost per task before you set your price.
```

### Three ways to keep costs low

1. **Use the right model for each task.** Use Haiku 4.5 for simple work, Opus 4.8 only where
   it matters.
2. **Prompt caching** — reuse large, fixed context (instructions, examples) cheaply.
   Saves up to ~90% on repeated input. (Covered in module 06.)
3. **Count tokens upfront** with the `count_tokens` function when you're unsure about a task's size.

And always: a **hard spending limit** in the console and in your code (module 10).

---

## The effort level: intelligence vs. cost

With Opus 4.8 you can set how deeply the model thinks and how much it "outputs" via
`output_config={"effort": ...}`:

- `low` — fast and cheap, for simple tasks.
- `medium` — a good balance.
- `high` — the default; for most serious tasks (recommended for agent work).
- `xhigh` / `max` — for the hardest, highest-value tasks (more expensive).

Combine with "adaptive thinking" (`thinking={"type": "adaptive"}`): the model itself decides
when and how much to think. You'll see this in the code starting from module 04.

---

## Your assignment

1. Complete steps 1–5 until `test_verbinding.py` runs successfully.
2. Set a spending limit in the console (e.g., $25 for this course).
3. Read any error messages carefully if something goes wrong — learning to debug is part of the craft.

---

## Next

→ [Module 04 — Building your first agent](04-je-eerste-agent-bouwen.md)
