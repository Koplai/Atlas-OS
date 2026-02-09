"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Menu, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import Sidebar from "@/app/components/shell/Sidebar";
import MobileDock from "@/app/components/shell/MobileDock";
import RightPanel from "@/app/components/right/RightPanel";
import { getPageTitle, workspaceSections } from "@/app/components/shell/navigation";
import { ROUTES } from "@/app/components/shell/routes";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/app/components/ui/cn";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const title = useMemo(() => getPageTitle(pathname), [pathname]);
  const isChatRoute = pathname === ROUTES.CHAT || pathname.startsWith(`${ROUTES.CHAT}/`);
  const routeChips = workspaceSections;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b1118] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.22),transparent_42%),radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.18),transparent_35%)]" />

      <div className="relative flex h-screen">
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

        <section className="flex min-w-0 flex-1 flex-col pb-24 lg:pb-0">
          <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0b1118]/80 px-3 py-2.5 backdrop-blur-2xl sm:px-4 lg:px-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Atlas Workspace</div>
                <div className="truncate text-sm font-semibold text-slate-100">{title}</div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-100 sm:inline-flex">
                  <span className="relative inline-flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                  </span>
                  <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                  Premium · Chat-first
                </div>
                <Button size="sm" variant="secondary" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
              {routeChips.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                      active
                        ? "border-indigo-500/60 bg-indigo-500/15 text-indigo-100"
                        : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:text-slate-100",
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>
          {children}
        </section>

        {!isChatRoute && <RightPanel />}
      </div>

      <MobileDock />
    </main>
  );
}
