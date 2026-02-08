import Sidebar from "@/app/components/shell/Sidebar";
import RightPanel from "@/app/components/right/RightPanel";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#0b1118] text-slate-100">
      <div className="flex h-screen">
        <Sidebar />
        <section className="flex min-w-0 flex-1 flex-col">{children}</section>
        <RightPanel />
      </div>
    </main>
  );
}
