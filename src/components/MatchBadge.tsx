import styles from "./MatchBadge.module.css"

interface MatchBadgeProps {
  score: number
}

export default function MatchBadge({ score }: MatchBadgeProps) {
  const badge =
    score >= 75
      ? { label: "High match", className: styles.high }
      : score >= 50
      ? { label: "Medium match", className: styles.medium }
      : { label: "Low match", className: styles.low }

  return (
    <span className={`${styles.badge} ${badge.className}`}>
      {badge.label}
    </span>
  )
}
