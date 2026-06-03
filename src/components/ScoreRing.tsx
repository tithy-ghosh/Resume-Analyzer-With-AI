interface ScoreRingProps {
  score: number
  size?: "sm" | "lg"
}

export default function ScoreRing({ score, size = "sm" }: ScoreRingProps) {
  const isLg = size === "lg"
  const r = isLg ? 30 : 15
  const dim = isLg ? 68 : 38
  const strokeWidth = isLg ? 4 : 3
  const circumference = 2 * Math.PI * r
  const dash = (score / 100) * circumference

  return (
    <div className={`relative flex-shrink-0 ${isLg ? "w-16 h-16" : "w-10 h-10"}`}>
      <svg viewBox={`0 0 ${dim} ${dim}`} className="w-full h-full">
        <circle
          cx={dim / 2} cy={dim / 2} r={r}
          fill="none" stroke="#f0ede8" strokeWidth={strokeWidth}
        />
        <circle
          cx={dim / 2} cy={dim / 2} r={r}
          fill="none" stroke="#1a1a1a" strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center font-medium text-[#1a1a1a] ${isLg ? "text-sm" : "text-[9px]"}`}>
        {score}%
      </div>
    </div>
  )
}