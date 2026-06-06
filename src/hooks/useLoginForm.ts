/**
 * hooks/useLoginForm.ts
 *
 * Form state and submission logic for the login page.
 *
 * We use NextAuth's signIn() with `redirect: false` so we can handle
 * errors ourselves rather than letting NextAuth redirect to its default
 * error page. On success we push to the dashboard manually.
 *
 * The error message is intentionally vague ("Invalid email or password")
 * regardless of whether the email doesn't exist or the password is wrong —
 * this prevents attackers from enumerating registered email addresses.
 */

"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { loginWithCredentials } from "@/services/authClientService"

export function useLoginForm() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    const result = await loginWithCredentials(email, password)

    if (result?.error) {
      // Don't reveal whether it was the email or password that was wrong
      setError("Invalid email or password")
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return {
    email,
    password,
    error,
    loading,
    setEmail,
    setPassword,
    submit,
  }
}