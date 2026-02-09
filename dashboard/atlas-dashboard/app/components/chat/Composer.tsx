"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Paperclip, Send } from "lucide-react";

import { Button } from "@/app/components/ui/Button";
import { CardFooter } from "@/app/components/ui/Card";

function supportsSpeechRecognition() {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export default function Composer(props: {
  onSend: (content: string, attachments: File[]) => Promise<void>;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [listening, setListening] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function send() {
    if (!text.trim() && files.length === 0) return;
    const t = text;
    const f = files;
    setText("");
    setFiles([]);
    await props.onSend(t, f);
  }

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...picked].slice(0, 10));
    e.target.value = "";
  }

  function startDictation() {
    if (!supportsSpeechRecognition()) return;
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (typeof SR !== "function") return;
    // SpeechRecognition constructor type isn't in TS lib here.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new (SR as any)();
    rec.lang = "es-ES";
    rec.interimResults = true;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (ev: unknown) => {
      const e = ev as { results?: ArrayLike<unknown> };
      const last = e.results?.[e.results.length - 1];
      if (!last) return;
      const chunk = (last as ArrayLike<{ transcript?: string }>)[0]?.transcript ?? "";
      setText((prev) => (prev ? prev + " " : "") + chunk);
    };
    rec.start();
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        // do not steal if focus isn't in a textarea/input we own
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <CardFooter className="sticky bottom-0 border-t border-slate-900 bg-[#0b1118]/80 pt-3 backdrop-blur-xl">
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((f, idx) => (
            <div
              key={idx}
              className="rounded-full border border-slate-800 bg-slate-950/40 px-2 py-1 text-[11px] text-slate-300"
              title={`${f.name} (${Math.round(f.size / 1024)} KB)`}
            >
              {f.name}
              <button
                className="ml-2 text-slate-500 hover:text-slate-200"
                onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex w-full items-end gap-2">
        <input ref={fileRef} type="file" className="hidden" multiple onChange={onPickFiles} />

        <Button
          size="sm"
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          disabled={props.disabled}
          title="Adjuntar archivos"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant={listening ? "primary" : "secondary"}
          onClick={startDictation}
          disabled={props.disabled || !supportsSpeechRecognition()}
          title={supportsSpeechRecognition() ? "Dictado por voz" : "Voz no soportada en este navegador"}
        >
          <Mic className="h-4 w-4" />
          {listening ? "Escuchando" : "Voz"}
        </Button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe a Atlas…"
          className="min-h-[44px] max-h-36 w-full resize-none rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors hover:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          disabled={props.disabled}
        />

        <Button size="sm" variant="primary" onClick={send} disabled={props.disabled} title="Enviar">
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-2 text-[11px] text-slate-500">
        Enter para enviar · Shift+Enter nueva línea
      </div>
    </CardFooter>
  );
}
