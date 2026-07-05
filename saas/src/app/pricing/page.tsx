import Link from "next/link";
import { Check, Sparkles, ArrowLeft } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/checkout-button";
import { Reveal } from "@/components/reveal";

export const metadata = { title: "Prijzen" };

export default function PricingPage() {
  const plans = [PLANS.free, PLANS.pro, PLANS.agency];
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <Link href="/" className="mb-10 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Terug naar home
      </Link>
      <Reveal>
        <div className="mb-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Prijzen</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Kies je plan</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            Start gratis, upgrade wanneer je AI-team harder moet werken. Maandelijks opzegbaar.
          </p>
        </div>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, i) => {
          const highlight = plan.id === "pro";
          return (
            <Reveal key={plan.id} delay={i * 0.08}>
              <div
                className={`relative flex h-full flex-col rounded-2xl border p-7 ${
                  highlight
                    ? "border-gold/50 bg-gold/[0.05] shadow-glow"
                    : "glass"
                }`}
              >
                {highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Sparkles className="h-3 w-3" /> Populair
                  </Badge>
                )}
                <h2 className="font-display text-xl font-semibold">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted">{plan.blurb}</p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-bold">
                    €{plan.priceMonthly}
                  </span>
                  <span className="text-sm text-muted">/maand</span>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span className="text-zinc-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  {plan.id === "free" ? (
                    <Link href="/register" className="block">
                      <Button variant="secondary" className="w-full">Start gratis</Button>
                    </Link>
                  ) : (
                    <CheckoutButton
                      plan={plan.id as "pro" | "agency"}
                      label={`Kies ${plan.name}`}
                      variant={highlight ? "default" : "outline"}
                    />
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      <p className="mt-10 text-center text-xs text-zinc-500">
        Prijzen excl. btw. Betalingen worden veilig verwerkt door Stripe.
        Limieten beschermen tegen misbruik; neem contact op voor maatwerk.
      </p>
    </div>
  );
}
