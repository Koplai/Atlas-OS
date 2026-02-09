"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { workspaceSections } from "@/app/components/shell/navigation";
import { ROUTES } from "@/app/components/shell/routes";
import { cn } from "@/app/components/ui/cn";

const dockItems = workspaceSections;

export default function MobileDock() {
  const pathname = usePathname();

  const isChatRoute = pathname === ROUTES.CHAT || pathname.startsWith(`${ROUTES.CHAT}/`);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pt-2 lg:hidden">
      {!isChatRoute && (
        <div className="mx-auto mb-2 flex max-w-xl justify-center">
          <Link
            href={ROUTES.CHAT_NEW}
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/55 bg-indigo-500/15 px-3 py-1.5 text-xs text-indigo-100 shadow-[0_10px_30px_rgba(79,70,229,.35)]"
          >
            Volver al chat
          </Link>
        </div>
      )}
      <div className="mx-auto grid max-w-xl grid-cols-4 gap-1 rounded-2xl border border-slate-800/90 bg-[#0b1118]/90 p-1.5 shadow-[0_18px_60px_rgba(2,6,23,.6)] backdrop-blur-2xl">
        {dockItems.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border px-2 py-2 text-[11px] transition-all",
                item.href === ROUTES.CHAT && !active && "border-indigo-500/25 bg-indigo-600/10 text-indigo-100",
                active
                  ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-50 shadow-[0_0_0_1px_rgba(99,102,241,.28)]"
                  : "border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60 hover:text-slate-100",
              )}
            >
              <item.icon className={cn("h-4 w-4", item.href === ROUTES.CHAT && "drop-shadow-[0_0_10px_rgba(129,140,248,.6)]")} />
              <span className="truncate">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
