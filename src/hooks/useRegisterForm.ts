/**
 * hooks/useRegisterForm.ts
 *
 * Form state and submission logic for the registration page.
 *
 * Flow:
 *  1. POST to /api/auth/register with username, email, and password
 *  2. If registration succeeds, immediately sign in via NextAuth
 *     so the user lands on the dashboard without a second login step
 *  3. If auto sign-in fails (shouldn't happen, but just in case),
 *     redirect to /login so the user can sign in manually
 *
 * Error handling:
 *  - Server errors (duplicate email/username, validation failures) are
 *    surfaced in the `error` field and shown in the RegisterView component
 *  - Loading state disables the submit button to prevent double-submits
 */

"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { loginWithCredentials, registerUser } from "@/services/authClientService"

export function useRegisterForm() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Step 1: Create the account
      await registerUser({ username, email, password })

      // Step 2: Sign in automatically — the user just registered, so this should always succeed
      const result = await loginWithCredentials(email, password)

      // Step 3: Redirect to dashboard, or fall back to login if something unexpected happened
      router.push(result?.error ? "/login" : "/dashboard")
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not create your account. Please try again."
      )
      setLoading(false)
    }
  }

  return {
    username,
    email,
    password,
    error,
    loading,
    setUsername,
    setEmail,
    setPassword,
    submit,
  }
}