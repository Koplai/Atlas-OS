import { NextResponse } from "next/server";

import { asObject, getClientIp, getString, rateLimit } from "@/lib/request";
import { invokeMcpTool } from "@/lib/mcp";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`mcp:invoke:${ip}`, { windowMs: 60_000, max: 30 });
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "RATE_LIMIT" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const b = asObject(body);
  const serverId = getString(b, "serverId", "").toLowerCase();
  const toolName = getString(b, "toolName", "");
  const args = (b as Record<string, unknown>).args;

  if (!serverId) {
    return NextResponse.json({ ok: false, error: "SERVER_ID_REQUIRED" }, { status: 400 });
  }
  if (!toolName) {
    return NextResponse.json({ ok: false, error: "TOOL_NAME_REQUIRED" }, { status: 400 });
  }

  const result = await invokeMcpTool({ serverId, toolName, args });

  if (!result.ok) {
    return NextResponse.json(result, { status: result.status });
  }

  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
