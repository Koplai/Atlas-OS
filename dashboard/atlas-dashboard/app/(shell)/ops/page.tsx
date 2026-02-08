import Link from "next/link";
import { Activity, ScrollText } from "lucide-react";

export default function OpsPage() {
  return (
    <div className="min-h-0 flex-1 p-4 lg:p-6">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-100">Ops Center</div>
        <div className="text-xs text-slate-500">Panel operativo para supervisión rápida y acceso a logs.</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
          <div className="inline-flex rounded-xl border border-slate-700 bg-slate-900/60 p-2 text-slate-200">
            <Activity className="h-4 w-4" />
          </div>
          <div className="mt-3 text-sm font-medium text-slate-100">Estado general</div>
          <div className="mt-1 text-xs text-slate-500">Usa el panel derecho para revisar status, tareas y métricas en vivo.</div>
        </div>

        <Link
          href="/logs"
          className="rounded-2xl border border-indigo-700/50 bg-indigo-600/10 p-4 transition-colors hover:border-indigo-500/60 hover:bg-indigo-600/15"
        >
          <div className="inline-flex rounded-xl border border-indigo-700/50 bg-indigo-950/40 p-2 text-indigo-100">
            <ScrollText className="h-4 w-4" />
          </div>
          <div className="mt-3 text-sm font-medium text-indigo-100">Logs</div>
          <div className="mt-1 text-xs text-indigo-200/75">Ver timeline de eventos, errores y señales de seguridad.</div>
        </Link>
      </div>
    </div>
  );
}
