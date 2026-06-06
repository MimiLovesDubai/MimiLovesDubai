# Bonus — Building it with Claude.ai (the fast, low-code route)

> Goal: understand how to use **Claude.ai** (the chat app in your browser) to design, test, and
> generate the code for your agent — even if you're not a programmer.

A lot of people assume you have to start by coding. You don't. You can do most of the work in
plain language through Claude.ai and let Claude handle the heavy lifting. This module shows you how.

---

## Three ways to build with Claude

There are three "surfaces." You pick the right one per task.

```
┌──────────────────────────────────────────────────────────────┐
│  1. Claude.ai (browser chat)                                  │
│     Design, test, generate code, build small tools.           │
│     → Easiest. Start here.                                     │
├──────────────────────────────────────────────────────────────┤
│  2. Claude Code (in your terminal)                            │
│     Claude builds and runs code alongside you, on your computer.│
│     → For real building without typing it all yourself.       │
├──────────────────────────────────────────────────────────────┤
│  3. The Claude API (in your own script)                       │
│     The engine that runs your agent 24/7.                     │
│     → For the autonomous agent that does real work.           │
└──────────────────────────────────────────────────────────────┘
```

The trick: **design and test in Claude.ai, then use the API/Claude Code to actually run it.**
Claude.ai is your workbench; the API is the factory.

---

## What can you do in Claude.ai?

- **Chat** — simply talk to Claude: ask questions, brainstorm, draft text.
- **Projects** — a workspace with fixed instructions and your own knowledge (files, notes) that
  Claude carries into every conversation. Perfect for giving your business context once.
- **Artifacts** — Claude builds something usable right in a side panel: a document, a
  spreadsheet-style overview, or even a small working mini-app.
- **File uploads** — hand Claude a document, spreadsheet, or image to work with.
- **Web search** — let Claude look up current information.

> 💡 **In Claude.ai:** create one **Project** for your business. Put into the project
> instructions who you are, what you sell, and to whom. Then you don't have to re-explain it in
> every chat — exactly like a system prompt does for an agent.

---

## The golden workflow (prototype → code → run)

```
   You describe your idea in plain language
                │
                ▼
   ┌─────────────────────────────┐
   │ Claude.ai                   │   1) Design the "role + rules" (system prompt)
   │  (design & test)            │   2) Test by role-playing
   └──────────────┬──────────────┘   3) Have Claude write the Python code
                  │ copy the code
                  ▼
   ┌─────────────────────────────┐
   │ your computer / the API     │   4) Run the code (modules 03 & 04)
   │  (make it really work)      │   5) Or use Claude Code / Managed Agents
   └─────────────────────────────┘
```

---

## Step by step

### Step 1 — Design your agent in plain language
Open Claude.ai and describe what you want. For example:

> "I want an agent that writes product descriptions for my furniture web shop. Help me draft a
> clear instruction (system prompt): role, goal, style, and limits."

Claude helps you sharpen the instruction. This is exactly the `system prompt` from module 04 —
except you write it together with Claude, in plain language.

### Step 2 — Test the agent by role-playing
Paste your instruction into a new chat and give Claude a real task. You'll see immediately
whether the output is good, before you write a single line of code. Adjust the instruction and
repeat.

> 💡 **In Claude.ai:** this "prompt tuning" is the most important work. You improve the
> instruction until the output is good enough to show a client. Save the best version in your Project.

### Step 3 — Have Claude write the code
Once your instruction is solid, ask Claude to turn it into working code. For example:

> "Write a Python script using the Anthropic SDK that uses this system prompt to generate product
> descriptions for a list of products, with model `claude-opus-4-8`. Add a cost counter and a
> daily budget limit."

You'll get code that looks like `agent_mvp.py` from this course. You don't have to invent it —
just run it (module 03 explains how).

### Step 4 — Make it actually run
The chat itself doesn't run your agent 24/7. To do that:
- **Run the code** on your computer (modules 03 & 04), or
- **use Claude Code** in your terminal — then Claude builds and runs it alongside you, or
- **use Managed Agents** (module 07) for an agent that runs 24/7 in the cloud.

### Step 5 — Build small helpers with Artifacts
For standalone tools (a calculator, a dashboard, a form) you can have Claude build an **Artifact**
in Claude.ai — a small working app, without you hosting or maintaining any code.

---

## The honest limits of Claude.ai

Claude.ai is fantastic for designing, testing, and generating code. But:

- It's a **chat**, not a server. It does not run your agent **on its own, 24/7, in the background**.
- It does not **autonomously take actions in your systems** (placing orders, sending emails) the
  way an agent with tools does — for that you need the API/Claude Code/Managed Agents.

In short: **Claude.ai thinks and builds; the API runs it.** Use them together.

---

## Which surface, when?

| What you want | Use |
|---------------|-----|
| Design an idea, test a prompt, draft text | **Claude.ai** |
| Keep fixed business context | **Claude.ai → Projects** |
| A small tool/dashboard | **Claude.ai → Artifacts** |
| Have code built and run on your PC | **Claude Code** |
| An agent that does real work 24/7 | **The API / Managed Agents** (modules 04–07) |

---

## Your assignment

1. Create a Project on Claude.ai for your business (with your one-line pitch from module 02).
2. Design your first system prompt together with Claude and test it by role-playing.
3. Have Claude write the matching Python code, and run it using the steps from module 03.

> You now have the fastest route: design in Claude.ai, run with the code. Then continue with
> module 04 to get everything truly working.

---

## Next

→ [Module 04 — Build your first agent](04-je-eerste-agent-bouwen.md)
