import * as React from "react";

import { cn } from "@/app/components/ui/cn";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-slate-800 bg-slate-950/25 p-8 text-center",
        className,
      )}
    >
      <div className="text-sm font-medium text-slate-200">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{description}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
