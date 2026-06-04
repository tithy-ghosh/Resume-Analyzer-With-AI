import Link from "next/link"
import type { PreparationDay } from "@/services/reportDetailService"
import styles from "./ReportSectionPage.module.css"

interface PreparationPlanPageProps {
  reportId: string
  plan?: PreparationDay[]
  preparationPlan?: PreparationDay[]
}

function DayCard({ day, index }: { day: PreparationDay; index: number }) {
  const dayNumber = day.day ?? index + 1
  const tasks = day.tasks?.filter(Boolean) ?? []

  return (
    <div className={styles.dayCard}>
      <div className={styles.dayNumber}>{dayNumber}</div>
      <div className={styles.dayContent}>
        <h2 className={styles.dayTitle}>{day.focus || `Day ${dayNumber} preparation`}</h2>

        {tasks.length > 0 ? (
          <ul className={styles.taskList}>
            {tasks.map((task, taskIndex) => (
              <li className={styles.taskItem} key={`${task}-${taskIndex}`}>
                <span className={styles.taskMarker}>-</span>
                <span>{task}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.fallbackCopy}>
            Review the job requirements, rehearse core examples, and note one concrete improvement
            for tomorrow.
          </p>
        )}
      </div>
    </div>
  )
}

export default function PreparationPlanPage({
  reportId,
  plan,
  preparationPlan,
}: PreparationPlanPageProps) {
  const days = plan ?? preparationPlan ?? []

  return (
    <main className={styles.pageShell}>
      <Link className={styles.backLink} href={`/reports/${reportId}`}>
        <span aria-hidden="true">&lt;</span>
        Back to overview
      </Link>

      <header className={styles.header}>
        <div className={styles.sectionLabel}>
          <div className={`${styles.marker} ${styles.preparationMarker}`} />
          <span className={styles.eyebrow}>Preparation plan</span>
        </div>
        <h1 className={styles.title}>
          Prep <em className={styles.titleEmphasis}>plan.</em>
        </h1>
        <p className={styles.intro}>
          A day-by-day roadmap for study, practice, and interview readiness.
        </p>
        <div className={styles.separator} />
      </header>

      <div className={styles.countRow}>
        <span className={styles.count}>{days.length} days</span>
      </div>

      {days.length > 0 ? (
        <div className={styles.dayList}>
          {days.map((day, index) => (
            <DayCard day={day} index={index} key={`${day.day ?? index}-${day.focus ?? "prep"}`} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyPlan}>
          <p className={styles.fallbackCopy}>No preparation plan was generated for this report.</p>
        </div>
      )}
    </main>
  )
}
