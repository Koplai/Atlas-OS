import { FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="min-h-0 flex-1 p-4 lg:p-6">
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/20 p-8 text-center">
        <div className="mx-auto inline-flex rounded-full border border-slate-700 bg-slate-900/50 p-3 text-slate-300">
          <FolderKanban className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-base font-semibold text-slate-100">Projects</h1>
        <p className="mt-1 text-sm text-slate-400">Gestiona y crea proyectos desde la barra lateral.</p>
      </div>
    </div>
  );
}
