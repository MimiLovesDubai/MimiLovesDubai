import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[90px] w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
