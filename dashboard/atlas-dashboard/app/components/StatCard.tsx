"use client";

import { ReactNode } from "react";

import { Card, CardContent } from "./ui/Card";

export default function StatCard(props: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent>
        <div className="text-xs text-slate-400">{props.label}</div>
        <div className="mt-2 text-2xl font-semibold text-slate-100">{props.value}</div>
        {props.hint && <div className="mt-1 text-xs text-slate-500">{props.hint}</div>}
      </CardContent>
    </Card>
  );
}
