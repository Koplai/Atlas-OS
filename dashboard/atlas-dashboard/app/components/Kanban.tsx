"use client";

import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVE";
}

const columns: Task["status"][] = ["TODO", "IN_PROGRESS", "DONE", "ARCHIVE"];

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

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-4">
      {columns.map((col) => (
        <div key={col} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{col.replace("_", " ")}</span>
            <span className="h-2 w-2 rounded-full bg-slate-600" />
          </div>
          <div className="mt-3 space-y-2">
            {tasks.filter((t) => t.status === col).map((t) => (
              <div key={t.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-xs text-slate-300">
                {t.title}
              </div>
            ))}
            {tasks.filter((t) => t.status === col).length === 0 && (
              <div className="text-xs text-slate-500">Sin tareas</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
