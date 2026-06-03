interface QuestionCardProps {
  index: number
  question: string
  intention: string
  answer: string
}

export default function QuestionCard({ index, question, intention, answer }: QuestionCardProps) {
  return (
    <div className="bg-white border border-[#e8e6e1] rounded-xl px-4 py-4"
    style={{ 
        "paddingInline":"1rem",
        "paddingBlock": "1rem",
      }}
    >
      <div className="flex items-start gap-3 mb-3"
      style={{"marginBottom": "1.75rem"}}
      >
        <div className="w-5 h-5 rounded-full bg-[#f0ede8] flex items-center justify-center text-[9px] font-medium text-[#888] flex-shrink-0"
        style={{"marginTop": "2px"}}
        >
          {index}
        </div>
        <p className="text-sm font-medium text-[#1a1a1a]">{question}</p>
      </div>
      <div className=" flex flex-col gap-2"
      style={{"paddingLeft": "2rem"}}
      >
        <div>
          <div className="text-[9px] text-[#bbb] uppercase tracking-[0.06em]"
          style={{"marginBottom": "0.25rem"}}
          >Why they ask</div>
          <p className="text-[12px] text-[#888]">{intention}</p>
        </div>
        <div>
          <div className="text-[9px] text-[#bbb] uppercase tracking-[0.06em]"
          style={{"marginBottom": "0.25rem"}}
          >How to answer</div>
          <p className="text-[12px] text-[#666]">{answer}</p>
        </div>
      </div>
    </div>
  )
}