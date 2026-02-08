"use client";

import { useState } from "react";
import Link from "next/link";
import { RefreshCw, ShieldCheck, ScrollText, RotateCcw } from "lucide-react";

import { Button } from "@/app/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/Card";

type CheckResponse = {
  ok: boolean;
  checks?: {
    gateway: { ok: boolean; detail: string };
    database: { ok: boolean; detail: string };
    recentErrors: { ok: boolean; detail: string };
  };
  executedAt?: string;
  durationMs?: number;
};

type RestartResponse = {
  ok: boolean;
  action?: "restart" | "start";
  output?: string;
  status?: string;
  error?: string;
  durationMs?: number;
};

export default function OpsControlCenter() {
  const [checks, setChecks] = useState<CheckResponse | null>(null);
  const [restart, setRestart] = useState<RestartResponse | null>(null);
  const [busy, setBusy] = useState<"checks" | "restart" | null>(null);

  async function runChecks() {
    setBusy("checks");
    try {
      const res = await fetch("/api/ops/checks", { method: "POST" });
      const data = (await res.json()) as CheckResponse;
      setChecks(data);
    } finally {
      setBusy(null);
    }
  }

  async function restartSafe() {
    setBusy("restart");
    try {
      const res = await fetch("/api/ops/restart-safe", { method: "POST" });
      const data = (await res.json()) as RestartResponse;
      setRestart(data);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100"><ShieldCheck className="h-4 w-4" /> Run checks</CardTitle>
          <CardDescription>Ejecuta checks operativos (gateway, DB, errores recientes).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Button onClick={runChecks} disabled={busy !== null}>
              <RefreshCw className="h-4 w-4" /> {busy === "checks" ? "Ejecutando…" : "Run checks"}
            </Button>
            <Link href="/logs" className="text-xs text-indigo-300 hover:text-indigo-200">Ver logs</Link>
          </div>

          {checks && (
            <div className="mt-3 space-y-2 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-2 text-slate-300">Gateway: <strong>{checks.checks?.gateway.ok ? "OK" : "FAIL"}</strong></div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-2 text-slate-300">Database: <strong>{checks.checks?.database.ok ? "OK" : "FAIL"}</strong></div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-2 text-slate-300">Errores acumulados: <strong>{checks.checks?.recentErrors.detail ?? "N/A"}</strong></div>
              <div className="text-slate-500">{checks.executedAt ? new Date(checks.executedAt).toLocaleString() : ""} · {checks.durationMs ?? 0}ms</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100"><RotateCcw className="h-4 w-4" /> Restart safe</CardTitle>
          <CardDescription>Reinicia gateway de forma segura (si está caído, hace start).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={restartSafe} disabled={busy !== null}>
              <RotateCcw className="h-4 w-4" /> {busy === "restart" ? "Aplicando…" : "Restart safe"}
            </Button>
            <Link href="/logs" className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200">
              <ScrollText className="h-3.5 w-3.5" /> Logs
            </Link>
          </div>

          {restart && (
            <div className="mt-3 space-y-2 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-2 text-slate-300">Resultado: <strong>{restart.ok ? "OK" : "FAIL"}</strong> ({restart.action ?? "n/a"})</div>
              {restart.error ? (
                <div className="whitespace-pre-wrap rounded-lg border border-rose-800/60 bg-rose-900/20 p-2 text-rose-200">{restart.error}</div>
              ) : (
                <div className="whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950/50 p-2 text-slate-300">{restart.status || restart.output || "Sin salida"}</div>
              )}
              <div className="text-slate-500">{restart.durationMs ?? 0}ms</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
