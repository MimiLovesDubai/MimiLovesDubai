"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

/** Small confirm-on-click delete button hitting a DELETE endpoint. */
export function DeleteButton({
  endpoint,
  id,
  confirmText = "Weet je het zeker? Dit kan niet ongedaan worden gemaakt.",
  redirectTo,
}: {
  endpoint: string;
  id: string;
  confirmText?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function del() {
    if (!window.confirm(confirmText)) return;
    setLoading(true);
    try {
      const res = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        if (redirectTo) router.push(redirectTo);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={del}
      disabled={loading}
      className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
      title="Verwijderen"
      aria-label="Verwijderen"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
