"use client"

import { useAtsResume } from "@/hooks/useAtsResume"
import { ArrowIcon, CopyIcon, DocumentIcon, DownloadIcon } from "./ATSResumeIcons"
import styles from "./ATSResumeButton.module.css"

interface ATSResumeButtonProps {
  reportId: string
}

export default function ATSResumeButton({ reportId }: ATSResumeButtonProps) {
  const atsResume = useAtsResume(reportId)
  const { copied, error, loading, pdfLoading, resume } = atsResume

  if (resume) {
    return (
      <div className={styles.resumeCard}>
        <div className={styles.resumeToolbar}>
          <div className={styles.resumeSummary}>
            <div className={styles.iconBox}>
              <DocumentIcon />
            </div>
            <div>
              <div className={styles.resumeTitle}>ATS-friendly resume ready</div>
              <div className={styles.resumeSubtitle}>Tailored to the job description, ready to send</div>
            </div>
          </div>

          <div className={styles.resumeActions}>
            <button onClick={atsResume.copy} className={styles.secondaryAction}>
              <CopyIcon />
              {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={atsResume.downloadPdf} disabled={pdfLoading} className={styles.primaryAction}>
              <DownloadIcon />
              {pdfLoading ? "Generating" : "Download PDF"}
            </button>
            <button onClick={atsResume.downloadTxt} className={styles.secondaryAction}>
              TXT
            </button>
            <button onClick={atsResume.reset} className={styles.secondaryAction}>
              Regenerate
            </button>
          </div>
        </div>

        <pre className={styles.resumePreview}>{resume}</pre>
      </div>
    )
  }

  return (
    <div>
      {error && <div className={styles.error}>{error}</div>}

      <button onClick={atsResume.generate} disabled={loading} className={styles.generateButton}>
        <div className={styles.generateAccent} />
        <div className={styles.generateContent}>
          <div className={styles.generateIcon}>
            {loading ? <div className={styles.spinner} /> : <DocumentIcon size={17} />}
          </div>

          <div className={styles.generateCopy}>
            <div className={styles.generateTitle}>
              {loading ? "Generating ATS-friendly resume..." : "Generate ATS-friendly resume"}
            </div>
            <div className={styles.generateSubtitle}>
              Job-specific keywords, clean formatting, PDF and TXT export
            </div>
          </div>

          {!loading && (
            <div className={styles.exportBadges}>
              <span>PDF</span>
              <span>TXT</span>
              <ArrowIcon className={styles.generateArrow} />
            </div>
          )}
        </div>

        {loading && (
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} />
          </div>
        )}
      </button>
    </div>
  )
}
