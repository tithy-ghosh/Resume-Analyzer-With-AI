import { auth } from "../../../../auth"
import { redirect, notFound } from "next/navigation"
import dbConnect from "@/lib/db"
import InterviewReportModel from "@/models/InterviewReport"
import Link from "next/link"
import PageLayout from "@/components/PageLayout"
import ScoreRing from "@/components/ScoreRing"
import MatchBadge from "@/components/MatchBadge"
import SectionTitle from "@/components/SectionTitle"
import QuestionCard from "@/components/QuestionCard"

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await auth()
  if (!session) redirect("/login")

  await dbConnect()
  const report = await InterviewReportModel.findOne({
    _id: id,
    user: session.user.id,
  }).lean()

  if (!report) notFound()

  const score = report.matchScore ?? 0
  const date = new Date(report.createdAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  })

  return (
    <PageLayout active="reports">

      {/* Header */}
      <div className="flex items-start justify-between "
      style={{"marginBottom": "1.5rem"}}
      >
        <div>
          <Link
            href="/dashboard"
            className="text-[11px] text-[#bbb] hover:text-[#1a1a1a] transition-colors  inline-block"
            style={{"marginBottom": "0.5rem"}}
          >
            ← Back to dashboard
          </Link>
          <h1 className="font-[Instrument_Serif] text-[26px] text-[#1a1a1a]">
            {report.title}
          </h1>
          <p className="text-[11px] text-[#bbb]"
          style={{"marginTop": "0.25rem"}}
          >{date}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <ScoreRing score={score} size="md" />
          <MatchBadge score={score} />
        </div>
      </div>

      <div className="flex flex-col gap-6 max-w-3xl">

        {/* Technical Questions */}
        <div>
          <SectionTitle>Technical questions</SectionTitle>
          <div className="flex flex-col gap-2">
            {report.technicalQuestions?.map((q, i) => (
              <QuestionCard
                key={i}
                index={i + 1}
                question={q.question ?? ""}
                intention={q.intention ?? ""}
                answer={q.answer ?? ""}
              />
            ))}
          </div>
        </div>

        {/* Behavioral Questions */}
        <div>
          <SectionTitle>Behavioral questions</SectionTitle>
          <div className="flex flex-col gap-2">
            {report.behavioralQuestions?.map((q, i) => (
              <QuestionCard
                key={i}
                index={i + 1}
                question={q.question ?? ""}
                intention={q.intention ?? ""}
                answer={q.answer ?? ""}
              />
            ))}
          </div>
        </div>

        {/* Skill Gaps */}
        <div>
          <SectionTitle>Skill gaps to bridge</SectionTitle>
          <div className="flex flex-col gap-2">
            {report.skillGaps?.map((s, i) => (
              <div
                key={i}
                className="bg-white border border-[#e8e6e1] rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ 
            "paddingInline":"1rem",
            "paddingBlock": "0.75rem",
            
          }}
              >
                <span className="text-sm text-[#1a1a1a]">{s.skill}</span>
                <span className={`text-[9px] font-medium px-2 py-1 rounded ${
                  s.severity === "high" ? "bg-red-50 text-red-800" :
                  s.severity === "medium" ? "bg-yellow-50 text-yellow-800" :
                  "bg-green-50 text-green-800"
                }`}
                style={{ 
            "paddingInline":"0.5rem",
            "paddingBlock": "0.25rem",
           
          }}
                >
                  {s.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Preparation Plan */}
        <div>
          <SectionTitle>7-day preparation plan</SectionTitle>
          <div className="flex flex-col gap-2">
            {report.preparationPlan?.map((day) => (
              <div
                key={day.day}
                className="bg-white border border-[#e8e6e1] rounded-xl"
                style={{ 
            "paddingInline":"1rem",
            "paddingBlock": "0.75rem",
            
          }}
              >
                <div className="flex items-center gap-3"
                style={{"marginBottom": "0.5rem"}}
                >
                  <div className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                    {day.day}
                  </div>
                  <span className="text-sm font-medium text-[#1a1a1a]">{day.focus}</span>
                </div>
                <ul className="flex flex-col gap-1 pl-9"
                style={{"paddingLeft": "2.25rem"}}
                >
                  {day.tasks?.map((task, i) => (
                    <li key={i} className="text-[11px] text-[#888] flex items-start gap-2">
                      <span className="text-[#ccc] mt-[2px]"
                      
                      style={{"marginTop": "2px"}}>·</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageLayout>
  )
}