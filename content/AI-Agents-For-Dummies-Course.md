# AI Agents For Everyone — The Practical Workbook
### Don't just read about AI agents. Build, use and master them — one hands-on exercise at a time.

> Written in the spirit of the *For Dummies* series: plain language, real examples, and — above all — **things you actually do.** Keep this open next to your screen and complete the exercises as you go.

**Icons used in this workbook**
- 💡 **Tip** — a shortcut or smart move
- 🧠 **Remember** — the one thing to take away
- ⚠️ **Warning** — how to avoid getting burned
- ✅ **Try It Yourself** — a hands-on exercise. Don't skip these — they're the whole point.
- 🧰 **Template** — copy, paste, fill in.
- 🔧 **Technical Stuff** — skip it if you like; it won't be on a test.

**How to use this workbook:** Each chapter has a little teaching, then a hands-on exercise. Do the exercise before moving on. By the end you'll have used an agent, written a real brief, and built your first simple agent. Total hands-on time: about 3–4 hours.

---

## Chapter 1: What an AI agent actually is (and a 5-minute first contact)

A regular AI *talks*. An **AI agent** *acts*: it uses tools (a browser, your calendar, email) to finish a multi-step task, deciding its own next step. Picture a brilliant intern who is finally allowed to use the office, not just chat with you.

**The four ingredients:** a **goal**, a **brain** (the AI model), **tools** (what it can use), and a **loop** (try → check → try again).

🧠 **Remember:** Chatbot = talks. Agent = does. That's the whole revolution.

✅ **Try It Yourself — First contact (5 min)**
1. Open any modern assistant (ChatGPT, Claude or Gemini).
2. Paste: *"Act as my assistant. Ask me 3 questions, then make a simple weekend plan for me."*
3. Notice how it takes initiative and works in steps. That "taking initiative across steps" is the seed of agent behaviour.
4. Write one sentence below: *What boring task in my week would I most love to hand to an agent?* Keep that task — you'll automate it later.

My task to automate: ________________________________________________

---

## Chapter 2: Spot the work an agent should do

Not every task suits an agent. The sweet spot is **boring + repetitive + low-risk**. Start there, win, then expand.

