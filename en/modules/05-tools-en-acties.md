# Module 05 — Giving Your Agent Tools

> Goal: make your agent *act* in the real world — not just talk. This is what actually makes an
> agent earn money.

Associated code: [`code/tools.py`](../code/tools.py).

---

## Talking vs. doing

Up to now, your agent generates text. But a business runs on *actions*: sending an email,
placing an order, saving a record, adjusting a price. For this you give the agent **tools**:
functions it is allowed to call on its own.

The flow is always the same:

```
1. You define tools (name, description, parameters).
2. The model decides on its own when and with what arguments to call a tool.
3. Your code executes the function and returns the result.
4. The model continues with that result — until the goal is reached.
```

This is called **tool use** (or function calling). It is the heart of every real agent.

---

## How tool use works — the basic cycle

```
  ┌──────────────┐     ┌─────────────────────────┐
  │  Your code   │────▶│  Model                  │
  │  (messages)  │     │  (reads tools, decides  │
  └──────────────┘     │   when to call one)     │
         ▲             └────────────┬────────────┘
         │                         │ tool_use block
         │                         ▼
         │             ┌─────────────────────────┐
         │  result     │  Your function runs     │
         └─────────────│  (real side-effect:     │
                       │   email sent, DB saved) │
                       └─────────────────────────┘
```

The model never runs your code directly — it asks for a tool call, you execute it, and you
hand the result back. You stay in control at every step.

---

## Defining a tool

A tool has three things: a **name**, a **description** (this is what the model uses to decide!),
and an **input schema** (JSON Schema). Example:

```python
tools = [
    {
        "name": "send_email",
        "description": "Send an email to a customer. Use this only for "
                       "confirmed, finished messages.",
        "input_schema": {
            "type": "object",
            "properties": {
                "to": {"type": "string", "description": "The recipient's email address"},
                "subject": {"type": "string"},
                "body": {"type": "string"},
            },
            "required": ["to", "subject", "body"],
        },
    }
]
```

> 💡 The **description** is critical. Write exactly when the tool should be used, not just
> what it does. "Use this when the customer requests a quote" produces much better results
> than simply "sends a quote".

> 💡 **In Claude.ai:** You can test tool descriptions right in the claude.ai chat by describing
> the tool in plain language and asking Claude how it would decide to use it. This helps you
> refine the wording before writing any code. The actual tool-calling loop still requires the API.

---

## The easy way: the tool runner

The Python SDK has a **tool runner** that handles the entire loop for you: it calls the API,
executes your tools, feeds the results back, and repeats until the model is done. You define
tools as regular Python functions with the `@beta_tool` decorator:

```python
import anthropic
from anthropic import beta_tool

client = anthropic.Anthropic()

@beta_tool
def get_stock(product_id: str) -> str:
    """Get the current stock level for a product.

    Args:
        product_id: The unique ID of the product.
    """
    # In reality, you'd call your real database or webshop API here.
    stock = {"chair-001": 3, "table-002": 25}
    return f"Stock for {product_id}: {stock.get(product_id, 0)} units."

@beta_tool
def place_order(product_id: str, quantity: int) -> str:
    """Place a purchase order with the supplier.

    Args:
        product_id: The ID of the product.
        quantity: Number of units to order.
    """
    return f"Order placed: {quantity}x {product_id}. Delivery in 3 days."

# The runner handles the complete agentic loop automatically:
runner = client.beta.messages.tool_runner(
    model="claude-opus-4-8",
    max_tokens=4000,
    tools=[get_stock, place_order],
    messages=[{"role": "user", "content": "Check chair-001 and reorder if stock is below 5."}],
)

for message in runner:
    for block in message.content:
        if block.type == "text":
            print(block.text)
```

The model checks the stock itself, decides a reorder is needed, and places the order — all
without you having to program the individual steps. That is an agent.

The schemas are generated automatically from your function signature and docstring. Write clear
docstrings — the model reads them.

---

## The manual loop: for control and checkpoints

Sometimes you want to stay in control yourself — for example, to ask a human for approval before
a risky action. Then you write the loop yourself. The pattern:

```python
messages = [{"role": "user", "content": "..."}]
while True:
    response = client.messages.create(
        model="claude-opus-4-8", max_tokens=4000, tools=tools, messages=messages,
    )
    if response.stop_reason == "end_turn":
        break  # model is done

    messages.append({"role": "assistant", "content": response.content})

    tool_results = []
    for block in response.content:
        if block.type == "tool_use":
            # HERE you can add a checkpoint (human-in-the-loop)!
            result = run_tool(block.name, block.input)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": result,
            })
    messages.append({"role": "user", "content": tool_results})
```

See [`code/tools.py`](../code/tools.py) for a complete, runnable example with a
human-in-the-loop checkpoint on expensive actions.

---

## Which actions deserve their own tool?

Not everything needs to be a tool. Give an action its own tool when:

- **Safety** — the action is hard to reverse (spending money, sending an email, deleting data).
  A dedicated tool can be gated behind approval.
- **Control** — you want to log, validate, or rate-limit the action.
- **Clarity** — the model performs better with a few well-defined tools than with one
  do-everything tool.

Rule of thumb: **3–8 well-described tools** is usually ideal. Too many tools confuse the model.

---

## Types of tools your business needs

| Category | Examples |
|----------|---------|
| **Read** | check stock, fetch customer data, check calendar, search the web |
| **Write** | save a record, adjust a price, update a status |
| **Communicate** | send an email/message, post a notification |
| **Transact** | place an order, create an invoice, process a payment (behind approval!) |
| **Ask a human** | `ask_human()` — lets the agent explicitly request help or approval |

That last one, `ask_human()`, is your secret weapon for safe autonomy. We come back to it in
module 10.

---

## Server-side tools (free superpowers)

Anthropic also offers **server-side tools** that run on their infrastructure — you don't have to
build anything yourself:

- **Web search & web fetch** — let your agent search the live web and read pages.
- **Code execution** — let your agent run code in a secure sandbox (data analysis,
  charts, generating files like Excel/PDF).

You add them like regular tools, for example:

```python
tools = [
    {"type": "web_search_20260209", "name": "web_search"},
    {"type": "code_execution_20260120", "name": "code_execution"},
]
```

For a research or reporting agent, these are invaluable.

---

## Your assignment

1. Run [`code/tools.py`](../code/tools.py) and watch how the model selects tools on its own.
2. Write 2–4 tools for your own business (start with reading, then writing, then actions).
3. Deliberately include an `ask_human()` tool for risky actions.

---

## Next up

→ [Module 06 — The Autonomous Loop](06-de-autonome-loop.md)
