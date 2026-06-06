# Module 11 — Legal, Tax & Ethics

> Goal: set up your business legally, with correct taxes, and ethically. Boring? Maybe. But this
> prevents fines, liability, and reputational damage. Don't skip it.

> ⚠️ This is general information, not legal or tax advice. Laws differ by country and change
> over time. When in doubt, consult an accountant or lawyer. The examples below are based on the
> Netherlands/Belgium and EU law. If you are in the US, UK, or anywhere else, you need to check
> your local equivalents — business registration, sales tax/VAT, and privacy law all vary
> significantly by jurisdiction. The principles are universal; the specifics are not.

---

## 1. Registering your business

Once you are delivering paid work on a regular basis, you are a business owner.

**EU / Netherlands example:**

- **Register with the KvK** (Kamer van Koophandel — Chamber of Commerce) — usually as a sole
  trader (eenmanszaak) to start.
- You will receive a **VAT number** from the Tax Authority (Belastingdienst).
- In Belgium: register with the **KBO** and join a social insurance fund.

A sole trader / freelancer structure is the simplest starting point. You can move to a limited
company (BV) later as revenue and risk grow — ask an accountant when that makes sense.

**Outside the EU:** find the equivalent in your country. In the US this is typically a sole
proprietorship or LLC registered at the state level; in the UK a sole trader or limited company
registered with Companies House. The principle is the same everywhere: once you earn money
regularly, register.

---

## 2. VAT / Sales tax

**EU / Netherlands example:**

- As a rule, charge **VAT** (in the Netherlands typically 21%) on your services and remit it to
  the tax authority.
- Track your incoming and outgoing VAT; file periodic **VAT returns**.
- Small-business schemes may apply (NL: KOR — kleineondernemersregeling). Check whether you
  qualify.
- Selling to customers in other EU countries or outside the EU? Separate VAT rules apply. Get
  advice as soon as this becomes relevant.

**Outside the EU:** the equivalent is sales tax (US), GST/HST (Canada/Australia), or VAT under
a different regime (UK). The core principle is universal: tax on turnover is not your money.

**Practical:** set aside your VAT or sales tax from the very first payment. It is not your money.

---

## 3. Income tax & record-keeping

- You pay **income tax** on your profit (revenue minus costs).
- Keep proper **records**: invoices, expenses, bank statements. In the Netherlands the retention
  requirement is generally 7 years; check your local rules.
- Your API costs, tools, and hosting are **deductible business expenses** — keep the receipts.

A simple bookkeeping tool or spreadsheet, plus an accountant for the annual return, is enough
at the start.

> 💡 **In Claude.ai:** Claude.ai is useful for drafting a simple expense-tracking template or a
> clean client invoice. Paste your requirements and have it generate a spreadsheet structure or
> invoice layout — then adapt it to your country's requirements. It cannot file your taxes or
> give you legal advice, but it is good for drafting and formatting administrative documents.

---

## 4. Privacy / GDPR (AVG)

Does your agent process personal data (names, emails, customer data)? Then privacy law applies.

**EU example — the GDPR (called AVG in Dutch):**

- **Purpose limitation & data minimisation** — collect only what you need.
- **Legal basis** — have a valid reason (consent, contract) to process data.
- **Transparency** — tell people what you do with their data (privacy policy).
- **Security** — protect the data (no secrets in code, restrict access — see module 10).
- **Processors** — if you send data to an AI service, that service is a data processor; document
  this relationship.
- **Rights** — people may view their data and request its deletion.

**Outside the EU:** the UK GDPR, US state laws (CCPA in California, etc.), and other national
frameworks apply similar principles with different details. Check your local privacy law.

```
Personal data flow — who is responsible for what:

  ┌──────────────┐   sends data   ┌───────────────────────┐
  │   Customer   │ ────────────►  │   Your business       │
  └──────────────┘                │   (Data Controller)   │
                                  └───────────┬───────────┘
                                              │ sends data
                                              ▼
                                  ┌───────────────────────┐
                                  │   AI API / Tools      │
                                  │   (Data Processor)    │
                                  └───────────────────────┘
  You must document this relationship and ensure the
  processor meets the required security standards.
```

Never store sensitive data unnecessarily, and never put passwords, national ID numbers, or
payment details in agent memory or logs.

---

## 5. The EU AI Act

The **EU AI Act** sets rules for AI systems, scaled to risk level. For most agent-based services
(content, support, automation) you fall into the **low-risk** category — but note:

- **Transparency:** make it clear when people are interacting with AI (e.g., an AI chatbot must
  identify itself as such).
- **Prohibited uses:** certain applications (manipulation, social scoring) are banned outright.
- **High risk:** some domains (recruitment, credit, healthcare, law enforcement) carry heavy
  compliance requirements. Avoid these as a beginner, or make sure you fully understand the
  obligations before going in.

**Outside the EU:** equivalent AI regulation is emerging in many jurisdictions (UK, US, and
others). Regardless of where you operate, the practical rule is the same: be honest that AI is
involved, and stay away from high-stakes domains unless your compliance is genuinely solid.

Rule of thumb: **be honest that AI is in the picture**, and stay away from high-risk domains
unless you have compliance fully under control.

---

## 6. Liability: you are responsible

This is the most important legal principle in this entire course:

> **You are liable for what your agent does. "The AI did it" is not a defense.**

If your agent makes a false promise, gives bad advice, or causes harm, you are the one
responsible to the customer. Therefore:

- **Terms and conditions** — document what you do and do not guarantee, and limit your
  liability.
- **Disclaimers** — be clear about the nature and limits of your service.
- **Human-in-the-loop** (module 10) — maintain control over risky outcomes.
- **Business insurance** — consider professional liability insurance as you grow.

This is exactly why the "100% autonomous with zero oversight" dream is so risky: full autonomy
without control means full liability without any grip on outcomes.

---

## 7. Ethics & reputation

What is legal is not always what is smart. Build a business you can explain with pride:

- **Be transparent** about AI use with your customers.
- **No spam** — respect people in lead generation and outreach (and follow the law — see privacy
  section above).
- **Deliver real value** — no throwaway AI content that pollutes the world; add genuine quality.
- **Be honest about what the agent can do** — don't promise what it won't deliver.
- **Respect copyright** — don't let your agent blindly copy someone else's work.

A good reputation is your greatest long-term asset. Agents make it easy to produce a lot very
quickly — use that power to be better, not to spam.

---

## Your checklist

- [ ] Business registered (KvK/KBO or local equivalent) once you are selling regularly.
- [ ] VAT / sales tax administration set up; tax amounts kept separate.
- [ ] Expenses and invoices recorded for income tax purposes.
- [ ] Privacy policy + GDPR / local privacy-law basics in place if you process personal data.
- [ ] AI transparency arranged (clearly identified as AI where relevant).
- [ ] Terms and conditions + disclaimer written.
- [ ] Human-in-the-loop on everything that touches liability.

---

## Next

→ [Module 12 — Launch Checklist & Growth](12-launch-en-groei.md)
