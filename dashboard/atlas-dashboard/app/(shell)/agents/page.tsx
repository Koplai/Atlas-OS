import AgentsBoard from "@/app/components/agents/AgentsBoard";

export default function AgentsPage() {
  return (
    <div className="min-h-0 flex-1 p-4 lg:p-6">
      <div className="mb-3">
        <div className="text-sm font-semibold text-slate-100">Agents</div>
        <div className="text-xs text-slate-500">Vista operativa por agente (timeline, logs y estado)</div>
      </div>
      <AgentsBoard />
    </div>
  );
}
