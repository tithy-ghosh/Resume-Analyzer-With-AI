import { redirect } from "next/navigation"
import { auth } from "../../../auth"
import DashboardView from "@/components/dashboard/DashboardView"
import { getDashboardSummary, getReportSummaries } from "@/services/reportService"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const reports = await getReportSummaries(session.user.id)
  const summary = getDashboardSummary(reports)

  return (
    <DashboardView
      reports={reports}
      summary={summary}
      username={session.user.username}
    />
  )
}
