import { auth } from "../../../../auth"
import { redirect, notFound } from "next/navigation"
import dbConnect from "@/lib/db"
import InterviewReportModel from "@/models/InterviewReport"
import Link from "next/link"
import PageLayout from "@/components/PageLayout"
import ScoreRing from "@/components/ScoreRing"
import MatchBadge from "@/components/MatchBadge"
import QuestionCard from "@/components/QuestionCard"
import ATSResumeButton from "@/components/ATSResumeButton"

type ReportSection = "technical" | "behavioral" | "preparation"

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

  const matchedSignals = roleSignals
    .filter(([keyword]) => text.includes(keyword))
    .map(([, topic]) => topic)
  const defaultTopics = [
    "the core tools and responsibilities named in the job description",
    "system design choices for this role",
    "debugging and production readiness",
    "security, validation, and safe data handling",
    "testing strategy and edge-case coverage",
    "performance bottlenecks and monitoring",
    "API design and integration tradeoffs",
    "deployment, rollback, and release confidence",
    "maintainability and documentation",
    "collaboration with product, design, and engineering partners",
  ]

  if (type === "behavioral") {
    return [
      {
        question: "Tell me about a time you owned a difficult delivery from ambiguity to release.",
        intention: "They are testing ownership, prioritization, communication, and whether you can move work forward without perfect instructions.",
        answer: "Use STAR. Pick a role-relevant project, explain the unclear goal, name the tradeoffs you managed, describe how you aligned people, and end with a measurable result.",
      },
      {
        question: "Describe a time you had to learn a job-critical tool or domain quickly.",
        intention: "They want to know if you can close skill gaps fast when the job description expects unfamiliar responsibilities.",
        answer: "Choose an example where learning changed the outcome. Mention your learning plan, how you validated progress, and how the new skill improved delivery quality or speed.",
      },
      {
        question: "Give an example of handling disagreement during a technical or product decision.",
        intention: "They are checking collaboration, judgment, and whether you can disagree without slowing the team down.",
        answer: "Frame the disagreement, explain the evidence you brought, show how you listened, and close with the decision and result. Avoid blaming teammates.",
      },
      {
        question: "Tell me about a mistake or production issue you helped fix.",
        intention: "They are evaluating accountability, debugging habits, and whether you turn incidents into better systems.",
        answer: "Be direct about the issue, focus on your actions, explain the fix and prevention steps, and share the lesson you now apply to similar work.",
      },
      {
        question: "How do you prioritize when several urgent tasks compete for your attention?",
        intention: "They want evidence that you can protect business impact, communicate clearly, and make practical tradeoffs.",
        answer: "Describe how you compare impact, urgency, dependencies, and risk. Mention how you update stakeholders and what you do when priorities change.",
      },
      {
        question: "Tell me about a time you improved quality, reliability, or maintainability.",
        intention: "They are looking for practical standards, long-term thinking, and care for the team that inherits your work.",
        answer: "Use a concrete example. Explain the quality problem, your action, the measurable improvement, and how it helped teammates or users.",
      },
      {
        question: "Describe a time you worked with a teammate or stakeholder whose expectations changed.",
        intention: "They want to see adaptability, expectation management, and calm communication.",
        answer: "Explain what changed, how you clarified the new goal, what you renegotiated, and what result you delivered.",
      },
      {
        question: "What kind of feedback has most improved your work?",
        intention: "They are checking coachability, self-awareness, and whether you can convert feedback into better execution.",
        answer: "Name the feedback, explain why it mattered, describe the behavior you changed, and share the visible improvement afterward.",
      },
    ]
  }

  return [...matchedSignals, ...defaultTopics].slice(0, 10).map((topic) => ({
    question: `How would you approach ${topic} in this role?`,
    intention: "They are checking whether you can connect the job description to practical implementation decisions.",
    answer: "Start with the goal and constraints, describe the design or workflow you would choose, mention tradeoffs, and explain how you would test or measure success.",
  }))
}

function withMinimumQuestions(
  questions: InterviewQuestion[] | undefined,
  jobDescription: string | undefined,
  type: "technical" | "behavioral",
  minimum: number
) {
  const existing = (questions ?? []).filter((q) => q.question)
  const fallback = buildFallbackQuestions(jobDescription, type)
  const seen = new Set(existing.map((q) => q.question?.toLowerCase()))
  const additions = fallback.filter((q) => !seen.has(q.question?.toLowerCase()))

  return [...existing, ...additions].slice(0, Math.max(minimum, existing.length))
}

