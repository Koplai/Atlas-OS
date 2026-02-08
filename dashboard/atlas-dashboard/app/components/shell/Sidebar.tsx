"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { cn } from "@/app/components/ui/cn";

type Thread = { id: string; title: string; updatedAt: string };

export default function Sidebar() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    const res = await fetch("/api/threads?limit=100", { cache: "no-store" });
    const data = await res.json();
    setThreads(data.threads ?? []);
  }

  async function createThread() {
    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Nuevo chat" }),
    });
    const data = await res.json();
    if (data.thread?.id) {
      await load();
      window.location.href = `/chat/${data.thread.id}`;
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const filtered = threads.filter((t) =>
    !q.trim() ? true : (t.title ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <aside className="hidden w-80 flex-col border-r border-slate-900 bg-[#0b1118] p-4 lg:flex">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold tracking-wide text-slate-200">Atlas</div>
        <Button size="sm" variant="secondary" onClick={createThread}>
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2">
        <Search className="h-4 w-4 text-slate-500" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search"
          className="border-0 bg-transparent px-0 py-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="mt-4 text-xs font-medium text-slate-500">Conversations</div>

      <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-auto pr-1">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-3 text-xs text-slate-500">
            No chats yet.
          </div>
        )}

        {filtered.map((t) => (
          <Link
            key={t.id}
            href={`/chat/${t.id}`}
            className={cn(
              "block rounded-xl border border-transparent px-3 py-2 text-sm text-slate-200 hover:border-slate-800 hover:bg-slate-950/30",
            )}
          >
            <div className="truncate">{t.title}</div>
            <div className="mt-1 text-[11px] text-slate-500">
              {new Date(t.updatedAt).toLocaleString()}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-slate-900 bg-slate-950/20 p-3 text-xs text-slate-500">
        Tip: el chat es tu centro de mando. Adjunta archivos o dicta por voz desde el composer.
      </div>
    </aside>
  );
}
