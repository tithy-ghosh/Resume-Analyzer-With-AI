type LogLevel = "info" | "warn" | "error"

function canLog(level: LogLevel) {
  return level === "error" || process.env.NODE_ENV !== "production"
}

export const logger = {
  info(message: string, ...details: unknown[]) {
    if (canLog("info")) console.info(message, ...details)
  },
  warn(message: string, ...details: unknown[]) {
    if (canLog("warn")) console.warn(message, ...details)
  },
  error(message: string, ...details: unknown[]) {
    if (canLog("error")) console.error(message, ...details)
  },
}
