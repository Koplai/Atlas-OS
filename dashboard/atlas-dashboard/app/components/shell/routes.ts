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
  "/chat/new-chat": ROUTES.CHAT_NEW,
  "/workspace/chat": ROUTES.CHAT,
  "/workspace/projects": ROUTES.PROJECTS,
  "/workspace/ops": ROUTES.OPS,
  "/workspace/logs": ROUTES.LOGS,
};

const SECTION_PREFIX_ALIASES: Array<{ aliases: string[]; canonical: string }> = [
  { aliases: ["/chat", "/chats", "/workspace/chat"], canonical: ROUTES.CHAT },
  { aliases: ["/projects", "/project", "/workspace/projects"], canonical: ROUTES.PROJECTS },
  { aliases: ["/ops", "/operation", "/operations", "/workspace/ops"], canonical: ROUTES.OPS },
  { aliases: ["/logs", "/log", "/workspace/logs"], canonical: ROUTES.LOGS },
];

export function normalizeRoutePath(pathname: string) {
  if (!pathname) return pathname;
  if (pathname === "/") return "/";

  // Collapse duplicated slashes and trim trailing slash to keep route checks deterministic.
  const collapsed = pathname.replace(/\/+/g, "/");
  return collapsed.endsWith("/") ? collapsed.slice(0, -1) : collapsed;
}

export function resolveCanonicalPath(pathname: string) {
  const normalized = normalizeRoutePath(pathname);
  const lower = normalized.toLowerCase();

  const mapped = CANONICAL_REDIRECTS[lower];
  if (mapped) return mapped;

  for (const section of SECTION_PREFIX_ALIASES) {
    for (const alias of section.aliases) {
      if (lower === alias) return section.canonical;
      if (lower.startsWith(`${alias}/`)) {
        const suffix = normalized.slice(alias.length);
        return `${section.canonical}${suffix}`;
      }
    }
  }

  // Only lowercase top-level navigation paths (avoid touching IDs like /chat/AbC123).
  if (/^\/[A-Za-z-]+$/.test(normalized) && normalized !== lower) return lower;

  return null;
}
