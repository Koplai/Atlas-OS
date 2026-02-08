"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

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
    <Card>
      <CardHeader>
        <CardTitle>Quick Task</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nueva tarea..."
          />
          <Button onClick={createTask} variant="primary">
            Crear
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {tasks.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-xs text-slate-200"
            >
              {t.title}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
