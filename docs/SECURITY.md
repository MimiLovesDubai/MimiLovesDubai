# Beveiligingsbeoordeling gallerydutchart.nl (26 oktober 2026)

**Platform:** Wix Editor (klassiek) · Premium-plan · eigen domein · Velo ingeschakeld
**Site-ID:** `3ae99428-3e18-4c94-b6c6-2d8add59bbf8`
**Scope:** alleen wat de site-eigenaar zelf beheert: apps, data-rechten, toegang en instellingen. De infrastructuur beheert Wix.
**Methode:** uitsluitend alleen-lezen controles via de Wix API op 26 oktober 2026. Er is in deze beoordeling niets aan de site gewijzigd.

## 1. Kort antwoord op "maak de site hackproof"

Honderd procent hackproof bestaat niet en niemand kan het garanderen: nieuwe kwetsbaarheden, phishing en gelekte wachtwoorden liggen buiten elke configuratie.
Een realistisch doel is: het aanvalsoppervlak klein houden, toegang goed afschermen en snel kunnen herstellen.

Uitkomst van deze controle:
- Geen lek gevonden in de CMS-rechten; er zijn daarom geen permissies aangepast.
- 1 dubbele app (Wix Forms & Payments) en 2 apps om te beoordelen (Online Programs, Hotels).
- De grootste winst zit in accountbeveiliging (2FA, wachtwoordbeheer). Dat kan alleen de eigenaar doen; zie de checklist.

## 2. Wat Wix zelf afdekt

Volgens de verdeling van verantwoordelijkheden tussen Wix en de site-eigenaar (in deze controle niet zelf getest) zorgt Wix voor:

| Onderdeel | Wie |
|---|---|
| TLS/SSL (https) en certificaten | Wix |
| Serverbeheer, patching en platformupdates | Wix |
| DDoS-bescherming | Wix |
| PCI-conformiteit voor betalingen (kaartgegevens raken de site niet) | Wix en betaalprovider |
| Account, wachtwoorden, rechten, apps, data-instellingen, Velo-code | **De eigenaar** |

In de audit van juli 2026 was al vastgesteld dat de site een Premium-plan met eigen domein en SSL heeft (zie AUDIT.md).

## 3. App-inventaris ("juiste software")

De API geeft 58 app-vermeldingen (56 unieke app-definities, allemaal ingeschakeld). 17 zijn te herkennen; de overige ongeveer 39 zijn Wix-platform- of systeem-apps waarvan de naam niet via de API of documentatie te herleiden is. Die zijn niet beoordeeld.

**Nodig / in gebruik**

| App | Bewijs van gebruik |
|---|---|
| Wix Stores (catalogus V3) en eCommerce (Checkout & Orders) | 16 producten |
| Wix Blog | 8 berichten |
| Wix Portfolio | 8 projecten |
| Wix Pricing Plans | 6 publieke plannen (e-books, Art Concept Sprint, Lease & Rotate, Project Deposit) |
| Wix Forms (nieuw, `225dd912...`) | Eigenaar van het actieve formulier "Leave your details for a personal response" (spamfilter ADVANCED) |
| Wix CMS / Velo | 3 eigen collecties (Leads, FunnelContent, LandingPages) |
| Promote SEO, Contacten, Marketing (coupons), Subscriptions | Ondersteunende apps; niet apart beoordeeld |
| Wix Chat en Inbox, Wix Invoices (V1) | Geïnstalleerd; gebruik niet gemeten |

**Dubbel: verwijderkandidaat (alleen na akkoord van de eigenaar)**
- **Wix Forms & Payments** (`14ce1214...`, in de Wix-documentatie "Forms (Old)"). Het enige formulier hangt aan de nieuwe Forms-app. In de namespace van de oude app staan 0 formulieren. Voorbehoud: de API ziet alleen formulieren die via de Form Schemas API bereikbaar zijn; controleer in de Editor dat geen pagina nog een oud formulier toont voordat de app verdwijnt.

**Onduidelijk / te beoordelen**
- **Wix Online Programs:** 2 programma's, beide in concept (DRAFT), niets gepubliceerd. Kandidaat voor verwijdering; beoordeel eerst of de concepten nodig zijn.
- **Wix Hotels:** past niet bij een galerie en het gebruik is onbekend (niet te tellen via de API). De naamkoppeling komt uit de site-context; de Wix-documentatie noemt voor Hotels een ander app-ID. Eigenaar beslist.

Aanbeveling: elke ongebruikte app vergroot het aanvalsoppervlak en het onderhoud. Verwijderen is niet terug te draaien; er is niets verwijderd.

## 4. CMS-datapermissies

Alleen de eigen (NATIVE) collecties zijn via de Permissions-API aan te passen. Gemeten waarden:

| Collectie | Items | Lezen | Toevoegen | Wijzigen | Verwijderen |
|---|---|---|---|---|---|
| Leads | 0 | CMS_EDITOR | **ANYONE** | CMS_EDITOR | CMS_EDITOR |
| FunnelContent | 6 | **ANYONE** | CMS_EDITOR | CMS_EDITOR | CMS_EDITOR |
| LandingPages | 11 | **ANYONE** | CMS_EDITOR | CMS_EDITOR | CMS_EDITOR |

