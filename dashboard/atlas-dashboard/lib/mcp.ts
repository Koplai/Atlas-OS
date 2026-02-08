export type MCPServerConfig = {
  id: string;
  label: string;
  baseUrl: string;
  healthPath: string;
  invokePath: string;
  enabled: boolean;
  timeoutMs: number;
  allowedTools: string[];
};

export type MCPServerStatus = {
  id: string;
  label: string;
  enabled: boolean;
  ok: boolean;
  latencyMs: number | null;
  detail: string;
  allowedTools: string[];
};

const DEFAULT_SERVERS: MCPServerConfig[] = [
  {
    id: "atlas-local",
    label: "Atlas Local MCP",
    baseUrl: "http://127.0.0.1:3920",
    healthPath: "/health",
    invokePath: "/mcp/invoke",
    enabled: true,
    timeoutMs: 3000,
    allowedTools: ["status.ping", "logs.query", "ops.checks"],
  },
];

function safeString(v: unknown, fallback: string) {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function safeNumber(v: unknown, fallback: number, min: number, max: number) {
  if (typeof v !== "number" || Number.isNaN(v)) return fallback;
  return Math.max(min, Math.min(max, v));
}

function normalizeServer(raw: unknown): MCPServerConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const id = safeString(r.id, "").toLowerCase();
  const baseUrl = safeString(r.baseUrl, "");
  if (!id || !baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) return null;

  const allowedTools = Array.isArray(r.allowedTools)
    ? r.allowedTools.filter((t): t is string => typeof t === "string" && t.trim().length > 0).slice(0, 100)
    : [];

  return {
    id,
    label: safeString(r.label, id),
    baseUrl,
    healthPath: safeString(r.healthPath, "/health"),
    invokePath: safeString(r.invokePath, "/mcp/invoke"),
    enabled: r.enabled !== false,
    timeoutMs: safeNumber(r.timeoutMs, 3000, 500, 30_000),
    allowedTools,
  };
}

export function getMcpServers(): MCPServerConfig[] {
  const raw = process.env.MCP_SERVERS_JSON;
  if (!raw) return DEFAULT_SERVERS;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_SERVERS;
    const servers = parsed
      .map((x) => normalizeServer(x))
      .filter((x): x is MCPServerConfig => !!x);
    return servers.length > 0 ? servers : DEFAULT_SERVERS;
  } catch {
    return DEFAULT_SERVERS;
  }
}

export function resolveMcpServer(serverId: string) {
  return getMcpServers().find((s) => s.id === serverId) ?? null;
}

export function isToolAllowed(server: MCPServerConfig, toolName: string) {
  if (!toolName.trim()) return false;
  return server.allowedTools.includes(toolName);
}

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function checkMcpServerStatus(server: MCPServerConfig): Promise<MCPServerStatus> {
  if (!server.enabled) {
    return {
      id: server.id,
      label: server.label,
      enabled: false,
      ok: false,
      latencyMs: null,
      detail: "disabled",
      allowedTools: server.allowedTools,
    };
  }

  const startedAt = Date.now();
  try {
    const response = await fetch(joinUrl(server.baseUrl, server.healthPath), {
      method: "GET",
      signal: AbortSignal.timeout(server.timeoutMs),
      cache: "no-store",
    });

    const latencyMs = Date.now() - startedAt;
    const detail = response.ok ? `HTTP ${response.status}` : `HTTP ${response.status}`;

    return {
      id: server.id,
      label: server.label,
      enabled: true,
      ok: response.ok,
      latencyMs,
      detail,
      allowedTools: server.allowedTools,
    };
  } catch (err: unknown) {
    return {
      id: server.id,
      label: server.label,
      enabled: true,
      ok: false,
      latencyMs: Date.now() - startedAt,
      detail: err instanceof Error ? err.message : String(err),
      allowedTools: server.allowedTools,
    };
  }
}

export async function invokeMcpTool(input: {
  serverId: string;
  toolName: string;
  args?: unknown;
}) {
  const server = resolveMcpServer(input.serverId);
  if (!server) return { ok: false, error: "MCP_SERVER_NOT_ALLOWED", status: 403 } as const;
  if (!server.enabled) return { ok: false, error: "MCP_SERVER_DISABLED", status: 409 } as const;
  if (!isToolAllowed(server, input.toolName)) return { ok: false, error: "MCP_TOOL_NOT_ALLOWED", status: 403 } as const;

  try {
    const res = await fetch(joinUrl(server.baseUrl, server.invokePath), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool: input.toolName, arguments: input.args ?? {} }),
      signal: AbortSignal.timeout(server.timeoutMs),
    });

    const text = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      result: text.slice(0, 20_000),
      serverId: server.id,
      toolName: input.toolName,
    } as const;
  } catch (err: unknown) {
    return {
      ok: false,
      status: 502,
      error: err instanceof Error ? err.message : String(err),
      serverId: server.id,
      toolName: input.toolName,
    } as const;
  }
}
