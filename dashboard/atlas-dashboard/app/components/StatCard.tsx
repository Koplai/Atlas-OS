"use client";

import { ReactNode } from "react";

export default function StatCard(props: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="text-xs text-slate-400">{props.label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-100">{props.value}</div>
      {props.hint && <div className="mt-1 text-xs text-slate-500">{props.hint}</div>}
    </div>
  );
}
