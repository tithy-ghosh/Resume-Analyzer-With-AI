import type { RefObject } from "react"
import PageLayout from "@/components/PageLayout"
import styles from "./AnalyzeView.module.css"

type AnalyzeViewProps = {
  error: string
  file: File | null
  fileInputRef: RefObject<HTMLInputElement | null>
  jobDescription: string
  loading: boolean
  selfDescription: string
  stage: string
  onFileSelect: (file?: File) => void
  onJobDescriptionChange: (value: string) => void
  onOpenFilePicker: () => void
  onSelfDescriptionChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function AnalyzeView({
  error,
  file,
  fileInputRef,
  jobDescription,
  loading,
  selfDescription,
  stage,
  onFileSelect,
  onJobDescriptionChange,
  onOpenFilePicker,
  onSelfDescriptionChange,
  onSubmit,
}: AnalyzeViewProps) {
  return (
    <PageLayout active="analyze">
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1>
            New <em>analysis.</em>
          </h1>
          <p>Upload your resume and paste the job description</p>
        </header>

        {error && <div className={styles.alert}>{error}</div>}

        {loading && (
          <div className={styles.stage}>
            <div className={styles.spinner} />
            {stage}
          </div>
        )}

        <form onSubmit={onSubmit} className={styles.form}>
          <div>
            <div className={styles.label}>Resume PDF</div>
            <div
              onClick={onOpenFilePicker}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                onFileSelect(event.dataTransfer.files?.[0])
              }}
              className={`${styles.dropzone} ${file ? styles.dropzoneActive : ""}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(event) => onFileSelect(event.target.files?.[0])}
                className={styles.hiddenInput}
              />

              {file ? (
                <>
                  <div className={`${styles.uploadIcon} ${styles.fileIcon}`} />
                  <div className={styles.uploadTitle}>{file.name}</div>
                  <div className={styles.fileMeta}>
                    {(file.size / 1024).toFixed(0)} KB · <span>Click to change</span>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.uploadIcon} />
                  <div className={styles.uploadTitle}>Drop your resume here</div>
                  <div className={styles.uploadHint}>or click to browse files</div>
                  <div className={styles.badges}>
                    <span>PDF</span>
                    <span>MAX 3MB</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <div className={styles.label}>Job Description</div>
            <textarea
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(event) => onJobDescriptionChange(event.target.value)}
              required
              rows={6}
              className={styles.textarea}
            />
          </div>

          <div>
            <div className={styles.label}>About yourself</div>
            <textarea
              placeholder="Briefly describe your background and experience level..."
              value={selfDescription}
              onChange={(event) => onSelfDescriptionChange(event.target.value)}
              required
              rows={3}
              className={styles.textarea}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submit}>
            {loading ? "Generating report..." : "Generate interview report"}
          </button>
        </form>
      </div>
    </PageLayout>
  )
}
