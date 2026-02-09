"use client";

import { useEffect, useState } from "react";
import { NotebookPen, Save } from "lucide-react";

import { Button } from "@/app/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/Card";

type Project = { id: string; name: string };

const STORAGE_KEY = "atlas.selectedProjectId";

export default function ProjectInstructionsCard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const selected = localStorage.getItem(STORAGE_KEY) || "";
    setProjectId(selected);

    const loadProjects = async () => {
      const res = await fetch("/api/projects?limit=100", { cache: "no-store" });
      const data = await res.json();
      setProjects(data.projects ?? []);
    };

    void loadProjects();
  }, []);

  useEffect(() => {
    if (!projectId) {
      setInstructions("");
      setStatus("");
      return;
    }

    const loadInstructions = async () => {
      setLoading(true);
      setStatus("");
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/instructions`, { cache: "no-store" });
        const data = await res.json();
        setInstructions(data.instructions ?? "");
      } finally {
        setLoading(false);
      }
    };

    void loadInstructions();
  }, [projectId]);

  async function saveInstructions() {
    if (!projectId) return;
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/instructions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `SAVE_FAILED_${res.status}`);
      }
      setStatus("Guardado");
    } catch {
      setStatus("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100"><NotebookPen className="h-4 w-4" /> Instrucciones por proyecto</CardTitle>
        <CardDescription>Define contexto operativo por proyecto para mantener consistencia en chats y ejecución.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <select
          value={projectId}
          onChange={(e) => {
            const next = e.target.value;
            setProjectId(next);
            localStorage.setItem(STORAGE_KEY, next);
          }}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 outline-none transition-colors hover:border-slate-700 focus:border-indigo-500"
        >
          <option value="">Selecciona proyecto</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Ej: Objetivos, restricciones, checklist de release, criterios QA..."
          disabled={!projectId || loading}
          className="h-40 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors hover:border-slate-700 focus:border-indigo-500"
        />

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">{loading ? "Cargando…" : status || " "}</div>
          <Button size="sm" onClick={saveInstructions} disabled={!projectId || loading || saving}>
            <Save className="h-3.5 w-3.5" /> {saving ? "Guardando…" : "Guardar instrucciones"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
