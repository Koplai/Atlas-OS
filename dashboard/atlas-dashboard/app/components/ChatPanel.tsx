"use client";

import { useEffect, useState } from "react";

interface Msg {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  async function load() {
    const res = await fetch("/api/chat", { cache: "no-store" });
    const data = await res.json();
    setMessages((data.messages ?? []).reverse());
  }

  useEffect(() => {
    load();
  }, []);

  async function send() {
    if (!input.trim()) return;
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });
    setInput("");
    load();
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="text-sm text-slate-400">Chat con Atlas</div>
      <div className="mt-3 h-44 overflow-auto rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs">
        {messages.length === 0 && <div className="text-slate-500">Sin mensajes</div>}
        {messages.map((m) => (
          <div key={m.id} className="mb-2">
            <span className={m.role === "user" ? "text-indigo-300" : "text-emerald-300"}>
              {m.role}:
            </span>{" "}
            {m.content}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        />
        <button onClick={send} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm">Enviar</button>
      </div>
    </div>
  );
}