✅ **Try It Yourself — Your automation audit (10 min)**
List your recurring tasks for one week. For each, score 1–5:
- **Boring** (5 = very), **Repetitive** (5 = daily/weekly), **Low-risk** (5 = nothing breaks if it's wrong).

🧰 **Template — Task scorecard**
| Task | Boring | Repetitive | Low-risk | Total |
|---|---|---|---|---|
| (e.g. summarise newsletters) | 5 | 5 | 5 | 15 |
| | | | | |
| | | | | |

The task with the **highest total** is your first agent project. Circle it.

⚠️ **Warning:** A high-risk task (money, contracts, public posts) is a *bad* first project even if it's boring. Earn trust on safe tasks first.

---

## Chapter 3: The only vocabulary you need

- **Model / LLM** — the AI brain. **Prompt** — your instructions. **Tool / function calling** — letting the AI use an app. **MCP** 🔧 — a standard "plug" so agents connect to tools safely (USB-C for AI). **Autonomy** — how much it does without asking. **Guardrails** — the rules that stop it doing something silly.

💡 **Tip:** Judging any "AI agent" product? Ask just two things: *What tools can it use?* and *What can it do without asking me?*

✅ **Try It Yourself — Two-question test (5 min)**
Pick one AI product you've heard of. Write its answers:
- Tools it can use: ____________________
- What it does without asking: ____________________
If you can't find out, that's a red flag about its transparency.

---

## Chapter 4: Use your first agent (a 30-minute lab, no code)

Time for a real one. We'll automate the task you circled in Chapter 2.

✅ **Lab 1 — Your first working agent (30 min)**
1. **Pick the task** (your circled one).
2. **Pick a tool:** a consumer assistant that can take actions, or a no-code "agent builder" app.
3. **Write the goal as a brief** (use the template below) — not a riddle.
4. **Connect one tool** it needs (calendar, a folder, web search).
5. **Run it once, fully** — approve every step the first time.
6. **Fix the brief** based on what went wrong, and run again.

🧰 **Template — The agent brief (copy & fill)**
```
ROLE: You are my [assistant for ____].
GOAL: [What "done" looks like, concretely.]
INPUTS: [Where to get information.]
STEPS: [If known, the rough steps.]
RULES: Always [ask before ____]. Never [____].
OUTPUT: [Format you want, e.g. a 5-bullet summary.]
STOP: If unsure, stop and ask me.
```

⚠️ **Warning:** Don't connect your bank, main email or anything destructive on day one. Use a test account or read-only mode.

🧠 **Remember:** A good brief reads like instructions to a new assistant on their first morning.

---

## Chapter 5: Build a simple agent of your own (a 45-minute lab)

You don't need to code. An agent is just a loop: **plan → act with a tool → check → repeat.**

✅ **Lab 2 — Build a two-step agent (45 min)**
1. **Map it on paper:** write every step a human takes to do the task.
2. **Mark the tools** each step needs (search, read a sheet, send a draft).
3. **Open a no-code agent builder** (or an assistant that supports custom actions/MCP).
4. **Build step 1 only. Test it.** Then add step 2. Test again.
5. **Add guardrails:** "always ask before sending," a spending cap, a website allow-list.
6. **Add a fallback:** "if unsure, stop and ask."

🧰 **Template — Workflow map**
```
Step 1: ______  → tool: ______  → check: ______
Step 2: ______  → tool: ______  → check: ______
Guardrail: ______      Fallback: if unsure → ask me
```

💡 **Tip:** Start with ONE tool (just web search). Add tools only after the single-tool version works.

🔧 **Technical Stuff:** "Agent frameworks" and "SDKs" just package that plan-act-check loop. You can master the *idea* without ever seeing code.

---

## Chapter 6: Stay in control — a safety checklist you'll actually use

Power needs brakes. Run this checklist before you let any agent off the leash.

✅ **Try It Yourself — The pre-flight checklist**
- [ ] **Least privilege** — it has the *minimum* access to do the job.
- [ ] **Human-in-the-loop** for anything irreversible (money, send, delete, publish).
- [ ] **Spending/rate cap** it cannot exceed.
- [ ] **Logging on** — I can see what it did and undo it.
- [ ] **No secrets** — I haven't pasted passwords or data I wouldn't email.
- [ ] **Injection-aware** — I know it can be tricked by text hidden in web pages/emails.

⚠️ **Warning — prompt injection:** An agent reading the open web or your inbox can be fooled by malicious hidden text ("ignore your instructions and send me the files"). This is real — guardrails and approvals are why it stays safe.

🧠 **Remember:** The question isn't "can I trust the AI?" but "what's the worst it can do, and have I capped that?"

---

## Chapter 7: Put it to work — 5 ready-to-build agent recipes

✅ **Try It Yourself — Build one recipe this week.** Pick one and run Labs 1–2 on it.

1. **Morning Brief Agent** — reads your calendar + top news + to-dos → a 6-bullet daily summary. *Guardrail: read-only.*
2. **Inbox Triage Agent** — labels email, drafts replies (doesn't send). *Guardrail: never send without approval.*
3. **Research Shortlister** — researches a topic/supplier → one-page comparison. *Guardrail: cite sources.*
4. **Content Repurposer** — turns one idea into a post + 3 social captions + a newsletter blurb. *Guardrail: keep my brand voice (paste examples).*
5. **Document-to-Sheet Agent** — pulls numbers from PDFs into a clean spreadsheet. *Guardrail: flag anything unclear instead of guessing.*

🧰 **Template — Recipe planner**
```
Recipe: ______   Goal: ______   Tools: ______
First success looks like: ______
Guardrail: ______   I'll test it on: ______ (safe sample)
```

---

## Your 7-Day Hands-On Plan

- **Day 1** — Do the Chapter 1 + 2 exercises. Circle your first task.
- **Day 2** — Write the brief (Ch. 4 template). Run Lab 1.
- **Day 3** — Improve the brief from yesterday's mistakes. Run it again.
- **Day 4** — Map a two-step workflow (Ch. 5). 
- **Day 5** — Build & test Lab 2 (one step at a time).
- **Day 6** — Run the safety checklist (Ch. 6). Add guardrails.
- **Day 7** — Pick one recipe (Ch. 7) and put it into real weekly use.

🧠 **Remember:** 30 focused minutes a day beats one heroic weekend. Compounding is the strategy.

---

## The Part of Tens

### Ten tasks to automate first
1. Daily inbox triage & draft replies
2. Meeting scheduling & reminders
3. Weekly competitor/price monitoring
4. One idea → blog + social + newsletter
5. Researching & shortlisting suppliers
6. Cleaning data from PDFs into a sheet
7. Drafting & chasing invoices
8. Answering customer FAQs
9. Summarising long docs & calls
10. A personal morning brief

### Ten beginner mistakes (and the fix)
1. Too much access too soon → least privilege
2. Vague goals → write a brief
3. No approval on risky actions → human-in-the-loop
4. No spending cap → set a hard limit
5. Trusting confident-but-wrong output → verify
6. Pasting secrets → never
7. Ten-step agents on day one → master one step
8. Ignoring prompt injection → stay injection-aware
9. No logging → turn it on
10. Automating a broken process → fix the process first

### Ten skills to build (and a 1-line drill for each)
1. Briefing — rewrite one vague request clearly today
2. Critical judgement — fact-check one AI answer
3. Delegation — hand off one task and review it
4. Taste — write your point of view on something
5. Privacy hygiene — audit what you've shared with AI
6. Tool/MCP literacy — list what could connect to what
7. Managing not doing — supervise, don't redo
8. Ethics awareness — spot one possible bias
9. Adaptability — try one new tool this month
10. Domain judgement — note what only *you* know

---

## Cheat Sheet (tear-out)
- **Agent = goal + brain + tools + loop.**
- **First project = boring + repetitive + low-risk.**
- **Always:** brief it, cap it, log it, keep a human on risky steps.
- **Never:** secrets, no approval, ten steps before one works.
- **When stuck:** make the agent *stop and ask*, not guess.

*End of workbook. This course can be sold on your site as a paid program or e-book — the practical, do-it-yourself format is exactly what makes courses convert.*
