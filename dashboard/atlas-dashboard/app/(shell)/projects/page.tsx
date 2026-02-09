import Link from "next/link";
import { FolderKanban, MessageSquare, Wrench, ScrollText } from "lucide-react";

import { ROUTES } from "@/app/components/shell/routes";

const quickActions = [
  { href: ROUTES.CHAT_NEW, label: "Nuevo chat", icon: MessageSquare },
  { href: ROUTES.OPS, label: "Ops center", icon: Wrench },
  { href: ROUTES.LOGS, label: "Ver logs", icon: ScrollText },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-0 flex-1 p-4 lg:p-6">
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/60 to-slate-950/40 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Workspace map</div>
            <h1 className="mt-1 text-sm font-semibold text-slate-100">Projects</h1>
            <p className="mt-1 text-xs text-slate-400">Gestiona proyectos desde la barra lateral y usa esta vista como hub operativo.</p>
          </div>
          <div className="rounded-full border border-slate-700 bg-slate-900/50 p-2.5 text-slate-300">
            <FolderKanban className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {quickActions.map((item, idx) => (
            <Link
              key={item.href}
              href={item.href}
              className={idx === 0
                ? "inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/55 bg-indigo-500/15 px-3 py-2 text-xs text-indigo-100 transition-colors hover:border-indigo-400"
                : "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-slate-100"}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
