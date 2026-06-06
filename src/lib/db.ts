/**
 * lib/db.ts
 *
 * Singleton Mongoose connection for Next.js.
 *
 * Next.js hot-reloads modules in development, which would open a new
 * database connection on every file save without this guard. In production,
 * serverless functions can share a warm connection across invocations within
 * the same container, so we cache the connection state here.
 *
 * Usage: call `await dbConnect()` at the top of any API route or
 * server action that needs the database.
 */

import mongoose from "mongoose"
import { logger } from "./logger"

// Tracks the Mongoose readyState (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)
type ConnectionCache = {
  isConnected?: number
}

const cache: ConnectionCache = {}

export default async function dbConnect(): Promise<void> {
  // Already connected — skip to avoid opening duplicate connections
  if (cache.isConnected) return

  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not defined. Add it to .env.local or your Vercel environment variables."
    )
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI)
    cache.isConnected = db.connections[0].readyState
    logger.info("MongoDB connected")
  } catch (error) {
    logger.error("MongoDB connection failed", error)
    // Re-throw so the calling API route can return a 500 instead of hanging
    throw new Error("Failed to connect to the database")
  }
}