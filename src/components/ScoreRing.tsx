interface ScoreRingProps {
  score: number
  size?: "xs" | "sm" | "md" | "title" | "lg"
}

export default function ScoreRing({ score, size = "sm" }: ScoreRingProps) {
  const isXs = size === "xs"
  const isMd = size === "md"
  const isTitle = size === "title"
  const isLg = size === "lg"
  const visualSize = isLg ? 64 : isTitle ? 60 : isMd ? 44 : isXs ? 18 : 40
  const r = isLg ? 30 : isTitle ? 26 : isMd ? 18 : isXs ? 7 : 15
  const dim = isLg ? 68 : isTitle ? 60 : isMd ? 44 : isXs ? 18 : 38
  const strokeWidth = isLg ? 4 : isTitle ? 4 : isMd ? 3 : isXs ? 2 : 3
  const circumference = 2 * Math.PI * r
  const dash = (score / 100) * circumference

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: `${visualSize}px`, height: `${visualSize}px` }}
    >
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
      {!isXs && (
        <div className={`absolute inset-0 flex items-center justify-center font-medium text-[#1a1a1a] ${isLg ? "text-sm" : isTitle ? "text-[13px]" : isMd ? "text-[10px]" : "text-[9px]"}`}>
          {score}%
        </div>
      )}
    </div>
  )
}
