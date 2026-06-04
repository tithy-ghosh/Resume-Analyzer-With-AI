import Link from "next/link"
import ATSResumeButton from "@/components/ATSResumeButton"
import PageLayout from "@/components/PageLayout"
import type { ReportDetail, SkillGap } from "@/services/reportDetailService"
import styles from "./ReportOverviewView.module.css"

type ScoreState = "strong" | "partial" | "needsWork"
type SectionVariant = "technical" | "behavioral" | "preparation"

const SCORE_RADIUS = 54
const SCORE_CIRCUMFERENCE = 2 * Math.PI * SCORE_RADIUS

const scoreClassByState: Record<ScoreState, string> = {
  strong: styles.scoreStrong,
  partial: styles.scorePartial,
  needsWork: styles.scoreNeedsWork,
}

const scoreLabelClassByState: Record<ScoreState, string> = {
  strong: styles.labelStrong,
  partial: styles.labelPartial,
  needsWork: styles.labelNeedsWork,
}

const sectionAccentByVariant: Record<SectionVariant, string> = {
  technical: styles.technicalAccent,
  behavioral: styles.behavioralAccent,
  preparation: styles.preparationAccent,
}

const severityClassByValue: Record<string, string> = {
  high: styles.severityHigh,
  medium: styles.severityMedium,
  low: styles.severityLow,
}

function getScoreState(score: number): ScoreState {
  if (score >= 75) return "strong"
  if (score >= 50) return "partial"
  return "needsWork"
}

function getScoreLabel(score: number) {
  if (score >= 75) return "Strong match"
  if (score >= 50) return "Partial match"
  return "Needs work"
}

function formatReportDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function ScoreArc({ score }: { score: number }) {
  const state = getScoreState(score)
  const dash = (score / 100) * SCORE_CIRCUMFERENCE

  return (
    <div className={styles.scoreWrap}>
      <div className={styles.scoreArc}>
        <svg className={styles.scoreSvg} viewBox="0 0 128 128" aria-hidden="true">
          <circle className={styles.scoreTrack} cx="64" cy="64" r={SCORE_RADIUS} />
          <circle
            className={`${styles.scoreValue} ${scoreClassByState[state]}`}
            cx="64"
            cy="64"
            r={SCORE_RADIUS}
            strokeDasharray={`${dash} ${SCORE_CIRCUMFERENCE}`}
          />
        </svg>
        <div className={styles.scoreText}>
          <span className={styles.scoreNumber}>{score}</span>
          <span className={styles.scoreTotal}>/ 100</span>
        </div>
      </div>
      <span className={`${styles.scoreLabel} ${scoreLabelClassByState[state]}`}>
        {getScoreLabel(score)}
      </span>
    </div>
  )
}

function SeverityBar({ severity }: { severity: string }) {
  const activeBarsBySeverity: Record<string, number> = {
    high: 3,
    medium: 2,
    low: 1,
  }
  const activeBars = activeBarsBySeverity[severity] ?? 1
  const label = severity === "high" ? "High priority" : severity === "low" ? "Low priority" : severity
  const severityClass = severityClassByValue[severity] ?? styles.severityFallback

  return (
    <span className={`${styles.severity} ${severityClass}`}>
      {Array.from({ length: 3 }).map((_, index) => (
        <span
          key={index}
          className={`${styles.severityBar} ${
            index < activeBars ? styles.severityBarActive : styles.severityBarMuted
          }`}
        />
      ))}
      {label}
    </span>
  )
}

function SectionTile({
  href,
  title,
  count,
  description,
  variant,
}: {
  href: string
  title: string
  count: string
  description: string
  variant: SectionVariant
}) {
  return (
    <Link className={styles.sectionTile} href={href}>
      <div className={`${styles.tileAccent} ${sectionAccentByVariant[variant]}`} />
      <div className={styles.sectionCount}>{count}</div>
      <h2 className={styles.tileTitle}>{title}</h2>
      <p className={styles.tileDescription}>{description}</p>
      <div className={styles.tileAction}>
        Open <span aria-hidden="true">-&gt;</span>
      </div>
    </Link>
  )
}

