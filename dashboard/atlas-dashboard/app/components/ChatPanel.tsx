"use client";

import { Mic, Paperclip, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type SpeechRecognitionConstructor = new () => unknown;

type SpeechRecognitionEventLite = {
  results?: ArrayLike<unknown>;
};

import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { cn } from "./ui/cn";
import { Input } from "./ui/Input";

type Msg = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

type UploadArtifact = {
  id: string;
  type: string;
  pointer: string;
  hash?: string | null;
  size?: number | null;
  createdAt: string;
};

type Attachment = {
  id: string;
  name: string;
  size: number;
  artifact: UploadArtifact;
};

type SpeechRecLike = {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
  onstart?: () => void;
  onend?: () => void;
  onerror?: (e: unknown) => void;
  onresult?: (e: unknown) => void;
  start?: () => void;
  stop?: () => void;
};

function useSpeechRecognition() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecLike | null>(null);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  function start(opts: { onText: (text: string) => void; onError?: (e: unknown) => void }) {
    try {
      const w = window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
      const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!SR) return;

      const rec = new SR() as unknown as SpeechRecLike;
      rec.lang = "es-ES";
      rec.interimResults = true;
      rec.continuous = false;

      rec.onstart = () => setListening(true);
      rec.onend = () => setListening(false);
      rec.onerror = (e) => {
        setListening(false);
        opts.onError?.(e);
      };
      rec.onresult = (e: unknown) => {
        const event = e as SpeechRecognitionEventLite;
        const results = Array.from(event.results ?? []);
        const transcript = results
          .map((r) => {
            const first = (r as ArrayLike<{ transcript?: unknown }>)[0];
            return typeof first?.transcript === "string" ? first.transcript : "";
          })
          .join("");
        if (transcript) opts.onText(transcript);
      };

      recRef.current = rec;
      rec.start?.();
    } catch (e) {
      setListening(false);
      opts.onError?.(e);
    }
  }

  function stop() {
    try {
      recRef.current?.stop?.();
    } finally {
      setListening(false);
    }
  }

  return { supported, listening, start, stop };
}

export default function ChatPanel(props: {
  className?: string;
  heightClassName?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const speech = useSpeechRecognition();

  async function load() {
    const res = await fetch("/api/chat", { cache: "no-store" });
    const data = await res.json();
    setMessages((data.messages ?? []).reverse());
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    // keep view pinned to bottom
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const attachmentsText = useMemo(() => {
    if (attachments.length === 0) return "";
    const lines = attachments.map((a) => `- ${a.name} (${Math.round(a.size / 1024)} KB) [artifact:${a.id}]`);
    return `\n\nAdjuntos:\n${lines.join("\n")}`;
  }, [attachments]);

  async function send() {
    if (busy) return;
    if (!input.trim() && attachments.length === 0) return;
    setBusy(true);
    try {
      const content = `${input}${attachmentsText}`.trim();
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      setInput("");
      setAttachments([]);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function uploadFiles(files: FileList) {
    const list = Array.from(files);
    for (const file of list) {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const json = await res.json();
      if (!json?.ok) continue;
      const artifact = json.artifact as UploadArtifact;
      setAttachments((prev) => [
        ...prev,
        { id: artifact.id, name: file.name, size: file.size, artifact },
      ]);
    }
  }

  return (
    <Card className={cn("flex flex-col", props.className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>Chat con Atlas</CardTitle>
          <div className="mt-1 text-xs text-slate-500">
            Tu canal principal: pregunta, adjunta contexto, y ejecuta.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            multiple
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length) uploadFiles(files);
              e.currentTarget.value = "";
            }}
          />
          <Button
            size="sm"
            onClick={() => fileRef.current?.click()}
            className="gap-2"
            title="Adjuntar archivos"
          >
            <Paperclip className="h-4 w-4" />
            Adjuntar
          </Button>

          <Button
            size="sm"
            variant={speech.listening ? "primary" : "secondary"}
            disabled={!speech.supported}
            onClick={() => {
              if (speech.listening) return speech.stop();
              speech.start({
                onText: (t) => setInput((prev) => (prev ? `${prev} ${t}` : t)),
              });
            }}
            className="gap-2"
            title={speech.supported ? "Hablar con Atlas" : "Voz no soportada en este navegador"}
          >
            <Mic className="h-4 w-4" />
            {speech.listening ? "Escuchando" : "Voz"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        {attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {attachments.map((a) => (
              <Badge key={a.id} variant="info" className="gap-2">
                {a.name}
                <button
                  className="ml-1 inline-flex"
                  onClick={() => setAttachments((prev) => prev.filter((x) => x.id !== a.id))}
                  title="Quitar"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div
          ref={listRef}
          className={cn(
            "min-h-0 overflow-auto rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm",
            props.heightClassName ?? "h-[58vh]",
          )}
        >
          {messages.length === 0 && <div className="text-slate-500">Sin mensajes</div>}
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[90%] whitespace-pre-wrap rounded-2xl border px-3 py-2 leading-relaxed",
                    m.role === "user"
                      ? "border-indigo-900/50 bg-indigo-950/30 text-slate-100"
                      : "border-slate-800 bg-slate-950/40 text-slate-200",
                  )}
                >
                  <div className="mb-1 text-[11px] text-slate-500">
                    {m.role === "user" ? "Tú" : "Atlas"} · {new Date(m.createdAt).toLocaleTimeString()}
                  </div>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje. Ej: ‘Revisa los logs y propón un plan’."
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
            }}
          />
          <Button onClick={send} variant="primary" disabled={busy} className="gap-2">
            <Send className="h-4 w-4" />
            Enviar
          </Button>
        </div>

        <div className="text-[11px] text-slate-500">
          Tip: <span className="text-slate-300">Ctrl/⌘ + Enter</span> para enviar. Adjunta contexto para mejores resultados.
        </div>
      </CardContent>
    </Card>
  );
}
