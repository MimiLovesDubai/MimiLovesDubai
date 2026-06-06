# Module 09 — Payments & Integrations

> Goal: actually get money coming in and connect your agent to the real world — payments,
> email, and hundreds of other apps.

---

## Collecting Money: Your Options

You don't need to build complex payment infrastructure. Choose based on your product:

| Method | Good for | Ease |
|--------|----------|------|
| **Manual invoices** | First customers, services, retainers | Very simple — send an invoice, receive via bank transfer |
| **Stripe Payment Links** | Per-unit or one-time sales, no code needed | Create a payment link in the Stripe dashboard, share it |
| **Stripe Subscriptions** | Recurring subscriptions | A bit more setup, but automatic monthly billing |
| **Marketplace** | Selling services | The platform handles payment (for a fee) |

> 💡 **Start manually.** For your first customers, a clean invoice or a Stripe Payment Link
> is more than enough. Only build automated payments once you have returning customers.

> 💡 **In Claude.ai:** Use claude.ai to draft your invoice template, write the email you send
> customers with their payment link, or compose onboarding messages. For the technical payment
> setup itself (Stripe, webhooks), you need to work in your code editor or Claude Code.
> Note: Stripe and Gumroad work globally, but local regulations and payment preferences vary
> by country — check what applies in your market before going live.

---

## Stripe in Brief (for Subscriptions)

Stripe is the standard for online payments. Here's how it works at a high level:

1. Create a (test) account at [stripe.com](https://stripe.com) and get your API keys.
2. Create a **Product** with a **Price** (e.g. $99/month).
3. Send customers to a **Checkout** or **Payment Link**.
4. Stripe sends a **webhook** to your server when payment is made — that's where you grant access.

```
Payment flow with Stripe

  Customer                 Stripe                    Your server
     │                       │                           │
     │── clicks checkout ──▶ │                           │
     │                       │── payment confirmed ────▶ │
     │                       │   (webhook POST)          │
     │                       │                    activate_customer()
     │◀── welcome email ─────────────────────────────────│
```

A minimal webhook handler (concept):

```python
import stripe, os
from flask import Flask, request

stripe.api_key = os.environ["STRIPE_API_KEY"]
app = Flask(__name__)

@app.route("/webhook", methods=["POST"])
def webhook():
    event = stripe.Webhook.construct_event(
        request.data, request.headers["Stripe-Signature"],
        os.environ["STRIPE_WEBHOOK_SECRET"],
    )
    if event["type"] == "checkout.session.completed":
        customer_email = event["data"]["object"]["customer_details"]["email"]
        # → grant access, start the agent service for this customer, send welcome email
        activate_customer(customer_email)
    return "", 200
```

Enable `stripe` and `flask` in `requirements.txt` (they're commented out) when you're ready to
use this. Always test first with Stripe's test mode and test card numbers.

> 🔐 **Always** verify the webhook signature (as shown above). Without it, anyone could send
> fake "payment completed" events to your server.

---

## Connecting Your Agent to Email

Many agent businesses run on email: requests come in, replies go out. Two approaches:

- **Simple (outbound):** use a transactional email service (e.g. via their API) to send emails
  from your agent as a tool (`send_email` from module 05).
- **Processing incoming mail:** have incoming email delivered via a service that sends a webhook
  to your server, then pass the content to your agent.

For a customer service agent (like `business_agent.py`) this is the natural connection: inbox
in, agent processes, reply out, escalate to you where needed.

---

## Hundreds of Apps Without Code: Zapier

Want to connect your agent to Gmail, Google Sheets, Slack, your CRM, calendars — without
building a custom integration for each one? Use **Zapier**, which connects 9,000+ apps. The pattern:

- A trigger in one app (new email, new form submission, new row) starts your agent.
- Your agent does the work.
- The result goes back into an app via Zapier (add a row, send a message, create a task).

This is the fastest way to plug your agent into an existing business workflow. Start with one
trigger and one action; expand from there.

---

## A Complete Income Flow

Here's what a working automated business looks like end to end:

```
Customer pays (Stripe)
      │  webhook
      ▼
Access activated ──▶ Customer data in database/Sheet
      │
      ▼
Work comes in (form / email / API)
      │
      ▼
🤖 Agent processes the work  ◀── guardrails (budget, checkpoints)
      │
      ▼
Result delivered (email / dashboard / file)
      │
      ▼
Monthly reporting ──▶ customer stays, you grow
```

You don't need to build all of this at once. Start with the middle step (the agent), handle the
rest manually, and automate step by step as you grow.

---

## Bookkeeping: Track It from Day One

As soon as money comes in, record:
- **Revenue** per customer/invoice.
- **Costs** (API, tools, hosting, payment fees).
- **Sales tax / VAT** where applicable (module 11).

A simple spreadsheet or bookkeeping tool is enough at the start. Not tracking it = problems
at tax time. Module 11 goes deeper into the rules.

---

## Your Assignment

1. Choose your payment method for the first customers (start: manual invoice or Payment Link).
2. Identify which integrations you actually need (email? spreadsheet? Slack?) — nothing more.
3. Sketch your income flow on paper, from payment to delivery.

---

## Next Up

→ [Module 10 — Safety & guardrails](10-veiligheid-en-guardrails.md)
