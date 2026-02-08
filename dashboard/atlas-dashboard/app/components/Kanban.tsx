"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "./ui/Badge";
import { Card, CardContent, CardHeader } from "./ui/Card";

interface Task {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVE";
}

const columns: Task["status"][] = ["TODO", "IN_PROGRESS", "DONE", "ARCHIVE"];

function statusBadgeVariant(status: Task["status"]) {
  if (status === "TODO") return "neutral" as const;
  if (status === "IN_PROGRESS") return "info" as const;
  if (status === "DONE") return "success" as const;
  return "warning" as const;
}

export default function Kanban() {
  const [tasks, setTasks] = useState<Task[]>([]);

  async function load() {
    const res = await fetch("/api/tasks", { cache: "no-store" });
    const data = await res.json();
    setTasks(data.tasks ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const byStatus = useMemo(() => {
    const map = new Map<Task["status"], Task[]>();
    for (const s of columns) map.set(s, []);
    for (const t of tasks) map.get(t.status)?.push(t);
    return map;
  }, [tasks]);

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-4">
      {columns.map((col) => {
        const colTasks = byStatus.get(col) ?? [];
        return (
          <Card key={col} className="overflow-hidden">
            <CardHeader className="p-3 pb-0">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{col.replace("_", " ")}</span>
                <Badge variant={statusBadgeVariant(col)}>{colTasks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {colTasks.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-xs text-slate-300"
                  >
                    {t.title}
                  </div>
                ))}
                {colTasks.length === 0 && <div className="text-xs text-slate-500">Sin tareas</div>}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
