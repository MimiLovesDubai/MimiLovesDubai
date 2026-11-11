# Hotel-voorstelmachine

Gepersonaliseerde kunstvoorstellen voor hotels die openen of renoveren: per hotel een PDF van 7
pagina's (A4 liggend, huisstijl Obsidian & Champagne) plus een begeleidende e-mail.

## Wat er klaarstaat (november 2026)

| Hotel | Concept | Opening (volgens openbare bronnen) | Bestanden |
|---|---|---|---|
| The Zetter 717 Amsterdam | Portraits of the Prinsengracht | begin 2027 | `proposals/out/the-zetter-717-amsterdam.*` |
| The Encounter, Amsterdam-Noord | North Light | medio 2027 | `proposals/out/the-encounter-amsterdam.*` |
| Kasteel Gemert (Curio Collection by Hilton) | The Light of Seven Centuries | 2026 | `proposals/out/kasteel-gemert-eindhoven.*` |
| Janu Dubai (DIFC) | Golden Hours | 2027 | `proposals/out/janu-dubai.*` |
| Gran Meliá Dubai Jumeirah | Two Waters | eind 2026 | `proposals/out/gran-melia-dubai-jumeirah.*` |

Per hotel: `<slug>.pdf` (het voorstel) en `<slug>-email.md` (aan wie, onderwerp, tekst, bronnen).

## Vóór je iets verstuurt (verplicht)

1. **Prijzen controleren.** Pagina 6 noemt je huidige winkelprijzen (originelen €1.250–€4.650,
   digitale edities vanaf €295); al het maatwerk staat op "quoted after a briefing". Klopt dat
   niet meer, pas het datablad aan en bouw opnieuw.
2. **Feiten controleren.** Openingsdata en kameraantallen komen uit openbare aankondigingen
   (bronnen staan onderaan elke e-mailfile) en kunnen veranderd zijn.
3. **Zelf versturen.** Er wordt nooit automatisch iets verzonden. Advies: begin met 1–2 hotels
   (The Zetter 717 en The Encounter passen het best bij je werk) en bel of mail na een week na.

## Een nieuw hotel toevoegen

1. Kopieer een bestaand datablad in `proposals/hotels/` naar `<nieuwe-slug>.json`.
2. Vul in: feiten + bronnen (alleen controleerbare openbare informatie), concept, 4 werken
   (sleutels zoals `ART_CANAL`, `ART_PRISM`; zie `ART` in `proposals/build-proposals.js`),
   2 maatwerkideeën, 2 visualisaties (`lobby` of `room`), 5 plaatsingen, 3 budgetvarianten, e-mail.
3. Bouw: `node proposals/build-proposals.js <nieuwe-slug>` (zonder slug: alle hotels).
   Met `--screenshots <map>` krijg je per pagina een PNG om te controleren; het script waarschuwt
   ook zelf als tekst buiten een pagina loopt.

## Automatisering (vanaf 11 november 2026)

**Vaste regel: alle hotelmail gaat uitsluitend via gallerydutchart@gmail.com. Het persoonlijke adres
beenenmariska@gmail.com wordt nooit gebruikt: niet lezen, geen concepten, niet verzenden.**

- **Elke maandag rond 10:17** zoekt de geplande taak *GDA Hotel Outreach* 2 nieuwe luxe hotels die binnenkort
  openen of renoveren, controleert de feiten (minstens 2 bronnen), bouwt het voorstel, zet de PDF in de
  Media Manager van gallerydutchart.nl en maakt het e-mailbestand klaar in `proposals/out/`.
- **Gmail** wordt pas gebruikt als gallerydutchart@gmail.com als Gmail-koppeling is ingesteld en dat is
  bevestigd (`gmailAccountConfirmed` in `proposals/outreach-log.json`). Dan komen de mails als **concept**
  in gallerydutchart@gmail.com en houdt de taak antwoorden bij (na 7 dagen zonder antwoord: één beleefde
  follow-up als concept; bij "no": nooit meer mailen). **Verzenden doet de eigenaar zelf.**
- Koppeling omzetten: claude.ai → Instellingen → Connectors → Gmail → loskoppelen → opnieuw verbinden en
  inloggen met gallerydutchart@gmail.com. Laat het daarna in de chat weten.
- PDF's worden als downloadlink in de mail gezet (te groot als bijlage via de koppeling).
- Contactadressen: alleen officieel gepubliceerde adressen. De hotelwebsites zijn vanuit de cloudomgeving
  niet altijd bereikbaar; dan noteert de taak de route (contactformulier/LinkedIn) en vult de eigenaar het adres in.
- Stoppen of pauzeren: zeg het in de chat; de geplande taak wordt dan uitgezet.
- Voortgang per hotel: `proposals/outreach-log.json`.

## Spelregels

- Alleen openbare, controleerbare feiten over het hotel; nooit een bestaande relatie suggereren
  (de laatste pagina zegt expliciet dat het een ongevraagd conceptvoorstel is).
- Geen verzonnen klanten, opdrachten, awards of cijfers. Visualisaties zijn illustratief.
- Digitale edities met blockchain-certificaat alleen als echtheidsbewijs, nooit als belegging.
- Elke e-mail eindigt met een afmeldregel ("reply no and I won't follow up").

Lettertype: Cormorant Garamond (SIL Open Font License, `assets/fonts/`).
