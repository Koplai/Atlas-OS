import type { LucideIcon } from "lucide-react";
import { MessageSquare, FolderKanban, Wrench, ScrollText, BarChart3 } from "lucide-react";

import { normalizeRoutePath, ROUTES } from "@/app/components/shell/routes";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

function normalizeForMatch(pathname: string) {
  return normalizeRoutePath(pathname).toLowerCase();
}

function matchPath(base: string) {
  const canonicalBase = normalizeForMatch(base);
  return (pathname: string) => {
    const current = normalizeForMatch(pathname);
    return current === canonicalBase || current.startsWith(`${canonicalBase}/`);
  };
}

export const primaryNavItems: NavItem[] = [
  {
    href: ROUTES.CHAT,
    label: "Chat",
    shortLabel: "Chat",
    icon: MessageSquare,
    match: matchPath(ROUTES.CHAT),
  },
  {
    href: ROUTES.PROJECTS,
    label: "Projects",
    shortLabel: "Projects",
    icon: FolderKanban,
    match: matchPath(ROUTES.PROJECTS),
  },
  {
    href: ROUTES.OPS,
    label: "Ops",
    shortLabel: "Ops",
    icon: Wrench,
    match: matchPath(ROUTES.OPS),
  },
  {
    href: ROUTES.LOGS,
    label: "Logs",
    shortLabel: "Logs",
    icon: ScrollText,
    match: matchPath(ROUTES.LOGS),
  },
  {
    href: ROUTES.AGENTS,
    label: "Agents",
    shortLabel: "Agents",
    icon: BarChart3,
    match: matchPath(ROUTES.AGENTS),
  },
];

const workspaceRouteSet = new Set<string>([ROUTES.CHAT, ROUTES.PROJECTS, ROUTES.OPS, ROUTES.LOGS]);

export const workspaceSections = primaryNavItems.filter((item) => workspaceRouteSet.has(item.href));

export function getPageTitle(pathname: string) {
  const normalized = normalizeForMatch(pathname);
  const active = primaryNavItems.find((item) => item.match(normalized));
  return active?.label ?? "Atlas";
}
