import { auth } from "../../../../auth"
import { redirect, notFound } from "next/navigation"
import BehavioralQuestionsPage from "@/components/report/BehavioralQuestionsPage"
import PreparationPlanPage from "@/components/report/PreparationPlanPage"
import ReportOverviewView from "@/components/report/ReportOverviewView"
import TechnicalQuestionsPage from "@/components/report/TechnicalQuestionsPage"
import { getReportDetail } from "@/services/reportDetailService"

const REPORT_SECTIONS = ["technical", "behavioral", "preparation"]

export default async function ReportPage({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = await params
  const [reportId, section] = id

  if (!reportId) notFound()
  if (section && !REPORT_SECTIONS.includes(section)) notFound()

  const session = await auth()
  if (!session) redirect("/login")

  const report = await getReportDetail(session.user.id, reportId)
  if (!report) notFound()

  if (section === "technical") {
    return (
      <TechnicalQuestionsPage
        reportId={reportId}
        questions={report.technicalQuestions}
        jobDescription={report.jobDescription}
      />
    )
  }

  if (section === "behavioral") {
    return (
      <BehavioralQuestionsPage
        reportId={reportId}
        questions={report.behavioralQuestions}
        jobDescription={report.jobDescription}
      />
    )
  }

  if (section === "preparation") {
    return <PreparationPlanPage reportId={reportId} preparationPlan={report.preparationPlan} />
  }

  return <ReportOverviewView report={report} />
}