function SkillGapGroup({ label, items }: { label: string; items: SkillGap[] }) {
  if (items.length === 0) return null

  return (
    <div className={styles.gapGroup}>
      <div className={styles.groupLabel}>{label}</div>
      <div className={styles.gapList}>
        {items.map((gap, index) => (
          <div className={styles.gapChip} key={`${gap.skill}-${index}`}>
            <span className={styles.gapName}>{gap.skill}</span>
            <SeverityBar severity={gap.severity} />
          </div>
        ))}
      </div>
    </div>
  )
}

function StatPill({ label }: { label: string }) {
  return <span className={styles.statPill}>{label}</span>
}

export default function ReportOverviewView({ report }: { report: ReportDetail }) {
  const highGaps = report.skillGaps.filter((gap) => gap.severity === "high")
  const mediumGaps = report.skillGaps.filter((gap) => gap.severity === "medium")
  const lowGaps = report.skillGaps.filter((gap) => gap.severity === "low")

  return (
    <PageLayout active="reports">
      <div className={styles.shell}>
        <Link className={styles.backLink} href="/reports">
          <span aria-hidden="true">&lt;</span>
          All reports
        </Link>

        <section className={styles.heroCard}>
          <div className={styles.heroPattern} />
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.meta}>
                <span className={styles.eyebrow}>Interview Report</span>
                <span className={styles.divider} />
                <span className={styles.date}>{formatReportDate(report.createdAt)}</span>
              </div>
              <h1 className={styles.title}>{report.title}</h1>
              <div className={styles.stats}>
                <StatPill label={`${report.technicalQuestions.length} technical`} />
                <StatPill label={`${report.behavioralQuestions.length} behavioral`} />
                <StatPill label={`${report.skillGaps.length} skill gaps`} />
                <StatPill label={`${report.preparationPlan.length}-day plan`} />
              </div>
              <p className={styles.summary}>
                Choose a section below to start your prep. Your ATS-optimized resume is ready to
                generate whenever you need it.
              </p>
            </div>
            <ScoreArc score={report.matchScore} />
          </div>
        </section>

        <section className={styles.atsPanel}>
          <div className={styles.atsHeading}>
            <div className={styles.atsIcon} aria-hidden="true">
              TXT
            </div>
            <div>
              <div className={styles.atsTitle}>ATS-friendly resume</div>
              <div className={styles.atsCopy}>
                Tailored to this job description with keywords that pass ATS filters.
              </div>
            </div>
          </div>
          <ATSResumeButton reportId={report.id} />
        </section>

        {report.skillGaps.length > 0 && (
          <section className={styles.skillGaps}>
            <div className={styles.skillHeader}>
              <span className={styles.skillTitle}>Skill gaps to address</span>
              <span className={styles.skillCount}>{report.skillGaps.length} identified</span>
            </div>
            <SkillGapGroup items={highGaps} label="High priority" />
            <SkillGapGroup items={mediumGaps} label="Medium priority" />
            <SkillGapGroup items={lowGaps} label="Low priority" />
          </section>
        )}

        <section className={styles.sectionGrid}>
          <SectionTile
            count={`${report.technicalQuestions.length} questions`}
            description="Role-specific technical prompts with model answers and interviewer intent."
            href={`/reports/${report.id}/technical`}
            title="Technical questions"
            variant="technical"
          />
          <SectionTile
            count={`${report.behavioralQuestions.length} questions`}
            description="STAR-format answers for ownership, teamwork, adaptability, and judgment."
            href={`/reports/${report.id}/behavioral`}
            title="Behavioral questions"
            variant="behavioral"
          />
          <SectionTile
            count={`${report.preparationPlan.length} days`}
            description="A focused plan for studying, practicing, and closing role-specific gaps."
            href={`/reports/${report.id}/preparation`}
            title="Preparation plan"
            variant="preparation"
          />
        </section>
      </div>
    </PageLayout>
  )
}
