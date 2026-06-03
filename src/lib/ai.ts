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

type InterviewQuestion = { question: string; intention: string; answer: string }

function fallbackQuestions(jobDescription: string, type: "technical" | "behavioral"): InterviewQuestion[] {
  const normalized = jobDescription.toLowerCase()
  const technicalTopics = [
    ["react", "React state, hooks, component boundaries, performance, and accessibility"],
    ["next", "Next.js routing, server/client rendering, caching, and API routes"],
    ["node", "Node.js API structure, async behavior, validation, and error handling"],
    ["mongodb", "MongoDB schema design, indexing, aggregation, and data consistency"],
    ["sql", "SQL data modeling, indexing, joins, transactions, and query performance"],
    ["python", "Python service design, testing, package choices, and data processing"],
    ["aws", "AWS deployment, security, monitoring, scaling, and cost control"],
    ["docker", "Docker image design, environments, local development, and deployment"],
    ["api", "API contracts, authentication, authorization, rate limits, and observability"],
    ["test", "testing strategy, edge cases, integration tests, and CI feedback"],
    ["security", "security risks, data protection, input validation, and least privilege"],
    ["performance", "performance bottlenecks, measurement, caching, and profiling"],
  ]

  if (type === "technical") {
    const matched = technicalTopics
      .filter(([keyword]) => normalized.includes(keyword))
      .map(([, topic]) => topic)
    const topics = Array.from(new Set([
      ...matched,
      ...technicalTopics.map(([, topic]) => topic),
    ]))

    return topics.map((topic) => ({
      question: `How would you handle ${topic} for this role?`,
      intention: "The interviewer is testing whether you can translate the job description into practical engineering decisions.",
      answer: "Start with the business goal and constraints, explain your technical approach, name tradeoffs, and describe how you would test, monitor, and improve the solution. Tie your answer to a real project whenever possible.",
    }))
  }

  return [
    ["Tell me about a time you owned a difficult delivery from ambiguity to release.", "ownership, prioritization, and communication"],
    ["Describe a time you had to learn a job-critical tool or domain quickly.", "learning speed and adaptability"],
    ["Give an example of handling disagreement during a technical or product decision.", "collaboration and judgment"],
    ["Tell me about a mistake or production issue you helped fix.", "accountability and debugging habits"],
    ["How do you prioritize when several urgent tasks compete for your attention?", "tradeoff thinking and stakeholder communication"],
    ["Tell me about a time you improved quality, reliability, or maintainability.", "long-term engineering standards"],
    ["Describe a time expectations changed late in a project.", "adaptability and expectation management"],
    ["What feedback has most improved your work?", "coachability and self-awareness"],
    ["Tell me about a time you helped another person succeed.", "mentorship and team contribution"],
    ["How do you handle feedback when you disagree with it at first?", "maturity and openness"],
  ].map(([question, trait]) => ({
    question,
    intention: `The interviewer is evaluating ${trait} for the responsibilities in this job description.`,
    answer: "Use STAR: describe a specific Situation, your Task, the Actions you personally took, and a concrete Result. Keep the story relevant to this role and include what you learned.",
  }))
}

function ensureMinimumQuestions(
  questions: InterviewQuestion[] | undefined,
  jobDescription: string,
  type: "technical" | "behavioral",
  minimum: number
) {
  const existing = (questions ?? []).filter((question) => question.question)
  const seen = new Set(existing.map((question) => question.question.toLowerCase()))
  const additions = fallbackQuestions(jobDescription, type).filter((question) => !seen.has(question.question.toLowerCase()))

  return [...existing, ...additions].slice(0, Math.max(minimum, existing.length))
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

Return this exact JSON structure. IMPORTANT: You must return AT LEAST 12 technical questions and 10 behavioral questions. Make the questions highly specific to the job description's tech stack, responsibilities, and requirements. Every question must include a useful answer guide so the user knows exactly how to answer.

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
      parsed.technicalQuestions = ensureMinimumQuestions(parsed.technicalQuestions, jobDescription, "technical", 12)
      parsed.behavioralQuestions = ensureMinimumQuestions(parsed.behavioralQuestions, jobDescription, "behavioral", 10)

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
