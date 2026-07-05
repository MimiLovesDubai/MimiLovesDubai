-- ============================================================
-- MyAIAgent OS — initial schema
-- Run in Supabase: SQL Editor -> paste -> Run
-- (or: supabase db push, with the CLI)
-- ============================================================

-- pgvector prepared (used later for semantic document search)
create extension if not exists vector;

-- ------------------------------------------------------------
-- profiles (mirror of auth.users)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- organizations
-- ------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- projects
-- ------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete set null,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);
create index if not exists projects_user_idx on public.projects(user_id);

-- ------------------------------------------------------------
-- agents (global catalog, seeded below)
-- ------------------------------------------------------------
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null,
  description text not null,
  icon text not null default 'bot',
  system_prompt text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- conversations & messages
-- ------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  agent_id uuid not null references public.agents(id),
  title text not null default 'Nieuw gesprek',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists conversations_user_idx on public.conversations(user_id, updated_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_conv_idx on public.messages(conversation_id, created_at);

-- ------------------------------------------------------------
-- documents (project context; embedding column prepared for pgvector)
-- ------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null default '',
  storage_path text,
  embedding vector(1536), -- prepared, not yet populated by the app
  created_at timestamptz not null default now()
);
create index if not exists documents_project_idx on public.documents(project_id);

-- ------------------------------------------------------------
-- tasks
-- ------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  source_conversation_id uuid references public.conversations(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','doing','done')),
  created_at timestamptz not null default now()
);
create index if not exists tasks_user_idx on public.tasks(user_id, status);

-- ------------------------------------------------------------
-- prompts (library: global rows have user_id null)
-- ------------------------------------------------------------
create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  category text not null default 'algemeen',
  content text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- subscriptions & payments & usage
-- ------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','pro','agency')),
  status text not null default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_invoice_id text unique,
  amount_cents integer not null,
  currency text not null default 'eur',
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('chat','task_gen')),
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists usage_user_month_idx on public.usage_logs(user_id, created_at);

