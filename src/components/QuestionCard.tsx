import styles from "./Question.module.css"

interface QuestionCardProps {
  index: number
  question: string
  intention: string
  answer: string
  variant?: "technical" | "behavioral"
}

export default function QuestionCard({ index, question, intention, answer, variant = "technical" }: QuestionCardProps) {
  const fallbackIntention = variant === "behavioral"
    ? "The interviewer wants evidence of judgment, ownership, communication, and how you work under real constraints."
    : "The interviewer wants to see whether you can explain the underlying concept and apply it to the role's day-to-day work."

  const fallbackAnswer = variant === "behavioral"
    ? "Use the STAR method: set up a specific Situation, explain your Task, describe the Actions you personally took, and finish with a measurable Result. Keep the example tied to this role's responsibilities and mention what you learned or would repeat."
    : "Answer with a short definition, then walk through a practical example from a project. Mention the tradeoffs, tools, failure modes, and how you would validate the solution in production."

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={`${styles.number} ${variant === "behavioral" ? styles.behavioralNumber : styles.technicalNumber}`}>
          {index}
        </div>
        <div className={styles.questionMeta}>
          <div className={styles.eyebrow}>
            {variant === "behavioral" ? "Behavioral question" : "Technical question"}
          </div>
          <p className={styles.questionTitle}>
            {question}
          </p>
        </div>
      </div>
      <div className={styles.detailGrid}>
        <div className={`${styles.detailPanel} ${styles.intentPanel}`}>
          <div className={styles.panelTitle}>Why they ask</div>
          <p className={styles.panelCopy}>{intention || fallbackIntention}</p>
        </div>
        <div className={`${styles.detailPanel} ${styles.answerPanel}`}>
          <div className={styles.panelTitle}>How to answer</div>
          <p className={styles.panelCopy}>{answer || fallbackAnswer}</p>
        </div>
      </div>
    </div>
  )
}
