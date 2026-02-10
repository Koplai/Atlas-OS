import { NextResponse } from "next/server";
import { execFile } from "node:child_process";

export const dynamic = "force-dynamic";

function runOpenclawStatus(args: string[]): Promise<{ ok: boolean; output: string; error?: string }> {
  return new Promise((resolve) => {
    execFile("openclaw", args, { timeout: 30_000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        resolve({ ok: false, output: `${stdout || ""}${stderr || ""}`.trim(), error: err.message });
        return;
      }
      resolve({ ok: true, output: `${stdout || ""}${stderr || ""}`.trim() });
    });
  });
}

export async function GET() {
  const [all, deep] = await Promise.all([
    runOpenclawStatus(["status", "--all"]),
    runOpenclawStatus(["status", "--deep"]),
  ]);

  return NextResponse.json(
    {
      ok: all.ok || deep.ok,
      commands: {
        "openclaw status --all": all,
        "openclaw status --deep": deep,
      },
      generatedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
