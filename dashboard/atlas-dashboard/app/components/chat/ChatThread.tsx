"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Nuevo chat" }),
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
      // MVP: attachments are not uploaded yet; we just show chips locally.
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

  const title = useMemo(() => (ready ? "Chat con Atlas" : "Nuevo chat"), [ready]);

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-200">{title}</div>
        <div className="flex items-center gap-2">
          <Badge variant={loading ? "warning" : "success"}>{loading ? "Thinking" : "Ready"}</Badge>
        </div>
      </div>

      <Card className="mt-4 flex min-h-0 flex-1 flex-col">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Conversation</CardTitle>
          <div className="text-xs text-slate-500">{messages.length} mensajes</div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-auto">
          {messages.length === 0 && (
            <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-4 text-sm text-slate-400">
              Empieza aquí. Este chat será tu centro de mando (dashboard estilo ChatGPT/Claude).
            </div>
          )}

          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[78%] rounded-2xl bg-indigo-600/20 px-3 py-2 text-sm text-indigo-100 border border-indigo-900/40"
                      : "max-w-[78%] rounded-2xl bg-slate-950/30 px-3 py-2 text-sm text-slate-100 border border-slate-800"
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
