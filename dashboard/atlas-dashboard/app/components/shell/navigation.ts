import type { LucideIcon } from "lucide-react";
import { MessageSquare, FolderKanban, Wrench, ScrollText, BarChart3 } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

export const primaryNavItems: NavItem[] = [
  {
    href: "/chat",
    label: "Chat",
    shortLabel: "Chat",
    icon: MessageSquare,
    match: (pathname) => pathname === "/chat" || pathname.startsWith("/chat/"),
  },
  {
    href: "/projects",
    label: "Projects",
    shortLabel: "Projects",
    icon: FolderKanban,
    match: (pathname) => pathname === "/projects" || pathname.startsWith("/projects/"),
  },
  {
    href: "/ops",
    label: "Ops",
    shortLabel: "Ops",
    icon: Wrench,
    match: (pathname) => pathname === "/ops" || pathname.startsWith("/ops/"),
  },
  {
    href: "/logs",
    label: "Logs",
    shortLabel: "Logs",
    icon: ScrollText,
    match: (pathname) => pathname === "/logs" || pathname.startsWith("/logs/"),
  },
  {
    href: "/agents/report",
    label: "Agents",
    shortLabel: "Agents",
    icon: BarChart3,
    match: (pathname) => pathname === "/agents" || pathname.startsWith("/agents/"),
  },
];

export function getPageTitle(pathname: string) {
  const active = primaryNavItems.find((item) => item.match(pathname));
  if (active) {
    if (active.href === "/agents/report" && pathname.startsWith("/agents/report")) return "Agents Report";
    return active.label;
  }
  return "Atlas";
}
