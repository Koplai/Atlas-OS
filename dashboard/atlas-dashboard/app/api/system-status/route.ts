import { NextResponse } from "next/server";
import { run } from "@/lib/exec";

export async function GET() {
  try {
    const { stdout, stderr } = await run("openclaw status");
    return NextResponse.json({ ok: true, stdout, stderr });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
