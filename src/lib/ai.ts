import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY!,
})

export interface InterviewReportResult {
  title: string
  matchScore: number
  technicalQuestions: { question: string; intention: string; answer: string }[]
  behavioralQuestions: { question: string; intention: string; answer: string }[]
  skillGaps: { skill: string; severity: "low" | "medium" | "high" }[]
  preparationPlan: { day: number; focus: string; tasks: string[] }[]
}

export async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}: {
  resume: string
  selfDescription: string
  jobDescription: string
}): Promise<InterviewReportResult> {

  console.log("🤖 Calling Gemini 2.5 Flash...")

  const prompt = `
You are an expert career coach and technical interviewer.
Analyze this candidate's resume against the job description and return a JSON object ONLY — no explanation, no markdown, just raw JSON.

Resume:
${resume.slice(0, 3000)}

Self Description:
${selfDescription}

Job Description:
${jobDescription.slice(0, 2000)}

Return this exact JSON structure:
{
  "title": "job title from job description",
  "matchScore": 75,
  "technicalQuestions": [
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." }
  ],
  "behavioralQuestions": [
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." }
  ],
  "skillGaps": [
    { "skill": "...", "severity": "high" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "...", "tasks": ["...", "..."] },
    { "day": 2, "focus": "...", "tasks": ["...", "..."] },
    { "day": 3, "focus": "...", "tasks": ["...", "..."] },
    { "day": 4, "focus": "...", "tasks": ["...", "..."] },
    { "day": 5, "focus": "...", "tasks": ["...", "..."] },
    { "day": 6, "focus": "...", "tasks": ["...", "..."] },
    { "day": 7, "focus": "...", "tasks": ["...", "..."] }
  ]
}
`

  // Retry up to 5 times for 503 temporary overload
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`🤖 Attempt ${attempt}...`)

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      })

      const text = response.text ?? ""
      console.log("🤖 Raw response (first 300 chars):", text.slice(0, 300))

      const clean = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()

      const parsed = JSON.parse(clean)
      console.log("✅ Success! Title:", parsed.title)

      return parsed

    } catch (err: unknown) {
      const e = err as { status?: number; message?: string }
      console.log(`⚠️ Attempt ${attempt} failed:`, e?.status)

      if (e?.status === 503 && attempt < 5) {
        const wait = attempt * 4000 // 4s, 8s, 12s, 16s
        console.log(`⏳ Waiting ${wait / 1000}s before retry...`)
        await new Promise(res => setTimeout(res, wait))
      } else {
        throw err
      }
    }
  }

  throw new Error("Gemini unavailable after 5 attempts. Please try again.")
}