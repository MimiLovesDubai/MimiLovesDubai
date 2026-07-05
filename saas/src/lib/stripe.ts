import Stripe from "stripe";

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY ontbreekt.");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export function priceIdFor(plan: "pro" | "agency"): string | null {
  const id =
    plan === "pro" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_AGENCY;
  return id || null;
}

export function planForPriceId(priceId: string): "pro" | "agency" | null {
  if (priceId && priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId && priceId === process.env.STRIPE_PRICE_AGENCY) return "agency";
  return null;
}

export function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
