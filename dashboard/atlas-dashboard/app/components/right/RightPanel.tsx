"use client";

import { useState } from "react";

import SystemStatus from "@/app/components/SystemStatus";
import TaskPanel from "@/app/components/TaskPanel";
import LogsPanel from "@/app/components/LogsPanel";
import StatsRow from "@/app/components/StatsRow";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/app/components/ui/cn";

const tabs = ["Status", "Tasks", "Logs"] as const;

type Tab = (typeof tabs)[number];

export default function RightPanel() {
  const [tab, setTab] = useState<Tab>("Status");

  return (
    <aside className="hidden w-[420px] flex-col border-l border-slate-900 bg-[#0b1118] p-4 xl:flex">
      <div className="flex items-center gap-2">
        {tabs.map((t) => (
          <Button
            key={t}
            size="sm"
            variant={tab === t ? "primary" : "secondary"}
            onClick={() => setTab(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      <div className={cn("mt-4 min-h-0 flex-1 overflow-auto pr-1")}> 
        {tab === "Status" && (
          <div className="space-y-4">
            <StatsRow />
            <SystemStatus />
          </div>
        )}
        {tab === "Tasks" && <TaskPanel />}
        {tab === "Logs" && <LogsPanel />}
      </div>
    </aside>
  );
}
