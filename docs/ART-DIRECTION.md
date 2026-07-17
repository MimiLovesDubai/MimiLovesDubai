# Fase 2+3 — Creatieve richting & prioriteiten

## Designconcept: "Museum Night, Amsterdam"
Eén cinematografische merkwereld: donker museaal canvas, ivoorkleurig licht, het magenta van het
grachtenpandjes-logo als enige felle stem. Internationale allure (kunstinstelling × luxury
hospitality × immersive studio), zonder neon, goud-overdaad of AI-glitter.

## Kleurpalet
| Rol | Kleur | Hex |
|---|---|---|
| Canvas (donker) | Museum Night | `#0B0A0D` / secties `#141218` |
| Licht | Ivory | `#F5F0E6` (dim: `#CFC8B8`) |
| Merkaccent | Gallery Magenta | `#C4267E` (uit het logo) |
| Detailaccent | Delft Cyan | `#29A8DF` (spaarzaam) |
| Warm accent | Old Gold | `#D4A017` (nummering, meta) |
| Delfts erfgoed | Cobalt | `#12306B` / `#1E4FA3` (artworks) |

## Typografie
- **Display:** klassieke serif (site: Playfair Display of Cormorant Garamond via Wix Fonts), regular, groot, ruim.
- **UI/body:** neo-grotesk (Helvetica Neue/Arial in masterfile; in Wix: Avenir of Helvetica).
- Kickers/labels: 11–12 px, uppercase, letterspacing 0.2–0.34 em.
- Hiërarchie: kicker → serif-kop → dim lopende tekst → CTA.

## Animatieprincipes
- Traag en soeverein: reveals 0.9 s ease, hover-lifts 0.3–0.45 s, Ken-Burns 26 s.
- Eén beweging per scherm; nooit twee dingen die tegelijk vragen om aandacht.
- `prefers-reduced-motion` wordt gerespecteerd (alles statisch).

## Homepage-opbouw (masterfile: `design/homepage-cinematic.html`)
1. **Cinematic hero** — fullscreen "Golden Hour Amsterdam", Ken-Burns, scrim, kicker, serif-kop
   (Bespoke Art, Immersive Experiences & Creative Direction …), sub, CTA's *Discuss Your Project* / *Enter the Portfolio*.
2. **Studio/disciplines** — 01 Hospitality Art · 02 Immersive Experiences · 03 Bespoke Commissions & Digital Editions.
3. **Selected Work** — afwisselend beeld/tekst, categorie-tags, gold meta, hover-zoom.
4. **Digital Editions** — donkerpaarse gradient, 3 editie-kaarten, blockchain-notitie, CTA *Acquire an Edition*.
5. **Quote-sectie** — ivoor canvas, founder-quote (contrastmoment).
6. **Contact** — Delft Flow als 14%-opacity fond, CTA-paneel.
7. **Footer** — logo, één regel, geen ruis.

## Portfolio-opbouw
Eén collectie **"Selected Work"**; elk project: fullscreen opening, titel, categorie + status
(**Concept study / Speculative concept / Proposal** — nooit een concept als gerealiseerde opdracht
presenteren), conceptuele tekst, detailbeelden, afsluitende project-CTA.

## Mobiel
Geen verkleinde desktop: één kolom, kop max ±34 px, CTA's full-width onder de duim,
gereduceerde animaties, geen horizontale scroll.

## Navigatie (nieuw)
Home · Selected Work · Digital Editions · Studio · Contact + knop **Start a Project**.
("Program list" en andere systeemteksten vervangen; minder belangrijke diensten onder "Studio".)

## Prioriteiten
**Kritiek (gedaan via API):** Portugese plaatshouders weg, Engels overal in data, spelfouten,
off-brand blog, sitebeschrijving, eerlijke projectlabels, slugs.
**Hoog (deels gedaan / menselijk):** homepage-herbouw naar masterfile, sitetaal → Engels,
contact-e-mail, digitale producten omzetten + bestanden koppelen, Wix Chat installeren.
**Middel:** pagina-SEO-titels/descriptions in Editor, Search Console, formulier + automation,
portfolio-beelden verrijken met detailshots.
**Optioneel:** meertaligheid (EN hoofdtaal + NL), video-hero, Kling AI-koppeling via Velo/Zapier.
