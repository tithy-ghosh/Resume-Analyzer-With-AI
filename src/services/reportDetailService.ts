import dbConnect from "@/lib/db"
import InterviewReportModel from "@/models/InterviewReport"

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
  createdAt: string
  jobDescription: string
  technicalQuestions: InterviewQuestion[]
  behavioralQuestions: InterviewQuestion[]
  skillGaps: SkillGap[]
  preparationPlan: PreparationDay[]
}

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

function serializeQuestions(questions?: InterviewQuestion[]) {
  return JSON.parse(JSON.stringify(questions ?? [])).filter((question: InterviewQuestion) =>
    question?.question?.trim()
  ) as InterviewQuestion[]
}

function serializeList<T>(items?: T[]) {
  return JSON.parse(JSON.stringify(items ?? [])) as T[]
}

export async function getReportDetail(userId: string, reportId: string): Promise<ReportDetail | null> {
  await dbConnect()

  const report = await InterviewReportModel.findOne({ _id: reportId, user: userId }).lean<RawReport>()
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
