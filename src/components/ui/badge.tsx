import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "gold";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-kotoba-gold focus:ring-offset-2",
        {
          "border-transparent bg-kotoba-coral text-kotoba-text hover:bg-kotoba-coral-dark":
            variant === "default",
          "border-transparent bg-kotoba-elevated text-kotoba-text hover:bg-kotoba-elevated/80":
            variant === "secondary",
          "border-transparent bg-kotoba-gold/20 text-kotoba-gold-light hover:bg-kotoba-gold/30":
            variant === "gold",
          "text-kotoba-text border-kotoba-border": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
