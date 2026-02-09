"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, ShieldCheck, ScrollText, RotateCcw, PlugZap, Play } from "lucide-react";

import { Button } from "@/app/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { ROUTES } from "@/app/components/shell/routes";

type CheckResponse = {
  ok: boolean;
  checks?: {
    gateway: { ok: boolean; detail: string };
    database: { ok: boolean; detail: string };
    recentErrors: { ok: boolean; detail: string };
    mcp: { ok: boolean; detail: string };
  };
  executedAt?: string;
  durationMs?: number;
  error?: string;
};

type RestartResponse = {
  ok: boolean;
  action?: "restart" | "start";
  output?: string;
  status?: string;
  error?: string;
  durationMs?: number;
};

type McpStatusResponse = {
  ok: boolean;
  summary: { configured: number; enabled: number; online: number };
  servers: Array<{ id: string; label: string; enabled: boolean; ok: boolean; latencyMs: number | null; detail: string; allowedTools: string[] }>;
};

type McpInvokeResponse = {
  ok: boolean;
  status: number;
  result?: string;
  error?: string;
  serverId?: string;
  toolName?: string;
};

export default function OpsControlCenter() {
  const [checks, setChecks] = useState<CheckResponse | null>(null);
  const [restart, setRestart] = useState<RestartResponse | null>(null);
  const [mcpStatus, setMcpStatus] = useState<McpStatusResponse | null>(null);
  const [mcpInvoke, setMcpInvoke] = useState<McpInvokeResponse | null>(null);
  const [selectedServerId, setSelectedServerId] = useState("");
  const [toolName, setToolName] = useState("status.ping");
  const [argsText, setArgsText] = useState("{}");
  const [busy, setBusy] = useState<"checks" | "restart" | "mcpStatus" | "mcpInvoke" | null>(null);

  async function runChecks() {
    setBusy("checks");
    try {
      const res = await fetch("/api/ops/checks", { method: "POST" });
      const data = (await res.json()) as CheckResponse;
      if (!res.ok) {
        setChecks({ ok: false, error: data.error ?? `HTTP_${res.status}` });
      } else {
        setChecks(data);
      }
    } catch (err: unknown) {
      setChecks({ ok: false, error: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(null);
    }
  }

  async function restartSafe() {
    setBusy("restart");
    try {
      const res = await fetch("/api/ops/restart-safe", { method: "POST" });
      const data = (await res.json()) as RestartResponse;
      if (!res.ok) {
        setRestart({ ok: false, error: data.error ?? `HTTP_${res.status}`, durationMs: data.durationMs });
      } else {
        setRestart(data);
      }
    } catch (err: unknown) {
      setRestart({ ok: false, error: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(null);
    }
  }

  const loadMcpStatus = useCallback(async () => {
    setBusy("mcpStatus");
    try {
      const res = await fetch("/api/mcp/status", { cache: "no-store" });
      const data = (await res.json()) as McpStatusResponse;
      setMcpStatus(data);
      setSelectedServerId((prev) => prev || data.servers?.[0]?.id || "");
    } catch {
      setMcpStatus(null);
    } finally {
      setBusy(null);
    }
  }, []);

  async function executeMcpTool() {
    let parsedArgs: unknown = {};
    try {
      parsedArgs = JSON.parse(argsText || "{}");
    } catch {
      setMcpInvoke({ ok: false, status: 400, error: "ARGS_INVALID_JSON" });
      return;
    }

    setBusy("mcpInvoke");
    try {
      const res = await fetch("/api/mcp/invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId: selectedServerId, toolName, args: parsedArgs }),
      });
      const data = (await res.json()) as McpInvokeResponse;
      setMcpInvoke({ ...data, status: data.status ?? res.status, ok: !!data.ok });
      void loadMcpStatus();
    } catch (err: unknown) {
      setMcpInvoke({ ok: false, status: 502, error: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    void loadMcpStatus();
  }, [loadMcpStatus]);

  const selectedServer = useMemo(
    () => mcpStatus?.servers?.find((s) => s.id === selectedServerId) ?? null,
    [mcpStatus, selectedServerId],
  );

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100"><ShieldCheck className="h-4 w-4" /> Run checks</CardTitle>
          <CardDescription>Ejecuta checks operativos (gateway, DB, errores recientes, MCP).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Button onClick={runChecks} disabled={busy !== null}>
              <RefreshCw className="h-4 w-4" /> {busy === "checks" ? "Ejecutando…" : "Run checks"}
            </Button>
            <Link href={ROUTES.LOGS} className="text-xs text-indigo-300 hover:text-indigo-200">Ver logs</Link>
          </div>

          {checks && (
            <div className="mt-3 space-y-2 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-2 text-slate-300">Gateway: <strong>{checks.checks?.gateway.ok ? "OK" : "FAIL"}</strong></div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-2 text-slate-300">Database: <strong>{checks.checks?.database.ok ? "OK" : "FAIL"}</strong></div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-2 text-slate-300">MCP: <strong>{checks.checks?.mcp.detail ?? "N/A"}</strong></div>
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
            <Link href={ROUTES.LOGS} className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200">
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

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100"><PlugZap className="h-4 w-4" /> MCP v1 (estado + operación)</CardTitle>
          <CardDescription>Guardrails activos: allowlist de servidores/tools, permisos por tool y timeout por servidor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Button size="sm" variant="ghost" onClick={loadMcpStatus} disabled={busy !== null}>
              <RefreshCw className="h-3.5 w-3.5" /> {busy === "mcpStatus" ? "Refrescando…" : "Refresh MCP"}
            </Button>
            <Badge variant={mcpStatus?.ok ? "success" : "warning"}>{mcpStatus?.ok ? "ONLINE" : "DEGRADED"}</Badge>
            <span className="text-slate-400">{mcpStatus?.summary ? `${mcpStatus.summary.online}/${mcpStatus.summary.enabled} online · ${mcpStatus.summary.configured} configured` : "Sin datos"}</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <div className="text-xs font-medium text-slate-300">Servidores MCP</div>
              <div className="space-y-2">
                {(mcpStatus?.servers ?? []).map((server) => (
                  <label key={server.id} className="flex cursor-pointer items-start gap-2 text-xs">
                    <input
                      type="radio"
                      name="mcp-server"
                      value={server.id}
                      checked={selectedServerId === server.id}
                      onChange={() => setSelectedServerId(server.id)}
                    />
                    <span className="text-slate-300">
                      <span className="font-medium">{server.label}</span> ({server.id}) · {server.ok ? "OK" : "FAIL"} · {server.latencyMs ?? 0}ms
                      <br />
                      <span className="text-slate-500">{server.detail}</span>
                    </span>
                  </label>
                ))}
                {(mcpStatus?.servers?.length ?? 0) === 0 && <div className="text-xs text-slate-500">No hay servidores MCP configurados.</div>}
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <div className="text-xs font-medium text-slate-300">Invocar tool MCP (accionable desde UI)</div>
              <input
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-100"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                placeholder="tool name"
              />
              <textarea
                className="h-24 w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-100"
                value={argsText}
                onChange={(e) => setArgsText(e.target.value)}
                placeholder='{"key":"value"}'
              />
              <div className="text-[11px] text-slate-500">Allowed tools: {selectedServer?.allowedTools?.join(", ") || "—"}</div>
              <Button size="sm" onClick={executeMcpTool} disabled={busy !== null || !selectedServerId || !toolName.trim()}>
                <Play className="h-3.5 w-3.5" /> {busy === "mcpInvoke" ? "Ejecutando…" : "Run MCP tool"}
              </Button>

              {mcpInvoke && (
                <div className="rounded-md border border-slate-800 bg-slate-950 p-2 text-xs">
                  <div className="text-slate-300">Resultado: <strong>{mcpInvoke.ok ? "OK" : "FAIL"}</strong> · HTTP {mcpInvoke.status}</div>
                  {mcpInvoke.error ? (
                    <div className="mt-1 text-rose-300">{mcpInvoke.error}</div>
                  ) : (
                    <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap text-slate-400">{mcpInvoke.result ?? "(sin body)"}</pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
