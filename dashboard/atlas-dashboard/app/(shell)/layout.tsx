"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import Sidebar from "@/app/components/shell/Sidebar";
import RightPanel from "@/app/components/right/RightPanel";
import { Button } from "@/app/components/ui/Button";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#0b1118] text-slate-100">
      <div className="flex h-screen">
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-900 bg-[#0b1118]/90 px-3 py-2 backdrop-blur lg:hidden">
            <div className="text-sm font-semibold text-slate-200">Atlas Chat</div>
            <Button size="sm" variant="secondary" onClick={() => setMobileOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
          </header>
          {children}
        </section>

        <RightPanel />
      </div>
    </main>
  );
}
