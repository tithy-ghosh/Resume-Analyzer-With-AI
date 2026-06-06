/**
 * auth.config.ts
 *
 * Edge-runtime-safe NextAuth configuration.
 *
 * Why this file exists separately from auth.ts:
 * Next.js middleware runs on the Edge runtime, which does not support
 * Node.js APIs like bcrypt or mongoose. So we split auth into two files:
 *
 *   auth.config.ts  → no Node.js imports, safe for middleware
 *   auth.ts         → full config with CredentialsProvider + bcrypt
 *
 * This file handles route protection logic only. The actual sign-in
 * logic lives in auth.ts.
 */

import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  // AUTH_SECRET is the newer env var name; fall back to NEXTAUTH_SECRET
  // for projects that haven't migrated yet.
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,

  // Required on Vercel and other platforms where the host header
  // can't be trusted automatically.
  trustHost: true,

  pages: {
    // Send unauthenticated users to /login instead of NextAuth's default /api/auth/signin
    signIn: "/login",
  },

  callbacks: {
    /**
     * Runs on every request that matches the middleware matcher.
     * Returns true to allow, or a Response redirect to block.
     *
     * Rules:
     *  - Unauthenticated users can only access "/" and the auth pages.
     *  - Authenticated users are bounced away from login/register back to the dashboard.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register")
      const isPublicPage = pathname === "/" || isAuthPage

      // Block unauthenticated access to protected routes
      if (!isLoggedIn && !isPublicPage) {
        return Response.redirect(new URL("/login", nextUrl))
      }

      // Prevent logged-in users from landing back on auth pages
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },
  },

  // Providers are defined in auth.ts. This array must exist here
  // to satisfy the type, but intentionally left empty.
  providers: [],
}