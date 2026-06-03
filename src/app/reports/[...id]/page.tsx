import { auth } from "../../../../auth"
import { redirect, notFound } from "next/navigation"
import dbConnect from "@/lib/db"
import InterviewReportModel from "@/models/InterviewReport"
import Link from "next/link"
import PageLayout from "@/components/PageLayout"
import ATSResumeButton from "@/components/ATSResumeButton"
import TechnicalQuestionsPage from "@/components/report/TechnicalQuestionsPage"
import BehavioralQuestionsPage from "@/components/report/BehavioralQuestionsPage"
import PreparationPlanPage from "@/components/report/PreparationPlanPage"

type InterviewQuestion = {
  question?: string
  intention?: string
  answer?: string
}

type PreparationDay = {
  day?: number
  focus?: string
  tasks?: string[]
}

function buildFallbackQuestions(jobDescription = "", type: "technical" | "behavioral"): InterviewQuestion[] {
  const text = jobDescription.toLowerCase()
  const roleSignals = [
    ["react", "React component architecture, hooks, state management, rendering performance, and accessibility"],
    ["next", "Next.js routing, server/client component boundaries, caching, and API routes"],
    ["node", "Node.js API design, async work, validation, and error handling"],
    ["mongodb", "MongoDB schema design, indexes, aggregation, and data consistency"],
    ["sql", "SQL query design, indexing, transactions, and data modeling"],
    ["python", "Python service design, testing, data handling, and package choices"],
    ["aws", "AWS deployment, security, monitoring, and cost-aware architecture"],
    ["docker", "Docker images, local development, deployment, and environment configuration"],
    ["api", "API contracts, authentication, rate limits, versioning, and observability"],
    ["test", "testing strategy, edge cases, CI feedback, and maintainability"],
  ]
  const matchedSignals = roleSignals.filter(([keyword]) => text.includes(keyword)).map(([, topic]) => topic)
  const defaultTopics = ["the core tools and responsibilities named in the job description", "system design choices for this role", "debugging and production readiness", "security, validation, and safe data handling", "testing strategy and edge-case coverage", "performance bottlenecks and monitoring", "API design and integration tradeoffs", "deployment, rollback, and release confidence", "maintainability and documentation", "collaboration with product, design, and engineering partners"]
  if (type === "behavioral") {
    return [
      { question: "Tell me about a time you owned a difficult delivery from ambiguity to release.", intention: "They are testing ownership, prioritization, communication, and whether you can move work forward without perfect instructions.", answer: "Use STAR. Pick a role-relevant project, explain the unclear goal, name the tradeoffs you managed, describe how you aligned people, and end with a measurable result." },
      { question: "Describe a time you had to learn a job-critical tool or domain quickly.", intention: "They want to know if you can close skill gaps fast when the job description expects unfamiliar responsibilities.", answer: "Choose an example where learning changed the outcome. Mention your learning plan, how you validated progress, and how the new skill improved delivery quality or speed." },
      { question: "Give an example of handling disagreement during a technical or product decision.", intention: "They are checking collaboration, judgment, and whether you can disagree without slowing the team down.", answer: "Frame the disagreement, explain the evidence you brought, show how you listened, and close with the decision and result. Avoid blaming teammates." },
      { question: "Tell me about a mistake or production issue you helped fix.", intention: "They are evaluating accountability, debugging habits, and whether you turn incidents into better systems.", answer: "Be direct about the issue, focus on your actions, explain the fix and prevention steps, and share the lesson you now apply to similar work." },
      { question: "How do you prioritize when several urgent tasks compete for your attention?", intention: "They want evidence that you can protect business impact, communicate clearly, and make practical tradeoffs.", answer: "Describe how you compare impact, urgency, dependencies, and risk. Mention how you update stakeholders and what you do when priorities change." },
      { question: "Tell me about a time you improved quality, reliability, or maintainability.", intention: "They are looking for practical standards, long-term thinking, and care for the team that inherits your work.", answer: "Use a concrete example. Explain the quality problem, your action, the measurable improvement, and how it helped teammates or users." },
    ]
  }
  return [...matchedSignals, ...defaultTopics].slice(0, 10).map((topic) => ({ question: `How would you approach ${topic} in this role?`, intention: "They are checking whether you can connect the job description to practical implementation decisions.", answer: "Start with the goal and constraints, describe the design or workflow you would choose, mention tradeoffs, and explain how you would test or measure success." }))
}

