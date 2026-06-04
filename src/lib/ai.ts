import { GoogleGenAI } from "@google/genai"
import { logger } from "./logger"

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY!,
})

const MAX_ATTEMPTS = 5

export interface InterviewReportResult {
  title: string
  matchScore: number
  technicalQuestions: InterviewQuestion[]
  behavioralQuestions: InterviewQuestion[]
  skillGaps: { skill: string; severity: "low" | "medium" | "high" }[]
  preparationPlan: { day: number; focus: string; tasks: string[] }[]
}

type InterviewQuestion = {
  question: string
  intention: string
  answer: string
}

function fallbackQuestions(jobDescription: string, type: "technical" | "behavioral"): InterviewQuestion[] {
  const normalizedDescription = jobDescription.toLowerCase()
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
    const matchedTopics = technicalTopics
      .filter(([keyword]) => normalizedDescription.includes(keyword))
      .map(([, topic]) => topic)

    const topics = Array.from(new Set([...matchedTopics, ...technicalTopics.map(([, topic]) => topic)]))

    return topics.map((topic) => ({
      question: `How would you handle ${topic} for this role?`,
      intention:
        "The interviewer is testing whether you can translate the job description into practical engineering decisions.",
      answer:
        "Start with the business goal and constraints, explain your technical approach, name tradeoffs, and describe how you would test, monitor, and improve the solution. Tie your answer to a real project whenever possible.",
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
    answer:
      "Use STAR: describe a specific Situation, your Task, the Actions you personally took, and a concrete Result. Keep the story relevant to this role and include what you learned.",
  }))
}

function ensureMinimumQuestions(
  questions: InterviewQuestion[] | undefined,
  jobDescription: string,
  type: "technical" | "behavioral",
  minimum: number
) {
  const existingQuestions = (questions ?? []).filter((question) => question.question)
  const seenQuestions = new Set(existingQuestions.map((question) => question.question.toLowerCase()))
  const additions = fallbackQuestions(jobDescription, type).filter(
    (question) => !seenQuestions.has(question.question.toLowerCase())
  )

  return [...existingQuestions, ...additions].slice(0, Math.max(minimum, existingQuestions.length))
}

function buildInterviewReportPrompt({
  resume,
  selfDescription,
  jobDescription,
}: {
  resume: string
  selfDescription: string
  jobDescription: string
}) {
  return `
You are an expert career coach and technical interviewer.
Analyze this candidate's resume against the job description and return a JSON object ONLY - no explanation, no markdown, just raw JSON.

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
    { "question": "Specific technical question based on job tech stack", "intention": "What the interviewer is testing for", "answer": "A detailed 3-5 sentence answer guide explaining exactly how to answer this, what to include, what frameworks/concepts to mention, and any red flags to avoid" }
  ],
  "behavioralQuestions": [
    { "question": "Behavioral question relevant to the role and company type", "intention": "What trait or experience the interviewer is evaluating", "answer": "A detailed STAR-method answer guide with Situation, Task, Action, and Result tips for this role" }
  ],
  "skillGaps": [
    { "skill": "Specific missing skill from job description not found in resume", "severity": "high" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "Day focus area", "tasks": ["Specific actionable task", "Another task", "Third task"] }
  ]
}
`
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
  const prompt = buildInterviewReportPrompt({ resume, selfDescription, jobDescription })

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      logger.info("Gemini report attempt", { attempt })

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      })

      const text = response.text ?? ""
      logger.info("Gemini raw response preview", { preview: text.slice(0, 300) })

      const cleanResponse = text.replace(/```json/g, "").replace(/```/g, "").trim()
      const parsed = JSON.parse(cleanResponse) as InterviewReportResult

      parsed.technicalQuestions = ensureMinimumQuestions(
        parsed.technicalQuestions,
        jobDescription,
        "technical",
        12
      )
      parsed.behavioralQuestions = ensureMinimumQuestions(
        parsed.behavioralQuestions,
        jobDescription,
        "behavioral",
        10
      )

      logger.info("Gemini report generated", {
        title: parsed.title,
        technicalQuestions: parsed.technicalQuestions?.length,
        behavioralQuestions: parsed.behavioralQuestions?.length,
      })

      return parsed
    } catch (error: unknown) {
      const geminiError = error as { status?: number }
      logger.warn("Gemini report attempt failed", { attempt, status: geminiError?.status })

      if (geminiError?.status === 503 && attempt < MAX_ATTEMPTS) {
        const wait = attempt * 4000
        logger.info("Waiting before Gemini retry", { seconds: wait / 1000 })
        await new Promise((resolve) => setTimeout(resolve, wait))
        continue
      }

      throw error
    }
  }

  throw new Error("Gemini unavailable after 5 attempts. Please try again.")
}
