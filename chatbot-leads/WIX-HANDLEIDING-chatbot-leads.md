# Wix-handleiding — Chatbot, leadopslag, meldingen en fallback (gallerydutchart.nl)

Deze handleiding voert exact de prioriteitstaak uit: **iedere serieuze chatbezoeker wordt een lead met naam + e-mailadres in Wix, verschijnt met het gesprek in Wix Inbox, krijgt automatisch een bevestiging, en jij krijgt direct een melding en kunt persoonlijk antwoorden.**

Alles hieronder gebruikt uitsluitend native Wix-functies (Inbox, Chat, Contacts, Automations, Forms, Wix-app). Geen extern CRM, geen betaalde externe chatbot.

> **Menupaden:** alle paden beginnen in je sitedashboard: **manage.wix.com → kies je site (gallerydutchart.nl)**. Wix hernoemt menu's soms; vind je een item niet, gebruik dan de zoekbalk bovenin het dashboard (typ bv. "Inbox", "Automatiseringen", "Formulieren").

---

## Stap 1 — Controleer de huidige situatie (eerst doen, niets aanpassen)

Doorloop dit en noteer de antwoorden. Dit bepaalt of je de bestaande chat houdt (Route A) of vervangt (Route B).

1. **Welke chat staat er live?** Open https://www.gallerydutchart.nl in een incognitovenster (desktop én mobiel).
   - Chatknop rechtsonder met Wix-stijl venster → waarschijnlijk **Wix Chat / Wix Inbox-chat**.
   - Chatvenster met AI-antwoorden → mogelijk **Wix AI Site Chat**.
   - Logo/naam van een andere dienst (Tidio, Tawk, Crisp, e.d.) → **externe chatbot**.
   - Geen knop → er is **geen** live chat.
2. **Wix-kant:** Dashboard → **Inbox**. Staan hier gesprekken van bezoekers? Open het meest recente: staat er een naam/e-mailadres bij, of alleen "Bezoeker" met een nummer?
3. Dashboard → **Contacten**: zijn er contacten die uit de chat komen (bron "Chat"/"Inbox")?
4. Dashboard → **Automatiseringen**: welke automatiseringen staan aan? Noteer ze; **verwijder niets**. Let op oude automatiseringen die naar een verkeerd e-mailadres sturen.
5. Dashboard → **Instellingen → Meldingen** (of: Inbox → tandwiel ⚙ → Meldingen): welk e-mailadres ontvangt Inbox-meldingen? Klopt dat adres nog?
6. Stuur zelf een testbericht als bezoeker (incognito): komt het aan in Inbox? Krijg je een mail of pushmelding?
7. **Beantwoord daarna de kernvraag:** *krijg ik nu naam + e-mailadres van chatgebruikers?*
   - **Ja, en gesprekken staan in Inbox** → **Route A**: behouden en alleen aanvullen (leadformulier, automatiseringen, fallback).
   - **Nee, of externe chat zonder koppeling met Inbox/Contacts** → **Route B**: overstappen op de native Wix-chat hieronder. Verwijder een externe widget pas nadat de Wix-chat live en getest is, en controleer eerst of die externe dienst nog ergens anders voor wordt gebruikt.

## Stap 2 — Native Wix-chat activeren of controleren

1. Dashboard → **Inbox** → knop **Chatinstellingen** (of Instellingen ⚙ binnen Inbox).
2. Zet **Chat op je site weergeven** aan, op **alle pagina's**, desktop **en** mobiel.
3. Heeft je Wix-pakket **AI Site Chat / AI-chatassistent** (Dashboard → Inbox → AI-instellingen, of zoek "AI Site Chat" in het dashboard): zet deze aan en geef hem instructies (zie de gespreksflow in Stap 3). Zet **"Leadgegevens verzamelen"** (naam + e-mail) aan.
4. Geen AI-optie in je pakket? Prima — de gewone Wix-chat volstaat: bezoekers stellen hun vraag, het **pre-chat/offline-formulier** vangt naam + e-mail, en jij antwoordt persoonlijk vanuit Inbox. De leadcapture werkt dan óók.
5. In de chatinstellingen:
   - **Welkomstbericht** (verschijnt automatisch): `Welcome to Gallery Dutch Art. How can we help you today?`
   - **Pre-chat / gegevensformulier**: vraag **naam** en **e-mailadres**; e-mail **verplicht**. Telefoonnummer als optioneel veld toevoegen.
   - **Afwezigheidsbericht** (buiten kantooruren): `Thank you for your message. Please leave your name and email address so Gallery Dutch Art can send you a personal response.`

## Stap 3 — De gespreksflow en teksten (voor AI Site Chat of je eigen antwoorden)

