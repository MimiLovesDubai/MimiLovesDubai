# Module 06 — De autonome loop

> Doel: een agent bouwen die zelfstandig blijft doorwerken aan een doel — robuust, betaalbaar en
> veilig. Dit is de overgang van "agent die één taak doet" naar "agent die een proces runt".

Bijbehorende code: [`code/business_agent.py`](../code/business_agent.py).

---

## Wat is "de loop"?

Een autonome agent draait in een cyclus tot zijn doel bereikt is:

```
        ┌──────────────────────────────────────────┐
        │                                          │
   ┌────▼─────┐   ┌──────────┐   ┌──────────────┐  │
   │ Denken    │──▶│ Tool     │──▶│ Resultaat    │──┘
   │ (plannen) │   │ kiezen   │   │ verwerken    │
   └───────────┘   └──────────┘   └──────────────┘
        │
        ▼ (doel bereikt?)
     Klaar ✅
```

De kunst zit niet in de lus zelf (die is simpel) maar in het **veilig en betaalbaar** houden
ervan. Een ongecontroleerde lus is hét grootste risico van agents.

---

## De vier wetten van een veilige loop

### Wet 1 — Altijd een harde stap-limiet

Een agent mag nooit oneindig doordraaien. Bouw een teller in:

```python
MAX_STAPPEN = 25
for stap in range(MAX_STAPPEN):
    ...
else:
    log("Stap-limiet bereikt — gestopt.")
```

Dit voorkomt dat een vastgelopen agent je hele budget opmaakt.

### Wet 2 — Altijd een budget-limiet

Tel kosten op na elke aanroep; stop bij de limiet. (Zie `Kostenmeter` in `agent_mvp.py` en
`business_agent.py`.) Zet daarnaast een **harde limiet in de Anthropic-console** als vangnet.

### Wet 3 — Altijd loggen

Log elke beslissing, tool-aanroep en het resultaat — met tijd en kosten. Zonder logboek weet je
nooit wat je agent deed toen er iets misging. Een agent zonder logs is een agent die je niet
mag vertrouwen.

### Wet 4 — Checkpoints op risicovolle acties

Geld uitgeven, publiceren, iets onomkeerbaars: laat de agent hier eerst goedkeuring vragen
(zie module 05 en 10). Autonomie is een glijdende schaal; begin streng, versoepel naarmate je
de agent vertrouwt.

---

## Stoppen op het juiste moment

Het model geeft via `stop_reason` aan waarom het stopte:

| `stop_reason` | Betekenis | Wat je doet |
|---------------|-----------|-------------|
| `end_turn` | Model is klaar | Lus beëindigen |
| `tool_use` | Model wil een tool gebruiken | Tool uitvoeren, resultaat teruggeven |
| `max_tokens` | Antwoord afgekapt | `max_tokens` verhogen |
| `pause_turn` | Server-side tool pauzeerde | Opnieuw versturen om te hervatten |
| `refusal` | Model weigert (veiligheid) | Niet opnieuw proberen; onderzoeken |

Je lus draait door zolang het model tools wil gebruiken, en stopt netjes bij `end_turn`.

---

## Kosten beheersen in een lange loop: prompt caching

Bij een agent met een grote, vaste system prompt en veel tools betaal je die context bij élke
stap opnieuw — tenzij je **prompt caching** gebruikt. Daarmee wordt de herhaalde context bijna
gratis (~90% goedkoper). Je markeert je vaste context één keer:

```python
system=[
    {
        "type": "text",
        "text": GROTE_SYSTEM_PROMPT,
        "cache_control": {"type": "ephemeral"},   # cache deze vaste context
    }
]
```

Voor langlopende agents kan dit je kosten drastisch verlagen. Houd je system prompt en tool-set
**stabiel** binnen een sessie — elke wijziging breekt de cache.

---

## Heel lange taken: compaction

Als een agent uren doorwerkt, groeit het gesprek tot het context window vol raakt. **Compaction**
(beta) vat oudere context automatisch samen, zodat de agent kan doorgaan. Je zet het aan en geeft
de samenvattings-blokken steeds terug. Voor de meeste starters is dit nog niet nodig — onthoud
dat het bestaat voor als je agents echt lang gaan draaien.

---

## Geheugen tussen sessies

Een lus onthoudt standaard niets na afloop. Voor een bedrijf wil je vaak dat de agent leert en
onthoudt (klantvoorkeuren, eerdere beslissingen). Drie opties:

1. **Eigen opslag** — schrijf belangrijke feiten naar een bestand of database, en laad ze als
   context bij de start. Simpel en effectief. (Doen we in `business_agent.py`.)
2. **Memory tool** — een tool waarmee de agent zelf naar een geheugen-map schrijft en leest.
3. **Managed Agents met memory stores** — Anthropic beheert persistent geheugen (module 07).

Begin met optie 1: een simpel `geheugen.json`-bestand dat je in- en uitleest.

---

## De complete bedrijfsagent

[`code/business_agent.py`](../code/business_agent.py) brengt alles samen:

- Een autonome lus met stap- en budgetlimiet (wet 1 & 2).
- Tools om te lezen, schrijven en handelen (module 05).
- Logging naar bestand (wet 3).
- Een mens-in-de-loop checkpoint op uitgaven (wet 4).
- Eenvoudig geheugen tussen runs via een JSON-bestand.

Het scenario: een agent die dagelijkse klantvragen afhandelt voor een dienstverlener —
kwalificeert, beantwoordt standaardvragen zelf, en escaleert complexe of dure verzoeken naar
jou. Draai:

```bash
python code/business_agent.py
```

Bestudeer de code regel voor regel. Dit is het skelet waarop je jouw eigen bedrijfsagent bouwt.

---

## Jouw opdracht

1. Draai `business_agent.py` en volg de logregels.
2. Pas tools, system prompt en checkpoint-drempel aan naar jouw bedrijf.
3. Voeg bewust alle vier de wetten toe als je je eigen agent schrijft.
4. Laat hem een dag "meedraaien" naast je handmatige werk en vergelijk de uitkomsten.

---

## Verder

→ [Module 07 — Managed Agents & opschalen](07-managed-agents.md)
