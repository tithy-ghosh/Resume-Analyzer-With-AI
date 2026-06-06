/**
 * middleware.ts
 *
 * Next.js edge middleware for route protection.
 *
 * We use the edge-safe authConfig here (not the full auth.ts) because
 * middleware runs on the Edge runtime where Node.js APIs are unavailable.
 *
 * The `authorized` callback in authConfig handles the actual redirect logic —
 * unauthenticated users are sent to /login, and logged-in users are
 * bounced away from /login and /register.
 */

import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth

export const config = {
  /**
   * Paths this middleware runs on.
   *
   * We intentionally exclude /api/auth/* routes (NextAuth's own endpoints)
   * and static files (_next, images, fonts) — those should never be blocked.
   *
   * All app pages that require authentication are covered here.
   */
  matcher: [
    "/",
    "/dashboard/:path*",
    "/analyze/:path*",
    "/reports/:path*",
    "/login",
    "/register",
  ],
}