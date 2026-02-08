"use client";

import { useEffect, useState } from "react";
import { Hammer } from "lucide-react";

export default function DevStatus() {
  const [developing, setDeveloping] = useState(false);

  async function load() {
    const res = await fetch("/api/status", { cache: "no-store" });
    const data = await res.json();
    setDeveloping(!!data.developing);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <span className="relative inline-flex h-2 w-2">
        <span className={`absolute inline-flex h-2 w-2 rounded-full ${developing ? "bg-emerald-400" : "bg-slate-600"}`} />
        {developing && <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />}
      </span>
      {developing ? (
        <span className="flex items-center gap-1 text-emerald-300">
          Developing <Hammer className="h-3 w-3 animate-bounce" />
        </span>
      ) : (
        <span>Idle</span>
      )}
    </div>
  );
}
