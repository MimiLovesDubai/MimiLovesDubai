# Fase 6 — Oplevering & beheergids (17 juli 2026)

## Wat is aangepast (live, via de Wix-API's)

### Winkel (12 producten)
- Alle titels genormaliseerd (geen ALL CAPS-spaties meer): *It's Donald Duck!*, *Lekker Rolmopsie*,
  *Zing, Lach, Huil, Bid en Bewonder*, *Hollandse Gezelligheid*, *Mysterious Lady*, *Falling in Love (Pink)*,
  *Davide*, *Doggy Walk*, *Falling in Love*, *Poem Lady*, *Deep Emotions*, *The Godfather*.
- Professionele Engelse galerijbeschrijvingen; "Acryli"/"luxourious"-spelfouten weg.
- Ribbons vertaald: "Mais vendido" → **Best Seller**, "Novo" → **New**, "Oferta" → **Signature Work**
  (bewust géén "Special Offer": er is geen korting actief — geen valse claim).

### Portfolio (8 projecten + collectie)
- Collectie "Mijn portfolio" → **"Selected Work"** met Engelse ondertitel.
- Alle Portugese plaatshouderteksten vervangen door Engelse projectverhalen.
- Eerlijke labels per project: *Concept study*, *Speculative concept* of *Proposal* —
  conceptwerk wordt nergens meer als gerealiseerde opdracht gepresenteerd.
- Merkveilige titels: "Palace Versace" → *Palazzo di Moda — Italy*; "Louis Vuitton Bag Collection" →
  *Couture Bags — An Homage* (met expliciete disclaimer "not affiliated").
- Rijksmuseum-project heet nu *Milkmaid — Holographic NFT Collection* (status: Proposal).
- Nette SEO-slugs (`war-museum-immersive-experience`, `milkmaid-holographic-nft`, …).

### Blog
- Portugese GOL-vluchten-post (off-brand) → **prullenbak** (herstelbaar in Blog → Trash).
- Nieuwe Engelse post over de Digital Editions / blockchain (zie blog-dashboard).

### Site-identiteit & SEO
- Bedrijfsomschrijving (site properties) nu in het Engels: *"Gallery Dutch Art creates bespoke art,
  blockchain-certified digital editions and immersive experiences for luxury hotels, residences and
  landmark destinations worldwide."*
- `llms.txt` geactualiseerd (AI-zoekmachines); robots.txt gecontroleerd — in orde.

### Nieuw: Digital Editions (blockchain) + design-asset
- 3 originele digitale kunstwerken gecreëerd (generatieve kunst, uniek voor de galerie):
  **Delft Flow**, **Tulipomania — Nocturne**, **Golden Hour — Amsterdam** (elk "Edition of 10", €295).
- 1 design-product: **Dutch Heritage Pattern Library** (commercial design licence, €149).
- Masterbestanden (2400×3000 PNG + JPG + broncode van de generator) staan in `assets/artworks/` en
  `assets/generator/` in deze repository — jouw eigendom, reproduceerbaar en uitbreidbaar.

### Logo
- **Officieel logo (jouw aangeleverde bestand, bijgesneden):** de onderste tekst (naam + functietitels)
  en de sierkrullen zijn eraf gehaald; over blijft www-boog + "GALLERY DUTCH ART.NL" + de drie huisjes.
  Bestanden: `assets/logo/gallery-dutch-art-logo-original.png` (witte achtergrond) en
  `…-original-transparent.png` (transparant, voor donkere vlakken). Beide staan ook in de Wix Media
  Manager. In de Editor: header → afbeelding vervangen → kies dit bestand uit Media.
- Extra: een vector-merkversie (alleen huisjes + "GALLERY DUTCH ART", strak hertekend) in
  `assets/logo/gallery-dutch-art-logo.svg` + `.png` — handig als klein beeldmerk in de siteheader,
  waar het volledige gestapelde logo onleesbaar klein zou worden.

### Cinematografische homepage (masterfile)
- `design/homepage-cinematic.html` — volledig uitgewerkt ontwerp (desktop + mobiel getest, incl.
  reveal-animaties, Ken-Burns-hero, reduced-motion-fallback). Open het bestand in een browser en
  bouw de secties 1-op-1 na in de Wix Editor (kleuren/typografie in `docs/ART-DIRECTION.md`).
  De klassieke Wix Editor laat pagina-ontwerp niet via API toe — dit is bewust als masterfile geleverd
  zodat niets van de bestaande site kapot kan gaan.

