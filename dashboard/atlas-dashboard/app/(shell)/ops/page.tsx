import Link from "next/link";

import OpsControlCenter from "@/app/components/ops/OpsControlCenter";
import McpStatusPanel from "@/app/components/ops/McpStatusPanel";
import CommandStatusPanel from "@/app/components/ops/CommandStatusPanel";
import { ROUTES } from "@/app/components/shell/routes";

export default function OpsPage() {
  return (
    <div className="min-h-0 flex-1 p-4 lg:p-6">
      <div className="mb-4 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/60 to-slate-950/40 p-4 sm:p-5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Operations · Premium flow</div>
        <div className="mt-1 text-sm font-semibold text-slate-100">Ops Center</div>
        <div className="mt-1 text-xs text-slate-500">Bloque operativo P0: checks ejecutables, restart-safe y control MCP sin salir del workspace chat-first.</div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href={ROUTES.CHAT_NEW} className="rounded-full border border-indigo-500/50 bg-indigo-500/15 px-3 py-1.5 text-indigo-100 transition-colors hover:border-indigo-400">Nuevo chat</Link>
          <Link href={ROUTES.PROJECTS} className="rounded-full border border-slate-700 bg-slate-900/40 px-3 py-1.5 text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100">Projects</Link>
          <Link href={ROUTES.LOGS} className="rounded-full border border-indigo-500/50 bg-indigo-500/15 px-3 py-1.5 text-indigo-100 transition-colors hover:border-indigo-400">Ver logs</Link>
        </div>
      </div>

      <div className="space-y-3">
        <OpsControlCenter />
        <CommandStatusPanel />
        <McpStatusPanel />
      </div>
    </div>
  );
}
