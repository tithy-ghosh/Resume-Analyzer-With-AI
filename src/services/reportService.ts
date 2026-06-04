import dbConnect from "@/lib/db"
import InterviewReportModel from "@/models/InterviewReport"

export type ReportSummary = {
  id: string
  title: string
  matchScore: number
  createdAt: string
}

export type DashboardSummary = {
  totalReports: number
  averageScore: number
  bestScore: number
}

const REPORT_LIST_PROJECTION =
  "-resume -selfDescription -jobDescription -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"

function toReportSummary(report: {
  _id: { toString: () => string }
  title?: string
  matchScore?: number
  createdAt?: Date | string
}): ReportSummary {
  return {
    id: report._id.toString(),
    title: report.title ?? "Untitled report",
    matchScore: report.matchScore ?? 0,
    createdAt: new Date(report.createdAt ?? Date.now()).toISOString(),
  }
}

export async function getReportSummaries(userId: string): Promise<ReportSummary[]> {
  await dbConnect()

  // Keep the list projection narrow so dashboard/report pages never pull resume text by accident.
  const reports = await InterviewReportModel.find({ user: userId })
    .sort({ createdAt: -1 })
    .select(REPORT_LIST_PROJECTION)
    .lean()

  return reports.map(toReportSummary)
}

export function getDashboardSummary(reports: ReportSummary[]): DashboardSummary {
  if (reports.length === 0) {
    return {
      totalReports: 0,
      averageScore: 0,
      bestScore: 0,
    }
  }

  const totalScore = reports.reduce((sum, report) => sum + report.matchScore, 0)

  return {
    totalReports: reports.length,
    averageScore: Math.round(totalScore / reports.length),
    bestScore: Math.max(...reports.map((report) => report.matchScore)),
  }
}
