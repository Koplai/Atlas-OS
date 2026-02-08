"use client";

import { useEffect, useState } from "react";

export default function SystemStatus() {
  const [data, setData] = useState<{ ok: boolean; stdout?: string; stderr?: string } | null>(null);

  async function load() {
    const res = await fetch("/api/system-status", { cache: "no-store" });
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="text-sm text-slate-400">OpenClaw Status</div>
      <div className="mt-2 whitespace-pre-wrap text-xs text-slate-300">
        {data?.stdout ?? "Cargando…"}
      </div>
      {data?.stderr && <div className="mt-2 text-xs text-rose-400">{data.stderr}</div>}
      <button onClick={load} className="mt-3 rounded-lg border border-slate-700 px-3 py-1 text-xs">Refresh</button>
    </div>
  );
}
