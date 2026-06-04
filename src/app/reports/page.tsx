import { redirect } from "next/navigation"
import { auth } from "../../../auth"
import ReportsView from "@/components/reports/ReportsView"
import { getReportSummaries } from "@/services/reportService"

export default async function ReportsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const reports = await getReportSummaries(session.user.id)

  return (
    <ReportsView
      reports={reports}
      username={session.user.username}
    />
  )
}
