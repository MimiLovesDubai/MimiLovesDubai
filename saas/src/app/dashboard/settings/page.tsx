import { createClient } from "@/lib/supabase/server";
import { getUsageAndLimit } from "@/lib/usage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillingButtons } from "@/components/dashboard/billing-buttons";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Instellingen" };
export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [usage, { data: sub }, { data: payments }, { data: profile }] = await Promise.all([
    getUsageAndLimit(supabase, user.id),
    supabase
      .from("subscriptions")
      .select("plan,status,current_period_end,stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("payments")
      .select("id,amount_cents,currency,status,created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("profiles").select("full_name,email").eq("id", user.id).maybeSingle(),
  ]);

  const pct = Math.min(100, Math.round((usage.used / Math.max(1, usage.limit)) * 100));

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Account</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Instellingen</h1>
      </div>

      {checkout === "success" && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          🎉 Betaling gelukt! Je upgrade wordt binnen enkele seconden actief (zodra Stripe de
          webhook heeft afgeleverd). Ververs de pagina als je het nog niet ziet.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profiel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm">
          <p><span className="text-muted">Naam:</span> {profile?.full_name || "—"}</p>
          <p><span className="text-muted">E-mail:</span> {profile?.email || user.email}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-base">
            Abonnement
            <Badge>{usage.plan.name}</Badge>
            {sub?.status && sub.status !== "active" && (
              <Badge variant="warning">{sub.status}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {usage.plan.priceMonthly === 0
              ? "Gratis plan — upgrade voor meer AI-berichten en projecten."
              : `€${usage.plan.priceMonthly}/maand` +
                (sub?.current_period_end
                  ? ` · verlengt op ${formatDate(sub.current_period_end)}`
                  : "")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted">AI-berichten deze maand</span>
              <span className="font-mono">{usage.used}/{usage.limit}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className={`h-full rounded-full ${pct >= 90 ? "bg-red-400" : "bg-gold-grad"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <BillingButtons hasPaidPlan={Boolean(sub?.stripe_customer_id)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Betalingen</CardTitle>
          <CardDescription>Je laatste facturen.</CardDescription>
        </CardHeader>
        <CardContent>
          {(payments || []).length === 0 ? (
            <p className="text-sm text-muted">Nog geen betalingen.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {(payments || []).map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-2.5">
                  <span>{formatDate(p.created_at)}</span>
                  <span className="font-mono">
                    €{(p.amount_cents / 100).toFixed(2)} · {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
