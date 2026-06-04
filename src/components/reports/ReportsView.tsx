import Link from "next/link"
import MatchBadge from "@/components/MatchBadge"
import PageLayout from "@/components/PageLayout"
import ScoreRing from "@/components/ScoreRing"
import SectionTitle from "@/components/SectionTitle"
import type { ReportSummary } from "@/services/reportService"
import styles from "./ReportsView.module.css"

type ReportsViewProps = {
  reports: ReportSummary[]
  username?: string
}

function EmptyReportsState() {
  return (
    <div className={styles.emptyState}>
      <p>No analyses yet</p>
      <Link href="/analyze" className={styles.primaryAction}>
        Upload your first resume
      </Link>
    </div>
  )
}

function ReportRow({ report }: { report: ReportSummary }) {
  const createdAt = new Date(report.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Link href={`/reports/${report.id}`} className={styles.reportRow}>
      <ScoreRing score={report.matchScore} size="sm" />
      <div className={styles.reportMeta}>
        <div className={styles.reportTitle}>{report.title}</div>
        <div className={styles.reportDate}>{createdAt}</div>
      </div>
      <MatchBadge score={report.matchScore} />
      <span className={styles.reportArrow}>›</span>
    </Link>
  )
}

export default function ReportsView({ reports, username }: ReportsViewProps) {
  return (
    <PageLayout active="reports" username={username}>
      <header className={styles.header}>
        <div>
          <h1>
            My <em>reports.</em>
          </h1>
          <p>{reports.length} total analyses</p>
        </div>
        <Link href="/analyze" className={styles.primaryAction}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          New Analysis
        </Link>
      </header>

      <SectionTitle>All reports</SectionTitle>

      {reports.length === 0 ? (
        <EmptyReportsState />
      ) : (
        <div className={styles.reportList}>
          {reports.map((report) => (
            <ReportRow key={report.id} report={report} />
          ))}
        </div>
      )}
    </PageLayout>
  )
}