Volgorde: eerst helpen, dan pas gegevens vragen. Gegevens worden gevraagd zodra iemand een offerte, prijzen, portfolio, project, samenwerking, afspraak of persoonlijk contact noemt.

Gebruik letterlijk deze teksten (Engels, zoals de site):

1. **Overgang naar leadcapture:**
   > "Thank you for telling us about your project. Gallery Dutch Art can review this personally and send you a relevant response. What is your name and business email address?"
2. **Toestemming (verplicht vóór opslag):**
   > "May Gallery Dutch Art store these details and contact you about this enquiry?"
3. **Na succesvolle opslag:**
   > "Thank you. Your enquiry has been received. Gallery Dutch Art will contact you using the details provided."
4. **Bij weigering of geen e-mailadres:**
   > "Without an email address or phone number, Gallery Dutch Art cannot send you a personal reply. You are welcome to continue browsing, or leave your details at any time via the contact form."

Verzamel minimaal: **voor- en achternaam, e-mailadres, bedrijf/organisatie, korte omschrijving van de aanvraag.** Vraag waar relevant ook: telefoon/WhatsApp, functie, land, projectlocatie, projecttype (hotel/resort/vastgoed/kunst), planning, indicatief budget, contactvoorkeur. E-mail is verplicht zodra iemand een antwoord/voorstel/portfolio verwacht; telefoon blijft optioneel tenzij iemand gebeld/geappt wil worden.

**Nooit** bevestigen dat gegevens zijn ontvangen als de opslag mislukt is — verwijs dan naar het fallbackformulier (Stap 6).

## Stap 4 — Opslag: zo hoort het eruit te zien in Wix

Bij een correct werkende flow zie je per lead:

- **Dashboard → Inbox**: het volledige gesprek, gekoppeld aan de persoon (niet "Bezoeker 123").
- **Dashboard → Contacten**: een contact met naam, e-mail, (telefoon), bedrijf, bron = chat, datum/tijd. Voeg via **Contacten → contact openen → Labels** het label **"Chatbot-lead"** toe (eenmalig aanmaken) en gebruik **Notities/Taken** voor opvolgstatus.
- Ontbreekt de koppeling gesprek↔contact, dan is het pre-chat/leadformulier (Stap 2.5) niet actief — dat is de plek waar naam en e-mail aan het gesprek worden gehecht.

## Stap 5 — Persoonlijk antwoorden (drie situaties)

- **A. Bezoeker nog online:** Dashboard → **Inbox** → gesprek openen → typ je antwoord → verzenden. De bezoeker ziet het direct in het chatvenster. Test dit één keer live.
- **B. Bezoeker weg, e-mail bekend:** antwoord gewoon vanuit **Inbox** — Wix bezorgt het bericht per e-mail op het opgegeven adres (controleer in Inbox dat het kanaal e-mail beschikbaar is bij dat contact). Of mail rechtstreeks vanuit **Contacten → contact → E-mail versturen**.
- **C. Anonieme bezoeker (geen e-mail):** terugcontact is **onmogelijk**. Daarom moet de chat vóór het einde van elk serieus gesprek om minimaal een e-mailadres vragen (Stap 3) en nooit de indruk wekken dat je iemand later kunt bereiken zonder gegevens.

## Stap 6 — Fallback: "Leave your details for a personal response"

Dit blijft werken óók als AI/chat niet beschikbaar is:

1. Dashboard → **Formulieren** (Forms) → **Nieuw formulier** → naam: **"Personal response"**. Velden: naam*, e-mail*, bedrijf, bericht*, en een **toestemmings-checkbox**: `May Gallery Dutch Art store these details and contact you about your enquiry?` (verplicht aanvinken).
2. Plaats het formulier via de **Editor** op de contactpagina en/of als knop **"Leave your details for a personal response"** zichtbaar nabij de chatknop. **Publiceer pas na de tests** (Stap 8).
3. Inzendingen komen automatisch in **Dashboard → Formulieren → Inzendingen** én in **Contacten**.

## Stap 7 — Automatiseringen (meldingen aan jou + bevestiging aan de bezoeker)

Dashboard → **Automatiseringen** → **+ Nieuwe automatisering**. Maak deze vier:

| # | Trigger | Actie |
|---|---------|-------|
| 1 | Bezoeker laat gegevens achter via chat / nieuw Inbox-bericht | **E-mail naar jou** met naam, e-mail, telefoon, bedrijf, bericht + link naar Inbox |
| 2 | Formulier "Personal response" ingezonden | **E-mail naar jou** (zelfde inhoud) |
| 3 | Formulier "Personal response" ingezonden | **Bevestigingsmail naar de bezoeker** (tekst hieronder) |
| 4 | Chatgegevens achtergelaten (indien beschikbaar als trigger) | **Bevestigingsmail naar de bezoeker** |

