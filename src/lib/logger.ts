/**
 * lib/logger.ts
 *
 * Lightweight structured logger.
 *
 * In production we only emit errors — info and warn logs add noise to
 * Vercel's function logs and can leak internal details. In development
 * all levels are visible so you can trace the full request lifecycle.
 *
 * Usage:
 *   logger.info("PDF extracted", { length: 3400 })
 *   logger.warn("Gemini retry", { attempt: 2 })
 *   logger.error("DB connection failed", error)
 */

type LogLevel = "info" | "warn" | "error"

function shouldLog(level: LogLevel): boolean {
  // Always log errors — they need to surface in production monitoring
  if (level === "error") return true
  // Suppress info/warn noise in production
  return process.env.NODE_ENV !== "production"
}

export const logger = {
  info(message: string, ...details: unknown[]): void {
    if (shouldLog("info")) console.info(`[INFO] ${message}`, ...details)
  },

  warn(message: string, ...details: unknown[]): void {
    if (shouldLog("warn")) console.warn(`[WARN] ${message}`, ...details)
  },

  error(message: string, ...details: unknown[]): void {
    if (shouldLog("error")) console.error(`[ERROR] ${message}`, ...details)
  },
}