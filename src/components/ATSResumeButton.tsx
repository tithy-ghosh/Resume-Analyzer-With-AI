"use client"
import { useState } from "react"

interface ATSResumeButtonProps {
  reportId: string
}

export default function ATSResumeButton({ reportId }: ATSResumeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [resume, setResume] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/ats-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message); return }
      setResume(data.atsResume)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(resume)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadTxt = () => {
    const blob = new Blob([resume], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ats-resume.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPdf = async () => {
    setPdfLoading(true)
    try {
      const { jsPDF } = (window as any).jspdf

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const maxWidth = pageWidth - margin * 2
      const lineHeight = 6
      let y = margin

      const lines = resume.split("\n")

      for (const line of lines) {
        const trimmed = line.trim()

        // Section headers — all caps lines
        if (
          trimmed &&
          trimmed === trimmed.toUpperCase() &&
          trimmed.length > 2 &&
          !trimmed.includes("@") &&
          !trimmed.match(/^\d/)
        ) {
          if (y > margin + 10) y += 4
          doc.setFont("helvetica", "bold")
          doc.setFontSize(11)
          doc.setTextColor(26, 26, 26)
          doc.text(trimmed, margin, y)
          y += 2
          doc.setDrawColor(200, 200, 200)
          doc.line(margin, y, pageWidth - margin, y)
          y += lineHeight

        } else if (trimmed === "") {
          y += 3

        } else {
          doc.setFont("helvetica", "normal")
          doc.setFontSize(9.5)
          doc.setTextColor(60, 60, 60)

          const wrapped = doc.splitTextToSize(trimmed, maxWidth)
          for (const wrappedLine of wrapped) {
            if (y + lineHeight > pageHeight - margin) {
              doc.addPage()
              y = margin
            }
            doc.text(wrappedLine, margin, y)
            y += lineHeight
          }
        }
      }

      doc.save("ats-resume.pdf")

    } catch (err) {
      console.error("PDF error:", err)
      downloadTxt()
    } finally {
      setPdfLoading(false)
    }
  }

  if (resume) {
    return (
      <div className="bg-white border border-[#e8e6e1] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="text-sm font-medium text-[#1a1a1a]">ATS-optimized resume</div>
            <div className="text-[11px] text-[#bbb] mt-[2px]">Tailored to the job description</div>
          </div>
          <div className="flex gap-2 flex-wrap">

            <button
              onClick={copy}
              className="flex items-center gap-1 px-3 py-[6px] text-[11px] font-medium text-[#1a1a1a] bg-[#f0ede8] rounded-lg hover:bg-[#e8e4de] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="5" width="9" height="9" rx="2"/>
                <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2"/>
              </svg>
              {copied ? "Copied!" : "Copy"}
            </button>

            <button
              onClick={downloadPdf}
              disabled={pdfLoading}
              className="flex items-center gap-1 px-3 py-[6px] text-[11px] font-medium text-white bg-[#1a1a1a] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 3v7M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 13h10" strokeLinecap="round"/>
              </svg>
              {pdfLoading ? "Generating..." : "Download PDF"}
            </button>

            <button
              onClick={downloadTxt}
              className="flex items-center gap-1 px-3 py-[6px] text-[11px] font-medium text-[#999] bg-[#f0ede8] rounded-lg hover:bg-[#e8e4de] transition-colors"
            >
              .txt
            </button>

            <button
              onClick={() => setResume("")}
              className="px-3 py-[6px] text-[11px] font-medium text-[#999] bg-[#f0ede8] rounded-lg hover:bg-[#e8e4de] transition-colors"
            >
              Regenerate
            </button>

          </div>
        </div>

        <pre className="text-[12px] text-[#444] bg-[#fafaf9] rounded-xl p-4 whitespace-pre-wrap font-mono leading-relaxed border border-[#f0ede8] max-h-[500px] overflow-y-auto">
          {resume}
        </pre>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-3 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      <button
        onClick={generate}
        disabled={loading}
        className="w-full bg-white border border-[#e8e6e1] rounded-xl px-4 py-4 flex items-center justify-between hover:border-[#1a1a1a] transition-colors group disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f0ede8] flex items-center justify-center group-hover:bg-[#1a1a1a] transition-colors">
            {loading ? (
              <div className="w-3 h-3 border-2 border-[#888] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5" className="group-hover:stroke-white transition-colors">
                <path d="M4 2h6l4 4v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" strokeLinecap="round"/>
                <path d="M10 2v4h4" strokeLinecap="round"/>
                <path d="M5 9h6M5 12h4" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-[#1a1a1a]">
              {loading ? "Generating ATS resume..." : "Generate ATS-optimized resume"}
            </div>
            <div className="text-[11px] text-[#bbb]">
              AI rewrites your resume · download as PDF or TXT
            </div>
          </div>
        </div>
        {!loading && (
          <span className="text-[#ccc] group-hover:text-[#1a1a1a] transition-colors">→</span>
        )}
      </button>
    </div>
  )
}