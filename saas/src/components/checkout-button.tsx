"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CheckoutButton({
  plan,
  label,
  variant = "default",
}: {
  plan: "pro" | "agency";
  label: string;
  variant?: "default" | "outline" | "secondary";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/register?next=/pricing`);
        return;
      }
      if (!res.ok) {
        setNotice(data.error || "Er ging iets mis. Probeer het later opnieuw.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setNotice("Netwerkfout. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <Button className="w-full" variant={variant} onClick={checkout} disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />} {label}
      </Button>
      {notice && (
        <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">{notice}</p>
      )}
    </div>
  );
}
