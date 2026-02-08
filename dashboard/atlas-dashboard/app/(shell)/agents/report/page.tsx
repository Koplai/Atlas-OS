import AgentsReportBoard from "@/app/components/agents/AgentsReportBoard";

export default function AgentsReportPage() {
  return (
    <div className="min-h-0 flex-1 p-4 lg:p-6">
      <div className="mb-3">
        <div className="text-sm font-semibold text-slate-100">Agents Report</div>
        <div className="text-xs text-slate-500">Observabilidad de sesiones/subagentes: estado, tokens de contexto, consumo total y costo estimado.</div>
      </div>
      <AgentsReportBoard />
    </div>
  );
}
