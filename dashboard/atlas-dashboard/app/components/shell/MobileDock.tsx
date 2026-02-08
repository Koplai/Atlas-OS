"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { primaryNavItems } from "@/app/components/shell/navigation";
import { cn } from "@/app/components/ui/cn";

const dockItems = primaryNavItems.filter((item) => ["/chat", "/projects", "/ops", "/logs"].includes(item.href));

export default function MobileDock() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/90 bg-[#0b1118]/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
        {dockItems.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] transition-colors",
                active ? "bg-indigo-600/15 text-indigo-100" : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-100",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="truncate">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
