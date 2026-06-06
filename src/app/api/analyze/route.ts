/**
 * app/api/analyze/route.ts
 *
 * POST /api/analyze
 *
 * The main pipeline endpoint. Accepts a multipart form with:
 *  - resume       (PDF file, max ~3 MB)
 *  - jobDescription (plain text)
 *  - selfDescription (plain text)
 *
 * Steps:
 *  1. Authenticate — reject unauthenticated requests immediately
 *  2. Validate — check all fields and enforce PDF-only upload
 *  3. Extract text — parse the PDF server-side (no third-party upload)
 *  4. Generate report — send to Gemini, receive structured JSON
 *  5. Persist — save to MongoDB and return the report ID to the client
 *
 * The client then redirects to /reports/[reportId].
 */

import { NextResponse } from "next/server"
import PDFParser from "pdf2json"
import { auth } from "../../../../auth"
import dbConnect from "@/lib/db"
import { generateInterviewReport } from "@/lib/ai"
import { logger } from "@/lib/logger"
import InterviewReportModel from "@/models/InterviewReport"

// ─── PDF extraction ───────────────────────────────────────────────────────────

/**
 * Extracts plain text from a PDF buffer using pdf2json.
 *
 * We use pdf2json instead of pdf-parse because pdf-parse has a known issue
 * where it tries to require a file from `test/` at import time, which breaks
 * in Next.js serverless environments on Vercel.
 */
function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser()

    parser.on("pdfParser_dataReady", (data) => {
      const text = data.Pages.flatMap((page) =>
        page.Texts.map((item) => decodeURIComponent(item.R[0].T))
      ).join(" ")
      resolve(text)
    })

    parser.on("pdfParser_dataError", reject)
    parser.parseBuffer(buffer)
  })
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // ── Parse and validate form data ────────────────────────────────────
    const formData = await request.formData()
    const resumeFile = formData.get("resume") as File | null
    const jobDescription = (formData.get("jobDescription") as string)?.trim()
    const selfDescription = (formData.get("selfDescription") as string)?.trim()

    if (!resumeFile || !jobDescription || !selfDescription) {
      return NextResponse.json(
        { message: "Resume, job description, and self description are all required" },
        { status: 400 }
      )
    }

    if (resumeFile.type !== "application/pdf") {
      return NextResponse.json(
        { message: "Resume must be a PDF file" },
        { status: 400 }
      )
    }

    // ── Extract text from PDF ───────────────────────────────────────────
    const arrayBuffer = await resumeFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const resumeText = await extractTextFromPDF(buffer)

    logger.info("PDF text extracted", { characters: resumeText.length })

    if (!resumeText.trim()) {
      return NextResponse.json(
        { message: "Could not read text from your PDF. Try a text-based PDF rather than a scanned image." },
        { status: 400 }
      )
    }

    // ── Generate AI report ──────────────────────────────────────────────
    const aiReport = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription,
    })

    // ── Persist to MongoDB ──────────────────────────────────────────────
    logger.info("Saving report", { title: aiReport.title, userId: session.user.id })

    await dbConnect()

    const report = await InterviewReportModel.create({
      user: session.user.id,
      resume: resumeText,
      selfDescription,
      jobDescription,
      title: aiReport.title,
      matchScore: aiReport.matchScore,
      technicalQuestions: aiReport.technicalQuestions,
      behavioralQuestions: aiReport.behavioralQuestions,
      skillGaps: aiReport.skillGaps,
      preparationPlan: aiReport.preparationPlan,
    })

    logger.info("Report saved", { reportId: report._id.toString() })

    return NextResponse.json(
      { message: "Report generated successfully", reportId: report._id.toString() },
      { status: 201 }
    )
  } catch (error) {
    logger.error("Analyze route failed", error)
    return NextResponse.json(
      { message: "Failed to generate report. Please try again." },
      { status: 500 }
    )
  }
}