"use client"

import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { createInterviewReport } from "@/services/analyzeClientService"

const PDF_MIME_TYPE = "application/pdf"

export function useAnalyzeForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [selfDescription, setSelfDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stage, setStage] = useState("")

  function setResumeFile(nextFile?: File) {
    if (nextFile?.type === PDF_MIME_TYPE) {
      setFile(nextFile)
      setError("")
      return
    }

    setError("Please upload a PDF file")
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!file) {
      setError("Please upload your resume")
      return
    }

    setLoading(true)
    setError("")

    try {
      setStage("Parsing your resume...")
      setStage("Analyzing with AI... this takes about 15 seconds")

      const reportId = await createInterviewReport({
        resume: file,
        jobDescription,
        selfDescription,
      })

      setStage("Report ready. Redirecting...")
      router.push(`/reports/${reportId}`)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Network error. Please try again.")
      setLoading(false)
    }
  }

  return {
    error,
    file,
    fileInputRef,
    jobDescription,
    loading,
    selfDescription,
    stage,
    openFilePicker: () => fileInputRef.current?.click(),
    setJobDescription,
    setResumeFile,
    setSelfDescription,
    submit,
  }
}
