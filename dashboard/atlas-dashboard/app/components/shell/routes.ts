export const ROUTES = {
  HOME: "/",
  CHAT: "/chat",
  CHAT_NEW: "/chat/new",
  PROJECTS: "/projects",
  OPS: "/ops",
  LOGS: "/logs",
  AGENTS: "/agents",
} as const;

export const CANONICAL_REDIRECTS: Record<string, string> = {
  "/project": ROUTES.PROJECTS,
  "/projects/": ROUTES.PROJECTS,
  "/operation": ROUTES.OPS,
  "/operations": ROUTES.OPS,
  "/ops/": ROUTES.OPS,
  "/log": ROUTES.LOGS,
  "/logs/": ROUTES.LOGS,
  "/chats": ROUTES.CHAT,
  "/chat/": ROUTES.CHAT,
  "/chat/new/": ROUTES.CHAT_NEW,
};

export function normalizeRoutePath(pathname: string) {
  if (!pathname) return pathname;
  if (pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function resolveCanonicalPath(pathname: string) {
  const normalized = normalizeRoutePath(pathname);
  const lower = normalized.toLowerCase();

  const mapped = CANONICAL_REDIRECTS[lower];
  if (mapped) return mapped;

  // Only lowercase top-level navigation paths (avoid touching IDs like /chat/AbC123).
  if (/^\/[A-Za-z-]+$/.test(normalized) && normalized !== lower) return lower;

  return null;
}
