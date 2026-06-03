"use client"
import { useState } from "react"

interface ATSResumeButtonProps {
  reportId: string
}

type JsPdfConstructor = new (options: {
  orientation: "portrait"
  unit: "mm"
  format: "a4"
}) => {
  internal: {
    pageSize: {
      getWidth: () => number
      getHeight: () => number
    }
  }
  setFont: (fontName: string, fontStyle: string) => void
  setFontSize: (size: number) => void
  setTextColor: (...color: number[]) => void
  text: (text: string | string[], x: number, y: number) => void
  setDrawColor: (...color: number[]) => void
  line: (x1: number, y1: number, x2: number, y2: number) => void
  splitTextToSize: (text: string, maxWidth: number) => string[]
  addPage: () => void
  save: (filename: string) => void
}

type WindowWithJsPdf = Window & {
  jspdf?: {
    jsPDF: JsPdfConstructor
  }
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
      if (!res.ok) {
        setError(data.message)
        return
      }
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
      const { jsPDF } = (window as WindowWithJsPdf).jspdf ?? {}
      if (!jsPDF) {
        downloadTxt()
        return
      }

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
      <div className="rounded-lg overflow-hidden border border-[#d8d2c8] bg-white shadow-[0_18px_44px_rgba(17,17,17,0.16)]">
        <div
          className="bg-[#fcfbf8] flex items-center justify-between flex-wrap gap-3"
          style={{ paddingInline: "1rem", paddingBlock: "0.85rem" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#10231e] flex items-center justify-center flex-shrink-0 shadow-[0_8px_20px_rgba(16,35,30,0.2)]">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M4 2h6l4 4v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" strokeLinecap="round" />
                <path d="M10 2v4h4M5 9h6M5 12h4" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1a1a1a]">ATS-friendly resume ready</div>
              <div className="text-[11px] text-[#8f826f]">Tailored to the job description, ready to send</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copy}
              className="flex items-center gap-1.5 text-[11px] font-medium text-[#555] bg-white border border-[#ded8cd] rounded-md hover:bg-[#f5f3ef] transition-colors"
              style={{ paddingInline: "0.75rem", paddingBlock: "0.4rem" }}
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="5" width="9" height="9" rx="2" />
                <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" />
              </svg>
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={downloadPdf}
              disabled={pdfLoading}
              className="flex items-center gap-1.5 text-[11px] font-medium text-white bg-[#10231e] rounded-md hover:bg-[#18372f] disabled:opacity-50 transition-colors"
              style={{ paddingInline: "0.75rem", paddingBlock: "0.4rem" }}
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 3v7M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 13h10" strokeLinecap="round" />
              </svg>
              {pdfLoading ? "Generating" : "Download PDF"}
            </button>
            <button
              onClick={downloadTxt}
              className="text-[11px] font-medium text-[#8f826f] bg-white border border-[#ded8cd] rounded-md hover:bg-[#f5f3ef] transition-colors"
              style={{ paddingInline: "0.75rem", paddingBlock: "0.4rem" }}
            >
              TXT
            </button>
            <button
              onClick={() => setResume("")}
              className="text-[11px] font-medium text-[#8f826f] bg-white border border-[#ded8cd] rounded-md hover:bg-[#f5f3ef] transition-colors"
              style={{ paddingInline: "0.75rem", paddingBlock: "0.4rem" }}
            >
              Regenerate
            </button>
          </div>
        </div>

        <pre className="text-[12px] text-[#38332c] bg-[#f8f6f1] whitespace-pre-wrap font-mono leading-relaxed max-h-[480px] overflow-y-auto border-t border-[#ebe4d9]"
          style={{ padding: "1.25rem" }}
        >
          {resume}
        </pre>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div
          className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          style={{ paddingInline: "1rem", paddingBlock: "0.6rem", marginBottom: "0.75rem" }}
        >
          {error}
        </div>
      )}

      <button
        onClick={generate}
        disabled={loading}
        className="relative w-full overflow-hidden rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
        style={{
          paddingInline: "1rem",
          paddingBlock: "1rem",
          backgroundColor: "#ffffff",
          border: "1px solid #d7cbbb",
          color: "#101010",
          boxShadow: "0 12px 28px rgba(38,31,22,0.1)",
        }}
      >
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: "#f2d58a" }} />
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-md group-hover:bg-[#18372f] flex items-center justify-center flex-shrink-0 transition-colors shadow-[0_12px_26px_rgba(16,35,30,0.24)]"
            style={{ backgroundColor: "#10231e" }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M4 2h6l4 4v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" strokeLinecap="round" />
                <path d="M10 2v4h4M5 9h6M5 12h4" strokeLinecap="round" />
              </svg>
            )}
          </div>

          <div className="text-left flex-1 min-w-0">
            <div className="text-[15px] font-semibold leading-5" style={{ color: "#101010" }}>
              {loading ? "Generating ATS-friendly resume..." : "Generate ATS-friendly resume"}
            </div>
            <div className="text-[11px] leading-4" style={{ marginTop: "4px", color: "#5f564c" }}>
              Job-specific keywords, clean formatting, PDF and TXT export
            </div>
          </div>

          {!loading && (
            <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[9px] text-[#4f463c] bg-[#f5f0e3] border border-[#e2d5b8] rounded px-2 py-0.5">PDF</span>
              <span className="text-[9px] text-[#4f463c] bg-[#eef8f5] border border-[#d5ebe5] rounded px-2 py-0.5">TXT</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#8f826f] group-hover:text-[#10231e] transition-colors ml-1">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>

        {loading && (
          <div className="mt-3 h-[3px] bg-[#eee7dc] rounded-full overflow-hidden">
            <div className="h-full bg-[#10231e] rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]"
              style={{ width: "40%", animation: "shimmer 1.5s ease-in-out infinite" }}
            />
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
