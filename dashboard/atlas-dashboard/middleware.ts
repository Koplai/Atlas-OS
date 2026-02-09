import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_API_PATHS = new Set(["/api/health"]);

const CANONICAL_REDIRECTS: Record<string, string> = {
  "/project": "/projects",
  "/project/": "/projects",
  "/projects/": "/projects",
  "/operation": "/ops",
  "/operations": "/ops",
  "/ops/": "/ops",
  "/log": "/logs",
  "/logs/": "/logs",
  "/chat/": "/chat",
  "/chat/new/": "/chat/new",
};

function unauthorized() {
  return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const canonicalPath = CANONICAL_REDIRECTS[pathname];
  if (canonicalPath) {
    const url = req.nextUrl.clone();
    url.pathname = canonicalPath;
    return NextResponse.redirect(url, 308);
  }

  // Only guard API routes for now.
  if (!pathname.startsWith("/api/")) return NextResponse.next();
  if (PUBLIC_API_PATHS.has(pathname)) return NextResponse.next();

  const token = process.env.ATLAS_DASHBOARD_TOKEN;

  // Dev-friendly default: if no token configured, do not block.
  // In production (or once token is set), require Bearer auth.
  // Only enforce app-level auth if a token is explicitly configured.
  // (Cloudflare Access can be the outer auth layer.)
  const mustAuth = !!token;
  if (!mustAuth) return NextResponse.next();

  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const headerToken = req.headers.get("x-atlas-token") ?? bearer;

  if (headerToken !== token) return unauthorized();

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