function withMinimumQuestions(questions: InterviewQuestion[] | undefined, jobDescription: string | undefined, type: "technical" | "behavioral", minimum: number) {
  const existing = (questions ?? []).filter((q) => q.question)
  const fallback = buildFallbackQuestions(jobDescription, type)
  const seen = new Set(existing.map((q) => q.question?.toLowerCase()))
  const additions = fallback.filter((q) => !seen.has(q.question?.toLowerCase()))
  return [...existing, ...additions].slice(0, Math.max(minimum, existing.length))
}

// ── Score Arc ──────────────────────────────────────────────────────────────────
function ScoreArc({ score }: { score: number }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626"
  const bg = score >= 75 ? "#f0fdf4" : score >= 50 ? "#fffbeb" : "#fef2f2"
  const label = score >= 75 ? "Strong match" : score >= 50 ? "Partial match" : "Needs work"

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
      <div style={{ position: "relative", width: 128, height: 128 }}>
        <svg viewBox="0 0 128 128" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
          <circle cx="64" cy="64" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="64" cy="64" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 28, fontWeight: 600, color: "#111", lineHeight: 1, fontFamily: "'DM Mono', monospace" }}>{score}</span>
          <span style={{ fontSize: 11, color: "#9ca3af", letterSpacing: "0.08em", marginTop: 2, fontFamily: "inherit" }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color, background: bg, borderRadius: 100, padding: "3px 12px", border: `1px solid ${color}20` }}>
        {label}
      </span>
    </div>
  )
}

// ── Skill Gap Badge ────────────────────────────────────────────────────────────
function SeverityBar({ severity }: { severity: string }) {
  const config = {
    high: { label: "High priority", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", bars: 3 },
    medium: { label: "Medium", color: "#d97706", bg: "#fffbeb", border: "#fcd34d", bars: 2 },
    low: { label: "Low priority", color: "#16a34a", bg: "#f0fdf4", border: "#86efac", bars: 1 },
  }[severity] ?? { label: severity, color: "#6b7280", bg: "#f9fafb", border: "#d1d5db", bars: 1 }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: config.color, background: config.bg, border: `1px solid ${config.border}`, borderRadius: 6, padding: "2px 8px" }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span key={i} style={{ width: 3, height: i < config.bars ? 9 : 5, background: i < config.bars ? config.color : `${config.color}30`, borderRadius: 2, display: "inline-block" }} />
      ))}
      {config.label}
    </span>
  )
}

// ── Section Tile ───────────────────────────────────────────────────────────────
function SectionTile({ href, title, count, description, accent }: { href: string; title: string; count: string; description: string; accent: string }) {
  return (
    <Link href={href} style={{ display: "block", textDecoration: "none", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "1.25rem", transition: "all 0.18s", position: "relative", overflow: "hidden" }}
      className="section-tile">
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: "16px 16px 0 0" }} />
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "1.1rem" }}>
        {count}
      </div>
      <h2 style={{ fontSize: 17, fontWeight: 600, color: "#111", margin: "0 0 0.4rem", lineHeight: 1.3 }}>{title}</h2>
      <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, margin: "0 0 1rem" }}>{description}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#111" }}>
        Open <span style={{ fontSize: 14 }}>→</span>
      </div>
      <style>{`.section-tile:hover { border-color: #111 !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }`}</style>
    </Link>
  )
}

