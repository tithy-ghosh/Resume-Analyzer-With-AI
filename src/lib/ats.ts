import { GoogleGenAI } from "@google/genai"
import { logger } from "./logger"

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY!,
})

const MAX_ATTEMPTS = 3

export async function generateATSResume({
  resume,
  jobDescription,
  title,
}: {
  resume: string
  jobDescription: string
  title: string
}): Promise<string> {
  const prompt = `
You are an expert resume writer specializing in ATS (Applicant Tracking System) optimization.

Rewrite the following resume to be highly optimized for this specific job description.

Original Resume:
${resume.slice(0, 3000)}

Target Job: ${title}
Job Description:
${jobDescription.slice(0, 2000)}

Rules:
- Keep all real experience and facts from the original resume - do NOT invent anything
- Reorder and reword bullet points to match job description keywords
- Use action verbs and quantifiable achievements where possible
- Add relevant keywords from the job description naturally
- Format as clean plain text with clear sections:
  CONTACT, SUMMARY, EXPERIENCE, SKILLS, EDUCATION
- Keep it to 1 page worth of content
- Do NOT add fake experience or skills the candidate doesn't have

Return ONLY the rewritten resume text. No explanations, no markdown, just the plain text resume.
`

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      logger.info("ATS resume attempt", { attempt })

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      })

      const text = response.text ?? ""
      logger.info("ATS resume generated", { length: text.length })
      return text
    } catch (error: unknown) {
      const geminiError = error as { status?: number }
      logger.warn("ATS resume attempt failed", { attempt, status: geminiError?.status })

      if (geminiError?.status === 503 && attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 4000))
        continue
      }

      throw error
    }
  }

  throw new Error("Failed to generate ATS resume")
}
