import { signIn } from "next-auth/react"

type RegisterInput = {
  username: string
  email: string
  password: string
}

export async function loginWithCredentials(email: string, password: string) {
  return signIn("credentials", {
    email,
    password,
    redirect: false,
  })
}

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
