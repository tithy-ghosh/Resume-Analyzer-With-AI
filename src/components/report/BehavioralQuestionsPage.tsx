import PageLayout from "@/components/PageLayout"
import QuestionCard from "@/components/QuestionCard"
import ReportDetailHeader from "./ReportDetailHeader"

type InterviewQuestion = {
  question?: string
  intention?: string
  answer?: string
}

interface BehavioralQuestionsPageProps {
  reportId: string
  questions: InterviewQuestion[]
}

export default function BehavioralQuestionsPage({ reportId, questions }: BehavioralQuestionsPageProps) {
  return (
    <PageLayout active="reports">
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <ReportDetailHeader
          reportId={reportId}
          eyebrow="Behavioral interview"
          title="Behavioral questions"
          description="Prepare strong story-based answers with the STAR method. Focus on ownership, collaboration, adaptability, communication, and measurable results."
          accent="#d97706"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {questions.map((q, i) => (
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
