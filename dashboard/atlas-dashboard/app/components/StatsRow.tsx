"use client";

import { useEffect, useState } from "react";
import StatCard from "@/app/components/StatCard";

type StatusResp = {
  developing?: boolean;
  run?: { id: string; status: string } | null;
  lastLog?: { severity: string } | null;
  time?: string;
};

type TasksResp = { tasks?: unknown[] };
type RunsResp = { runs?: unknown[] };
type LogsResp = { logs?: Array<{ severity?: unknown }> };

function arrLen(v: unknown) {
  return Array.isArray(v) ? v.length : 0;
}

export default function StatsRow() {
  const [status, setStatus] = useState<StatusResp | null>(null);
  const [tasks, setTasks] = useState<number | null>(null);
  const [runs, setRuns] = useState<number | null>(null);
  const [errors, setErrors] = useState<number | null>(null);

  async function load() {
    const [s, t, r, l] = await Promise.all([
      fetch("/api/status", { cache: "no-store" }).then((x) => x.json() as Promise<StatusResp>),
      fetch("/api/tasks?limit=500", { cache: "no-store" }).then((x) => x.json() as Promise<TasksResp>),
      fetch("/api/runs?limit=200", { cache: "no-store" }).then((x) => x.json() as Promise<RunsResp>),
      fetch("/api/logs?limit=200", { cache: "no-store" }).then((x) => x.json() as Promise<LogsResp>),
    ]);

    setStatus(s);
    setTasks(arrLen(t.tasks));
    setRuns(arrLen(r.runs));

    const logs = l.logs ?? [];
    setErrors(
      logs.filter((x) => x.severity === "ERROR" || x.severity === "SECURITY").length,
    );
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-4">
      <StatCard label="Estado" value={status?.developing ? "Developing" : "Idle"} hint={status?.time ? `Actualizado: ${new Date(status.time).toLocaleTimeString()}` : undefined} />
      <StatCard label="Tareas" value={tasks ?? "—"} hint="Total (limitado)" />
      <StatCard label="Runs" value={runs ?? "—"} hint="Total (limitado)" />
      <StatCard label="Errores" value={errors ?? "—"} hint="ERROR/SECURITY recientes" />
    </div>
  );
}
