import Link from "next/link"
import styles from "./ReportDetailHeader.module.css"

interface ReportDetailHeaderProps {
  reportId: string
  eyebrow: string
  title: string
  description: string
  accent: string
}

const markerClassByAccent: Record<string, string> = {
  "#2563eb": styles.technicalMarker,
  "#d97706": styles.behavioralMarker,
  "#7c3aed": styles.preparationMarker,
}

export default function ReportDetailHeader({
  reportId,
  eyebrow,
  title,
  description,
  accent,
}: ReportDetailHeaderProps) {
  const markerClass = markerClassByAccent[accent] ?? ""

  return (
    <div className={styles.header}>
      <Link className={styles.backLink} href={`/reports/${reportId}`}>
        <span aria-hidden="true">&lt;</span>
        Back to overview
      </Link>
      <div className={styles.labelRow}>
        <div className={`${styles.marker} ${markerClass}`} />
        <span className={styles.eyebrow}>{eyebrow}</span>
      </div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <div className={styles.separator} />
    </div>
  )
}
