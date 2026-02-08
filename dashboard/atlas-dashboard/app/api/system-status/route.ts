import { NextResponse } from "next/server";
import { runOpenClawStatus } from "@/lib/exec";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { stdout, stderr } = await runOpenClawStatus();
    // Avoid huge payloads (and accidental leakage) by truncating.
    const max = 20_000;
    return NextResponse.json(
      {
        ok: true,
        stdout: stdout?.slice(0, max) ?? "",
        stderr: stderr?.slice(0, max) ?? "",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
