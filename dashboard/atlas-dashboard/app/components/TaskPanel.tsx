"use client";

import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  status: string;
}

export default function TaskPanel() {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  async function load() {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data.tasks ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function createTask() {
    if (!title.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status: "TODO" }),
    });
    setTitle("");
    load();
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="text-sm text-slate-400">Quick Task</div>
      <div className="mt-3 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva tarea..."
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        />
        <button onClick={createTask} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm">
          Crear
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {tasks.slice(0, 5).map((t) => (
          <div key={t.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-xs">
            {t.title}
          </div>
        ))}
      </div>
    </div>
  );
}
