# Statusrapport — Chatbot, leads en bereikbaarheid (gallerydutchart.nl)

**Datum:** 10 augustus 2026
**Taak:** Zorgen dat chatbotbezoekers als lead met contactgegevens in Wix Inbox/Contacts terechtkomen, met melding en bevestiging.

---

## 1. Het directe antwoord op je hoofdvraag

**"Krijg ik op dit moment wel of niet de contactgegevens van chatbotgebruikers?"**

**Dat kon in deze sessie niet worden vastgesteld — en ik ga het niet gokken.** Je hebt uitdrukkelijk gevraagd om geen aannames te doen en alleen geteste feiten te rapporteren. In deze sessie was echte controle technisch onmogelijk (zie punt 2). Hieronder staat exact hoe je het zelf in 5 minuten controleert (punt 3) en hoe je mij bij een volgende sessie wél toegang geeft zodat ik het volledig kan uitvoeren en testen (punt 4).

## 2. Waarom deze sessie de Wix-site niet kon bereiken

Twee onafhankelijke blokkades, beide buiten mijn controle en beide alleen door jou op te heffen:

1. **Wix-koppeling vereist goedkeuring.** De Wix-connector is wel aan deze omgeving gekoppeld, maar elke aanroep werd geweigerd met "MCP tool call requires approval". Deze sessie draait op de achtergrond (zonder dat jij meekijkt), dus er was niemand om de goedkeuringsvraag te beantwoorden. Zonder die goedkeuring kan ik Wix Inbox, Contacts, Automations, chatinstellingen en meldingsinstellingen niet inzien of wijzigen.
2. **De netwerkpolicy van deze omgeving blokkeert gallerydutchart.nl.** Ook het simpelweg openen van de gepubliceerde website (om te zien welke chatwidget er live staat) werd door de uitgaande-verkeer-policy geblokkeerd ("EGRESS_BLOCKED"). Ik kon dus zelfs niet extern verifiëren welke chatoplossing er draait.

Wat ik wél heb gecontroleerd: deze GitHub-repository bevat alleen tekstcontent (e-books, verkoopteksten) en **geen** sitecode of Velo-code. De hele site leeft in Wix zelf — er valt hier dus niets in code te repareren.

**Over "switch model":** ik kan het model van een lopende sessie niet zelf omwisselen; dat kies je bij het starten van een sessie. Ik heb het verbruik minimaal gehouden: geen sub-agents, geen zware analyses, alleen de noodzakelijke controles en dit rapport.

## 3. Zo controleer je zelf in 5 minuten of je nu leads ontvangt

1. Open je site in een **incognitovenster** op je telefoon of desktop: https://www.gallerydutchart.nl
2. Staat er rechtsonder een chatknop? Zo nee → er is geen live chat en je verliest nu zeker leads.
3. Zo ja: stuur als testbezoeker het bericht: *"TEST — I would like a quote for a hotel art project."*
4. Kijk of de chat om je **naam en e-mailadres** vraagt. Vult niets dat af → dan verzamelt de chat nu géén contactgegevens.
5. Open de **Wix-app** op je telefoon of ga naar **manage.wix.com → jouw site → Inbox**. Staat het testgesprek daar? Zie je een naam/e-mailadres bij het gesprek, of alleen "Bezoeker 123…"?
6. Check **Dashboard → Contacten**: is er een nieuw contact aangemaakt?
7. Check je mailbox (ook spam): kreeg je een melding? Zo ja, **op welk e-mailadres**?

Als bij stap 4–7 iets ontbreekt, geldt: **je krijgt nu geen bruikbare leads uit de chat.** De volledige reparatie staat stap voor stap in `WIX-HANDLEIDING-chatbot-leads.md` (zelfde map) — inclusief exacte menupaden, de chatteksten, de automatiseringen, het fallbackformulier en de 13 verplichte tests.

## 4. Hoe ik dit de volgende keer volledig voor je kan uitvoeren

Twee opties (één is genoeg):

- **Optie A — interactieve sessie:** start deze taak in een gewone (interactieve) Claude-sessie met de Wix-connector actief, en klik op **"Toestaan/Allow"** zodra de goedkeuringsvraag voor de Wix-tools verschijnt. Dan kan ik alle instellingen echt inzien, aanpassen, de automatiseringen aanmaken en de volledige testronde draaien.
- **Optie B — achtergrondsessie met vooraf goedgekeurde Wix-tools:** geef in de omgevings-/permissie-instellingen de Wix-connectortools vooraf goedkeuring en zet de netwerkpolicy zo dat gallerydutchart.nl bereikbaar is. Dan kan dit ook zonder dat je meekijkt.

## 5. Wat er nu al klaarstaat (geen Wix-toegang nodig)

In `WIX-HANDLEIDING-chatbot-leads.md` staat volledig uitgewerkt en direct bruikbaar:

- de controle-checklist voor de huidige situatie (Stap 1 uit je opdracht);
- de aanbevolen inrichting op basis van native Wix (Inbox, Contacts, Automations, Forms — geen extern CRM);
- de exacte chatbot-gespreksflow met jouw Engelse teksten en de toestemmingsvraag;
- welke gegevens per lead worden vastgelegd;
- de drie antwoord-situaties (bezoeker online / vertrokken met e-mail / anoniem);
- de meldingen-inrichting inclusief waar je het notificatie-e-mailadres controleert en wijzigt;
- de automatische bevestigingsmail (zakelijk, geen nieuwsbriefinschrijving);
- het permanente fallbackformulier dat ook zonder AI blijft werken;
- de 13 verplichte tests met TEST-gegevens en het opruimen daarvan;
- de beheerdershandleiding met exacte Wix-menupaden.

**Belangrijk:** er is in deze sessie niets op de live site gewijzigd, niets verwijderd en niets gepubliceerd.
