import type { LucideIcon } from "lucide-react";
import { MessageSquare, FolderKanban, Wrench, ScrollText, BarChart3 } from "lucide-react";

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
    href: "/chat",
    label: "Chat",
    shortLabel: "Chat",
    icon: MessageSquare,
    match: matchPath("/chat"),
  },
  {
    href: "/projects",
    label: "Projects",
    shortLabel: "Projects",
    icon: FolderKanban,
    match: matchPath("/projects"),
  },
  {
    href: "/ops",
    label: "Ops",
    shortLabel: "Ops",
    icon: Wrench,
    match: matchPath("/ops"),
  },
  {
    href: "/logs",
    label: "Logs",
    shortLabel: "Logs",
    icon: ScrollText,
    match: matchPath("/logs"),
  },
  {
    href: "/agents",
    label: "Agents",
    shortLabel: "Agents",
    icon: BarChart3,
    match: matchPath("/agents"),
  },
];

export const workspaceSections = primaryNavItems.filter((item) =>
  ["/chat", "/projects", "/ops", "/logs"].includes(item.href),
);

export function getPageTitle(pathname: string) {
  const active = primaryNavItems.find((item) => item.match(pathname));
  return active?.label ?? "Atlas";
}
