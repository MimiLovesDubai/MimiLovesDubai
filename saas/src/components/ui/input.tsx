import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
