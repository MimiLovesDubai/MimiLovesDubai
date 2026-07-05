import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, stripeConfigured, priceIdFor, appUrl } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validate";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log eerst in." }, { status: 401 });

  const body = checkoutSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Ongeldig plan." }, { status: 400 });

  // Development fallback: clear message instead of a broken button.
  if (!stripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Betalen is nog niet geconfigureerd. Zet STRIPE_SECRET_KEY en de STRIPE_PRICE_* variabelen in .env.local (zie README).",
        devFallback: true,
      },
      { status: 501 }
    );
  }

  const priceId = priceIdFor(body.data.plan);
  if (!priceId) {
    return NextResponse.json(
      {
        error: `Prijs-ID voor het ${body.data.plan}-plan ontbreekt (STRIPE_PRICE_${body.data.plan.toUpperCase()}).`,
        devFallback: true,
      },
      { status: 501 }
    );
  }

  try {
    const stripe = getStripe();

    // Reuse the Stripe customer if we saved one earlier
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan: body.data.plan },
      subscription_data: { metadata: { user_id: user.id, plan: body.data.plan } },
      ...(sub?.stripe_customer_id
        ? { customer: sub.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
      success_url: `${appUrl()}/dashboard/settings?checkout=success`,
      cancel_url: `${appUrl()}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("stripe checkout error", err);
    return NextResponse.json(
      { error: "Stripe checkout kon niet worden gestart. Controleer je Stripe-configuratie." },
      { status: 500 }
    );
  }
}
