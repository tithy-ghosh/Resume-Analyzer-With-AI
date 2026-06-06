/**
 * app/api/auth/register/route.ts
 *
 * POST /api/auth/register
 *
 * Creates a new user account. After a successful registration the client
 * immediately calls NextAuth's signIn() so the user lands on the dashboard
 * without having to sign in again manually.
 *
 * Validation:
 *  - All three fields (username, email, password) must be present
 *  - Duplicate email or username returns a clear 409 Conflict
 *  - Password is hashed with bcrypt (10 salt rounds) before storage —
 *    the plain-text password never touches the database
 */

import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/db"
import UserModel from "@/models/Users"

const BCRYPT_SALT_ROUNDS = 10

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    // ── Input validation ──────────────────────────────────────────────────
    if (!username?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { message: "Username, email, and password are all required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // ── Duplicate check ───────────────────────────────────────────────────
    await dbConnect()

    const existingUser = await UserModel.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    })

    if (existingUser) {
      // Tell the user which field is taken so they can correct it
      const field = existingUser.email === email.toLowerCase() ? "email" : "username"
      return NextResponse.json(
        { message: `That ${field} is already registered` },
        { status: 409 }
      )
    }

    // ── Create account ────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)

    const user = await UserModel.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    })

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[register] Unexpected error:", error)
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}