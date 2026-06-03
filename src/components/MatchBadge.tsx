interface MatchBadgeProps {
  score: number
}

export default function MatchBadge({ score }: MatchBadgeProps) {
  const badge =
    score >= 75
      ? { label: "High match", className: "bg-green-50 text-green-800" }
      : score >= 50
      ? { label: "Medium match", className: "bg-yellow-50 text-yellow-800" }
      : { label: "Low match", className: "bg-red-50 text-red-800" }

  return (
    <span className={`text-[9px] font-medium px-2 py-1 rounded ${badge.className}`}
    style={{ 
        "paddingInline":"0.5rem",
        "paddingBlock": "0.25rem",
      }}
    >
      {badge.label}
    </span>
  )
}