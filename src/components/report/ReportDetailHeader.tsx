import Link from "next/link"

interface ReportDetailHeaderProps {
  reportId: string
  eyebrow: string
  title: string
  description: string
  accent: string
}

export default function ReportDetailHeader({ reportId, eyebrow, title, description, accent }: ReportDetailHeaderProps) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <Link href={`/reports/${reportId}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280", textDecoration: "none", marginBottom: "1.25rem" }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 3L5 8l5 5" />
        </svg>
        Back to overview
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.5rem" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>{eyebrow}</span>
      </div>
      <h1 style={{ fontFamily: "'DM Serif Display', 'Georgia', serif", fontSize: 36, fontWeight: 400, color: "#111", lineHeight: 1.1, margin: "0 0 0.6rem" }}>{title}</h1>
      <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, maxWidth: 560, margin: 0 }}>{description}</p>
      <div style={{ height: 1, background: "#f3f4f6", margin: "1.25rem 0 0" }} />
    </div>
  )
}
