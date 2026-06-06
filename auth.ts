/**
 * auth.ts
 *
 * Full NextAuth configuration — Node.js runtime only.
 *
 * This file adds the CredentialsProvider on top of the shared authConfig.
 * It handles the actual sign-in check: look up the user by email, verify
 * the bcrypt password hash, and return the user object that gets packed
 * into the JWT.
 *
 * Do NOT import this file from middleware.ts. Use auth.config.ts there.
 */

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/db"
import UserModel from "@/models/Users"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Spread the shared config (pages, callbacks, trustHost, secret)
  ...authConfig,

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      /**
       * Called when a user submits the login form.
       * Return a user object on success, or throw an error on failure.
       * NextAuth surfaces these errors through the `error` search param on the sign-in page.
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        await dbConnect()

        const user = await UserModel.findOne({ email: credentials.email })

        if (!user) {
          // Keep the message vague to avoid leaking whether an email is registered
          throw new Error("Invalid email or password")
        }

        const passwordMatches = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatches) {
          throw new Error("Invalid email or password")
        }

        // Return only what we need in the token — never return the password hash
        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
        }
      },
    }),
  ],

  // JWT sessions avoid a database lookup on every request.
  // The token is stored in an httpOnly cookie and verified server-side.
  session: { strategy: "jwt" },

  callbacks: {
    /**
     * Called after authorize() succeeds. We add our custom fields
     * (id and username) to the token so they survive across requests.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
      }
      return token
    },

    /**
     * Called whenever session data is read (useSession, getServerSession, auth()).
     * We expose id and username so components don't have to re-fetch the user.
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
      }
      return session
    },
  },
})