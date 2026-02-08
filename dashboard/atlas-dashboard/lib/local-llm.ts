export type LocalLlmHealth = {
  ok: boolean;
  checkedAt: string;
  endpoint: string;
  latencyMs: number;
  error: string | null;
  modelsCount: number | null;
  modelNames: string[];
};

function toInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function checkLocalLlmHealth(): Promise<LocalLlmHealth> {
  const endpoint = process.env.LOCAL_LLM_HEALTH_URL || "http://127.0.0.1:11434/api/tags";
  const timeoutMs = toInt(process.env.LOCAL_LLM_TIMEOUT_MS, 1500);

  const startedAt = Date.now();
  let ok = false;
  let error: string | null = null;
  let modelsCount: number | null = null;
  let modelNames: string[] = [];

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`HTTP_${res.status}`);
    }

    const data = (await res.json()) as { models?: Array<{ name?: string }> };
    const models = Array.isArray(data?.models) ? data.models : [];
    modelNames = models.map((m) => m?.name).filter((name): name is string => Boolean(name)).slice(0, 20);
    modelsCount = modelNames.length;
    ok = true;
  } catch (err: unknown) {
    ok = false;
    error = err instanceof Error ? err.message : String(err);
  }

  return {
    ok,
    checkedAt: new Date().toISOString(),
    endpoint,
    latencyMs: Date.now() - startedAt,
    error,
    modelsCount,
    modelNames,
  };
}
