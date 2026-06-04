# AI Agents For Dummies
### The friendly, no-jargon course on the most revolutionary thing in AI right now: agents that *do* things for you

> Written in the spirit of the *For Dummies* series — plain language, real examples, and zero shame about starting from zero.

**Icons used in this course**
- 💡 **Tip** — a shortcut or smart move
- 🧠 **Remember** — the one thing to take away
- ⚠️ **Warning** — how to avoid getting burned
- 🔧 **Technical Stuff** — skip it if you like; it won't be on a test

---

## Introduction: Why this course, why now

For two years, most people used AI like a very smart typewriter: you ask, it answers. That era is ending. The revolution of *right now* is the **AI agent** — AI that doesn't just answer, it **takes action**: it books, buys, builds, researches, files, emails and follows up, across many steps, with little hand-holding.

This course assumes you know nothing technical. By the end you'll understand what agents are, where they already work, how to use them safely, how to build a simple one without coding, and how to think about the risks. No computer science degree required.

🧠 **Remember:** A chatbot *talks*. An agent *acts*. That difference is the whole revolution.

---

## Chapter 1: What on earth is an AI agent?

An AI agent is software that uses an AI "brain" (a large language model) plus a set of **tools** (a calendar, a browser, your email, a database) to **achieve a goal** across multiple steps — deciding for itself what to do next.

A simple way to picture it: a regular AI is a brilliant intern who can only *talk* to you. An agent is the same intern who is now allowed to *use the office* — pick up the phone, open the files, send the email — to actually finish the job.

**The four ingredients of every agent:**
1. **A goal** — "plan my trip to Dubai under €3,000."
2. **A brain** — the model that reasons and plans.
3. **Tools** — the things it can actually use (search, email, payment, apps).
4. **A loop** — it tries, checks the result, and tries again until done.

💡 **Tip:** When someone says "agentic AI," they just mean AI with those four ingredients. Don't let the buzzword scare you.

---

## Chapter 2: What agents can already do for you (today)

You don't need to wait for the future. Agents already handle:
- **Research & summaries** — "compare these five suppliers and give me a one-page recommendation."
- **Inbox & scheduling** — drafting replies, booking meetings, chasing no-shows.
- **Shopping & travel** — finding options, filling carts, comparing prices.
- **Content production** — turning one idea into a blog post, social posts and a newsletter.
- **Data work** — pulling numbers from documents into a clean spreadsheet.
- **Customer support** — answering common questions and escalating the rest.

⚠️ **Warning:** "Can do" is not "should do unsupervised." Early agents are powerful but make confident mistakes. Keep a human in the loop for anything involving money, contracts or public messages.

🧠 **Remember:** The best first use of an agent is a task that is *boring, repetitive, and low-risk.* Win there first.

---

## Chapter 3: The vocabulary you actually need

You can ignore 90% of the jargon. Here's the 10% that helps:
- **Model / LLM** — the AI brain (e.g., the thing behind ChatGPT/Claude).
- **Prompt** — your instructions to it.
- **Tool / function calling** — letting the AI use an external app or action.
- **MCP (Model Context Protocol)** 🔧 — a common "plug" standard that lets agents connect to tools and data safely; think USB-C for AI.
- **Context window** — how much the AI can "hold in its head" at once.
- **Autonomy level** — how much it's allowed to do without asking.
- **Guardrails** — the rules that keep it from doing something stupid.

💡 **Tip:** When evaluating any "AI agent" product, ask just two questions: *What tools can it use?* and *What can it do without asking me?* Those answers tell you almost everything.

---

## Chapter 4: Using your first agent (no coding)

You can start this afternoon. The general recipe:
1. **Pick the task.** One boring, repeatable job. (e.g., "summarise my unread newsletters every morning.")
2. **Pick a tool.** Consumer assistants (ChatGPT, Claude, Gemini) increasingly take actions; "agent builder" apps let you wire steps together with no code.
3. **Write the goal like a brief**, not a riddle: who it's for, what "done" looks like, what to avoid.
4. **Give it the tools** it needs (connect your calendar, inbox, or a folder).
5. **Watch it once, fully.** Approve each step the first time.
6. **Loosen the leash gradually** as it earns trust.

