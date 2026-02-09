import type { LucideIcon } from "lucide-react";
import { MessageSquare, FolderKanban, Wrench, ScrollText, BarChart3 } from "lucide-react";

import { ROUTES } from "@/app/components/shell/routes";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

function matchPath(base: string) {
  return (pathname: string) => pathname === base || pathname.startsWith(`${base}/`);
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
  const active = primaryNavItems.find((item) => item.match(pathname));
  return active?.label ?? "Atlas";
}
