import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sttUrl = process.env.STT_URL;
  if (!sttUrl) {
    return NextResponse.json({ ok: false, error: "STT_NOT_CONFIGURED" }, { status: 503 });
  }

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

  const file = f as File;
  if (file.size > 35 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "FILE_TOO_LARGE" }, { status: 413 });
  }

  const upstreamForm = new FormData();
  const sttFileField = process.env.STT_FILE_FIELD || "audio_file";
  upstreamForm.append(sttFileField, file, file.name || "audio.webm");

  // Common whisper-webservice params (safe if ignored by provider)
  upstreamForm.append("task", "transcribe");
  upstreamForm.append("language", process.env.STT_LANGUAGE || "es");
  upstreamForm.append("output", "json");

  const controller = new AbortController();
  const timeoutMs = Number(process.env.STT_TIMEOUT_MS || 120000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(sttUrl, {
      method: "POST",
      body: upstreamForm,
      signal: controller.signal,
    });

    const contentType = res.headers.get("content-type") || "";
    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { ok: false, error: "STT_UPSTREAM_ERROR", status: res.status, detail: errText.slice(0, 1000) },
        { status: 502 },
      );
    }

    if (contentType.includes("application/json")) {
      const data = await res.json();
      const text =
        (typeof data?.text === "string" && data.text) ||
        (typeof data?.transcript === "string" && data.transcript) ||
        (typeof data?.result === "string" && data.result) ||
        "";
      return NextResponse.json({ ok: true, text, raw: data }, { headers: { "Cache-Control": "no-store" } });
    }

    const text = await res.text();
    return NextResponse.json({ ok: true, text }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "STT_UNAVAILABLE", detail: e instanceof Error ? e.message : String(e) },
      { status: 503 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
