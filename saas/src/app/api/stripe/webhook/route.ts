import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, stripeConfigured, planForPriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/stripe/webhook — keeps the subscriptions/payments tables in sync.
 * Configure in Stripe: Developers -> Webhooks -> endpoint
 *   https://YOUR-DOMAIN/api/stripe/webhook
 * Events: checkout.session.completed, customer.subscription.updated,
 *         customer.subscription.deleted, invoice.paid
 */
export async function POST(req: NextRequest) {
  if (!stripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe niet geconfigureerd." }, { status: 501 });
  }
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY ontbreekt; webhook kan de database niet bijwerken." },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Geen signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("webhook signature verification failed", err);
    return NextResponse.json({ error: "Ongeldige signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.user_id;
        if (!userId || session.mode !== "subscription") break;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;

        let plan: "pro" | "agency" | null =
          (session.metadata?.plan as "pro" | "agency") || null;
        let periodEnd: string | null = null;

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = sub.items.data[0]?.price?.id;
          plan = (priceId && planForPriceId(priceId)) || plan;
          if (sub.current_period_end) {
            periodEnd = new Date(sub.current_period_end * 1000).toISOString();
          }
        }

        await admin.from("subscriptions").upsert(
          {
            user_id: userId,
            plan: plan || "pro",
            status: "active",
            stripe_customer_id: customerId ?? null,
            stripe_subscription_id: subscriptionId ?? null,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price?.id;
        const plan = priceId ? planForPriceId(priceId) : null;
        const cancelled =
          event.type === "customer.subscription.deleted" || sub.status === "canceled";
        const end = sub.current_period_end;

        await admin
          .from("subscriptions")
          .update({
            plan: cancelled ? "free" : plan || "pro",
            status: cancelled ? "cancelled" : sub.status,
            current_period_end: end ? new Date(end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = invoice.subscription_details?.metadata?.user_id;
        if (!userId) break;
        await admin.from("payments").upsert(
          {
            user_id: userId,
            stripe_invoice_id: invoice.id,
            amount_cents: invoice.amount_paid ?? 0,
            currency: invoice.currency || "eur",
            status: "paid",
          },
          { onConflict: "stripe_invoice_id" }
        );
        break;
      }
    }
  } catch (err) {
    console.error("webhook handling error", err);
    return NextResponse.json({ error: "Verwerking mislukte." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
