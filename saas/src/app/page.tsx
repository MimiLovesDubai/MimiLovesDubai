import Link from "next/link";
import {
  Rocket,
  PenLine,
  Megaphone,
  Search,
  Scale,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { PLANS } from "@/lib/plans";

const AGENTS = [
  { icon: Rocket, name: "Business Builder", desc: "Van idee naar concreet businessplan met validatie." },
  { icon: PenLine, name: "Website Copy", desc: "Complete websiteteksten die bezoekers omzetten in klanten." },
  { icon: Megaphone, name: "Marketing Agent", desc: "Marketingplannen, contentkalenders en campagnes." },
  { icon: Search, name: "SEO Agent", desc: "Zoekwoordstrategie en content die scoort in Google." },
  { icon: Scale, name: "Legal Letter", desc: "Formele brieven en aanmaningen, professioneel opgesteld." },
  { icon: Zap, name: "Productivity", desc: "Doelen worden taken, taken worden weekplanningen." },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-40 glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5 font-display font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-grad text-[#1c1606] shadow-glow">
              <Sparkles className="h-4 w-4" />
            </span>
            MyAIAgent <span className="gold-text">OS</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-zinc-300 md:flex">
            <a href="#agents" className="hover:text-white">AI-werknemers</a>
            <a href="#how" className="hover:text-white">Hoe het werkt</a>
            <Link href="/pricing" className="hover:text-white">Prijzen</Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link href="/login">
              <Button variant="ghost" size="sm">Inloggen</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Start gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-5 pb-24 pt-40 text-center">
        <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]" />
        <Reveal>
          <Badge className="mx-auto mb-6">
            <Sparkles className="h-3 w-3" /> Het besturingssysteem voor jouw AI-bedrijf
          </Badge>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight md:text-6xl">
            Run je bedrijf met <span className="gold-text">AI-werknemers</span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Zes gespecialiseerde AI-agents bouwen je businessplan, schrijven je website,
            plannen je marketing en zetten alles om in taken — in één premium commandocentrum.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/register">
              <Button size="lg" className="animate-pulse-glow">
                Start gratis — geen creditcard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="secondary">Bekijk prijzen</Button>
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.32}>
          <div className="mx-auto mt-14 flex max-w-xl items-center justify-center gap-8 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-gold" /> Jouw data blijft van jou</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-gold" /> Live in 2 minuten</span>
            <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-gold" /> Aangedreven door Claude</span>
          </div>
        </Reveal>
      </section>

      {/* Agents */}
      <section id="agents" className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="mb-12 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Je nieuwe team</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              Zes AI-werknemers, altijd aan het werk
            </h2>
          </div>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((a, i) => (
            <Reveal key={a.name} delay={i * 0.06}>
              <div className="group hud-ring glass h-full rounded-2xl p-6 transition-all hover:border-gold/50 hover:shadow-glow">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gold-grad text-[#1c1606] shadow-glow transition-transform group-hover:scale-110">
                  <a.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg font-semibold">{a.name}</h3>
                <p className="mt-1.5 text-sm text-muted">{a.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="mb-12 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Zo werkt het</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Van idee naar uitvoering</h2>
          </div>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: FileText, step: "01", title: "Maak een project", desc: "Voeg je idee, notities en documenten toe. Dit wordt de kennisbank van je AI-team." },
            { icon: Sparkles, step: "02", title: "Kies een agent en chat", desc: "Elke agent kent jouw project en levert direct bruikbare output — geen algemene antwoorden." },
            { icon: ListChecks, step: "03", title: "Genereer taken en voer uit", desc: "Eén klik zet elk gesprek om in een concrete takenlijst in je dashboard." },
          ].map((s, i) => (
            <Reveal key={s.step} delay={i * 0.08}>
              <div className="glass h-full rounded-2xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <s.icon className="h-6 w-6 text-gold" />
                  <span className="font-mono text-xs text-zinc-600">{s.step}</span>
                </div>
                <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="hud-ring glass rounded-3xl p-10 text-center md:p-14">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Begin gratis. <span className="gold-text">Groei wanneer jij groeit.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              {PLANS.free.messagesPerMonth} gratis AI-berichten per maand. Upgrade naar Pro
              (€{PLANS.pro.priceMonthly}/mnd) of Agency (€{PLANS.agency.priceMonthly}/mnd) wanneer je meer nodig hebt.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <Link href="/register"><Button size="lg">Maak gratis account</Button></Link>
              <Link href="/pricing"><Button size="lg" variant="outline">Vergelijk alle plannen</Button></Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-zinc-500 md:flex-row">
          <p>© {new Date().getFullYear()} MyAIAgent.tech — alle rechten voorbehouden.</p>
          <nav className="flex gap-6">
            <Link href="/privacy" className="hover:text-zinc-300">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-300">Voorwaarden</Link>
            <Link href="/cookies" className="hover:text-zinc-300">Cookies</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
