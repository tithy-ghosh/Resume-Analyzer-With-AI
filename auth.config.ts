import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname
      const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
      const isPublic = pathname === "/" || isAuthPage

      if (!isLoggedIn && !isPublic) return Response.redirect(new URL("/login", nextUrl))
      if (isLoggedIn && isAuthPage) return Response.redirect(new URL("/dashboard", nextUrl))
      return true
    },
  },
  providers: [],
}
