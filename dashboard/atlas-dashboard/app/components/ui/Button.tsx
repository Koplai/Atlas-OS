import * as React from "react";

import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:text-white/70",
  secondary:
    "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-900/60 disabled:opacity-60",
  ghost: "bg-transparent text-slate-200 hover:bg-slate-900/60 disabled:opacity-60",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-2 py-1 text-xs rounded-lg",
  md: "px-3 py-2 text-sm rounded-lg",
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  }
>(function Button({ className, variant = "secondary", size = "md", type = "button", ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    />
  );
});