## Waar vind je je leads?
- **Dashboard → Contacts (CRM)**: alle contacten en leads. Vandaag: 6 contacten (alleen members).
- **Dashboard → Inbox**: berichten en chats.
- Meldingen: Dashboard → Settings → Notifications → e-mail aanzetten voor "New contact / form submission".
- De Velo-collectie "Leads" (CMS → Leads) bevat de oude funnel-data.

## Chatbotgesprekken bekijken
Er is **nog geen chatapp geïnstalleerd**. Installeren: Dashboard → Apps → App Market → **Wix Chat** →
Add. Daarna staan alle gesprekken in **Inbox**; de mobiele Wix-app geeft pushmeldingen.

## Teksten, projecten en beelden zelf wijzigen
- Winkel: Dashboard → Store Products → product → bewerken.
- Portfolio: Dashboard → Portfolio → Projects.
- Blog: Dashboard → Blog.
- Beelden: Dashboard → Media Manager (de 4 nieuwe kunstwerken + logo staan er al).
- Homepage/design: Editor (blauwe knop "Edit Site").

## Menselijke acties (kort lijstje, in volgorde)
1. **Back-up**: Dashboard → Settings → Site history → "Duplicate site" (vóór Editor-werk). *(API kan dit niet.)*
2. **Sitetaal naar Engels**: Dashboard → Settings → Language & region → English. (Systeemteksten,
   cart/checkout worden dan Engels.)
3. **Contact-e-mail instellen**: Dashboard → Settings → Business info → e-mail + adres invullen.
4. **Digitale producten omzetten**: Store Products → elk van de 4 nieuwe producten → Product type →
   **Digital file** → upload het bijbehorende bestand uit `assets/artworks/` (master-PNG). (Catalog V1
   staat dit alleen via het dashboard toe.)
5. **Homepage herbouwen** met `design/homepage-cinematic.html` als voorbeeld (of plan een sessie —
   de teksten kunnen 1-op-1 gekopieerd worden).
6. **Wix Chat installeren** (zie boven) + welkomstbericht: *"Welcome to Gallery Dutch Art. How can we
   help you create something iconic?"*
7. **Formulier + automation**: Editor → Add → Contact Form op de contactsectie; daarna Dashboard →
   Automations → "Form submitted → send email to me" + "→ send thank-you email to visitor".
8. **SEO-basis in de Editor**: per pagina Page SEO → Engelse titel + description. Suggesties:
   - Home: "Gallery Dutch Art — Bespoke Art for Iconic Hotels & Destinations"
   - Shop: "Original Dutch Contemporary Art & Blockchain Digital Editions"
   Daarna Dashboard → Marketing → SEO → verbind **Google Search Console** en dien de sitemap in.
9. **Kling AI-koppeling** (gevraagd): kan niet veilig automatisch — vereist jouw eigen Kling-account
   en API-sleutel. Veilige route: Dashboard → Developer Tools → Secrets Manager → sleutel opslaan →
   Velo-backendfunctie (web module) die de Kling-API aanroept — **nooit** de sleutel in de frontend.
   Alternatief zonder code: Zapier (Kling AI ↔ Wix) via je Zapier-account. Zet dit desgewenst als
   vervolgopdracht uit; de AI-beeldpipeline die vandaag is gebruikt staat al in `assets/generator/`.

## Eerlijkheid over "bovenaan in Google"
De technische SEO-basis is gelegd (schone Engelse content, nette slugs, llms.txt, robots.txt,
beschrijvingen). Niemand kan een #1-positie garanderen — wél is dit het bewezen pad: Search Console
aansluiten, per pagina titels/descriptions (actie 8), regelmatig Engelstalige blogposts rond
"hospitality art", "art for hotels", "blockchain art editions", en backlinks via pers (VT Wonen-lijn
doorzetten). De blockchain-editions geven een uniek, nieuwswaardig verhaal om mee te pitchen.

## Gebruikte Wix-functies
Stores Catalog V1 API · Portfolio API · Blog API · Site Properties API · SEO txt-file API (llms.txt) ·
Media Manager API · CRM/Contacts (gelezen) · Form Submissions API (gecontroleerd) — alles binnen de
bestaande site; niets is gemigreerd of opnieuw gebouwd.
