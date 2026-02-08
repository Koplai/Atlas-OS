import { NextResponse } from "next/server";
import { run } from "@/lib/exec";

export async function GET() {
  try {
    const { stdout, stderr } = await run("openclaw status");
    return NextResponse.json({ ok: true, stdout, stderr });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