-- ------------------------------------------------------------
-- New-user bootstrap: profile + default org + free subscription
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  insert into public.organizations (owner_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)) || '''s workspace');
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.projects enable row level security;
alter table public.agents enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.documents enable row level security;
alter table public.tasks enable row level security;
alter table public.prompts enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.usage_logs enable row level security;

create policy "own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "own orgs" on public.organizations
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "own projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "agents readable" on public.agents
  for select to authenticated using (true);

create policy "own conversations" on public.conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own messages" on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own documents" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "prompts read global or own" on public.prompts
  for select to authenticated using (user_id is null or auth.uid() = user_id);
create policy "prompts write own" on public.prompts
  for insert to authenticated with check (auth.uid() = user_id);
create policy "prompts delete own" on public.prompts
  for delete to authenticated using (auth.uid() = user_id);

create policy "own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "own payments" on public.payments
  for select using (auth.uid() = user_id);

create policy "own usage select" on public.usage_logs
  for select using (auth.uid() = user_id);
create policy "own usage insert" on public.usage_logs
  for insert with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Storage bucket for document uploads (private, per-user folder)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "docs upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "docs read own folder" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "docs delete own folder" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- ------------------------------------------------------------
-- Seed: 6 agents
-- ------------------------------------------------------------
insert into public.agents (slug, name, tagline, description, icon, system_prompt) values
('business-builder', 'Business Builder', 'Van idee naar plan',
 'Bouwt samen met jou een concreet businessplan: doelgroep, aanbod, prijs en validatie.',
 'rocket',
 'Je bent de Business Builder Agent van MyAIAgent OS, een ervaren startup-strateeg. Je helpt de gebruiker stap voor stap een online bedrijf op te zetten: positionering, doelgroep, aanbod, prijsstrategie en validatie. Werk gestructureerd, stel gerichte vragen als informatie ontbreekt, en geef altijd concrete, direct uitvoerbare vervolgstappen. Gebruik de projectcontext als die is meegegeven. Antwoord in de taal van de gebruiker (standaard Nederlands). Wees eerlijk over risico''s; beloof geen gegarandeerde resultaten.'),
('website-copy', 'Website Copy', 'Tekst die converteert',
 'Schrijft complete websiteteksten: hero, features, over ons, FAQ en call-to-actions.',
 'pen',
 'Je bent de Website Copy Agent van MyAIAgent OS, een senior conversie-copywriter. Je schrijft heldere, overtuigende websiteteksten (hero, features, social proof, FAQ, CTA) afgestemd op doelgroep en merk. Vraag naar doelgroep, aanbod en gewenste toon als dat onduidelijk is. Lever teksten sectie voor sectie, klaar om te plakken, zonder lorem ipsum. Gebruik de projectcontext als die is meegegeven. Antwoord in de taal van de gebruiker (standaard Nederlands).'),
('marketing', 'Marketing Agent', 'Plannen die verkopen',
 'Maakt marketingplannen, contentkalenders en campagnes voor social en e-mail.',
 'megaphone',
 'Je bent de Marketing Agent van MyAIAgent OS, een pragmatische growth-marketeer. Je maakt concrete marketingplannen: kanaalkeuze, contentkalenders, hooks voor social media, e-mailflows en campagnes met meetbare doelen. Prioriteer gratis/organische kanalen voor starters. Vraag naar budget, doelgroep en kanaal als dat ontbreekt. Lever output die direct uitvoerbaar is (per week, per post). Gebruik de projectcontext als die is meegegeven. Antwoord in de taal van de gebruiker (standaard Nederlands).'),
('seo', 'SEO Agent', 'Gevonden worden in Google',
 'Doet zoekwoordenonderzoek, schrijft meta-teksten en maakt SEO-contentplannen.',
 'search',
 'Je bent de SEO Agent van MyAIAgent OS, een technische en content-SEO-specialist. Je helpt met zoekwoordstrategie, paginatitels en meta-omschrijvingen, contentplannen, interne linkstructuur en on-page optimalisatie. Leg keuzes kort uit en geef prioriteiten (impact vs. moeite). Verzin geen zoekvolumes: geef indicaties en benoem onzekerheid. Gebruik de projectcontext als die is meegegeven. Antwoord in de taal van de gebruiker (standaard Nederlands).'),
('legal-letter', 'Legal Letter', 'Formele brieven, snel',
 'Stelt zakelijke en formele brieven op: aanmaningen, bezwaren, opzeggingen en klachten.',
 'scale',
 'Je bent de Legal Letter Agent van MyAIAgent OS. Je stelt formele Nederlandse brieven en e-mails op: betalingsherinneringen, aanmaningen, opzeggingen, klachten en bezwaarschriften. Vraag om de benodigde feiten (namen, data, bedragen, referenties) en lever een complete, nette brief. BELANGRIJK: je geeft algemene informatie en tekstsuggesties, geen juridisch advies; adviseer bij hoge belangen of complexe zaken altijd een jurist te raadplegen en vermeld dit onderaan elke brief-output. Antwoord in de taal van de gebruiker (standaard Nederlands).'),
('productivity', 'Productivity Agent', 'Meer gedaan in minder tijd',
 'Zet doelen om in taken, plant je week en helpt prioriteren met focus.',
 'zap',
 'Je bent de Productivity Agent van MyAIAgent OS, een nuchtere productiviteitscoach. Je helpt doelen opsplitsen in concrete taken, weekplanningen maken en prioriteren (belangrijk vs. urgent). Houd taken klein en meetbaar (af te ronden in 1 sessie). Vraag naar deadline en beschikbare tijd als dat ontbreekt. Gebruik de projectcontext als die is meegegeven. Antwoord in de taal van de gebruiker (standaard Nederlands).')
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- Seed: global prompt library
-- ------------------------------------------------------------
insert into public.prompts (user_id, title, category, content) values
(null, 'Doelgroep-interview', 'onderzoek', 'Stel je voor dat je mijn ideale klant bent: [beschrijf doelgroep]. Beantwoord als deze persoon: 1) Wat is je grootste frustratie rond [probleem]? 2) Wat heb je al geprobeerd? 3) Wat zou een perfecte oplossing voor je zijn? 4) Wat zou je daarvoor betalen?'),
(null, 'Waardepropositie-schrijver', 'strategie', 'Schrijf 5 varianten van een waardepropositie voor: [product/dienst] voor [doelgroep] die worstelen met [probleem]. Formaat: "Wij helpen [doelgroep] om [resultaat] zonder [pijn]." Kies daarna zelf de sterkste en leg uit waarom.'),
(null, 'Social hook-generator', 'marketing', 'Genereer 10 pakkende openingszinnen (hooks) voor korte video''s over [onderwerp], gericht op [doelgroep]. Mix: vraag, controversieel standpunt, cijfer, verhaal-opening en misvatting. Maximaal 12 woorden per hook, geen clickbait die niet waargemaakt wordt.'),
(null, 'E-mail welkomstflow', 'marketing', 'Schrijf een welkomstflow van 4 e-mails voor nieuwe inschrijvers van [merk]. E-mail 1: welkom + belofte. E-mail 2: verhaal + probleem. E-mail 3: bewijs + tips. E-mail 4: aanbod + urgentie (eerlijk). Geef per e-mail: onderwerpregel, preview-tekst en volledige tekst.'),
(null, 'Landingspagina-outline', 'copy', 'Maak een complete outline voor een landingspagina die [product] verkoopt aan [doelgroep]. Secties: hero (kop + subkop + CTA), probleem, oplossing, voordelen (3), social proof, prijs, FAQ (5 vragen), afsluitende CTA. Schrijf per sectie de daadwerkelijke tekst.'),
(null, 'SEO-artikel brief', 'seo', 'Maak een schrijfbriefing voor een SEO-artikel over [zoekwoord]. Geef: zoekintentie, voorgestelde titel (max 60 tekens), meta-omschrijving (max 155 tekens), H2/H3-structuur, te beantwoorden vragen, interne linksuggesties en een indicatie van de gewenste lengte.'),
(null, 'Weekplanning met prioriteiten', 'productiviteit', 'Hier zijn mijn doelen voor deze week: [doelen]. Beschikbare tijd: [uren]. Maak een realistische weekplanning: per dag maximaal 3 taken, de belangrijkste taak eerst, en benoem wat ik bewust NIET doe deze week.'),
(null, 'Formele klachtbrief', 'juridisch', 'Stel een formele klachtbrief op aan [bedrijf] over [probleem]. Feiten: [datum aankoop, bedrag, wat er misging, eerdere contactmomenten]. Toon: zakelijk en beslist, niet agressief. Sluit af met een concreet verzoek en een redelijke termijn van 14 dagen.')
on conflict do nothing;
