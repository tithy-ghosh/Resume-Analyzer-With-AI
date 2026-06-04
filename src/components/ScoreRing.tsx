import styles from "./ScoreRing.module.css"

interface ScoreRingProps {
  score: number
  size?: "xs" | "sm" | "md" | "title" | "lg"
}

export default function ScoreRing({ score, size = "sm" }: ScoreRingProps) {
  const isXs = size === "xs"
  const isMd = size === "md"
  const isTitle = size === "title"
  const isLg = size === "lg"
  const r = isLg ? 30 : isTitle ? 26 : isMd ? 18 : isXs ? 7 : 15
  const dim = isLg ? 68 : isTitle ? 60 : isMd ? 44 : isXs ? 18 : 38
  const strokeWidth = isLg ? 4 : isTitle ? 4 : isMd ? 3 : isXs ? 2 : 3
  const circumference = 2 * Math.PI * r
  const dash = (score / 100) * circumference
  const labelSize = isLg ? styles.lg : isTitle ? styles.title : isMd ? styles.md : styles.sm
  const ringSize = isLg
    ? styles.ringLg
    : isTitle
      ? styles.ringTitle
      : isMd
        ? styles.ringMd
        : isXs
          ? styles.ringXs
          : styles.ringSm

  return (
    <div className={`${styles.ring} ${ringSize}`}>
      <svg viewBox={`0 0 ${dim} ${dim}`} className={styles.svg}>
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
        <div className={`${styles.label} ${labelSize}`}>
          {score}%
        </div>
      )}
    </div>
  )
}
