"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Search, X, MessageSquare, ScrollText } from "lucide-react";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { cn } from "@/app/components/ui/cn";

type Thread = { id: string; title: string; updatedAt: string };
type Project = { id: string; name: string };

const STORAGE_KEY = "atlas.selectedProjectId";

export default function Sidebar(props: { mobileOpen?: boolean; onCloseMobile?: () => void }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [q, setQ] = useState("");

  async function load() {
    const [pRes, tRes] = await Promise.all([
      fetch("/api/projects?limit=100", { cache: "no-store" }),
      fetch(`/api/threads?limit=100${selectedProjectId ? `&projectId=${encodeURIComponent(selectedProjectId)}` : ""}`, { cache: "no-store" }),
    ]);
    const pData = await pRes.json();
    const tData = await tRes.json();
    setProjects(pData.projects ?? []);
    setThreads(tData.threads ?? []);
  }

  async function createThread() {
    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Nuevo chat", projectId: selectedProjectId || undefined }),
    });
    const data = await res.json();
    if (data.thread?.id) {
      await load();
      window.location.href = `/chat/${data.thread.id}`;
    }
  }

  async function createProject() {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Nuevo proyecto" }),
    });
    const data = await res.json();
    if (data.project?.id) {
      setSelectedProjectId(data.project.id);
      localStorage.setItem(STORAGE_KEY, data.project.id);
      await load();
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setSelectedProjectId(saved);
  }, []);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const filtered = threads.filter((t) =>
    !q.trim() ? true : (t.title ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  const content = (
    <>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold tracking-wide text-slate-200">Atlas</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={createThread}>
            <Plus className="h-4 w-4" /> New
          </Button>
          <Button size="sm" variant="ghost" className="lg:hidden" onClick={props.onCloseMobile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
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

      <nav className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Link href="/chat" onClick={props.onCloseMobile} className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/30 px-2 py-1.5 text-slate-200">
          <MessageSquare className="h-3.5 w-3.5" /> Chat
        </Link>
        <Link href="/ops" onClick={props.onCloseMobile} className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/30 px-2 py-1.5 text-slate-200">
          <ScrollText className="h-3.5 w-3.5" /> Logs
        </Link>
      </nav>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs font-medium text-slate-500">Projects</div>
        <Button size="sm" variant="ghost" onClick={createProject}>+ Project</Button>
      </div>

      <select
        value={selectedProjectId}
        onChange={(e) => {
          setSelectedProjectId(e.target.value);
          localStorage.setItem(STORAGE_KEY, e.target.value);
        }}
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2 text-sm"
      >
        <option value="">All projects</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

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
            onClick={props.onCloseMobile}
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
    </>
  );

  return (
    <>
      <aside className="hidden w-80 flex-col border-r border-slate-900 bg-[#0b1118] p-4 lg:flex">{content}</aside>

      <div className={cn("fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden", props.mobileOpen ? "opacity-100" : "pointer-events-none opacity-0")} onClick={props.onCloseMobile} />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[86vw] max-w-sm flex-col border-r border-slate-900 bg-[#0b1118] p-4 transition-transform lg:hidden",
          props.mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {content}
      </aside>
    </>
  );
}
