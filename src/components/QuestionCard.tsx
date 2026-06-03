interface QuestionCardProps {
  index: number
  question: string
  intention: string
  answer: string
  variant?: "technical" | "behavioral"
}

export default function QuestionCard({ index, question, intention, answer, variant = "technical" }: QuestionCardProps) {
  const fallbackIntention = variant === "behavioral"
    ? "The interviewer wants evidence of judgment, ownership, communication, and how you work under real constraints."
    : "The interviewer wants to see whether you can explain the underlying concept and apply it to the role's day-to-day work."

  const fallbackAnswer = variant === "behavioral"
    ? "Use the STAR method: set up a specific Situation, explain your Task, describe the Actions you personally took, and finish with a measurable Result. Keep the example tied to this role's responsibilities and mention what you learned or would repeat."
    : "Answer with a short definition, then walk through a practical example from a project. Mention the tradeoffs, tools, failure modes, and how you would validate the solution in production."

  return (
    <div className="group rounded-xl bg-white border border-[#e3dbcf] shadow-[0_12px_34px_rgba(38,31,22,0.055)] hover:border-[#c6bbab] transition-colors overflow-hidden">
      <div className="flex items-start gap-3 border-b border-[#eee7dc] bg-white"
        style={{ padding: "1rem" }}
      >
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[12px] font-semibold flex-shrink-0 ${
          variant === "behavioral"
            ? "bg-[#fff6e4] border-[#ead8af] text-[#805600]"
            : "bg-[#eef8f4] border-[#cfe7dc] text-[#173d33]"
        }`}>
          {index}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.08em] text-[#7b6d5b] font-semibold">
            {variant === "behavioral" ? "Behavioral question" : "Technical question"}
          </div>
          <p className="text-[15px] leading-6 font-semibold text-[#171717]" style={{ marginTop: "0.15rem" }}>
            {question}
          </p>
        </div>
      </div>
      <div className="grid gap-3 bg-[#fffefa] sm:grid-cols-2"
        style={{ padding: "1rem" }}
      >
        <div className="rounded-lg bg-[#faf7f1] border border-[#efe7da]"
          style={{ padding: "0.9rem" }}
        >
          <div className="text-[10px] text-[#8f826f] uppercase tracking-[0.06em] font-semibold"
            style={{ marginBottom: "0.35rem" }}
          >Why they ask</div>
          <p className="text-[12px] leading-5 text-[#62594d]">{intention || fallbackIntention}</p>
        </div>
        <div className="rounded-lg bg-[#f4fbf8] border border-[#dceee8]"
          style={{ padding: "0.9rem" }}
        >
          <div className="text-[10px] text-[#4d7c70] uppercase tracking-[0.06em] font-semibold"
            style={{ marginBottom: "0.35rem" }}
          >How to answer</div>
          <p className="text-[12px] leading-5 text-[#465d56]">{answer || fallbackAnswer}</p>
        </div>
      </div>
    </div>
  )
}
