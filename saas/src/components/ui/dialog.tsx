"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Lightweight dialog (no portal libs). Controlled via open/onOpenChange. */
export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#14121b] p-6 shadow-2xl animate-fade-up",
          className
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white"
            aria-label="Sluiten"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
