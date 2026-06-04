# Module 05 — Tools geven aan je agent

> Doel: je agent laten *handelen* in de echte wereld — niet alleen praten. Dit is wat een agent
> daadwerkelijk geld laat verdienen.

Bijbehorende code: [`code/tools.py`](../code/tools.py).

---

## Praten vs. doen

Tot nu toe genereert je agent tekst. Maar een bedrijf draait op *acties*: een e-mail versturen,
een bestelling plaatsen, een record opslaan, een prijs aanpassen. Daarvoor geef je de agent
**tools**: functies die hij zelf mag aanroepen.

De flow is altijd hetzelfde:

```
1. Jij definieert tools (naam, beschrijving, parameters).
2. Het model besluit zélf wanneer en met welke argumenten het een tool aanroept.
3. Jouw code voert de functie uit en geeft het resultaat terug.
4. Het model gaat verder met dat resultaat — tot het doel bereikt is.
```

Dit heet **tool use** (of function calling). Het is het hart van elke echte agent.

---

## Een tool definiëren

Een tool heeft drie dingen: een **naam**, een **beschrijving** (hier kiest het model op!), en
een **invoerschema** (JSON Schema). Voorbeeld:

```python
tools = [
    {
        "name": "verstuur_email",
        "description": "Verstuur een e-mail naar een klant. Gebruik dit alleen voor "
                       "bevestigde, afgeronde berichten.",
        "input_schema": {
            "type": "object",
            "properties": {
                "naar": {"type": "string", "description": "E-mailadres van de ontvanger"},
                "onderwerp": {"type": "string"},
                "tekst": {"type": "string"},
            },
            "required": ["naar", "onderwerp", "tekst"],
        },
    }
]
```

> 💡 De **beschrijving** is cruciaal. Schrijf precies wanneer de tool gebruikt moet worden, niet
> alleen wat hij doet. "Gebruik dit wanneer de klant om een offerte vraagt" geeft veel betere
> resultaten dan alleen "verstuurt een offerte".

---

## De makkelijke manier: de tool runner

De Python-SDK heeft een **tool runner** die de hele lus voor je afhandelt: hij roept de API aan,
voert je tools uit, geeft de resultaten terug, en herhaalt tot het model klaar is. Je definieert
tools als gewone Python-functies met de `@beta_tool`-decorator:

```python
import anthropic
from anthropic import beta_tool

client = anthropic.Anthropic()

@beta_tool
def get_voorraad(product_id: str) -> str:
    """Haal de huidige voorraad op van een product.

    Args:
        product_id: De unieke ID van het product.
    """
    # Hier zou je je echte database/webshop-API aanroepen.
    voorraad = {"stoel-001": 3, "tafel-002": 25}
    return f"Voorraad voor {product_id}: {voorraad.get(product_id, 0)} stuks."

@beta_tool
def plaats_bestelling(product_id: str, aantal: int) -> str:
    """Plaats een inkoopbestelling bij de leverancier.

    Args:
        product_id: De ID van het product.
        aantal: Aantal te bestellen stuks.
    """
    return f"Bestelling geplaatst: {aantal}x {product_id}. Levering over 3 dagen."

# De runner draait de complete agentische lus automatisch:
runner = client.beta.messages.tool_runner(
    model="claude-opus-4-8",
    max_tokens=4000,
    tools=[get_voorraad, plaats_bestelling],
    messages=[{"role": "user", "content": "Check stoel-001 en bestel bij als het er minder dan 5 zijn."}],
)

for message in runner:
    for block in message.content:
        if block.type == "text":
            print(block.text)
```

Het model bekijkt zelf de voorraad, beslist dat er bijbesteld moet worden, en plaatst de
bestelling — allemaal zonder dat jij de stappen hoeft te programmeren. Dát is een agent.

De schema's worden automatisch gegenereerd uit je functie-signatuur en docstring. Schrijf dus
duidelijke docstrings — het model leest ze.

---

## De handmatige lus: voor controle en checkpoints

Soms wil je *zelf* de regie — bijvoorbeeld om een mens om goedkeuring te vragen vóór een
risicovolle actie. Dan schrijf je de lus zelf. Het patroon:

```python
messages = [{"role": "user", "content": "..."}]
while True:
    response = client.messages.create(
        model="claude-opus-4-8", max_tokens=4000, tools=tools, messages=messages,
    )
    if response.stop_reason == "end_turn":
        break  # model is klaar

    messages.append({"role": "assistant", "content": response.content})

    tool_resultaten = []
    for block in response.content:
        if block.type == "tool_use":
            # HIER kun je een checkpoint inbouwen (mens-in-de-loop)!
            resultaat = voer_tool_uit(block.name, block.input)
            tool_resultaten.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": resultaat,
            })
    messages.append({"role": "user", "content": tool_resultaten})
```

Zie [`code/tools.py`](../code/tools.py) voor een volledig, draaibaar voorbeeld met een
mens-in-de-loop-checkpoint op dure acties.

---

## Welke acties promoveer je tot een eigen tool?

Niet alles hoeft een tool te zijn. Geef een actie een eigen tool als:

- **Veiligheid** — de actie is moeilijk terug te draaien (geld uitgeven, e-mail versturen,
  data verwijderen). Een eigen tool kun je afschermen achter goedkeuring.
- **Controle** — je wilt de actie loggen, valideren of beperken.
- **Helderheid** — het model presteert beter met een paar duidelijke tools dan met één
  alleskunnende tool.

Vuistregel: **3–8 goed-omschreven tools** is meestal ideaal. Te veel tools verwarren het model.

---

## Soorten tools die je bedrijf nodig heeft

| Categorie | Voorbeelden |
|-----------|-------------|
| **Lezen** | voorraad opvragen, klantgegevens ophalen, agenda checken, web doorzoeken |
| **Schrijven** | record opslaan, prijs aanpassen, status bijwerken |
| **Communiceren** | e-mail/bericht versturen, melding plaatsen |
| **Transacties** | bestelling plaatsen, factuur maken, betaling verwerken (achter goedkeuring!) |
| **Mens vragen** | `vraag_mens()` — laat de agent expliciet om hulp/goedkeuring vragen |

Die laatste, `vraag_mens()`, is je geheime wapen voor veilige autonomie. Komt terug in module 10.

---

## Server-side tools (gratis superkrachten)

Anthropic biedt ook **server-side tools** die op hun infrastructuur draaien — je hoeft niets zelf
te bouwen:

- **Web search & web fetch** — laat je agent het actuele web doorzoeken en pagina's lezen.
- **Code execution** — laat je agent code draaien in een veilige sandbox (data-analyse,
  grafieken, bestanden maken zoals Excel/PDF).

Je voegt ze toe als gewone tools, bijvoorbeeld:

```python
tools = [
    {"type": "web_search_20260209", "name": "web_search"},
    {"type": "code_execution_20260120", "name": "code_execution"},
]
```

Voor een onderzoeks- of rapportage-agent zijn deze goud waard.

---

## Jouw opdracht

1. Draai [`code/tools.py`](../code/tools.py) en bekijk hoe het model zelf tools kiest.
2. Schrijf 2–4 tools voor jóuw bedrijf (begin met lezen, dan schrijven, dan acties).
3. Bouw bewust een `vraag_mens()`-tool in voor risicovolle acties.

---

## Verder

→ [Module 06 — De autonome loop](06-de-autonome-loop.md)
