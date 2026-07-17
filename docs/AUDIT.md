# Fase 1 — Audit gallerydutchart.nl (17 juli 2026)

**Platform:** Wix Editor (klassiek, géén Wix Studio) · Premium-plan · eigen domein · Velo ingeschakeld
**Site-ID:** `3ae99428-3e18-4c94-b6c6-2d8add59bbf8` · Taal: NL · Valuta: EUR
**Apps:** Promote SEO, Wix Blog, Invoices, Online Programs, Portfolio, Pricing Plans, Stores (Catalog **V1**)

## Sterk
- Premium-plan met eigen domein en SSL.
- Portfolio-app en Stores aanwezig — de juiste bouwstenen bestaan al.
- `llms.txt` en site-MCP-endpoint actief (AI-vindbaarheid) met goede Engelse merkomschrijving.
- robots.txt correct geconfigureerd (incl. PetalBot-block).
- Uniek merk-DNA: grachtenpandjes-logo, Delfts-blauw-erfgoed, NFT/Vermeer-project ("Milkmaid").
- Persverwijzing aanwezig: "Prints on canvas seen in VT Wonen".

## Zwak / gevonden problemen
1. **Portugese plaatshouderteksten** in 6 van 8 portfolioprojecten ("Aqui ficará a descrição do projeto…") — template-tekst die nooit is vervangen. → **hersteld**
2. **Template-slugs** (`project-title-1` … `project-title-6`) — onprofessioneel en SEO-loos. → **hersteld**
3. **Off-brand blogpost in het Portugees** over GOL-vluchten Rio–Lissabon (afkomstig van een andere site). → **naar prullenbak verplaatst**
4. **Spelfouten in de winkel**: "Acryli on canvas" (8×), "luxourious", dubbele spaties, namen in ALL CAPS met eindspaties. → **hersteld**
5. **Portugese ribbons** op producten ("Mais vendido", "Oferta", "Novo") — taalmix NL/EN/PT door de site heen. → **hersteld (Engels)**
6. **Zwakke sitebeschrijving** ("Discover Exclusive  Dutch Art that suits you." — met dubbele spatie). → **hersteld (Engelse positionering)**
7. **Portfoliocollectie heette "Mijn portfolio"** (Nederlands, generiek). → **"Selected Work"**
8. **Geen chatbot**: Wix Chat is niet geïnstalleerd. → menselijke actie nodig (zie DELIVERY.md)
9. **Geen contact-e-mail** in de site-eigenschappen. → menselijke actie nodig
10. **Slechts 6 contacten** in CRM, allemaal sitemembers — geen leads via formulieren; er is wél een Velo-collectie "Leads" met 20 velden (funnel-opzet bestaat, levert niets op).
11. **Merkclaims zonder context**: projecten als "Palace Versace" en "Louis Vuitton Bag Collection" wekten de indruk van opdrachten voor die merken. → geherformuleerd als onafhankelijke concept-studies/hommages (juridisch veiliger, wél even chic).
12. Sitetaal staat op **Nederlands** terwijl de doelgroep internationaal is. → omzetten naar Engels = menselijke actie (dashboard), zie DELIVERY.md.

## Beperkingen van de omgeving
- Klassieke Wix Editor: pagina-ontwerp is **niet** via API te bewerken (geen Wix Studio). Visuele herbouw gebeurt in de Editor met het meegeleverde ontwerp (`design/homepage-cinematic.html`) als masterfile.
- Catalog V1: digitale producten kunnen via API alleen als "physical" worden aangemaakt; omzetten naar digitaal + bestand koppelen is 2 klikken in het dashboard per product.
- De sandbox heeft geen directe toegang tot het live domein (netwerkpolicy); audit is uitgevoerd via de Wix-API's.
