"use client";

import { useEffect, useMemo, useState } from "react";

type LogEntry = {
  id: string;
  timestamp: string;
  severity: string;
  source: string;
  message: string;
};

function sevClass(sev: string) {
  if (sev === "ERROR" || sev === "SECURITY") return "text-rose-300 border-rose-900/60 bg-rose-950/30";
  if (sev === "WARN") return "text-amber-300 border-amber-900/60 bg-amber-950/30";
  return "text-slate-300 border-slate-800 bg-slate-900/40";
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
    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">Logs</div>
          <div className="text-xs text-slate-500">Auto-refresh cada 10s (limitado)</div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
          >
            <option value="ALL">ALL</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="SECURITY">SECURITY</option>
          </select>
          <button
            onClick={load}
            className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-200"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-3 h-64 overflow-auto rounded-lg border border-slate-900 bg-slate-950/40 p-2 text-xs">
        {filtered.length === 0 && <div className="p-2 text-slate-500">Sin logs</div>}
        {filtered.map((l) => (
          <div key={l.id} className={`mb-2 rounded-lg border p-2 ${sevClass(l.severity)}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">{l.severity} · {l.source}</div>
              <div className="text-[11px] text-slate-500">{new Date(l.timestamp).toLocaleTimeString()}</div>
            </div>
            <div className="mt-1 whitespace-pre-wrap break-words">{l.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
