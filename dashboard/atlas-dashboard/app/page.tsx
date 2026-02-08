import { Bell, LayoutGrid, FileText, ScrollText, CircleDot } from "lucide-react";

import TaskPanel from "@/app/components/TaskPanel";
import ChatPanel from "@/app/components/ChatPanel";
import Kanban from "@/app/components/Kanban";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b1118] text-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="h-screen w-72 border-r border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full border border-slate-700 bg-gradient-to-br from-slate-700 to-slate-900 animate-pulse" />
            <div>
              <div className="text-lg font-semibold">ATLAS</div>
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <CircleDot className="h-3 w-3" /> Idle
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">Ready for tasks</div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="text-slate-400">Current Run</div>
            <div className="rounded-lg border border-slate-800 p-3">No active run</div>

            <div className="text-slate-400">Last Heartbeat</div>
            <div className="rounded-lg border border-slate-800 p-3">—</div>

            <div className="text-slate-400">Channels</div>
            <div className="rounded-lg border border-slate-800 p-3 space-y-1">
              <div>Terminal: Connected</div>
              <div>Telegram: Connected</div>
              <div>WhatsApp: Connected</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1 p-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2 font-semibold"><LayoutGrid className="h-4 w-4"/>Dashboard</span>
              <span className="flex items-center gap-2 text-slate-400"><FileText className="h-4 w-4"/>Docs</span>
              <span className="flex items-center gap-2 text-slate-400"><ScrollText className="h-4 w-4"/>Log</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              Last sync: —
              <Bell className="h-4 w-4" />
            </div>
          </header>

          {/* Proof-of-work */}
          <div className="mt-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-4">
            <div className="text-sm text-slate-400">Proof-of-Work</div>
            <div className="mt-2 text-xs text-slate-500">No evidence yet</div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2"><TaskPanel /><ChatPanel /></div>

          {/* Kanban */}
          <Kanban />
        </section>
      </div>
    </main>
  );
}
