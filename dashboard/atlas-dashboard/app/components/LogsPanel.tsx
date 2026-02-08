"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/Card";
import { cn } from "./ui/cn";
import { inputClassName } from "./ui/Input";

type LogEntry = {
  id: string;
  timestamp: string;
  severity: string;
  source: string;
  message: string;
};

function sevVariant(sev: string) {
  if (sev === "ERROR" || sev === "SECURITY") return "danger" as const;
  if (sev === "WARN") return "warning" as const;
  if (sev === "INFO") return "info" as const;
  return "neutral" as const;
}

export default function LogsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [severity, setSeverity] = useState<string>("ALL");

  async function load() {
    const res = await fetch("/api/logs?limit=200", { cache: "no-store" });
    const data = await res.json();
    setLogs(data.logs ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    if (severity === "ALL") return logs;
    return logs.filter((l) => l.severity === severity);
  }, [logs, severity]);

  return (
    <Card className="mt-4">
      <CardHeader className="flex items-start justify-between gap-3 p-4 pb-0 sm:flex-row">
        <div>
          <CardTitle>Logs</CardTitle>
          <CardDescription>Auto-refresh cada 10s (limitado)</CardDescription>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className={cn(inputClassName, "w-auto px-2 py-1 text-xs")}
          >
            <option value="ALL">ALL</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="SECURITY">SECURITY</option>
          </select>
          <Button onClick={load} size="sm">
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-64 overflow-auto rounded-lg border border-slate-900 bg-slate-950/40 p-2 text-xs">
          {filtered.length === 0 && <div className="p-2 text-slate-500">Sin logs</div>}
          {filtered.map((l) => (
            <div key={l.id} className="mb-2 rounded-lg border border-slate-800 bg-slate-900/40 p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-medium text-slate-200">
                  <Badge variant={sevVariant(l.severity)}>{l.severity}</Badge>
                  <span className="text-slate-400">{l.source}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {new Date(l.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <div className="mt-1 whitespace-pre-wrap break-words text-slate-200">{l.message}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
