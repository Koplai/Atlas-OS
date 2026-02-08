"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";

export default function SystemStatus() {
  const [data, setData] = useState<{ ok: boolean; stdout?: string; stderr?: string } | null>(null);

  async function load() {
    const res = await fetch("/api/system-status", { cache: "no-store" });
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>OpenClaw Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap text-xs text-slate-300">{data?.stdout ?? "Cargando…"}</div>
        {data?.stderr && <div className="mt-2 text-xs text-rose-400">{data.stderr}</div>}
        <Button onClick={load} className="mt-3" size="sm">
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
}
