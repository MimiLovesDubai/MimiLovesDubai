export type PlanId = "free" | "pro" | "agency";

export const PLANS: Record<
  PlanId,
  {
    id: PlanId;
    name: string;
    priceMonthly: number; // EUR
    messagesPerMonth: number;
    projects: number;
    blurb: string;
    features: string[];
    stripePriceEnv?: string;
  }
> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    messagesPerMonth: 25,
    projects: 1,
    blurb: "Proef de kracht van AI-werknemers.",
    features: [
      "25 AI-berichten per maand",
      "1 project",
      "Alle 6 AI-agents",
      "Prompt-bibliotheek",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 29,
    messagesPerMonth: 1000,
    projects: 10,
    blurb: "Voor ondernemers die serieus bouwen.",
    features: [
      "1.000 AI-berichten per maand",
      "10 projecten",
      "Alle 6 AI-agents",
      "Taken automatisch genereren",
      "Documenten als context",
      "E-mail support",
    ],
    stripePriceEnv: "STRIPE_PRICE_PRO",
  },
  agency: {
    id: "agency",
    name: "Agency",
    priceMonthly: 99,
    messagesPerMonth: 10000,
    projects: 100,
    blurb: "Voor bureaus en power users.",
    features: [
      "10.000 AI-berichten per maand",
      "100 projecten",
      "Alle 6 AI-agents",
      "Taken automatisch genereren",
      "Documenten als context",
      "Prioriteit support",
    ],
    stripePriceEnv: "STRIPE_PRICE_AGENCY",
  },
};

export function planFor(plan: string | null | undefined) {
  return PLANS[(plan as PlanId) || "free"] ?? PLANS.free;
}
