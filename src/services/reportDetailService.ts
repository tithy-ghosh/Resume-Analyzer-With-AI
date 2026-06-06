/**
 * services/reportDetailService.ts
 *
 * Server-side data access for a single report's full detail view.
 *
 * We always scope queries to `{ _id, user }` so a user can never read
 * another user's report, even if they know the report ID. MongoDB ObjectIds
 * are not secret — the authorization check is the only thing protecting them.
 *
 * The raw Mongoose document is serialized before being passed to React Server
 * Components. Next.js requires plain objects (no class instances, no Dates,
 * no ObjectIds) when crossing the server/client boundary.
 */

import dbConnect from "@/lib/db"
import InterviewReportModel from "@/models/InterviewReport"

// ─── Types ────────────────────────────────────────────────────────────────────

export type InterviewQuestion = {
  question?: string
  intention?: string
  answer?: string
}

export type PreparationDay = {
  day?: number
  focus?: string
  tasks?: string[]
}

export type SkillGap = {
  skill: string
  severity: "low" | "medium" | "high" | string
}

export type ReportDetail = {
  id: string
  title: string
  matchScore: number
  createdAt: string   // ISO string — safe to pass to client components
  jobDescription: string
  technicalQuestions: InterviewQuestion[]
  behavioralQuestions: InterviewQuestion[]
  skillGaps: SkillGap[]
  preparationPlan: PreparationDay[]
}

// Raw shape from Mongoose `.lean()` — all fields optional because old reports
// may have been created before some fields were added to the schema
type RawReport = {
  _id: unknown
  title?: string
  matchScore?: number
  createdAt?: Date | string
  jobDescription?: string
  technicalQuestions?: InterviewQuestion[]
  behavioralQuestions?: InterviewQuestion[]
  skillGaps?: SkillGap[]
  preparationPlan?: PreparationDay[]
}

// ─── Serialization helpers ────────────────────────────────────────────────────

/**
 * Deep-serializes a list and filters out any question that has no text.
 * `JSON.parse(JSON.stringify(...))` strips Mongoose internals (ObjectIds,
 * prototype methods) that would cause Next.js serialization errors.
 */
function serializeQuestions(questions?: InterviewQuestion[]): InterviewQuestion[] {
  return (JSON.parse(JSON.stringify(questions ?? [])) as InterviewQuestion[]).filter(
    (q) => q?.question?.trim()
  )
}

/** Deep-serializes a generic array, stripping Mongoose internals. */
function serializeList<T>(items?: T[]): T[] {
  return JSON.parse(JSON.stringify(items ?? [])) as T[]
}

// ─── Query ────────────────────────────────────────────────────────────────────

/**
 * Fetches the full detail for one report.
 *
 * @param userId   - The authenticated user's ID (from the session)
 * @param reportId - The MongoDB ObjectId string from the URL
 * @returns The report detail, or null if it doesn't exist or belongs to another user
 */
export async function getReportDetail(
  userId: string,
  reportId: string
): Promise<ReportDetail | null> {
  await dbConnect()

  const report = await InterviewReportModel.findOne({
    _id: reportId,
    user: userId, // ownership check — never skip this
  }).lean<RawReport>()

  if (!report) return null

  return {
    id: String(report._id),
    title: report.title ?? "Interview report",
    matchScore: report.matchScore ?? 0,
    createdAt: new Date(report.createdAt ?? Date.now()).toISOString(),
    jobDescription: report.jobDescription ?? "",
    technicalQuestions: serializeQuestions(report.technicalQuestions),
    behavioralQuestions: serializeQuestions(report.behavioralQuestions),
    skillGaps: serializeList(report.skillGaps),
    preparationPlan: serializeList(report.preparationPlan),
  }
}