// ── Detail Header ──────────────────────────────────────────────────────────────
// ── Main Page ──────────────────────────────────────────────────────────────────
export default async function ReportPage({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = await params
  const [reportId, section] = id
  if (!reportId) notFound()
  if (section && !["technical", "behavioral", "preparation"].includes(section)) notFound()

  const session = await auth()
  if (!session) redirect("/login")

  await dbConnect()
  const report = await InterviewReportModel.findOne({ _id: reportId, user: session.user.id }).lean()
  if (!report) notFound()

  const score = report.matchScore ?? 0
  const date = new Date(report.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  const technicalQuestions = withMinimumQuestions(report.technicalQuestions, report.jobDescription, "technical", 10)
  const behavioralQuestions = withMinimumQuestions(report.behavioralQuestions, report.jobDescription, "behavioral", 8)
  const preparationPlan = report.preparationPlan as PreparationDay[] | undefined

  // ── Section: Technical ──
  if (section === "technical") {
    return <TechnicalQuestionsPage reportId={reportId} questions={technicalQuestions} />
  }

  // ── Section: Behavioral ──
  if (section === "behavioral") {
    return <BehavioralQuestionsPage reportId={reportId} questions={behavioralQuestions} />
  }

  // ── Section: Preparation ──
  if (section === "preparation") {
    return <PreparationPlanPage reportId={reportId} preparationPlan={preparationPlan} />
  }

  // ── Overview ──────────────────────────────────────────────────────────────────
  const skillGaps = report.skillGaps as { skill: string; severity: string }[] | undefined
  const highGaps = skillGaps?.filter(g => g.severity === "high") ?? []
  const medGaps = skillGaps?.filter(g => g.severity === "medium") ?? []
  const lowGaps = skillGaps?.filter(g => g.severity === "low") ?? []

  return (
    <PageLayout active="reports">
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Back */}
        <Link href="/reports" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280", textDecoration: "none", marginBottom: "1.5rem" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          All reports
        </Link>

        {/* Hero Card */}
        <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 20, padding: "1.75rem", marginBottom: "1.25rem", position: "relative", overflow: "hidden" }}>
          {/* subtle grid bg */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)", backgroundSize: "24px 24px", opacity: 0.35, pointerEvents: "none" }} />

          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem", alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.6rem" }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>Interview Report</span>
                <span style={{ width: 1, height: 12, background: "#e5e7eb" }} />
                <span style={{ fontSize: 10, color: "#9ca3af" }}>{date}</span>
              </div>

              <h1 style={{ fontFamily: "'DM Serif Display', 'Georgia', serif", fontSize: 40, fontWeight: 400, color: "#111", lineHeight: 1.05, margin: "0 0 1rem", maxWidth: 560 }}>
                {report.title}
              </h1>

              {/* Quick stats row */}
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                <StatPill icon="📋" label={`${technicalQuestions.length} technical`} />
                <StatPill icon="💬" label={`${behavioralQuestions.length} behavioral`} />
                <StatPill icon="⚠️" label={`${skillGaps?.length ?? 0} skill gaps`} />
                <StatPill icon="📅" label={`${preparationPlan?.length ?? 0}-day plan`} />
              </div>

              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, maxWidth: 480, margin: 0 }}>
                Choose a section below to start your prep. Your ATS-optimized resume is ready to generate whenever you need it.
              </p>
            </div>

            <ScoreArc score={score} />
          </div>
        </div>

        {/* ATS Banner */}
        <div style={{ background: "#fafaf9", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "1.25rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", marginBottom: "0.75rem" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M4 2h6l4 4v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" strokeLinecap="round" />
                <path d="M10 2v4h4M5 9h6M5 12h4" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 2 }}>ATS-friendly resume</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Tailored to this job description with keywords that pass ATS filters.</div>
            </div>
          </div>
          <ATSResumeButton reportId={reportId} />
        </div>

        {/* Skill Gaps */}
        {(skillGaps?.length ?? 0) > 0 && (
          <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "1.25rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#dc2626" strokeWidth="1.5">
                <path d="M8 3v5M8 11v1" strokeLinecap="round" />
                <circle cx="8" cy="8" r="6" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#111" }}>Skill gaps to address</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af" }}>{skillGaps?.length} identified</span>
            </div>

            {[
              { items: highGaps, label: "High priority" },
              { items: medGaps, label: "Medium priority" },
              { items: lowGaps, label: "Low priority" },
            ].filter(g => g.items.length > 0).map(({ items, label }) => (
              <div key={label} style={{ marginBottom: "0.75rem" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.4rem" }}>{label}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {items.map((gap, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "5px 10px" }}>
                      <span style={{ fontSize: 12, color: "#111", fontWeight: 500 }}>{gap.skill}</span>
                      <SeverityBar severity={gap.severity} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section Tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
          <SectionTile
            href={`/reports/${reportId}/technical`}
            title="Technical questions"
            count={`${technicalQuestions.length} questions`}
            description="Role-specific technical prompts with answer guides and interviewer intent."
            accent="#2563eb"
          />
          <SectionTile
            href={`/reports/${reportId}/behavioral`}
            title="Behavioral questions"
            count={`${behavioralQuestions.length} questions`}
            description="STAR-method practice for ownership, teamwork, adaptability, and judgment."
            accent="#d97706"
          />
          <SectionTile
            href={`/reports/${reportId}/preparation`}
            title="Preparation plan"
            count={`${preparationPlan?.length ?? 0} days`}
            description="A focused plan for studying, practicing, and closing role-specific gaps."
            accent="#7c3aed"
          />
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');
      `}</style>
    </PageLayout>
  )
}

function StatPill({ icon, label }: { icon: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#f3f4f6", borderRadius: 100, padding: "4px 12px", fontSize: 11, color: "#374151", fontWeight: 500, border: "1px solid #e5e7eb" }}>
      <span style={{ fontSize: 11 }}>{icon}</span>
      {label}
    </span>
  )
}
