"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import AgentPanel from "@/app/components/agents/AgentPanel";
import { Button } from "@/app/components/ui/Button";
import { EmptyState } from "@/app/components/ui/EmptyState";

type AgentData = {
  id: string;
  name: string;
  status: string;
  systemPromptVersion: string;
  toolsAllowed: string[];
  lastRun: { id: string; status: string; updatedAt: string } | null;
  timeline: Array<{
    id: string;
    timestamp: string;
    severity: "INFO" | "WARN" | "ERROR" | "SECURITY";
    source: string;
    message: string;
  }>;
};

export default function AgentsBoard() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [selected, setSelected] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents", { cache: "no-store" });
      const data = await res.json();
      setAgents(data.agents ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, [load]);

  const visible = useMemo(() => {
    if (selected === "ALL") return agents;
    return agents.filter((a) => a.id === selected);
  }, [agents, selected]);

  if (!loading && agents.length === 0) {
    return (
      <EmptyState
        title="Aún no hay agentes registrados"
        description="Crea agentes en Atlas para ver paneles individuales de estado, timeline y logs aquí."
        action={
          <Button onClick={load} size="sm">
            Reintentar
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={selected === "ALL" ? "primary" : "secondary"} onClick={() => setSelected("ALL")}>Todos</Button>
        {agents.map((agent) => (
          <Button
            key={agent.id}
            size="sm"
            variant={selected === agent.id ? "primary" : "secondary"}
            onClick={() => setSelected(agent.id)}
          >
            {agent.name}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={load}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {visible.map((agent) => (
          <AgentPanel key={agent.id} agent={agent} />
        ))}
      </div>

      {!loading && visible.length === 0 && (
        <EmptyState
          title="No hay coincidencias"
          description="Selecciona otro agente para explorar su timeline individual."
        />
      )}
    </div>
  );
}
