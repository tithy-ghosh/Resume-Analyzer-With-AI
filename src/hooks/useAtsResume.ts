"use client"

import { useState } from "react"
import {
  copyText,
  downloadResumePdf,
  downloadTextFile,
  generateAtsResume,
} from "@/services/atsResumeClientService"

export function useAtsResume(reportId: string) {
  const [loading, setLoading] = useState(false)
  const [resume, setResume] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  async function generate() {
    setLoading(true)
    setError("")

    try {
      setResume(await generateAtsResume(reportId))
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    await copyText(resume)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  function downloadTxt() {
    downloadTextFile(resume)
  }

  function downloadPdf() {
    setPdfLoading(true)

    try {
      downloadResumePdf(resume)
    } catch {
      downloadTextFile(resume)
    } finally {
      setPdfLoading(false)
    }
  }

  return {
    copied,
    error,
    loading,
    pdfLoading,
    resume,
    copy,
    downloadPdf,
    downloadTxt,
    generate,
    reset: () => setResume(""),
  }
}
