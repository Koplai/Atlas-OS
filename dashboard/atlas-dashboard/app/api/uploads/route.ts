import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_FORM" }, { status: 400 });
  }

  const f = form.get("file");
  if (!f || typeof f === "string") {
    return NextResponse.json({ ok: false, error: "FILE_REQUIRED" }, { status: 400 });
  }

  // In Next.js route handlers, `File` is available in the runtime.
  const file = f as File;
  if (!file.name) {
    return NextResponse.json({ ok: false, error: "INVALID_FILE" }, { status: 400 });
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "FILE_TOO_LARGE" }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const hash = crypto.createHash("sha256").update(bytes).digest("hex");

  // Store on disk (dev-friendly). In production you likely want S3/R2.
  const dir = path.join(process.cwd(), ".data", "uploads");
  await mkdir(dir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${Date.now()}_${hash.slice(0, 12)}_${safeName}`;
  const pointer = path.join(dir, filename);
  await writeFile(pointer, bytes);

  const artifact = await prisma.artifact.create({
    data: {
      type: "upload",
      pointer,
      hash,
      size: file.size,
    },
  });

  return NextResponse.json({ ok: true, artifact }, { headers: { "Cache-Control": "no-store" } });
}
