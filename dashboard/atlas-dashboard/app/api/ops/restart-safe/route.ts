import { NextResponse } from "next/server";
import {
  runOpenClawGatewayRestart,
  runOpenClawGatewayStart,
  runOpenClawGatewayStatus,
} from "@/lib/exec";

export const dynamic = "force-dynamic";

function safeOutput(stdout?: string, stderr?: string) {
  const value = `${stdout ?? ""}\n${stderr ?? ""}`.trim();
  return value.slice(0, 3000);
}

export async function POST() {
  const startedAt = Date.now();

  let mode: "restart" | "start" = "restart";

  try {
    const status = await runOpenClawGatewayStatus();
    const text = `${status.stdout ?? ""}\n${status.stderr ?? ""}`.toLowerCase();
    if (text.includes("stopped") || text.includes("not running") || text.includes("inactive")) {
      mode = "start";
    }
  } catch {
    mode = "start";
  }

  try {
    const result = mode === "restart" ? await runOpenClawGatewayRestart() : await runOpenClawGatewayStart();
    const finalStatus = await runOpenClawGatewayStatus();

    return NextResponse.json(
      {
        ok: true,
        action: mode,
        output: safeOutput(result.stdout, result.stderr),
        status: safeOutput(finalStatus.stdout, finalStatus.stderr),
        durationMs: Date.now() - startedAt,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        ok: false,
        action: mode,
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - startedAt,
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
