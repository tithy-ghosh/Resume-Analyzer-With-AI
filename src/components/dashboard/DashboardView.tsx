import Link from "next/link"
import MatchBadge from "@/components/MatchBadge"
import PageLayout from "@/components/PageLayout"
import ScoreRing from "@/components/ScoreRing"
import SectionTitle from "@/components/SectionTitle"
import type { DashboardSummary, ReportSummary } from "@/services/reportService"
import styles from "./DashboardView.module.css"

type DashboardViewProps = {
  reports: ReportSummary[]
  summary: DashboardSummary
  username?: string
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statSub}>{sub}</div>
    </div>
  )
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

export default function DashboardView({ reports, summary, username }: DashboardViewProps) {
  return (
    <PageLayout active="dashboard" username={username}>
      <header className={styles.header}>
        <div>
          <h1>
            Good to see you, <em>{username}.</em>
          </h1>
          <p>Here is your interview prep overview</p>
        </div>
        <Link href="/analyze" className={styles.primaryAction}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          New Analysis
        </Link>
      </header>

      <section className={styles.statsGrid} aria-label="Dashboard summary">
        <StatCard label="Total Analyses" value={summary.totalReports.toString()} sub="All time" />
        <StatCard label="Avg Match Score" value={`${summary.averageScore}%`} sub="Across all reports" />
        <StatCard label="Best Match" value={summary.totalReports > 0 ? `${summary.bestScore}%` : "-"} sub="Highest score" />
      </section>

      <SectionTitle>Recent reports</SectionTitle>

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
