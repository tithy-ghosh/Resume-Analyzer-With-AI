"use client"

import { useState } from "react"
import styles from "./Question.module.css"

interface QuestionAccordionProps {
  index: number
  question: string
  intention: string
  answer: string
}

export default function QuestionAccordion({ index, question, intention, answer }: QuestionAccordionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.card}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={styles.trigger}
      >
        <div className={`${styles.number} ${styles.technicalNumber}`}>
          {index}
        </div>
        <div className={styles.questionMeta}>
          <div className={styles.eyebrow}>
            Technical question
          </div>
          <h2 className={styles.questionTitle}>
            {question}
          </h2>
        </div>
        <div className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#5f564c" strokeWidth="1.7">
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open && (
        <div className={`${styles.detailGrid} ${styles.accordionGrid}`}>
          <div className={`${styles.detailPanel} ${styles.intentPanel}`}>
            <div className={styles.panelTitle}>
              Why they ask
            </div>
            <p className={styles.panelCopy}>
              {intention || "They want to see whether you can explain the concept and apply it to the responsibilities in this role."}
            </p>
          </div>
          <div className={`${styles.detailPanel} ${styles.answerPanel}`}>
            <div className={styles.panelTitle}>
              How to answer
            </div>
            <p className={styles.panelCopy}>
              {answer || "Start with the goal, explain your approach, mention tradeoffs, and describe how you would test or measure success."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
