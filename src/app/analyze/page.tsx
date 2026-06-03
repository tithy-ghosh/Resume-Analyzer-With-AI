"use client"
import { useState, useRef } from "react"
import Link from "next/link"
import PageLayout from "@/components/PageLayout"
import SectionTitle from "@/components/SectionTitle"

export default function AnalyzePage() {
  const fileRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [selfDescription, setSelfDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stage, setStage] = useState("")

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && f.type === "application/pdf") {
      setFile(f)
      setError("")
    } else {
      setError("Please upload a PDF file")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError("Please upload your resume"); return }

    setLoading(true)
    setError("")

    try {
      setStage("Parsing your resume...")
      const formData = new FormData()
      formData.append("resume", file)
      formData.append("jobDescription", jobDescription)
      formData.append("selfDescription", selfDescription)

      setStage("Analyzing with AI... (this takes ~15 seconds)")

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      console.log("✅ Full response:", data)

      if (!res.ok) {
        setError(data.message || "Something went wrong")
        setLoading(false)
        return
      }

      if (!data.reportId) {
        setError("Report ID missing from response")
        setLoading(false)
        return
      }

      setStage("Report ready! Redirecting...")
      window.location.href = `/reports/${data.reportId}`

    } catch (err) {
      console.error("❌ Fetch error:", err)
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  return (
  <PageLayout active="analyze">
    <div className="max-w-2xl">

      <div
      style={{"marginBottom": "2rem"}}
      >
        <h1 className="font-[Instrument_Serif] text-[28px] text-[#1a1a1a] leading-tight">
          New <em className="italic text-[#999]">analysis.</em>
        </h1>
        <p className="text-[11px] text-[#bbb]"
        style={{"marginTop": "0.25rem"}}
        >Upload your resume and paste the job description</p>
      </div>

      {error && (
        <div className=" rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
        style={{ 
            "paddingInline":"1rem",
            "paddingBlock": "0.75rem",
            "marginBottom": "1.25rem"
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div className=" rounded-xl bg-[#f0ede8] border border-[#e4e1db] text-[#888] text-sm flex items-center gap-3"
        style={{ 
            "paddingInline":"1rem",
            "paddingBlock": "0.75rem",
            "marginBottom": "1.25rem"
          }}
        >
          <div className="w-3 h-3 border-2 border-[#888] border-t-transparent rounded-full animate-spin flex-shrink-0" />
          {stage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Resume Upload */}
        <div>
          <div className="text-[10px] text-[#aaa] uppercase tracking-[0.07em]"
          style={{"marginBottom": "0.5rem"}}
          >Resume PDF</div>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const f = e.dataTransfer.files?.[0]
              if (f?.type === "application/pdf") { setFile(f); setError("") }
              else setError("Please upload a PDF file")
            }}
            className={`border-[1.5px] border-dashed rounded-2xl text-center cursor-pointer transition-all ${
              file
                ? "border-solid border-[#1a1a1a] bg-[#f8f8f7]"
                : "border-[#d4d0c8] bg-[#fafaf9] hover:border-[#1a1a1a] hover:bg-[#f5f3ef]"
            }`}
            style={{"padding": "1.75rem"}}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              
              onChange={handleFile}
              style={{"display": "none"}}
            />

            {file ? (
              <>
                <div className="max-w-1/6 rounded-[10px] bg-[#131313] flex items-center justify-center"
                style={{
                  "marginInline": "auto",
                  "marginBottom": "0.75rem"
                }}
                >
                  
                </div>
                <div className="text-sm font-medium text-[#1a1a1a]"
                style={{"marginBottom": "0.25rem"}}
                >{file.name}</div>
                <div className="text-[11px] text-[#999]">
                  {(file.size / 1024).toFixed(0)} KB · <span className="text-[#1a1a1a] underline">Click to change</span>
                </div>
              </>
            ) : (
              <>
                <div className=" rounded-[10px] bg-[#f0ede8] flex items-center justify-center"
                style={{
                  "marginInline": "auto",
                  "marginBottom": "0.75rem"
                }}
                >
                  
                </div>
                <div className="text-sm font-medium text-[#1a1a1a]"
                style={{"marginBottom": "0.25rem"}}
                >Drop your resume here</div>
                <div className="text-[11px] text-[#bbb]"
                style={{"marginBottom": "0.75rem"}}
                >or click to browse files</div>
                <div className="flex  justify-center" style={{"gap": "6px"}}>
                  <span className="text-[9px] text-[#999] bg-[#f0ede8] rounded tracking-[0.04em]"
                  style={{ 
            "paddingInline":"7px",
            "paddingBlock": "2px",
            
          }}
                  >PDF</span>
                  <span className="text-[9px] text-[#999] bg-[#f0ede8] rounded  tracking-[0.04em]"
                  style={{ 
            "paddingInline":"7px",
            "paddingBlock": "2px",
            
          }}
                  >MAX 3MB</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div>
          <div className="text-[10px] text-[#aaa] uppercase tracking-[0.07em]"
          style={{"marginBottom": "0.5rem"}}
          >Job Description</div>
          <textarea
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            required
            rows={6}
            className="w-full bg-white border border-[#e4e1db] rounded-xl text-sm text-[#1a1a1a] placeholder:text-[#c4c0b8] outline-none focus:border-[#1a1a1a] transition-colors resize-none"
            style={{ 
            "paddingInline":"1rem",
            "paddingBlock": "0.75rem",
            
          }}
          />
        </div>

        {/* Self Description */}
        <div>
          <div className="text-[10px] text-[#aaa] uppercase tracking-[0.07em]"
          style={{"marginBottom": "0.5rem"}}
          >About yourself</div>
          <textarea
            placeholder="Briefly describe your background and experience level..."
            value={selfDescription}
            onChange={e => setSelfDescription(e.target.value)}
            required
            rows={3}
            className="w-full bg-white border border-[#e4e1db] rounded-xl text-sm text-[#1a1a1a] placeholder:text-[#c4c0b8] outline-none focus:border-[#1a1a1a] transition-colors resize-none"
            style={{ 
            "paddingInline":"1rem",
            "paddingBlock": "0.75rem",
            
          }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-1/2 bg-[#1a1a1a] text-white rounded-xl py-3 px-6 text-sm font-medium flex items-center justify-center hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{"paddingInline": "1.5rem","paddingBlock": "0.75rem", "marginInline": "auto"}}
        >
          <span>{loading ? "Generating report..." : "Generate interview report"}</span>
          
        </button>

      </form>
    </div>
  </PageLayout>
)
}