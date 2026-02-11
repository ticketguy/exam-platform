import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Hidden admin path — only you know this
const ADMIN_SLUG = "idokosafehouse";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  // ─── Rewrite /idokosafehouse/* → /admin/* (hidden admin URL) ───
  if (path.startsWith(`/${ADMIN_SLUG}`)) {
    const adminPath = path.replace(`/${ADMIN_SLUG}`, "/admin");
    const url = req.nextUrl.clone();
    url.pathname = adminPath;

    // /idokosafehouse/login — allow without auth
    if (adminPath === "/admin/login") {
      // If already logged in as admin, redirect to dashboard
      if (token?.role === "admin") {
        return NextResponse.redirect(new URL(`/${ADMIN_SLUG}`, req.url));
      }
      return NextResponse.rewrite(url);
    }

    // Other admin pages — require admin role
    if (!token) {
      return NextResponse.redirect(new URL(`/${ADMIN_SLUG}/login`, req.url));
    }
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.rewrite(url);
  }

  // ─── Block direct /admin/* access (return 404) ───
  if (path.startsWith("/admin")) {
    return NextResponse.rewrite(new URL("/not-found", req.url));
  }

  // ─── Public routes ───
  if (
    path === "/" ||
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // ─── Not logged in → redirect to login ───
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ─── Redirect logged-in user away from login page ───
  if (path === "/login" && token.role === "user") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ─── User routes — prevent admin from accessing ───
  if (
    (path.startsWith("/dashboard") ||
      path.startsWith("/exams") ||
      path.startsWith("/wallet") ||
      path.startsWith("/leaderboard") ||
      path.startsWith("/profile") ||
      path.startsWith("/settings")) &&
    token.role === "admin"
  ) {
    return NextResponse.redirect(new URL(`/${ADMIN_SLUG}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
