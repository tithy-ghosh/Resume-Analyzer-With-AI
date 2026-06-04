"use client"

import RegisterView from "@/components/auth/RegisterView"
import { useRegisterForm } from "@/hooks/useRegisterForm"

export default function RegisterPage() {
  const form = useRegisterForm()

  return (
    <RegisterView
      username={form.username}
      email={form.email}
      password={form.password}
      error={form.error}
      loading={form.loading}
      onUsernameChange={form.setUsername}
      onEmailChange={form.setEmail}
      onPasswordChange={form.setPassword}
      onSubmit={form.submit}
    />
  )
}