Bijzondere rechten (specialPermissions): geen bij alle drie.

**Beoordeling**
- **Leads:** niet publiek leesbaar, dus geen datalek van persoonsgegevens. "Toevoegen: ANYONE" betekent dat een anonieme bezoeker rijen kan toevoegen (spamrisico, geen leesrisico). De collectie is nu leeg. Bewust ongewijzigd: de oude Velo-funnel kan hierop leunen en zou breken.
- **FunnelContent:** publiek leesbaar. Inhoud: formulierspecificatie, bedankpagina, drie e-mailteksten en een segment-mapping. Geen persoonsgegevens van bezoekers; het enige e-mailadres is het zakelijke afzenderadres nprojects@gallerydutchart.nl; een patroonscan vond geen sleutels of wachtwoorden. Laag risico. Kan naar CMS_EDITOR als geen pagina de inhoud via de front-end leest.
- **LandingPages:** publiek leesbaar is bedoeld (openbare pagina's). Geen actie.
- De collectielijst toont hetzelfde niveau als "ADMIN" waar de Permissions-API "CMS_EDITOR" toont; beide betekenen: niet publiek.
- Wix-app-collecties zijn niet via de API aan te passen. Opvallend: Members/FullData en Members/PublicData zijn leesbaar voor iedereen; dat is een vaste Wix-systeeminstelling (6 leden). Formulier-inzendingen, bestellingen, coupons en portfolio-collecties zijn alleen voor beheerders leesbaar. Nergens is publiek wijzigen of verwijderen mogelijk.

**Doorgevoerde wijzigingen: geen.** Er was geen duidelijk lek (geen publieke leesrechten op Leads, geen publiek wijzigen of verwijderen), dus ook geen voor/na.

## 5. Overige controles

| Controle | Uitkomst |
|---|---|
| Site-eigenschappen | Bedrijfsnaam, e-mail (gallerydutchart@gmail.com) en taal aanwezig; geen telefoon of adres. Het veld `consentPolicy` komt niet terug in de API-respons. Controleer in het dashboard. |
| Cookiebanner | De API antwoordt "No application found for the requested site". De cookiebanner lijkt dus niet actief. Controleer in het dashboard of bezoekers om toestemming wordt gevraagd. |
| Formulier | Spamfilter staat op ADVANCED, toestemmingsveld aanwezig. Een aparte CAPTCHA-instelling is niet via de API zichtbaar. |
| Toegang | 2 accounts hebben toegang tot de site (de API toont alleen account-ID's, geen namen of rollen). |
| Geheimen in publieke collecties | Patroonscan van FunnelContent en LandingPages: 0 treffers. Beperkte scan, geen garantie. |
| robots.txt en llms.txt | Eerder gecontroleerd (zie AUDIT.md). In deze sessie niet opnieuw opgehaald: het egress-beleid blokkeerde www.gallerydutchart.nl. |

## 6. Checklist voor de eigenaar

1. **2FA aanzetten op het Wix-account** (Account Settings → Privacy & Security).
2. **2FA aanzetten op gallerydutchart@gmail.com.** Wie dit postvak overneemt, kan wachtwoorden van Wix resetten.
3. Gebruik een **sterk, uniek wachtwoord** in een wachtwoordmanager, voor Wix én Gmail.
4. Houd **herstelgegevens** (telefoon, herstelmail) actueel.
5. **Deel nooit inloggegevens**; geef anderen toegang via een uitnodiging met een rol.
6. **Controleer de collaborators** (Dashboard → Roles & Permissions). Nu hebben 2 accounts toegang; zijn beide herkenbaar?
7. **Zet CAPTCHA aan** in de formulierinstellingen, naast het spamfilter.
8. Zet **geen API-sleutels of wachtwoorden** in sitetekst of Velo-frontendcode; gebruik de Secrets Manager voor backendcode.
9. Controleer **cookiebanner en privacy-instellingen** (zie sectie 5).
10. **Ruim apps periodiek op** en geef akkoord of afwijzing op de kandidaten in sectie 3.
11. Beslis of **Leads: toevoegen door iedereen** nog nodig is (alleen na controle van de oude funnel).

## 7. Wat niet via de API te controleren was

- 2FA-status van het Wix-account en van Gmail, wachtwoordsterkte, herstelgegevens.
- Namen en rollen van de collaborators.
- Velo-code (frontend en backend): niet leesbaar via de API, dus onbekend of er geheimen of onveilige hooks in staan.
- Of een pagina in de Editor nog het oude Forms & Payments-formulier gebruikt.
- De live site (https, headers, robots.txt, llms.txt) in deze sessie.
- Cookiebanner-instellingen buiten de API-respons; de CAPTCHA-schakelaar.
- Gebruik van Chat, Invoices en Hotels; de ongeveer 39 niet-herkende platform-apps.
- Betaalinstellingen, domein- en registrar-beveiliging (domeinvergrendeling, 2FA bij de registrar).
