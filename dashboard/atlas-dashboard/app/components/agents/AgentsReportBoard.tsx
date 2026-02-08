"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, DollarSign, Gauge, Sigma } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";

type ReportRow = {
  key: string;
  sessionId: string | null;
  agentLabel: string;
  kind: string;
  status: "ACTIVE" | "IDLE" | "STALE" | "UNKNOWN";
  model: string;
  contextTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number | null;
  lastActivityAt: string | null;
};

type ReportData = {
  generatedAt: string;
  rows: ReportRow[];
  totals: {
    sessions: number;
    active: number;
    contextTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
    sessionsWithCost: number;
    cloudSessions: number;
  };
};

function statusVariant(status: ReportRow["status"]) {
  if (status === "ACTIVE") return "success" as const;
  if (status === "IDLE") return "info" as const;
  if (status === "STALE") return "warning" as const;
  return "neutral" as const;
}

function fmtInt(value: number) {
  return new Intl.NumberFormat("es-ES").format(value);
}

function fmtMoney(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD", maximumFractionDigits: 4 }).format(value);
}

export default function AgentsReportBoard() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/report", { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(() => data?.rows ?? [], [data]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" /> Sesiones</CardTitle></CardHeader>
          <CardContent className="pt-2 text-2xl font-semibold text-slate-100">{fmtInt(data?.totals.sessions ?? 0)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Activos</CardTitle></CardHeader>
          <CardContent className="pt-2 text-2xl font-semibold text-emerald-300">{fmtInt(data?.totals.active ?? 0)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sigma className="h-4 w-4" /> Tokens totales</CardTitle></CardHeader>
          <CardContent className="pt-2 text-2xl font-semibold text-slate-100">{fmtInt(data?.totals.totalTokens ?? 0)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Costo estimado</CardTitle></CardHeader>
          <CardContent className="pt-2 text-2xl font-semibold text-indigo-200">{fmtMoney(data ? data.totals.estimatedCostUsd : null)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="text-slate-100">Observabilidad por agente/sesión</CardTitle>
          <div className="flex items-center gap-2">
            {data && <span className="text-xs text-slate-500">Actualizado: {new Date(data.generatedAt).toLocaleTimeString()}</span>}
            <Button size="sm" variant="ghost" onClick={load} disabled={loading}>Refresh</Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="overflow-auto rounded-xl border border-slate-800/80">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left">Agente</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                  <th className="px-3 py-2 text-left">Contexto</th>
                  <th className="px-3 py-2 text-left">Input</th>
                  <th className="px-3 py-2 text-left">Output</th>
                  <th className="px-3 py-2 text-left">Total</th>
                  <th className="px-3 py-2 text-left">Costo</th>
                  <th className="px-3 py-2 text-left">Modelo</th>
                  <th className="px-3 py-2 text-left">Última actividad</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-t border-slate-900/80 text-slate-200">
                    <td className="px-3 py-2">
                      <div className="font-medium">{row.agentLabel}</div>
                      <div className="text-xs text-slate-500">{row.kind}</div>
                    </td>
                    <td className="px-3 py-2"><Badge variant={statusVariant(row.status)}>{row.status}</Badge></td>
                    <td className="px-3 py-2">{fmtInt(row.contextTokens)}</td>
                    <td className="px-3 py-2">{fmtInt(row.inputTokens)}</td>
                    <td className="px-3 py-2">{fmtInt(row.outputTokens)}</td>
                    <td className="px-3 py-2 font-medium text-slate-100">{fmtInt(row.totalTokens)}</td>
                    <td className="px-3 py-2">{fmtMoney(row.estimatedCostUsd)}</td>
                    <td className="px-3 py-2 text-xs text-slate-400">{row.model}</td>
                    <td className="px-3 py-2 text-xs text-slate-400">{row.lastActivityAt ? new Date(row.lastActivityAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center text-slate-500">No hay sesiones activas reportadas por OpenClaw.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
