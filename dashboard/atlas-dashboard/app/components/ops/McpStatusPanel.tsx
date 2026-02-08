"use client";

import { useEffect, useState } from "react";
import { PlugZap } from "lucide-react";

import { Badge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/Card";

type StatusData = {
  ok: boolean;
  summary?: {
    configured: number;
    enabled: number;
    online: number;
  };
  servers?: Array<{
    id: string;
    label: string;
    enabled: boolean;
    ok: boolean;
    latencyMs: number | null;
    detail: string;
    allowedTools: string[];
  }>;
  generatedAt?: string;
};

export default function McpStatusPanel() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/mcp/status", { cache: "no-store" });
      const json = (await res.json()) as StatusData;
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100"><PlugZap className="h-4 w-4" /> MCP v1 status</CardTitle>
        <CardDescription>Conectividad de servidores MCP (allowlist + timeout + permisos por tool).</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center gap-2">
          <Badge variant={data?.ok ? "success" : "warning"}>{data?.ok ? "HEALTHY" : "DEGRADED"}</Badge>
          <span className="text-xs text-slate-400">{data?.summary ? `${data.summary.online}/${data.summary.enabled} online` : "—"}</span>
          <Button size="sm" variant="ghost" onClick={load} disabled={loading}>Refresh</Button>
        </div>

        <div className="space-y-2 text-xs">
          {(data?.servers ?? []).map((s) => (
            <div key={s.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-slate-200">{s.label}</div>
                <Badge variant={s.ok ? "success" : "warning"}>{s.ok ? "ONLINE" : "OFFLINE"}</Badge>
              </div>
              <div className="mt-1 text-slate-400">{s.id} · {s.latencyMs ?? "—"}ms · {s.detail}</div>
              <div className="mt-1 text-slate-500">tools: {s.allowedTools.join(", ") || "none"}</div>
            </div>
          ))}
          {(!data?.servers || data.servers.length === 0) && <div className="text-slate-500">No hay servidores MCP configurados.</div>}
        </div>
      </CardContent>
    </Card>
  );
}
