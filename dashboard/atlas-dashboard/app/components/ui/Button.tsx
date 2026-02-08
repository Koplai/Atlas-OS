import * as React from "react";

import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "border border-indigo-500/70 bg-indigo-600 text-white shadow-[0_8px_24px_-12px_rgba(99,102,241,0.8)] hover:bg-indigo-500 hover:border-indigo-400 disabled:bg-indigo-600/50 disabled:border-indigo-600/40 disabled:text-white/70",
  secondary:
    "border border-slate-700/80 bg-slate-900/40 text-slate-100 hover:border-slate-600 hover:bg-slate-900/80 disabled:opacity-60",
  ghost: "bg-transparent text-slate-300 hover:bg-slate-900/70 hover:text-slate-100 disabled:opacity-60",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-xs rounded-lg",
  md: "px-3.5 py-2 text-sm rounded-xl",
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
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    />
  );
});
