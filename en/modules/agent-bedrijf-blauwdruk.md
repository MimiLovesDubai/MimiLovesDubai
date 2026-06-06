# Capstone — Build your autonomous agent company (the blueprint)

> Goal: after this module you have a **running system of collaborating agents** that independently
> processes jobs, checks them, delivers, and tracks revenue — with you as the owner at the right
> checkpoints. This is the destination the whole course works toward.

Companion code: [`code/agent_company.py`](../code/agent_company.py).

---

## Honest first: what "autonomous" means here

You're building a **largely autonomous** business: the agents do the work, you approve the risky
moments (money, delivery to customers). That isn't a limitation but a strength — it keeps your
quality high and you legally safe (modules 10 & 11). "100% human-free, guaranteed income" does not
exist; a running system with human checkpoints does. This is what you have after this module.

---

## The architecture: a small company of agents

```
                         ┌──────────────────────────┐
   Jobs ───────────────▶ │  COORDINATOR             │  pulls work, drives the
   (inbox / form /       │  (the orchestration,     │  pipeline, watches the budget
    jobs.json)           │   in code)               │
                         └────────────┬─────────────┘
                                      │ per job
                ┌─────────────────────┼─────────────────────┐
                ▼                     ▼                     ▼
        ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
        │  WRITER       │ ──▶ │  REVIEWER     │ ──▶ │ CLIENT COMMS │
        │  (agent)      │ ◀── │  (agent, QA)  │     │ (delivery mail)│
        └──────────────┘ revise └──────────────┘     └──────┬───────┘
            makes deliverable   approves/rejects             │
                                                             ▼
                                                  ┌──────────────────┐
                                                  │  HUMAN (approval) │ ◀ guardrail
                                                  └────────┬─────────┘
                                                           ▼
                                             ┌──────────────────────────┐
                                             │ Delivery + LEDGER         │
                                             │ (revenue, cost, margin)   │
                                             └──────────────────────────┘
```

Four agent roles, one human checkpoint, and a ledger that tracks your revenue. Together they form
a company that does a day's work with a single command.

---

## How this ties all the modules together

| Part of the company | Comes from module |
|---------------------|-------------------|
| The agents and their prompts | 04 (first agent), 01 (what is an agent) |
| Tools & actions | 05 |
| The autonomous loop + revision | 06 |
| Budget, human-in-the-loop, logging | 10 |
| Multiple collaborating agents | 07 (Managed Agents / multi-agent) |
| Price, revenue, ledger | 08 |
| Delivery, email, payment | 09 |
| The 7-day path to your first customer | Worked example |

---

## The code: `agent_company.py`

The script implements exactly the architecture above:

- **Coordinator** — reads jobs from `jobs.json` (in reality: your inbox/CRM/form), watches the
  daily budget, and sends each job through the pipeline.
- **Writer** (agent) — produces the deliverable with structured output.
- **Reviewer** (agent) — checks for facts, style and completeness; gives a score and requests a
  revision if needed (up to `MAX_REVISIES`).
- **Client comms** — drafts a short delivery email (cheap model, since it's a simple task).
- **Human** — approves before delivery (skip with `--auto` for unattended runs).
- **Ledger** — books revenue per customer in `grootboek.json`, totals cost and margin.

Run it:

```bash
python code/agent_company.py            # with human approval per delivery
python code/agent_company.py --auto      # unattended (for scheduled runs)
```

You'll watch the agents collaborate: write → review → revise if needed → deliver → book. The
deliverables land in `code/outputs/`, the log in `code/company.log`, the revenue in
`code/grootboek.json`.

---

## Running it 24/7

A business that only runs when you start the script by hand isn't autonomous yet. Schedule it:

**Linux / Mac (cron) — every morning at 8:00:**

```bash
crontab -e
# add (adjust the paths):
0 8 * * *  cd /path/to/project && /path/to/.venv/bin/python code/agent_company.py --auto >> code/cron.log 2>&1
```

**Windows:** use **Task Scheduler** → daily task → start `python code/agent_company.py --auto`.

**In the cloud / 24/7 without your own PC:** run it on a small server, or move to **Managed Agents**
(module 07), which run entirely on Anthropic's infrastructure.

> 💡 Only switch to `--auto` once you've checked the output for a while. Run supervised first, then
> let go gradually — autonomy is earned step by step (module 10).

---

## Scaling into a bigger company

- **More roles** — add agents: a research agent, an SEO agent, a customer-service agent.
- **Real integrations** — replace `jobs.json` with your real inbox/form, and the "delivery" with a
  real email tool (module 09) and payment (Stripe/Gumroad).
- **Multiple niches** — run the same system with different prompts for different markets.
- **Coordinator as an agent** — let a Managed-Agent coordinator decide itself which specialist is
  needed when (module 07).

---

## Definition of done ✅

After this module you have:

- [ ] A **group of collaborating agents** that processes jobs on its own (writer + reviewer + client comms, driven by a coordinator).
- [ ] **Quality control** built in (the reviewer approves/rejects and asks for revisions).
- [ ] **Guardrails**: daily budget, logging and human approval before delivery.
- [ ] A **ledger** that tracks your revenue, costs and margin.
- [ ] A way to **schedule it 24/7** (cron / Task Scheduler / cloud / Managed Agents).

That's a real, running AI-agent business. What it earns is up to your niche, your price and your
distribution (module 08 & the worked example) — but the machine is in place.

---

## Your assignment

1. Run `agent_company.py` and follow the collaboration between the agents.
2. Replace the prompts and `PRIJS_PER_OPDRACHT` (price per job) with your own business's.
3. Connect `jobs.json` to a real source of jobs, and delivery to email/payment.
4. Schedule it with cron or Task Scheduler and let it run supervised for a week first.

> Congratulations — you haven't just learned how agents run a business, you have one running. Head
> to the worked example for the path to your first paying customer.

---

## Next

→ [Back to overview](../README.md)
