import OpsControlCenter from "@/app/components/ops/OpsControlCenter";
import McpStatusPanel from "@/app/components/ops/McpStatusPanel";

export default function OpsPage() {
  return (
    <div className="min-h-0 flex-1 p-4 lg:p-6">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-100">Ops Center</div>
        <div className="text-xs text-slate-500">Bloque operativo P0: acciones ejecutables (run checks, restart-safe) y acceso directo a logs.</div>
      </div>

      <div className="space-y-3">
        <OpsControlCenter />
        <McpStatusPanel />
      </div>
    </div>
  );
}
