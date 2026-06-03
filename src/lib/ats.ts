import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY!,
})

export async function generateATSResume({
  resume,
  jobDescription,
  title,
}: {
  resume: string
  jobDescription: string
  title: string
}): Promise<string> {

  console.log("📄 Generating ATS resume...")

  const prompt = `
You are an expert resume writer specializing in ATS (Applicant Tracking System) optimization.

Rewrite the following resume to be highly optimized for this specific job description.

Original Resume:
${resume.slice(0, 3000)}

Target Job: ${title}
Job Description:
${jobDescription.slice(0, 2000)}

Rules:
- Keep all real experience and facts from the original resume — do NOT invent anything
- Reorder and reword bullet points to match job description keywords
- Use action verbs and quantifiable achievements where possible
- Add relevant keywords from the job description naturally
- Format as clean plain text with clear sections:
  CONTACT, SUMMARY, EXPERIENCE, SKILLS, EDUCATION
- Keep it to 1 page worth of content
- Do NOT add fake experience or skills the candidate doesn't have

Return ONLY the rewritten resume text. No explanations, no markdown, just the plain text resume.
`

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`📄 ATS attempt ${attempt}...`)

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      })

      const text = response.text ?? ""
      console.log("✅ ATS resume generated, length:", text.length)
      return text

    } catch (err: unknown) {
      const e = err as { status?: number }
      console.log(`⚠️ ATS attempt ${attempt} failed:`, e?.status)

      if (e?.status === 503 && attempt < 3) {
        await new Promise(res => setTimeout(res, attempt * 4000))
      } else {
        throw err
      }
    }
  }

  throw new Error("Failed to generate ATS resume")
}