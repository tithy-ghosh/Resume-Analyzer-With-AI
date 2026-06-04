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
