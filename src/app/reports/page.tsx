import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/db"
import InterviewReportModel from "@/models/InterviewReport"
import Link from "next/link"
import PageLayout from "@/components/PageLayout"
import ScoreRing from "@/components/ScoreRing"
import MatchBadge from "@/components/MatchBadge"
import SectionTitle from "@/components/SectionTitle"

export default async function ReportsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  await dbConnect()

  const reports = await InterviewReportModel.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .select("-resume -selfDescription -jobDescription -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")
    .lean()

  return (
    <PageLayout active="reports" username={session.user.username}>

      <div className="flex items-start justify-between"
      style={{"marginBottom": "1.5rem"}}
      >
        <div>
          <h1 className="font-[Instrument_Serif] text-[28px] text-[#1a1a1a] leading-tight">
            My <em className="italic text-[#999]">reports.</em>
          </h1>
          <p className="text-[11px] text-[#bbb]"
          style={{"marginTop": "0.25rem"}}
          >{reports.length} total analyses</p>
        </div>
        <Link
          href="/analyze"
          className="bg-[#1a1a1a] text-white rounded-[9px]  text-[11px] font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ 
            "paddingInline":"1rem",
            "paddingBlock": "0.25rem",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          New Analysis
        </Link>
      </div>

      <SectionTitle>All reports</SectionTitle>

      {reports.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e4e1db] rounded-xl text-center"
        style={{"padding": "2.5rem"}}
        >
          <p className="text-[#bbb] text-sm"
          style={{"marginBottom": "2rem"}}
          >No analyses yet</p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white text-xs font-medium  rounded-lg hover:opacity-90 transition-opacity"

            style={{ 
            "paddingInline":"1rem",
            "paddingBlock": "0.5rem",
            
          }}
          >
            Upload your first resume 
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {reports.map((report) => (
            <Link
              key={report._id.toString()}
              href={`/reports/${report._id}`}
              className="bg-white border border-[#e8e6e1] rounded-xl flex items-center gap-4 hover:border-[#1a1a1a] transition-colors group"
              style={{ 
            "paddingInline":"1rem",
            "paddingBlock": "0.75rem",
            
          }}
            >
              <ScoreRing score={report.matchScore ?? 0} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#1a1a1a] truncate">{report.title}</div>
                <div className="text-[11px] text-[#bbb] "
                style={{"marginTop": "2px"}}
                >
                  {new Date(report.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric"
                  })}
                </div>
              </div>
              <MatchBadge score={report.matchScore ?? 0} />
              <span className="text-[#ccc] text-lg group-hover:text-[#1a1a1a] transition-colors">›</span>
            </Link>
          ))}
        </div>
      )}

    </PageLayout>
  )
}