"use client"

import Link from "next/link"
import { useQuestionDisclosure } from "@/hooks/useQuestionDisclosure"
import type { InterviewQuestion } from "@/services/reportDetailService"
import styles from "./ReportSectionPage.module.css"

interface TechnicalQuestionsPageProps {
  reportId: string
  questions: InterviewQuestion[]
  jobDescription?: string
}

function QuestionRow({
  index,
  question,
  intention,
  answer,
}: {
  index: number
  question: string
  intention: string
  answer: string
}) {
  const { open, toggle } = useQuestionDisclosure()

  return (
    <div className={`${styles.questionCard} ${open ? styles.questionCardOpen : ""}`}>
      <button
        aria-expanded={open}
        className={styles.questionButton}
        onClick={toggle}
        type="button"
      >
        <span className={`${styles.questionIndex} ${styles.technicalIndex}`}>
          {String(index).padStart(2, "0")}
        </span>
        <span className={styles.questionText}>{question}</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} aria-hidden="true">
          v
        </span>
      </button>

      {open && (
        <div className={styles.detailGrid}>
          <div className={styles.detailPanel}>
            <div className={styles.panelTitle}>Why they ask</div>
            <p className={styles.panelCopy}>
              {intention ||
                "They want to see how you connect the underlying concept to the role's real responsibilities."}
            </p>
          </div>
          <div className={`${styles.detailPanel} ${styles.answerPanel}`}>
            <div className={styles.panelTitle}>How to answer</div>
            <p className={styles.panelCopy}>
              {answer ||
                "Start with the goal and constraints, explain your approach, name tradeoffs, and describe how you would validate success."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TechnicalQuestionsPage({ reportId, questions }: TechnicalQuestionsPageProps) {
  return (
    <main className={styles.pageShell}>
      <Link className={styles.backLink} href={`/reports/${reportId}`}>
        <span aria-hidden="true">&lt;</span>
        Back to overview
      </Link>

      <header className={styles.header}>
        <div className={styles.sectionLabel}>
          <div className={`${styles.marker} ${styles.technicalMarker}`} />
          <span className={styles.eyebrow}>Technical interview</span>
        </div>
        <h1 className={styles.title}>
          Technical <em className={styles.titleEmphasis}>questions.</em>
        </h1>
        <p className={styles.intro}>
          Click any question to reveal interviewer intent and how to answer.
        </p>
        <div className={styles.separator} />
      </header>

      <div className={styles.countRow}>
        <span className={styles.count}>{questions.length} questions</span>
      </div>

      <div className={styles.questionList}>
        {questions.map((question, index) => (
          <QuestionRow
            answer={question.answer ?? ""}
            index={index + 1}
            intention={question.intention ?? ""}
            key={`${question.question ?? "question"}-${index}`}
            question={question.question ?? ""}
          />
        ))}
      </div>
    </main>
  )
}
