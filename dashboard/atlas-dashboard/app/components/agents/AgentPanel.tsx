import { Activity, Clock3 } from "lucide-react";

import { Badge } from "@/app/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { EmptyState } from "@/app/components/ui/EmptyState";

type AgentLog = {
  id: string;
  timestamp: string;
  severity: "INFO" | "WARN" | "ERROR" | "SECURITY";
  source: string;
  message: string;
};

type AgentPanelData = {
  id: string;
  name: string;
  status: string;
  systemPromptVersion: string;
  toolsAllowed: string[];
  lastRun: { id: string; status: string; updatedAt: string } | null;
  timeline: AgentLog[];
};

function statusVariant(status: string) {
  const normalized = status.toUpperCase();
  if (normalized.includes("RUN") || normalized.includes("ACTIVE")) return "success" as const;
  if (normalized.includes("WARN") || normalized.includes("BLOCK")) return "warning" as const;
  if (normalized.includes("FAIL") || normalized.includes("ERROR")) return "danger" as const;
  return "neutral" as const;
}

function severityVariant(sev: AgentLog["severity"]) {
  if (sev === "ERROR" || sev === "SECURITY") return "danger" as const;
  if (sev === "WARN") return "warning" as const;
  if (sev === "INFO") return "info" as const;
  return "neutral" as const;
}

export default function AgentPanel({ agent }: { agent: AgentPanelData }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-slate-100">{agent.name}</CardTitle>
            <CardDescription>Prompt {agent.systemPromptVersion}</CardDescription>
          </div>
          <Badge variant={statusVariant(agent.status)}>{agent.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <Badge variant="neutral" className="gap-1">
            <Activity className="h-3 w-3" />
            {agent.lastRun ? `Run ${agent.lastRun.status}` : "Sin run vinculado"}
          </Badge>
          {agent.lastRun && (
            <Badge variant="neutral" className="gap-1">
              <Clock3 className="h-3 w-3" />
              {new Date(agent.lastRun.updatedAt).toLocaleString()}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {agent.toolsAllowed.length === 0 ? (
            <span className="text-xs text-slate-500">Sin tools declaradas</span>
          ) : (
            agent.toolsAllowed.slice(0, 8).map((tool) => (
              <Badge key={tool} variant="info" className="text-[10px]">
                {tool}
              </Badge>
            ))
          )}
        </div>

        <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-2">
          <div className="mb-2 text-xs font-medium text-slate-400">Timeline</div>

          {agent.timeline.length === 0 ? (
            <EmptyState
              title="Sin actividad todavía"
              description="Cuando este agente reporte logs, aparecerán aquí en orden temporal."
              className="p-5"
            />
          ) : (
            <div className="max-h-72 space-y-2 overflow-auto pr-1">
              {agent.timeline.map((log) => (
                <div key={log.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={severityVariant(log.severity)}>{log.severity}</Badge>
                    <span className="text-[11px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{log.source}</div>
                  <div className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-200">{log.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
