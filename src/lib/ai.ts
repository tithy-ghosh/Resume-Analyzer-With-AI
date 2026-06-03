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

Return this exact JSON structure. IMPORTANT: You must return AT LEAST 10 technical questions and 8 behavioral questions. Make the questions highly specific to the job description's tech stack, responsibilities, and requirements — not generic questions.

{
  "title": "exact job title from job description",
  "matchScore": 72,
  "technicalQuestions": [
    { "question": "Specific technical question based on job tech stack", "intention": "What the interviewer is testing for", "answer": "A detailed 3-5 sentence answer guide explaining exactly how to answer this, what to include, what frameworks/concepts to mention, and any red flags to avoid" },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." }
  ],
  "behavioralQuestions": [
    { "question": "Behavioral question relevant to the role and company type", "intention": "What trait or experience the interviewer is evaluating", "answer": "A detailed STAR-method answer guide: what Situation to describe, what Task to highlight, what Action demonstrates the skill, and what Result to share. Include specific tips for this role." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." },
    { "question": "...", "intention": "...", "answer": "..." }
  ],
  "skillGaps": [
    { "skill": "Specific missing skill from job description not found in resume", "severity": "high" },
    { "skill": "...", "severity": "medium" },
    { "skill": "...", "severity": "low" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "Day focus area", "tasks": ["Specific actionable task", "Another task", "Third task"] },
    { "day": 2, "focus": "...", "tasks": ["...", "...", "..."] },
    { "day": 3, "focus": "...", "tasks": ["...", "...", "..."] },
    { "day": 4, "focus": "...", "tasks": ["...", "...", "..."] },
    { "day": 5, "focus": "...", "tasks": ["...", "...", "..."] },
    { "day": 6, "focus": "...", "tasks": ["...", "...", "..."] },
    { "day": 7, "focus": "...", "tasks": ["...", "...", "..."] }
  ]
}
`

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
      console.log("  Technical questions:", parsed.technicalQuestions?.length)
      console.log("  Behavioral questions:", parsed.behavioralQuestions?.length)

      return parsed

    } catch (err: unknown) {
      const e = err as { status?: number; message?: string }
      console.log(`⚠️ Attempt ${attempt} failed:`, e?.status)

      if (e?.status === 503 && attempt < 5) {
        const wait = attempt * 4000
        console.log(`⏳ Waiting ${wait / 1000}s before retry...`)
        await new Promise(res => setTimeout(res, wait))
      } else {
        throw err
      }
    }
  }

  throw new Error("Gemini unavailable after 5 attempts. Please try again.")
}