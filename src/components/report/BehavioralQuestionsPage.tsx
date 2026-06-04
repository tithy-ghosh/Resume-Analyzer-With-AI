"use client"

import Link from "next/link"
import { useQuestionAnswer } from "@/hooks/useQuestionAnswer"
import type { InterviewQuestion } from "@/services/reportDetailService"
import styles from "./ReportSectionPage.module.css"

interface BehavioralQuestionsPageProps {
  reportId: string
  questions: InterviewQuestion[]
  jobDescription?: string
}

function QuestionRow({
  index,
  question,
  intention,
  answerGuide,
  jobDescription,
}: {
  index: number
  question: string
  intention: string
  answerGuide: string
  jobDescription?: string
}) {
  const { answer, loading, open, toggle } = useQuestionAnswer({
    question,
    type: "behavioral",
    jobDescription,
  })

  return (
    <div className={`${styles.questionCard} ${open ? styles.questionCardOpen : ""}`}>
      <button
        aria-expanded={open}
        className={styles.questionButton}
        onClick={toggle}
        type="button"
      >
        <span className={`${styles.questionIndex} ${styles.behavioralIndex}`}>
          {String(index).padStart(2, "0")}
        </span>
        <span className={styles.questionText}>{question}</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} aria-hidden="true">
          v
        </span>
      </button>

      {open && (
        <div className={styles.behavioralDetails}>
          <div className={`${styles.detailPanel} ${styles.starPanel}`}>
            <div className={styles.panelTitle}>Model answer (STAR)</div>
            {loading ? (
              <div className={styles.loadingRow}>
                <div className={styles.spinner} />
                <span>Generating answer...</span>
              </div>
            ) : (
              <p className={styles.panelCopy}>{answer}</p>
            )}
          </div>
          <div className={styles.detailGrid}>
            <div className={styles.detailPanel}>
              <div className={styles.panelTitle}>Why they ask</div>
              <p className={styles.panelCopy}>
                {intention ||
                  "They want evidence of judgment, ownership, and communication under real constraints."}
              </p>
            </div>
            <div className={`${styles.detailPanel} ${styles.tipPanel}`}>
              <div className={styles.panelTitle}>Answer tip</div>
              <p className={styles.panelCopy}>
                {answerGuide ||
                  "Use STAR: Situation, Task, Actions you took, and a concrete Result tied to this role."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BehavioralQuestionsPage({
  reportId,
  questions,
  jobDescription,
}: BehavioralQuestionsPageProps) {
  return (
    <main className={styles.behavioralShell}>
      <div className={styles.pageShell}>
        <Link className={styles.backLink} href={`/reports/${reportId}`}>
          <span aria-hidden="true">&lt;</span>
          Back to overview
        </Link>

        <header className={styles.header}>
          <div className={styles.sectionLabel}>
            <div className={`${styles.marker} ${styles.behavioralMarker}`} />
            <span className={styles.eyebrow}>Behavioral interview</span>
          </div>
          <h1 className={styles.title}>
            Behavioral <em className={styles.titleEmphasis}>questions.</em>
          </h1>
          <p className={styles.intro}>
            Click any question to get a full STAR model answer you can study and adapt.
          </p>
          <div className={styles.separator} />
        </header>

        <div className={styles.countRow}>
          <span className={styles.count}>{questions.length} questions</span>
        </div>

        {questions.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No behavioral questions found for this report.</p>
            <p className={styles.emptyCopy}>
              This report may have been generated before behavioral questions were added. Try
              generating a new report.
            </p>
          </div>
        ) : (
          <div className={styles.questionList}>
            {questions.map((item, index) => (
              <QuestionRow
                answerGuide={item.answer ?? ""}
                index={index + 1}
                intention={item.intention ?? ""}
                jobDescription={jobDescription}
                key={`${item.question ?? "question"}-${index}`}
                question={item.question ?? ""}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
