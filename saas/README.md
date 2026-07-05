# MyAIAgent OS — AI Business Operating System (MVP)

Een werkende SaaS-app waarmee je je online bedrijf runt met AI-werknemers:
projecten, zes gespecialiseerde Claude-agents met streaming chat, documenten
als context, automatische takenlijsten, prompt-bibliotheek, abonnementen via
Stripe en een admin-overzicht — in een premium dark-mode interface.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn-stijl
componenten · Framer Motion · Supabase (Auth + Postgres + RLS, pgvector
voorbereid) · Anthropic Claude API · Stripe Checkout · Vercel-ready.

---

## 1. Snel starten (lokaal)

Vereisten: Node 20+, een gratis [Supabase](https://supabase.com)-project en
een [Anthropic API-key](https://platform.claude.com).

```bash
cd saas
npm install
cp .env.example .env.local   # vul de waarden in (zie hieronder)
npm run dev                  # http://localhost:3000
```

## 2. Supabase instellen (±5 minuten)

1. Maak een project op [supabase.com](https://supabase.com) (gratis tier is genoeg).
2. **Database:** open *SQL Editor*, plak de volledige inhoud van
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) en klik **Run**.
   Dit maakt alle 12 tabellen, RLS-policies, de nieuwe-gebruiker-trigger,
   de storage-bucket en seedt de 6 agents + 8 standaardprompts.
3. **Auth:** *Authentication → Providers → Email* staat standaard aan.
   - Voor de snelste test: zet *Confirm email* **uit** (dan kun je direct inloggen).
   - Laat je hem aan, dan moet je op de bevestigingslink in de mail klikken —
     de registratiepagina legt dat netjes uit.
4. **Keys:** *Project Settings → API* → kopieer naar `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; nodig voor Stripe-webhook + admin)

## 3. Anthropic instellen (±1 minuut)

1. Maak een API-key op [platform.claude.com](https://platform.claude.com).
2. Zet hem in `.env.local` als `ANTHROPIC_API_KEY`.
3. Model is standaard `claude-opus-4-8` (override met `ANTHROPIC_MODEL`).

Zonder key blijft de app werken; de chat geeft dan een duidelijke melding
in plaats van een kapotte knop.

## 4. Stripe instellen (optioneel voor development)

Zonder Stripe-keys werkt de hele app; de upgrade-knop legt dan uit dat
billing nog niet is geconfigureerd (bewuste dev-fallback, HTTP 501).

Voor echte betalingen:

1. Maak op [dashboard.stripe.com](https://dashboard.stripe.com) (testmodus) twee
   producten met een maandelijkse prijs: **Pro €29/mnd** en **Agency €99/mnd**.
2. Kopieer de price-ID's naar `STRIPE_PRICE_PRO` en `STRIPE_PRICE_AGENCY`.
3. Zet `STRIPE_SECRET_KEY` (Developers → API keys).
4. **Webhook:** Developers → Webhooks → *Add endpoint*:
   - URL: `https://JOUW-DOMEIN/api/stripe/webhook`
     (lokaal: `stripe listen --forward-to localhost:3000/api/stripe/webhook`)
   - Events: `checkout.session.completed`, `customer.subscription.updated`,
     `customer.subscription.deleted`, `invoice.paid`
   - Kopieer de signing secret naar `STRIPE_WEBHOOK_SECRET`.
5. Testkaart: `4242 4242 4242 4242`, willekeurige toekomstige datum/CVC.

## 5. Deployen op Vercel

1. Push deze map naar een Git-repo (of gebruik de bestaande).
2. [vercel.com](https://vercel.com) → *New Project* → importeer de repo →
   **Root Directory: `saas`**.
3. Zet alle variabelen uit `.env.example` bij *Environment Variables*
   (met `NEXT_PUBLIC_APP_URL` = je productie-URL).
4. Deploy. Wijs daarna je Stripe-webhook naar het productie-domein.
5. Supabase: *Authentication → URL Configuration* → zet je productie-URL als
   Site URL (voor e-mailbevestigingslinks).

---

## Omgevingsvariabelen

| Variabele | Verplicht | Doel |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Publieke anon key (RLS beschermt data) |
| `SUPABASE_SERVICE_ROLE_KEY` | Voor webhook/admin | Server-only; omzeilt RLS |
| `ANTHROPIC_API_KEY` | Voor AI | Claude API |
| `ANTHROPIC_MODEL` | ❌ | Default `claude-opus-4-8` |
| `STRIPE_SECRET_KEY` | Voor betalen | Stripe server-key |
| `STRIPE_WEBHOOK_SECRET` | Voor webhook | Handtekening-verificatie |
| `STRIPE_PRICE_PRO` / `STRIPE_PRICE_AGENCY` | Voor betalen | Price-ID's |
| `NEXT_PUBLIC_APP_URL` | ✅ | Basis-URL voor redirects |
| `ADMIN_EMAILS` | Voor admin | Komma-gescheiden adminlijst |

Geen enkele secret staat in de code; alles loopt via env-variabelen en
`.env*` staat in `.gitignore`.

---

## Architectuur in het kort

```
src/
├── app/
│   ├── page.tsx                 # Landing (premium dark, Framer Motion)
│   ├── pricing/ privacy/ terms/ cookies/
│   ├── (auth)/login + register  # Supabase e-mail/wachtwoord
│   ├── dashboard/               # Beschermd via middleware
│   │   ├── page.tsx             # Overzicht: stats, launcher, recent, taken
│   │   ├── projects/[id]        # Projecten + documenten + gesprekken
│   │   ├── agents/              # Agent-launcher (6 agents, projectcontext)
│   │   ├── chat/[id]            # Streaming chat + "Genereer taken"
│   │   ├── tasks/ prompts/ settings/ admin/
│   └── api/
│       ├── chat                 # Claude-streaming, context, limieten, logging
│       ├── tasks/generate       # Structured output → takenlijst
│       ├── projects documents conversations tasks prompts
│       └── stripe/{checkout,webhook,portal}
├── lib/  (supabase clients, ai, plans, usage, ratelimit, zod-validatie)
└── components/ (ui-kit + dashboard-componenten, command palette ⌘K)
supabase/migrations/0001_init.sql  # schema + RLS + trigger + seeds
```

**Beveiliging:** middleware beschermt `/dashboard`; álle tabellen hebben
row-level security (eigenaar-only), agents/globale prompts zijn read-only
voor ingelogde gebruikers; API-routes valideren input met Zod; chat en
taakgeneratie hebben een rate limit én maandelijkse planlimieten;
de service-role key wordt alleen server-side gebruikt (webhook/admin).

---

## Testplan (handmatig)

1. **Registreren:** maak een account → (bevestig e-mail indien aan) → log in.
   ✔ Je komt op het dashboard; in Supabase zie je rijen in `profiles`,
   `organizations` en `subscriptions` (plan `free`).
2. **Project:** *Projecten → Nieuw project* → naam + omschrijving.
   ✔ Projectdetail opent; project telt mee in het overzicht.
3. **Document:** op de projectpagina *Document toevoegen* → plak tekst of
   kies een `.txt`/`.md`. ✔ Document verschijnt in de lijst.
4. **Agent + chat:** *AI-agents* → kies projectcontext → *Start gesprek* bij
   Website Copy → vraag: *"Schrijf een hero-tekst voor mijn product"*.
   ✔ Antwoord streamt live binnen; ✔ refresh: berichten staan er nog
   (opgeslagen in `messages`); ✔ het gesprek verwijst naar je projectcontext.
5. **Taken genereren:** klik in de chat op *Genereer taken*.
   ✔ Melding met aantal; *Taken*-pagina toont ze; status klikken werkt
   (todo → bezig → klaar) en overleeft een refresh.
6. **Limieten:** verstuur >20 chatberichten binnen 1 minuut → nette
   429-melding. (Maandlimiet test je door `messagesPerMonth` van `free`
   tijdelijk op 1 te zetten in `src/lib/plans.ts` → 402 met upgrade-melding.)
7. **Prompts:** kopieerknop werkt; eigen prompt opslaan en verwijderen werkt.
8. **Pricing/Stripe zonder keys:** *Kies Pro* → nette melding dat billing nog
   niet is geconfigureerd (501-fallback).
9. **Stripe mét keys (testmodus):** *Kies Pro* → Checkout → testkaart →
   terug op *Instellingen* met succes-banner; na webhook-aflevering staat het
   plan op Pro en verschijnt de betaling onder *Betalingen*; het
   klantportaal (opzeggen) opent.
10. **Admin:** zet je e-mail in `ADMIN_EMAILS` → *Admin* in de sidebar toont
    tellers en nieuwste gebruikers (vereist service-role key). Niet-admins
    worden geredirect.
11. **Responsive:** mobiel toont een compacte topbar; chat, dialogen en
    grids schalen mee.
12. **⌘K:** command palette opent, filtert en navigeert.

## Acceptatiecriteria (status)

| Criterium | Status |
|---|---|
| Registreren/inloggen | ✅ Supabase Auth (e-mail/wachtwoord, met confirm-flow) |
| Project aanmaken | ✅ incl. planlimiet |
| AI-agent starten | ✅ 6 agents, uit de database, met eigen system prompt |
| Echte AI-output via API | ✅ Claude, streaming, met projectcontext |
| Gesprekken opgeslagen | ✅ `conversations` + `messages` |
| Taken opgeslagen | ✅ handmatig + AI-gegenereerd (structured output) |
| Dashboard toont echte data | ✅ projecten, gesprekken, taken, usage |
| Pricingpagina | ✅ 3 plannen |
| Stripe checkout werkt / klaarstaat | ✅ met keys live; zonder keys nette 501-fallback |
| Legal pages | ✅ privacy, voorwaarden, cookies (NL) |
| Responsive | ✅ mobile-first, aparte mobiele navigatie |
| Nette foutafhandeling | ✅ Zod-validatie, duidelijke NL-meldingen, streamfouten afgevangen |
| Vercel-deploy mogelijk | ✅ `next build` slaagt; alleen env-vars nodig |

## Wat werkt / wat (bewust) nog niet

**Werkt volledig**
- Auth, projecten, documenten (tekst + .txt/.md-upload), 6 agents,
  streaming chat met geheugen en projectcontext, taken (handmatig + AI),
  prompt-bibliotheek (globaal + eigen), usage-limieten per plan,
  rate limiting, Stripe checkout/webhook/portaal, admin-overzicht,
  command palette, dark premium UI, RLS-beveiliging.

**Bewust beperkt in deze MVP (eerlijk benoemd in de UI waar relevant)**
- **pgvector is voorbereid, niet actief:** de `documents.embedding`-kolom en
  extensie bestaan, maar er worden nog geen embeddings berekend; documenten
  gaan als platte tekst (afgekapt) mee als context.
- **Documentuploads:** alleen tekstbestanden (.txt/.md/.csv) worden in de
  browser gelezen; PDF/Word-parsing zit er nog niet in. De storage-bucket
  met policies staat al klaar.
- **Organisaties:** elke gebruiker krijgt automatisch één workspace;
  teamleden uitnodigen zit nog niet in de UI.
- **Rate limiter is in-memory:** prima voor MVP/één instance; voor serieuze
  schaal vervang je hem door Redis/Upstash.
- **Wachtwoord vergeten:** nog geen aparte flow (kan via Supabase worden
  aangezet); geen social logins.
- **E-mails (facturen e.d.):** Stripe verstuurt zijn eigen bonnetjes;
  eigen transactionele mails zijn er nog niet.
