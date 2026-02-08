import LogsPanel from "@/app/components/LogsPanel";

export default function OpsPage() {
  return (
    <div className="min-h-0 flex-1 p-4 lg:p-6">
      <div className="text-sm font-semibold text-slate-200">Ops · Logs</div>
      <LogsPanel />
    </div>
  );
}
