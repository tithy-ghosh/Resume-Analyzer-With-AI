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
      await registerUser({ username, email, password })
      const result = await loginWithCredentials(email, password)

      router.push(result?.error ? "/login" : "/dashboard")
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create your account")
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
