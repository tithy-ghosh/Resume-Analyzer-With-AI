"use client"

import { useState } from "react"

interface QuestionAccordionProps {
  index: number
  question: string
  intention: string
  answer: string
}

export default function QuestionAccordion({ index, question, intention, answer }: QuestionAccordionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl bg-white border border-[#e3dbcf] shadow-[0_12px_34px_rgba(38,31,22,0.055)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="w-full text-left flex items-start gap-3 hover:bg-[#fbf8f2] transition-colors"
        style={{ padding: "1rem" }}
      >
        <div className="w-8 h-8 rounded-lg bg-[#eef8f4] border border-[#cfe7dc] text-[#173d33] flex items-center justify-center text-[12px] font-semibold flex-shrink-0">
          {index}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.08em] text-[#7b6d5b] font-semibold">
            Technical question
          </div>
          <h2 className="text-[15px] leading-6 font-semibold text-[#171717]" style={{ marginTop: "0.15rem" }}>
            {question}
          </h2>
        </div>
        <div
          className="w-8 h-8 rounded-lg border border-[#e3dbcf] bg-white flex items-center justify-center flex-shrink-0 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#5f564c" strokeWidth="1.7">
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="grid gap-3 border-t border-[#eee7dc] bg-[#fffefa] sm:grid-cols-2"
          style={{ padding: "1rem" }}
        >
          <div className="rounded-lg bg-[#faf7f1] border border-[#efe7da]"
            style={{ padding: "0.9rem" }}
          >
            <div className="text-[10px] uppercase tracking-[0.06em] text-[#8f826f] font-semibold">
              Why they ask
            </div>
            <p className="text-[12px] leading-5 text-[#62594d]" style={{ marginTop: "0.35rem" }}>
              {intention || "They want to see whether you can explain the concept and apply it to the responsibilities in this role."}
            </p>
          </div>
          <div className="rounded-lg bg-[#f4fbf8] border border-[#dceee8]"
            style={{ padding: "0.9rem" }}
          >
            <div className="text-[10px] uppercase tracking-[0.06em] text-[#4d7c70] font-semibold">
              How to answer
            </div>
            <p className="text-[12px] leading-5 text-[#465d56]" style={{ marginTop: "0.35rem" }}>
              {answer || "Start with the goal, explain your approach, mention tradeoffs, and describe how you would test or measure success."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
