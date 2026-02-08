"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import Composer from "@/app/components/chat/Composer";

type Msg = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

export default function ChatThread(props: { threadId: string | null }) {
  const [threadId, setThreadId] = useState<string | null>(props.threadId);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const ready = !!threadId;

  async function ensureThread() {
    if (threadId) return threadId;
    const selectedProjectId = typeof window !== "undefined" ? localStorage.getItem("atlas.selectedProjectId") : null;
    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Nuevo chat", projectId: selectedProjectId || undefined }),
    });
    const data = await res.json();
    if (data.thread?.id) {
      setThreadId(data.thread.id);
      window.history.replaceState({}, "", `/chat/${data.thread.id}`);
      return data.thread.id as string;
    }
    throw new Error("Failed to create thread");
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
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: id, content, attachments: attachments.map((f) => ({ name: f.name, size: f.size })) }),
      });
      await load();
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const title = useMemo(() => (ready ? "Chat" : "Nuevo chat"), [ready]);

  return (
    <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-100">{title}</div>
        <Badge variant={loading ? "warning" : "success"}>{loading ? "Thinking" : "Ready"}</Badge>
      </div>

      <Card className="mt-3 flex min-h-0 flex-1 flex-col sm:mt-4">
        <CardHeader className="flex-row items-center justify-between border-b border-slate-900/80 pb-3">
          <CardTitle className="text-slate-300">Conversation</CardTitle>
          <div className="text-xs text-slate-500">{messages.length} mensajes</div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-auto pt-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/20 p-6 text-center">
              <div className="mx-auto inline-flex rounded-full border border-indigo-900/60 bg-indigo-950/30 p-2 text-indigo-200">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="mt-3 text-sm font-medium text-slate-200">Empieza una conversación</div>
              <div className="mt-1 text-xs text-slate-500">Pregunta, planifica o ejecuta tareas desde aquí.</div>
            </div>
          )}

          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[90%] sm:max-w-[78%] rounded-2xl border border-indigo-800/50 bg-indigo-600/15 px-3.5 py-2.5 text-sm text-indigo-100"
                      : "max-w-[90%] sm:max-w-[78%] rounded-2xl border border-slate-800 bg-slate-900/40 px-3.5 py-2.5 text-sm text-slate-100"
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
