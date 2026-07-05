import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gold-grad text-[#1c1606] shadow-glow hover:shadow-glow-lg hover:-translate-y-px active:translate-y-0",
        secondary:
          "glass text-zinc-100 hover:bg-white/[0.08] hover:border-white/20",
        ghost: "text-zinc-300 hover:bg-white/[0.06] hover:text-white",
        destructive:
          "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25",
        outline:
          "border border-gold/40 text-gold-bright hover:bg-gold/10",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-7 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
