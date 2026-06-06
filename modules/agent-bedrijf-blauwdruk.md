# Capstone — Bouw je autonome agent-bedrijf (de blauwdruk)

> Doel: na deze module heb je een **draaiend systeem van samenwerkende agents** dat zelfstandig
> opdrachten verwerkt, controleert, levert en de omzet bijhoudt — met jou als eigenaar op de
> juiste checkpoints. Dit is het eindpunt waar de hele cursus naartoe werkt.

Bijbehorende code: [`code/agent_company.py`](../code/agent_company.py).

---

## Eerlijk vooraf: wat "autonoom" hier betekent

Je bouwt een **grotendeels autonoom** bedrijf: de agents doen het werk, jij keurt de risicovolle
momenten goed (geld, levering naar klanten). Dat is geen beperking maar een kracht — het houdt je
kwaliteit hoog en je juridisch veilig (module 10 & 11). "100% zonder mens, gegarandeerd inkomen"
bestaat niet; een draaiend systeem met menselijke checkpoints wél. Dít is wat je na deze module hebt.

---

## De architectuur: een klein bedrijf van agents

```
                         ┌──────────────────────────┐
   Opdrachten ─────────▶ │  COÖRDINATOR             │  haalt werk op, stuurt de
   (inbox / formulier /  │  (de regie, in code)     │  pijplijn aan, bewaakt budget
    jobs.json)           └────────────┬─────────────┘
                                      │ per opdracht
                ┌─────────────────────┼─────────────────────┐
                ▼                     ▼                     ▼
        ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
        │  SCHRIJVER    │ ──▶ │  CONTROLEUR   │ ──▶ │ KLANTCONTACT │
        │  (agent)      │ ◀── │  (agent, QA)  │     │  (oplevermail)│
        └──────────────┘ revisie └──────────────┘     └──────┬───────┘
            maakt deliverable   keurt goed/af                 │
                                                              ▼
                                                   ┌──────────────────┐
                                                   │  MENS (akkoord)   │ ◀ guardrail
                                                   └────────┬─────────┘
                                                            ▼
                                              ┌──────────────────────────┐
                                              │ Levering + GROOTBOEK      │
                                              │ (omzet, kosten, marge)    │
                                              └──────────────────────────┘
```

Vier agent-rollen, één menselijk checkpoint, en een grootboek dat je omzet bijhoudt. Samen vormen
ze een bedrijf dat met één commando een dag werk verzet.

---

## Hoe dit alle modules samenbrengt

| Onderdeel van het bedrijf | Komt uit module |
|---------------------------|-----------------|
| De agents en hun prompts | 04 (eerste agent), 01 (wat is een agent) |
| Tools & acties | 05 |
| De autonome lus + revisie | 06 |
| Budget, mens-in-de-loop, logging | 10 |
| Meerdere samenwerkende agents | 07 (Managed Agents / multi-agent) |
| Prijs, omzet, grootboek | 08 |
| Levering, e-mail, betaling | 09 |
| Het 7-dagen-pad naar je eerste klant | Praktijkvoorbeeld |

---

## De code: `agent_company.py`

Het script implementeert precies de architectuur hierboven:

- **Coördinator** — leest opdrachten uit `jobs.json` (in het echt: je inbox/CRM/formulier),
  bewaakt het dagbudget en stuurt elke opdracht door de pijplijn.
- **Schrijver** (agent) — maakt de deliverable met gestructureerde output.
- **Controleur** (agent) — beoordeelt op feiten, stijl en volledigheid; geeft een score en vraagt
  zo nodig om revisie (tot `MAX_REVISIES`).
- **Klantcontact** — stelt een korte oplevermail op (goedkoop model, want simpele taak).
- **Mens** — geeft akkoord vóór levering (sla over met `--auto` voor onbewaakte runs).
- **Grootboek** — boekt omzet per klant in `grootboek.json`, telt kosten en marge.

Draai het:

```bash
python code/agent_company.py            # met menselijk akkoord per levering
python code/agent_company.py --auto      # onbewaakt (voor geplande runs)
```

Je ziet de agents samenwerken: schrijven → controleren → eventueel reviseren → leveren → boeken.
De deliverables komen in `code/outputs/`, het logboek in `code/company.log`, de omzet in
`code/grootboek.json`.

---

## Het 24/7 laten draaien

Een bedrijf dat alleen draait als jij het script start, is nog geen autonoom bedrijf. Plan het in:

**Linux / Mac (cron) — elke ochtend om 8:00:**

```bash
crontab -e
# voeg toe (pas het pad aan):
0 8 * * *  cd /pad/naar/project && /pad/naar/.venv/bin/python code/agent_company.py --auto >> code/cron.log 2>&1
```

**Windows:** gebruik **Taakplanner** → dagelijkse taak → start `python code/agent_company.py --auto`.

**In de cloud / 24/7 zonder je eigen pc:** draai het op een kleine server, of stap over op
**Managed Agents** (module 07) die volledig op Anthropic's infrastructuur draaien.

> 💡 Begin met `--auto` pas als je de output een tijdje hebt gecontroleerd. Eerst bewaakt draaien,
> dan geleidelijk loslaten — autonomie verdien je stap voor stap (module 10).

---

## Uitbreiden naar een groter bedrijf

- **Meer rollen** — voeg agents toe: een research-agent, een SEO-agent, een klantenservice-agent.
- **Echte koppelingen** — vervang `jobs.json` door je echte inbox/formulier, en de "levering" door
  een echte e-mailtool (module 09) en betaling (Stripe/Gumroad).
- **Meerdere niches** — draai hetzelfde systeem met andere prompts voor andere markten.
- **Coördinator als agent** — laat een Managed-Agent-coördinator zélf beslissen welke specialist
  wanneer nodig is (module 07).

---

## Definitie van klaar ✅

Na deze module heb je:

- [ ] Een **groep samenwerkende agents** die opdrachten zelfstandig verwerkt (schrijver + controleur + klantcontact, aangestuurd door een coördinator).
- [ ] **Kwaliteitscontrole** ingebouwd (de controleur keurt goed/af en vraagt om revisie).
- [ ] **Guardrails**: dagbudget, logging en een menselijk akkoord vóór levering.
- [ ] Een **grootboek** dat je omzet, kosten en marge bijhoudt.
- [ ] Een manier om het **24/7 te plannen** (cron / Taakplanner / cloud / Managed Agents).

Dat is een echt, draaiend AI-agent-bedrijf. Wat het verdient, bepaal je met je niche, je prijs en
je distributie (module 08 & het praktijkvoorbeeld) — maar de machine staat.

---

## Jouw opdracht

1. Draai `agent_company.py` en volg de samenwerking tussen de agents.
2. Vervang de prompts en `PRIJS_PER_OPDRACHT` door die van jóuw bedrijf.
3. Koppel `jobs.json` aan een echte bron van opdrachten en de levering aan e-mail/betaling.
4. Plan het in met cron of Taakplanner en laat het eerst bewaakt een week meedraaien.

> Gefeliciteerd — je hebt nu niet alleen geleerd hóe agents een bedrijf runnen, je hebt er een
> draaien. Ga naar het praktijkvoorbeeld voor het pad naar je eerste betalende klant.

---

## Verder

→ [Terug naar het overzicht](../README.md)
