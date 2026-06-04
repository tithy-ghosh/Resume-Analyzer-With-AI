import { NextResponse } from "next/server"
import { auth } from "../../../../auth"
import dbConnect from "@/lib/db"
import { generateInterviewReport } from "@/lib/ai"
import { logger } from "@/lib/logger"
import InterviewReportModel from "@/models/InterviewReport"
import PDFParser from "pdf2json"

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
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

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const resumeFile = formData.get("resume") as File | null
    const jobDescription = formData.get("jobDescription") as string
    const selfDescription = formData.get("selfDescription") as string

    if (!resumeFile || !jobDescription || !selfDescription) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    if (resumeFile.type !== "application/pdf") {
      return NextResponse.json(
        { message: "Resume must be a PDF file" },
        { status: 400 }
      )
    }

    const arrayBuffer = await resumeFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const resumeText = await extractTextFromPDF(buffer)

    logger.info("PDF extracted", { length: resumeText.length })

    if (!resumeText.trim()) {
      return NextResponse.json(
        { message: "Could not extract text from PDF" },
        { status: 400 }
      )
    }

    const aiReport = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription,
    })

    logger.info("Saving interview report", { title: aiReport.title })

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

    logger.info("Interview report saved", { reportId: report._id.toString() })

    return NextResponse.json({
      message: "Report generated successfully",
      reportId: report._id.toString(),
    }, { status: 201 })
  } catch (error) {
    logger.error("Analyze route failed", error)
    return NextResponse.json(
      { message: "Failed to generate report. Please try again." },
      { status: 500 }
    )
  }
}
