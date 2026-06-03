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
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const maxWidth = pageWidth - margin * 2
      const lineHeight = 6
      let y = margin

      for (const line of resume.split("\n")) {
        const trimmed = line.trim()
        if (trimmed && trimmed === trimmed.toUpperCase() && trimmed.length > 2 && !trimmed.includes("@") && !trimmed.match(/^\d/)) {
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
          for (const wrappedLine of doc.splitTextToSize(trimmed, maxWidth)) {
            if (y + lineHeight > pageHeight - margin) { doc.addPage(); y = margin }
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

  /* ── Generated state ─── */
  if (resume) {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#e8e6e1]">
        {/* Top bar */}
        <div
          className="bg-white flex items-center justify-between flex-wrap gap-3"
          style={{ paddingInline: "1.25rem", paddingBlock: "1rem" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M4 2h6l4 4v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" strokeLinecap="round"/>
                <path d="M10 2v4h4M5 9h6M5 12h4" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-[#1a1a1a]">ATS-optimized resume</div>
              <div className="text-[11px] text-[#bbb]">Tailored to the job description · ready to send</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copy}
              className="flex items-center gap-1.5 text-[11px] font-medium text-[#555] bg-[#f5f3ef] border border-[#e8e6e1] rounded-lg hover:bg-[#ece9e3] transition-colors"
              style={{ paddingInline: "0.75rem", paddingBlock: "0.4rem" }}
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="5" width="9" height="9" rx="2"/>
                <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2"/>
              </svg>
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={downloadPdf}
              disabled={pdfLoading}
              className="flex items-center gap-1.5 text-[11px] font-medium text-white bg-[#1a1a1a] rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ paddingInline: "0.75rem", paddingBlock: "0.4rem" }}
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 3v7M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 13h10" strokeLinecap="round"/>
              </svg>
              {pdfLoading ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={downloadTxt}
              className="text-[11px] font-medium text-[#999] bg-[#f5f3ef] border border-[#e8e6e1] rounded-lg hover:bg-[#ece9e3] transition-colors"
              style={{ paddingInline: "0.75rem", paddingBlock: "0.4rem" }}
            >
              .txt
            </button>
            <button
              onClick={() => setResume("")}
              className="text-[11px] font-medium text-[#999] bg-[#f5f3ef] border border-[#e8e6e1] rounded-lg hover:bg-[#ece9e3] transition-colors"
              style={{ paddingInline: "0.75rem", paddingBlock: "0.4rem" }}
            >
              Regenerate
            </button>
          </div>
        </div>

        {/* Resume content */}
        <pre className="text-[12px] text-[#444] bg-[#fafaf9] whitespace-pre-wrap font-mono leading-relaxed max-h-[480px] overflow-y-auto border-t border-[#f0ede8]"
          style={{ padding: "1.25rem" }}
        >
          {resume}
        </pre>
      </div>
    )
  }

  /* ── Default CTA state ─── */
  return (
    <div>
      {error && (
        <div
          className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
          style={{ paddingInline: "1rem", paddingBlock: "0.6rem", marginBottom: "0.75rem" }}
        >
          {error}
        </div>
      )}

      <button
        onClick={generate}
        disabled={loading}
        className="w-full rounded-2xl border-[1.5px] border-dashed border-[#d4d0c8] bg-white hover:border-[#1a1a1a] hover:bg-[#fafaf9] disabled:opacity-40 disabled:cursor-not-allowed transition-all group"
        style={{ paddingInline: "1.25rem", paddingBlock: "1.125rem" }}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-[#f5f3ef] group-hover:bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 transition-colors">
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#888] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5"
                className="group-hover:stroke-white transition-colors">
                <path d="M4 2h6l4 4v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" strokeLinecap="round"/>
                <path d="M10 2v4h4M5 9h6M5 12h4" strokeLinecap="round"/>
              </svg>
            )}
          </div>

          {/* Text */}
          <div className="text-left flex-1">
            <div className="text-sm font-medium text-[#1a1a1a]">
              {loading ? "Generating your ATS resume..." : "Generate ATS-optimized resume"}
            </div>
            <div className="text-[11px] text-[#bbb]" style={{ marginTop: "2px" }}>
              AI rewrites your resume with job-specific keywords · download as PDF or TXT
            </div>
          </div>

          {/* Badges */}
          {!loading && (
            <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[9px] text-[#999] bg-[#f5f3ef] border border-[#e8e6e1] rounded px-2 py-0.5">PDF</span>
              <span className="text-[9px] text-[#999] bg-[#f5f3ef] border border-[#e8e6e1] rounded px-2 py-0.5">TXT</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#ccc] group-hover:text-[#1a1a1a] transition-colors ml-1">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* Loading progress bar */}
        {loading && (
          <div className="mt-3 h-[2px] bg-[#f0ede8] rounded-full overflow-hidden">
            <div className="h-full bg-[#1a1a1a] rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]"
              style={{ width: "40%", animation: "shimmer 1.5s ease-in-out infinite" }} />
          </div>
        )}
      </button>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); width: 40% }
          50% { width: 60% }
          100% { transform: translateX(300%); width: 40% }
        }
      `}</style>
    </div>
  )
}   