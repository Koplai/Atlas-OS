"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { cn } from "@/app/components/ui/cn";
import { primaryNavItems } from "@/app/components/shell/navigation";
import { ROUTES } from "@/app/components/shell/routes";

type Thread = { id: string; title: string; updatedAt: string };
type Project = { id: string; name: string };

const STORAGE_KEY = "atlas.selectedProjectId";

const navItems = primaryNavItems;

export default function Sidebar(props: { mobileOpen?: boolean; onCloseMobile?: () => void }) {
  const pathname = usePathname();
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
      window.location.href = `${ROUTES.CHAT}/${data.thread.id}`;
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
  }, [selectedProjectId, pathname]);

  useEffect(() => {
    const onThreadsChanged = () => {
      void load();
    };
    window.addEventListener("atlas:threads-changed", onThreadsChanged);
    return () => window.removeEventListener("atlas:threads-changed", onThreadsChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const filtered = useMemo(
    () =>
      threads.filter((t) =>
        !q.trim() ? true : (t.title ?? "").toLowerCase().includes(q.toLowerCase()),
      ),
    [threads, q],
  );

  const content = (
    <>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Atlas</div>
          <div className="text-sm font-semibold text-slate-100">Conversations</div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="primary" onClick={createThread}>
            <Plus className="h-4 w-4" /> New
          </Button>
          <Button size="sm" variant="ghost" className="lg:hidden" onClick={props.onCloseMobile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2">
        <Search className="h-4 w-4 text-slate-500" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar chat"
          className="border-0 bg-transparent px-0 py-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <nav className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 text-xs lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0">
        {navItems.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={props.onCloseMobile}
              className={cn(
                "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 transition-all lg:shrink",
                active
                  ? "border-indigo-600/60 bg-indigo-600/15 text-indigo-100"
                  : "border-slate-800 bg-slate-950/30 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60 hover:text-slate-100",
              )}
            >
              <item.icon className="h-3.5 w-3.5" /> {item.shortLabel}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs font-medium text-slate-500">Proyecto</div>
        <Button size="sm" variant="ghost" onClick={createProject}>+ Nuevo</Button>
      </div>

      <select
        value={selectedProjectId}
        onChange={(e) => {
          setSelectedProjectId(e.target.value);
          localStorage.setItem(STORAGE_KEY, e.target.value);
        }}
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 outline-none transition-colors hover:border-slate-700 focus:border-indigo-500"
      >
        <option value="">Todos los proyectos</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <div className="mt-4 text-xs font-medium text-slate-500">Historial</div>

      <div className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-auto pr-1">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/20 p-4 text-center">
            <div className="text-sm text-slate-300">Sin conversaciones</div>
            <div className="mt-1 text-xs text-slate-500">Crea un chat para empezar en este proyecto.</div>
          </div>
        )}

        {filtered.map((t) => {
          const active = pathname === `${ROUTES.CHAT}/${t.id}`;
          return (
            <Link
              key={t.id}
              href={`${ROUTES.CHAT}/${t.id}`}
              onClick={props.onCloseMobile}
              className={cn(
                "block rounded-xl border px-3 py-2 text-sm transition-all",
                active
                  ? "border-indigo-700/60 bg-indigo-600/10 text-slate-100"
                  : "border-transparent text-slate-300 hover:border-slate-800 hover:bg-slate-950/40 hover:text-slate-100",
              )}
            >
              <div className="truncate font-medium">{t.title}</div>
              <div className="mt-1 text-[11px] text-slate-500">
                {new Date(t.updatedAt).toLocaleString()}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-80 flex-col border-r border-slate-900/90 bg-[#0b1118]/85 p-4 backdrop-blur-xl lg:flex">{content}</aside>

      <div className={cn("fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden", props.mobileOpen ? "opacity-100" : "pointer-events-none opacity-0")} onClick={props.onCloseMobile} />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[86vw] max-w-sm flex-col border-r border-slate-900 bg-[#0b1118]/95 p-4 backdrop-blur-xl transition-transform lg:hidden",
          props.mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {content}
      </aside>
    </>
  );
}
