# Worked Example — From zero to your first customer in 7 days

> Goal: one complete, follow-along example that ties all the modules together. Copy-paste
> messages, prompts, and a day-by-day plan. Adapt it to your niche and get going.

This is no longer theory. We take one concrete little business and walk it all the way through:
from idea to the first paid invoice. The example: **SEO product descriptions for furniture web
shops.** The same pattern works for hundreds of niches — swap "furniture" for your market.

---

## The offer (modules 02 & 08)

> I help **furniture web shops** that don't have time to write good product copy, by
> **delivering compelling, SEO-friendly descriptions with an AI agent — ready to publish.**

Price: **€99 per month for 50 descriptions** (or €2 each to start).

### The numbers (know your margin)

```
Sale: 50 descriptions × €2          = €100.00
- API cost (~€0.02 per description) = €  1.00
- Other (email, hosting)            = €  4.00
─────────────────────────────────────────────
Gross margin per package            = €95.00  (95%)
```

Healthy. Your time goes into quality control and customer contact — not into the writing.

---

## Day 1 — Validate before you build (module 02)

Don't build anything yet. First find 5 potential customers and gauge interest. Send this message
(LinkedIn, email, or a web-shop owners' group). **Copy and adapt:**

> Subject: quick question about your product copy
>
> Hi [name], I came across your shop [name] — nice collection. Quick question: does writing
> product descriptions take you a lot of time? I help furniture web shops with SEO-friendly
> descriptions, ready to publish, for a fixed monthly fee. Would that interest you, and what
> would it be worth to you? No sales pitch — I just want to know if this is a real problem.

Goal for day 1: **3–5 replies** and at least one "yes, I'd pay for that." Listen to the
objections — you'll use them tomorrow.

---

## Day 2 — Design the agent (module 04 + the Claude.ai route)

Open claude.ai and refine your instruction together. This is the **system prompt** — copy it
straight into `agent_mvp.py`:

```
You are an experienced e-commerce copywriter specializing in furniture.
You write compelling, honest product copy that converts.

Rules:
- Tone: warm, expert, to the point. No exaggeration, no empty superlatives.
- Never invent specifications (dimensions, materials) that aren't in the brief.
- Always deliver: a catchy title, a flowing 2-4 sentence description,
  3 to 5 selling bullets, and 3 to 6 SEO keywords.
```

Test it in claude.ai with a real product from your prospect. Good enough? On to tomorrow.

---

## Day 3 — Deliver once, by hand (module 04)

Use `agent_mvp.py` (from the `code/` folder) with the prompt above. Fill the `WERKLIJST` (work
list) with 5 real products from your prospect and run:

```bash
python code/agent_mvp.py
```

Check each text by hand, polish where needed, and put them in a clean Google Doc or spreadsheet.
This is your **free sample delivery** — quality matters more than speed here.

---

## Day 4 — The sales conversation (module 08)

Send your sample to the prospect who was most interested. **Copy and adapt:**

> Hi [name], as a taster I went ahead and made 5 product descriptions for you — see the
> attachment. Feel free to publish them and see what they do. If you like it, I deliver 50 of
> these every month for €99. The first month is no-obligation. Shall I get you set up this week?

### Three common objections (and your reply)

| Objection | Your reply |
|-----------|------------|
| "Isn't it just AI?" | "Exactly — that's why it's fast and affordable. But I check every text myself, so you get AI speed with human quality." |
| "€99 is a lot" | "How many hours does it cost you now? For 50 texts I easily save you a full workday a month. Convert that to your hourly rate." |
| "I want to see it work first" | "Totally fair — that's why you already have 5 for free. Publish them, and only pay from the next batch." |

---

## Day 5 — Set up payment (module 09)

Keep it simple for customer number one:
- Send a **clean invoice** (or a **Stripe Payment Link** for €99).
- Set VAT aside (module 11).
- Record income and costs in a spreadsheet from euro one.

Automated payments and webhooks come later — first prove that people pay.

---

## Day 6 — Deliver and guardrails (modules 06 & 10)

Deliver the first real batch of 50 descriptions. Turn on your guardrails when you run it:
- a **daily budget** in `agent_mvp.py` (already built in),
- a **spending limit** in the Anthropic console,
- and check a **sample** of the output before you send it.

After delivery, ask for feedback and a short testimonial — you'll use it for customer two.

---

## Day 7 — Repeat and automate (module 12)

Now that you know it works:
- Reach out to 5 new furniture web shops with the same day-1 message.
- Write down every manual step from this week — that's your automation list.
- Automate the most tedious step first (e.g. drop the texts into a Google Sheet automatically via
  Zapier, module 09).

Repeat the cycle. Three to five customers in the same niche is a real, running little business.

---

## The 7-day checklist

- [ ] Day 1 — reached out to 5 prospects, at least 1 "yes, I'd pay for that"
- [ ] Day 2 — system prompt designed and tested in claude.ai
- [ ] Day 3 — delivered 5 texts by hand as a free sample
- [ ] Day 4 — sent the sales message, handled objections
- [ ] Day 5 — payment method set up (invoice or Payment Link)
- [ ] Day 6 — delivered first paid batch, guardrails on, asked for feedback
- [ ] Day 7 — reached out to 5 new prospects, automated the first step

---

## Handy tools (concrete)

| Function | Start with |
|----------|------------|
| AI engine | Claude API (`claude-opus-4-8`), or claude.ai to design |
| Running code | Python on your own computer (module 03) |
| Payments | Manual invoice, Stripe Payment Link, or Gumroad |
| Email/delivery | Google Docs/Sheets, a transactional email service |
| Integrations | Zapier (9,000+ apps) — start with 1 trigger + 1 action |
| Bookkeeping | A simple spreadsheet, later a bookkeeping tool |

---

## The core idea

This example works because it's **narrow** (one service, one niche), **validated before building**,
and **delivered semi-manually** until you know people pay. Swap the niche, keep the pattern, and
you have a playbook you can run again every week.

> Start today at day 1. One message actually sent is worth more than a week of perfecting.

---

## Next

→ [Back to overview](../README.md)