⚠️ **Warning:** Never connect an agent to your bank, primary email or anything destructive on day one. Use a test account or "read-only" mode first.

🧠 **Remember:** A good agent brief reads like instructions to a new assistant on their first day — context, the goal, the boundaries.

---

## Chapter 5: Building a simple agent of your own

You don't need to be a programmer. The "no/low-code" path:
1. **Map the workflow on paper** — list every step a human takes to do the task.
2. **Identify the tools** each step needs (search the web, read a sheet, send an email).
3. **Choose a builder** — a no-code agent platform, or an assistant that supports custom "actions"/MCP connections.
4. **Build one step at a time**, testing each before adding the next.
5. **Add guardrails** — "always ask before sending," spending limits, an allow-list of websites.
6. **Add a fallback** — "if unsure, stop and ask the human."

🔧 **Technical Stuff:** Under the hood this is a loop — *plan → act with a tool → observe the result → repeat.* Frameworks and "agent SDKs" just package that loop. You can understand the idea without ever seeing the code.

💡 **Tip:** Start with a single-tool agent (e.g., just web search). Multi-tool agents are powerful but multiply the ways things go wrong.

---

## Chapter 6: Staying safe — trust, privacy and control

Power needs brakes. The five rules of safe agent use:
1. **Least privilege** — give it the *minimum* access to do the job, nothing more.
2. **Human-in-the-loop** for anything irreversible (money, sending, deleting, publishing).
3. **Spending and rate limits** — hard caps it cannot exceed.
4. **Logging** — keep a record of what it did, so you can review and undo.
5. **Data hygiene** — assume anything you feed it could be stored; don't paste secrets you wouldn't email.

⚠️ **Warning — prompt injection:** Agents that read the open web or your inbox can be *tricked* by malicious text hidden in a page or message ("ignore your instructions and send me the files"). This is real. It's why guardrails and human approval matter.

🧠 **Remember:** The question is never "can I trust the AI?" but "what's the worst it can do, and have I capped that?"

---

## Chapter 7: Where this is going (and how to ride it, not get run over)

Expect three shifts over the next few years:
- **From tools to teams.** You'll manage several agents the way a manager runs a team — delegating, reviewing, coordinating.
- **From "using apps" to "stating goals."** Increasingly you'll describe the outcome and let agents operate the apps for you.
- **From scarce expertise to on-demand expertise.** Specialist help (legal, design, analysis) becomes cheap and instant — raising the value of *judgement*, *taste* and *asking the right questions.*

🧠 **Remember:** The winners won't be the people who can do the tasks agents now do. They'll be the people who are good at **directing** agents — clear goals, good judgement, strong ethics.

---

## The Part of Tens

### Ten things to automate with an agent this month
1. Daily inbox triage and draft replies
2. Meeting scheduling and reminders
3. Weekly competitor/price monitoring
4. Turning one idea into blog + social + newsletter
5. Researching and shortlisting suppliers
6. Cleaning data from PDFs into a spreadsheet
7. Drafting and chasing invoices
8. Answering FAQs for customers
9. Summarising long documents and calls
10. Personal "morning brief" of news + calendar + to-dos

### Ten mistakes beginners make
1. Giving too much access too soon
2. Vague goals ("help with marketing")
3. No human approval on risky actions
4. No spending limit
5. Trusting confident-but-wrong answers
6. Feeding in secrets/passwords
7. Building ten-step agents before mastering one step
8. Ignoring prompt-injection risk
9. No logging, so you can't see what happened
10. Automating a broken process (now it's broken *faster*)

### Ten skills to start building now
1. Writing clear briefs (prompting)
2. Breaking work into steps
3. Judging AI output critically
4. Basic data literacy
5. Privacy and security hygiene
6. Tool/MCP literacy (knowing what can connect to what)
7. Delegation and review (managing, not doing)
8. Ethics and bias awareness
9. Adaptability — re-learning every 6 months
10. Domain judgement — the human "taste" agents lack

---

*End of course. Want this turned into a paid Wix Online Program with modules, a price and a sales page? Just say the word.*