Bevestigingsmail (zakelijk/transactioneel — **geen** nieuwsbriefinschrijving, geen marketinglijst):

> **Subject:** Your enquiry at Gallery Dutch Art
>
> "Thank you for contacting Gallery Dutch Art. We have received your enquiry and will review the information you provided. A personal response will be sent to your email address."

Deze bevestiging mag alleen verstuurd worden bij een geldig e-mailadres + gegeven toestemming (dat is automatisch zo, omdat de trigger het formulier/leadformulier met verplichte velden is).

**Notificatieadres controleren (belangrijk):**
- In elke automatisering "E-mail naar jou": controleer het **ontvangstadres** expliciet. Gebruik geen oud adres.
- Dashboard → **Instellingen → Meldingen**: controleer/wijzig hier op welk adres je Inbox-meldingen krijgt. Dit is ook de plek waar je het later zelf aanpast.
- **Pushmeldingen:** installeer de **Wix-app** (App Store/Google Play) → log in → kies je site → app-instellingen → **Meldingen** → zet meldingen voor **Inbox/chatberichten** en **formulierinzendingen** aan.

## Stap 8 — Testronde (verplicht, vóór publicatie van wijzigingen)

Test als externe bezoeker in een **incognitovenster**. Gebruik overal herkenbare gegevens met het woord **TEST** (bv. "TEST Jansen", test+chat@jouwdomein.nl).

1. Desktop, anoniem: bericht sturen zonder gegevens → chat legt uit dat antwoord zonder e-mail niet kan.
2. Desktop: naam + e-mail achterlaten → verschijnt in Inbox mét naam.
3. Mobiel: naam + e-mail + telefoon → idem, chatvenster bruikbaar op telefoon.
4. Toestemming weigeren → géén contact aangemaakt, nette afsluittekst.
5. Ongeldig e-mailadres ("test@test") → formulier/chat weigert het.
6. Site sluiten direct na inzending → lead staat er toch.
7. Persoonlijk antwoord vanuit Inbox → komt aan (situatie A én B uit Stap 5).
8. Automatische bevestigingsmail ontvangen op het testadres.
9. E-mailmelding aan jou ontvangen op het juiste adres.
10. Push-/Inbox-melding op je telefoon ontvangen.
11. Lead zichtbaar in **Contacten** met alle velden.
12. Gesprek in Inbox gekoppeld aan de juiste persoon.
13. Chat uitschakelen (of AI uit) → fallbackformulier werkt nog steeds en triggert automatiseringen 2 + 3.

**Pas als alle 13 slagen:** wijzigingen publiceren. Daarna: Dashboard → Contacten → testcontacten met "TEST" **archiveren/verwijderen**; testgesprekken in Inbox archiveren. Verwijder geen echte gesprekken of contacten.

## Stap 9 — Beheerdershandleiding (dagelijks gebruik)

- **Nieuwe gesprekken lezen:** manage.wix.com → site → **Inbox** (of Wix-app → Inbox).
- **Contactgegevens vinden:** Dashboard → **Contacten** (filter op label "Chatbot-lead").
- **Persoonlijk antwoorden:** Inbox → gesprek → typen → verzenden (werkt live én per e-mail na vertrek).
- **Meldingsadres wijzigen:** Dashboard → **Instellingen → Meldingen**; plus per automatisering: Dashboard → **Automatiseringen → automatisering openen → actie "E-mail versturen" → ontvanger**.
- **App-pushmeldingen aanzetten:** Wix-app → site kiezen → Meldingen → Inbox/chat aan.
- **Zelf testen:** herhaal Stap 8-test 2 elk kwartaal, of na elke Wix-wijziging.
- **Geen e-mail achtergelaten?** Dan geen terugcontact mogelijk — de chat zegt dit zelf (Stap 3.4) en verwijst naar het formulier.
- **Werkt ook zonder AI-model:** de gewone chat + pre-chat-formulier, het fallbackformulier, Contacten, Inbox, alle automatiseringen en alle meldingen. Alleen de automatische AI-antwoorden vallen weg; leads blijven binnenkomen.

## Acceptatiecriterium (uit de opdracht)

Klaar is het pas wanneer een testbezoeker: (1) een chatbericht schrijft → (2) naam + e-mail achterlaat → (3) toestemming geeft → (4) als contact in Wix staat → (5) met gesprek in Inbox verschijnt → (6) automatisch een bevestiging krijgt → (7) bij jou een melding veroorzaakt → (8) en jij vanuit Inbox of e-mail persoonlijk kunt antwoorden — **plus** een werkend fallbackformulier zonder AI.
