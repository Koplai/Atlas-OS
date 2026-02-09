import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const QDRANT = "http://127.0.0.1:6333";
const COLLECTION = "atlas_memory";
const OLLAMA = "http://127.0.0.1:11434/api/embeddings";
const EMBED_MODEL = "nomic-embed-text:latest";

async function embed(query: string): Promise<number[]> {
  const r = await fetch(OLLAMA, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: query }),
    cache: "no-store",
  });
  if (!r.ok) throw new Error("embed_failed");
  const data = (await r.json()) as { embedding?: number[] };
  if (!data.embedding) throw new Error("embed_missing");
  return data.embedding;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? "5"), 20);

  if (!query) {
    return NextResponse.json({ ok: false, error: "Missing query param: q" }, { status: 400 });
  }

  try {
    const vector = await embed(query);
    const sr = await fetch(`${QDRANT}/collections/${COLLECTION}/points/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vector,
        limit,
        with_payload: true,
      }),
      cache: "no-store",
    });

    if (!sr.ok) throw new Error("search_failed");

    const raw = (await sr.json()) as {
      result?: Array<{ score: number; payload?: Record<string, unknown> }>;
    };

    const results = (raw.result ?? []).map((r) => ({
      score: r.score,
      source: r.payload?.source ?? null,
      domain: r.payload?.domain ?? null,
      authorityLevel: r.payload?.authority_level ?? null,
      confidenceLevel: r.payload?.confidence_level ?? null,
      text: r.payload?.text ?? null,
      citation: `${r.payload?.source ?? "unknown"}#chunk:${r.payload?.chunk ?? "?"}`,
    }));

    return NextResponse.json(
      {
        ok: true,
        contractVersion: "v1",
        query,
        knowledgeUsed: results.map((r) => ({
          source: r.source,
          domain: r.domain,
          confidenceLevel: r.confidenceLevel,
          authorityLevel: r.authorityLevel,
        })),
        results,
        generatedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: "KVD search unavailable",
        detail: e instanceof Error ? e.message : "unknown",
      },
      { status: 503 },
    );
  }
}
