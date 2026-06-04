"use client"

import LoginView from "@/components/auth/LoginView"
import { useLoginForm } from "@/hooks/useLoginForm"

export default function LoginPage() {
  const form = useLoginForm()

  return (
    <LoginView
      email={form.email}
      password={form.password}
      error={form.error}
      loading={form.loading}
      onEmailChange={form.setEmail}
      onPasswordChange={form.setPassword}
      onSubmit={form.submit}
    />
  )
}
