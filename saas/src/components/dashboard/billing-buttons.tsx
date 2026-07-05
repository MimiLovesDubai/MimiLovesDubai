"use client";

import { useState } from "react";
import { CreditCard, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BillingButtons({ hasPaidPlan }: { hasPaidPlan: boolean }) {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || "Kon het portaal niet openen.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setNotice("Netwerkfout. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2.5">
        <a href="/pricing">
          <Button variant="secondary">
            <CreditCard className="h-4 w-4" /> Plannen bekijken / upgraden
          </Button>
        </a>
        {hasPaidPlan && (
          <Button variant="outline" onClick={openPortal} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            Facturen & opzeggen (Stripe)
          </Button>
        )}
      </div>
      {notice && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">{notice}</p>
      )}
    </div>
  );
}
