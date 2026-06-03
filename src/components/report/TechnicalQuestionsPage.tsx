import PageLayout from "@/components/PageLayout"
import QuestionAccordion from "@/components/QuestionAccordion"
import ReportDetailHeader from "./ReportDetailHeader"

type InterviewQuestion = {
  question?: string
  intention?: string
  answer?: string
}

interface TechnicalQuestionsPageProps {
  reportId: string
  questions: InterviewQuestion[]
}

export default function TechnicalQuestionsPage({ reportId, questions }: TechnicalQuestionsPageProps) {
  return (
    <PageLayout active="reports">
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <ReportDetailHeader
          reportId={reportId}
          eyebrow="Technical interview"
          title="Technical questions"
          description="Click a question to reveal what the interviewer is testing and how to structure a strong answer."
          accent="#2563eb"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {questions.map((q, i) => (
            <QuestionAccordion
              key={i}
              index={i + 1}
              question={q.question ?? ""}
              intention={q.intention ?? ""}
              answer={q.answer ?? ""}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
