/**
 * services/authClientService.ts
 *
 * Client-side helpers for authentication actions.
 *
 * These run in the browser and communicate with:
 *  - /api/auth/register  (our custom route) for account creation
 *  - NextAuth's signIn() for credential verification
 *
 * We intentionally keep these functions thin — no UI logic, no routing.
 * That lives in the hooks (useRegisterForm, useLoginForm) that call these.
 */

import { signIn } from "next-auth/react"

type RegisterInput = {
  username: string
  email: string
  password: string
}

/**
 * Creates a new account via the registration API.
 * Throws an Error with the server's message on failure so the calling
 * hook can surface it directly in the form.
 */
export async function registerUser(input: RegisterInput): Promise<void> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message ?? "Could not create your account")
  }
}

/**
 * Signs in with email and password via NextAuth's CredentialsProvider.
 *
 * `redirect: false` prevents NextAuth from redirecting on error —
 * we handle routing ourselves so we can show inline form errors.
 *
 * Returns the NextAuth result object. Check `result.error` to detect failure.
 */
export async function loginWithCredentials(email: string, password: string) {
  return signIn("credentials", {
    email,
    password,
    redirect: false,
  })
}