function SectionTile({
  href,
  title,
  count,
  description,
  tone,
}: {
  href: string
  title: string
  count: string
  description: string
  tone: "green" | "amber" | "blue"
}) {
  const tones = {
    green: {
      bg: "#eef8f4",
      border: "#cfe7dc",
      icon: "#173d33",
    },
    amber: {
      bg: "#fff6e4",
      border: "#ead8af",
      icon: "#805600",
    },
    blue: {
      bg: "#eef5ff",
      border: "#ccdcf5",
      icon: "#244f86",
    },
  }[tone]

  return (
    <Link
      href={href}
      className="group rounded-xl bg-white border border-[#e3dbcf] shadow-[0_18px_48px_rgba(38,31,22,0.07)] hover:shadow-[0_24px_60px_rgba(38,31,22,0.11)] transition-all"
      style={{ padding: "1rem" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className="h-12 w-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: tones.bg, border: `1px solid ${tones.border}` }}
        >
          <svg width="21" height="21" viewBox="0 0 16 16" fill="none" stroke={tones.icon} strokeWidth="1.6">
            <path d="M3 3h10M3 7h10M3 11h6" strokeLinecap="round" />
          </svg>
        </div>
        <div className="text-[11px] font-semibold text-[#6f6252]">{count}</div>
      </div>
      <h2 className="text-[21px] font-semibold text-[#171717]" style={{ marginTop: "1.2rem" }}>
        {title}
      </h2>
      <p className="text-[12px] leading-5 text-[#6f6252]" style={{ marginTop: "0.5rem" }}>
        {description}
      </p>
      <div className="flex items-center gap-2 text-[12px] font-semibold text-[#173d33]"
        style={{ marginTop: "1.2rem" }}
      >
        Open section
        <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
      </div>
    </Link>
  )
}

function DetailHeader({
  reportId,
  title,
  eyebrow,
  description,
}: {
  reportId: string
  title: string
  eyebrow: string
  description: string
}) {
  return (
    <div className="rounded-xl bg-white border border-[#e3dbcf] shadow-[0_18px_48px_rgba(38,31,22,0.07)]"
      style={{ padding: "1.2rem", marginBottom: "1.25rem" }}
    >
      <Link href={`/reports/${reportId}`} className="text-[11px] text-[#7b6d5b] hover:text-[#171717] transition-colors">
        Back to report overview
      </Link>
      <div className="text-[10px] uppercase tracking-[0.08em] text-[#173d33] font-semibold" style={{ marginTop: "1rem" }}>
        {eyebrow}
      </div>
      <h1 className="font-[Instrument_Serif] text-[36px] leading-tight text-[#171717]">{title}</h1>
      <p className="max-w-2xl text-[13px] leading-6 text-[#6f6252]" style={{ marginTop: "0.5rem" }}>
        {description}
      </p>
    </div>
  )
}

export default async function ReportPage({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = await params
  const [reportId, section] = id

  if (!reportId) notFound()
  if (section && !["technical", "behavioral", "preparation"].includes(section)) notFound()

  const session = await auth()
  if (!session) redirect("/login")

  await dbConnect()
  const report = await InterviewReportModel.findOne({
    _id: reportId,
    user: session.user.id,
  }).lean()

  if (!report) notFound()

  const score = report.matchScore ?? 0
  const date = new Date(report.createdAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  })
  const technicalQuestions = withMinimumQuestions(report.technicalQuestions, report.jobDescription, "technical", 10)
  const behavioralQuestions = withMinimumQuestions(report.behavioralQuestions, report.jobDescription, "behavioral", 8)
  const preparationPlan = report.preparationPlan as PreparationDay[] | undefined

  if (section === "technical") {
    return (
      <PageLayout active="reports">
        <div className="max-w-5xl mx-auto">
          <DetailHeader
            reportId={reportId}
            eyebrow="Technical interview"
            title="Technical questions"
            description="Practice the technical questions likely to come from this job description. Each card includes what the interviewer is testing and how to structure your answer."
          />
          <div className="grid gap-3">
            {technicalQuestions.map((q, i) => (
              <QuestionCard
                key={i}
                index={i + 1}
                question={q.question ?? ""}
                intention={q.intention ?? ""}
                answer={q.answer ?? ""}
                variant="technical"
              />
            ))}
          </div>
        </div>
      </PageLayout>
    )
  }

  if (section === "behavioral") {
    return (
      <PageLayout active="reports">
        <div className="max-w-5xl mx-auto">
          <DetailHeader
            reportId={reportId}
            eyebrow="Behavioral interview"
            title="Behavioral questions"
            description="Prepare strong story-based answers with the STAR method. Focus on ownership, collaboration, adaptability, communication, and measurable results."
          />
          <div className="grid gap-3">
            {behavioralQuestions.map((q, i) => (
              <QuestionCard
                key={i}
                index={i + 1}
                question={q.question ?? ""}
                intention={q.intention ?? ""}
                answer={q.answer ?? ""}
                variant="behavioral"
              />
            ))}
          </div>
        </div>
      </PageLayout>
    )
  }

  if (section === "preparation") {
    return (
      <PageLayout active="reports">
        <div className="max-w-5xl mx-auto">
          <DetailHeader
            reportId={reportId}
            eyebrow="Preparation plan"
            title="Preparation plan"
            description="Follow this focused plan to close gaps, rehearse answers, and prepare examples before the interview."
          />
          <div className="grid gap-3">
            {preparationPlan?.map((day) => (
              <div
                key={day.day}
                className="rounded-xl bg-white border border-[#e3dbcf] shadow-[0_12px_34px_rgba(38,31,22,0.055)]"
                style={{ padding: "1rem" }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#173d33] text-white flex items-center justify-center text-[12px] font-semibold flex-shrink-0">
                    {day.day}
                  </div>
                  <div>
                    <h2 className="text-[16px] font-semibold text-[#171717]">{day.focus}</h2>
                    <ul className="grid gap-2" style={{ marginTop: "0.75rem" }}>
                      {day.tasks?.map((task, i) => (
                        <li key={i} className="text-[13px] leading-5 text-[#655b50] flex items-start gap-2">
                          <span className="text-[#173d33] font-semibold">-</span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout active="reports">
      <div className="max-w-6xl mx-auto">
        <div
          className="rounded-2xl bg-white border border-[#e3dbcf] shadow-[0_24px_70px_rgba(38,31,22,0.08)]"
          style={{ padding: "1.25rem", marginBottom: "1.25rem" }}
        >
          <div className="flex flex-col gap-5">
            <div>
              <div className="max-w-4xl">
                <Link href="/dashboard" className="text-[11px] text-[#7b6d5b] hover:text-[#171717] transition-colors">
                  Back to dashboard
                </Link>
                <div className="text-[10px] uppercase tracking-[0.08em] text-[#173d33] font-semibold leading-none" style={{ marginTop: "1rem" }}>
                  Interview report
                </div>
                <div className="flex items-start justify-between gap-5" style={{ marginTop: "-0.1rem" }}>
                  <h1 className="font-[Instrument_Serif] text-[42px] text-[#171717]"
                    style={{ lineHeight: "0.95" }}
                  >
                    {report.title}
                  </h1>
                  <div
                    className="flex flex-col items-center justify-center flex-shrink-0"
                    style={{ minWidth: "78px" }}
                  >
                    <div className="text-[9px] uppercase tracking-[0.08em] text-[#7b6d5b] font-semibold leading-none"
                      style={{ marginBottom: "0.35rem" }}
                    >
                      Match
                    </div>
                    <ScoreRing score={score} size="title" />
                    <div style={{ marginTop: "0.35rem" }}>
                      <MatchBadge score={score} />
                    </div>
                  </div>
                </div>
                <p className="text-[13px] text-[#6f6252]" style={{ marginTop: "0.55rem" }}>
                  Generated {date}. Choose a section below to prepare in a focused workspace.
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl bg-[#f8f4ec] border border-[#ded4c3]"
            style={{ padding: "1rem", marginTop: "1.25rem" }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.08em] text-[#6f6252] font-semibold">ATS resume</div>
                <p className="text-[13px] leading-5 text-[#171717]" style={{ marginTop: "0.35rem" }}>
                  Generate the ATS-friendly resume from this report before interview practice.
                </p>
              </div>
              <div className="lg:w-[430px]">
                <ATSResumeButton reportId={reportId} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SectionTile
            href={`/reports/${reportId}/technical`}
            title="Technical questions"
            count={`${technicalQuestions.length} questions`}
            description="Role-specific technical prompts with answer direction and interviewer intent."
            tone="green"
          />
          <SectionTile
            href={`/reports/${reportId}/behavioral`}
            title="Behavioral questions"
            count={`${behavioralQuestions.length} questions`}
            description="STAR-method practice for ownership, teamwork, adaptability, and judgment."
            tone="amber"
          />
          <SectionTile
            href={`/reports/${reportId}/preparation`}
            title="Preparation plan"
            count={`${preparationPlan?.length ?? 0} days`}
            description="A focused plan for studying, practicing, and closing role-specific gaps."
            tone="blue"
          />
        </div>
      </div>
    </PageLayout>
  )
}
