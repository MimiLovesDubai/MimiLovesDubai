import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, stripeConfigured, appUrl } from "@/lib/stripe";

export const runtime = "nodejs";

/** POST /api/stripe/portal — open the Stripe customer portal (manage/cancel). */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log eerst in." }, { status: 401 });

  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Betalen is nog niet geconfigureerd (STRIPE_SECRET_KEY ontbreekt).", devFallback: true },
      { status: 501 }
    );
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Geen actief betaald abonnement gevonden." },
      { status: 404 }
    );
  }

  try {
    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appUrl()}/dashboard/settings`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (err) {
    console.error("stripe portal error", err);
    return NextResponse.json({ error: "Kon het klantportaal niet openen." }, { status: 500 });
  }
}
