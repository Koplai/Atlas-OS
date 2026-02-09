"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import Composer from "@/app/components/chat/Composer";
import { cn } from "@/app/components/ui/cn";
import { workspaceSections } from "@/app/components/shell/navigation";
import { ROUTES } from "@/app/components/shell/routes";

type Msg = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

const starterPrompts = ["Resumen de logs críticos", "Plan de despliegue hoy", "Checklist P0/P1"];

export default function ChatThread(props: { threadId: string | null }) {
  const [threadId, setThreadId] = useState<string | null>(props.threadId);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const ready = !!threadId;
  const quickLinks = workspaceSections.filter((item) => item.href !== ROUTES.CHAT);

  async function ensureThread() {
    if (threadId) return threadId;
    const selectedProjectId = typeof window !== "undefined" ? localStorage.getItem("atlas.selectedProjectId") : null;

    const create = async (projectId?: string) => {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nuevo chat", projectId: projectId || undefined }),
      });
      const data = await res.json();
      return { res, data } as const;
    };

    // Try with selected project first; fallback without project if stale/invalid relation.
    let created = await create(selectedProjectId || undefined);
    if (!created.res.ok || !created.data.thread?.id) {
      created = await create(undefined);
    }

    if (created.data.thread?.id) {
      setThreadId(created.data.thread.id);
      window.history.replaceState({}, "", `${ROUTES.CHAT}/${created.data.thread.id}`);
      window.dispatchEvent(new CustomEvent("atlas:threads-changed"));
      return created.data.thread.id as string;
    }

    throw new Error(created.data?.error ?? "Failed to create thread");
  }

  async function load() {
    if (!threadId) return;
    const res = await fetch(`/api/chat?threadId=${encodeURIComponent(threadId)}&limit=200`, { cache: "no-store" });
    const data = await res.json();
    setMessages(data.messages ?? []);
  }

  async function send(content: string, attachments: File[]) {
    const id = await ensureThread();
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: id, content, attachments: attachments.map((f) => ({ name: f.name, size: f.size })) }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `CHAT_SEND_FAILED_${res.status}`);
      }

      await load();
      window.dispatchEvent(new CustomEvent("atlas:threads-changed"));
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const title = useMemo(() => (ready ? "Chat" : "New chat"), [ready]);

  return (
    <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4 lg:p-6">
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-950/40 p-3 shadow-[0_10px_30px_rgba(2,6,23,.35)] sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Chat-first workspace</div>
            <div className="text-sm font-semibold text-slate-100">{title}</div>
          </div>
          <Badge variant={loading ? "warning" : "success"}>{loading ? "Thinking" : "Ready"}</Badge>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400 sm:flex sm:gap-2 sm:overflow-x-auto sm:pb-1 sm:text-xs">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/30 px-3 py-1.5">Thread: <span className="text-slate-200">{ready ? "activo" : "nuevo"}</span></div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/30 px-3 py-1.5">Mensajes: <span className="text-slate-200">{messages.length}</span></div>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 text-xs">
          {quickLinks.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 transition-colors",
                  active
                    ? "border-indigo-500/60 bg-indigo-500/15 text-indigo-100"
                    : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600 hover:text-slate-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <Card className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden sm:mt-4">
        <CardHeader className="flex-row items-center justify-between border-b border-slate-900/80 pb-3">
          <CardTitle className="text-slate-300">Conversation</CardTitle>
          <div className="text-xs text-slate-500">{messages.length} mensajes</div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-auto bg-[linear-gradient(to_bottom,rgba(15,23,42,0.25),transparent_20%)] pt-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/20 p-6 text-center">
              <div className="mx-auto inline-flex rounded-full border border-indigo-900/60 bg-indigo-950/30 p-2 text-indigo-200">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="mt-3 text-sm font-medium text-slate-200">Empieza una conversación</div>
              <div className="mt-1 text-xs text-slate-500">Pregunta, planifica o ejecuta tareas desde aquí.</div>
              <div className="mt-3 flex flex-wrap justify-center gap-2 text-[11px]">
                {starterPrompts.map((prompt) => (
                  <span key={prompt} className="rounded-full border border-slate-800 bg-slate-900/40 px-2.5 py-1 text-slate-300">Ej: {prompt}</span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 pb-2">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[95%] sm:max-w-[80%] rounded-2xl border border-indigo-800/50 bg-indigo-600/15 px-3.5 py-2.5 text-sm text-indigo-100"
                      : "max-w-[95%] sm:max-w-[80%] rounded-2xl border border-slate-800 bg-slate-900/40 px-3.5 py-2.5 text-sm text-slate-100"
                  }
                >
                  <div className="whitespace-pre-wrap break-words leading-relaxed">{m.content}</div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {new Date(m.createdAt).toLocaleTimeString()} · {m.role}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </CardContent>

        <Composer onSend={send} disabled={loading} />
      </Card>
    </div>
  );
}
