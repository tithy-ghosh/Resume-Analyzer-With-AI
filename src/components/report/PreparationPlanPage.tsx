import PageLayout from "@/components/PageLayout"
import ReportDetailHeader from "./ReportDetailHeader"

type PreparationDay = {
  day?: number
  focus?: string
  tasks?: string[]
}

interface PreparationPlanPageProps {
  reportId: string
  preparationPlan?: PreparationDay[]
}

export default function PreparationPlanPage({ reportId, preparationPlan }: PreparationPlanPageProps) {
  return (
    <PageLayout active="reports">
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <ReportDetailHeader
          reportId={reportId}
          eyebrow="Preparation plan"
          title="7-day prep plan"
          description="Follow this focused plan to close gaps, rehearse answers, and prepare examples before the interview."
          accent="#7c3aed"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {preparationPlan?.map((day) => (
            <div key={day.day} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "1.1rem 1.25rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color: "#fff" }}>
                {day.day}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111", margin: "0 0 0.75rem", lineHeight: 1.4 }}>{day.focus}</h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {day.tasks?.map((task, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6, display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: "#7c3aed", fontWeight: 700, fontSize: 14, lineHeight: 1.5, flexShrink: 0 }}>-</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
