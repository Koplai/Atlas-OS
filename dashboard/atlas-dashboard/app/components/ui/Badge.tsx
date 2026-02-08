import * as React from "react";

import { cn } from "./cn";

export type BadgeVariant = "neutral" | "info" | "success" | "warning" | "danger";

const variantClass: Record<BadgeVariant, string> = {
  neutral: "border-slate-800 bg-slate-900/40 text-slate-200",
  info: "border-indigo-900/60 bg-indigo-950/30 text-indigo-200",
  success: "border-emerald-900/60 bg-emerald-950/30 text-emerald-200",
  warning: "border-amber-900/60 bg-amber-950/30 text-amber-200",
  danger: "border-rose-900/60 bg-rose-950/30 text-rose-200",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}
