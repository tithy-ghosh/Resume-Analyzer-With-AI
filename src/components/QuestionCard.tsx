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
    <div className="group bg-[#fffefa] border border-[#e4dfd6] rounded-lg shadow-[0_10px_28px_rgba(31,27,20,0.045)] hover:border-[#c6bbab] transition-colors overflow-hidden">
      <div className="flex items-start gap-3 border-b border-[#f0ede8]"
        style={{ paddingInline: "1rem", paddingBlock: "1rem" }}
      >
        <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-semibold flex-shrink-0 ${
          variant === "behavioral"
            ? "bg-[#fff4dc] text-[#8a5a00]"
            : "bg-[#e9f4f1] text-[#17624f]"
        }`}>
          {index}
        </div>
        <p className="text-[14px] leading-6 font-semibold text-[#171717]">{question}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2"
        style={{ paddingInline: "1rem", paddingBlock: "1rem" }}
      >
        <div className="rounded-md bg-[#faf7f1] border border-[#efe7da]"
          style={{ padding: "0.85rem" }}
        >
          <div className="text-[10px] text-[#8f826f] uppercase tracking-[0.06em] font-semibold"
            style={{ marginBottom: "0.35rem" }}
          >Why they ask</div>
          <p className="text-[12px] leading-5 text-[#62594d]">{intention || fallbackIntention}</p>
        </div>
        <div className="rounded-md bg-[#f4fbf8] border border-[#dceee8]"
          style={{ padding: "0.85rem" }}
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
