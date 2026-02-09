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
  "/project/": ROUTES.PROJECTS,
  "/projects/": ROUTES.PROJECTS,
  "/operation": ROUTES.OPS,
  "/operations": ROUTES.OPS,
  "/ops/": ROUTES.OPS,
  "/log": ROUTES.LOGS,
  "/logs/": ROUTES.LOGS,
  "/chats": ROUTES.CHAT,
  "/chats/": ROUTES.CHAT,
  "/chat/": ROUTES.CHAT,
  "/chat/new/": ROUTES.CHAT_NEW,
};
