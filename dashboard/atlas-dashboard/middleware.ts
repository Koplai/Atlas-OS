import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_API_PATHS = new Set(["/api/health"]);

function unauthorized() {
  return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard API routes for now.
  if (!pathname.startsWith("/api/")) return NextResponse.next();
  if (PUBLIC_API_PATHS.has(pathname)) return NextResponse.next();

  const token = process.env.ATLAS_DASHBOARD_TOKEN;

  // Dev-friendly default: if no token configured, do not block.
  // In production (or once token is set), require Bearer auth.
  const mustAuth = process.env.NODE_ENV === "production" || !!token;
  if (!mustAuth) return NextResponse.next();

  if (!token) return unauthorized();

  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const headerToken = req.headers.get("x-atlas-token") ?? bearer;

  if (headerToken !== token) return unauthorized();

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
