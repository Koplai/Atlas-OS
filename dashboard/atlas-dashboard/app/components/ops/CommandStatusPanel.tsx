"use client";

import { useEffect, useState } from "react";
import { TerminalSquare, RefreshCw } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

type CmdResult = { ok: boolean; output: string; error?: string };
type ApiResponse = {
  ok: boolean;
  commands: {
    "openclaw status --all": CmdResult;
    "openclaw status --deep": CmdResult;
  };
  generatedAt: string;
};

export default function CommandStatusPanel() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/system/command-status", { cache: "no-store" });
      const json = (await res.json()) as ApiResponse;
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
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <TerminalSquare className="h-4 w-4" /> Command Runtime Status
        </CardTitle>
        <CardDescription>
          Salida en vivo de comandos críticos para visibilidad operativa (openclaw status --all/--deep).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button size="sm" variant="secondary" onClick={load} disabled={loading}>
          <RefreshCw className="h-3.5 w-3.5" /> {loading ? "Refrescando…" : "Refresh command status"}
        </Button>

        {data ? (
          <>
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <div className="mb-2 text-xs text-slate-400">openclaw status --all</div>
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap text-xs text-slate-200">
                {data.commands["openclaw status --all"].output || "(sin salida)"}
              </pre>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <div className="mb-2 text-xs text-slate-400">openclaw status --deep</div>
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap text-xs text-slate-200">
                {data.commands["openclaw status --deep"].output || "(sin salida)"}
              </pre>
            </div>

            <div className="text-[11px] text-slate-500">Actualizado: {new Date(data.generatedAt).toLocaleString()}</div>
          </>
        ) : (
          <div className="text-xs text-slate-500">Sin datos todavía.</div>
        )}
      </CardContent>
    </Card>
  );
}
