"use client";

import { useMemo, useState } from "react";
import { Menu, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import Sidebar from "@/app/components/shell/Sidebar";
import RightPanel from "@/app/components/right/RightPanel";
import { getPageTitle } from "@/app/components/shell/navigation";
import { Button } from "@/app/components/ui/Button";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const title = useMemo(() => getPageTitle(pathname), [pathname]);
  const isChatRoute = pathname === "/chat" || pathname.startsWith("/chat/");

  return (
    <main className="min-h-screen bg-[#0b1118] text-slate-100">
      <div className="flex h-screen">
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-[#0b1118]/90 px-3 py-2.5 backdrop-blur sm:px-4 lg:px-6">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Atlas Workspace</div>
              <div className="truncate text-sm font-semibold text-slate-100">{title}</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1 rounded-full border border-slate-800 bg-slate-900/50 px-2.5 py-1 text-xs text-slate-300 sm:inline-flex">
                <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                Premium UI
              </div>
              <Button size="sm" variant="secondary" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </header>
          {children}
        </section>

        {!isChatRoute && <RightPanel />}
      </div>
    </main>
  );
}
