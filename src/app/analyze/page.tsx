"use client"

import AnalyzeView from "@/components/analyze/AnalyzeView"
import { useAnalyzeForm } from "@/hooks/useAnalyzeForm"

export default function AnalyzePage() {
  const form = useAnalyzeForm()

  return (
    <AnalyzeView
      error={form.error}
      file={form.file}
      fileInputRef={form.fileInputRef}
      jobDescription={form.jobDescription}
      loading={form.loading}
      selfDescription={form.selfDescription}
      stage={form.stage}
      onFileSelect={form.setResumeFile}
      onJobDescriptionChange={form.setJobDescription}
      onOpenFilePicker={form.openFilePicker}
      onSelfDescriptionChange={form.setSelfDescription}
      onSubmit={form.submit}
    />
  )
}
