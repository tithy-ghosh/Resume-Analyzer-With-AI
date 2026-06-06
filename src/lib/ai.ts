/**
 * lib/ai.ts
 *
 * Server-side Gemini AI client for generating interview reports.
 *
 * Flow:
 *  1. Build a prompt from the candidate's resume, self-description, and job description
 *  2. Ask Gemini 2.5 Flash to return structured JSON
 *  3. Parse and validate the response
 *  4. If Gemini returns fewer questions than we need, fill the gaps with
 *     sensible fallbacks so the user always gets a complete report
 *
 * Retry logic: Gemini occasionally returns 503 (overloaded). We retry up to
 * MAX_ATTEMPTS times with exponential back-off before giving up.
 */

import { GoogleGenAI } from "@google/genai"
import { logger } from "./logger"

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! })

// How many times to retry a Gemini 503 before surfacing the error to the user
const MAX_ATTEMPTS = 5

// Minimum question counts — report pages always have enough content to be useful
const MIN_TECHNICAL_QUESTIONS = 12
const MIN_BEHAVIORAL_QUESTIONS = 10

// ─── Types ────────────────────────────────────────────────────────────────────

export type InterviewQuestion = {
  question: string
  intention: string
  answer: string
}

export type SkillGap = {
  skill: string
  severity: "low" | "medium" | "high"
}

export type PreparationDay = {
  day: number
  focus: string
  tasks: string[]
}

export type InterviewReportResult = {
  title: string
  matchScore: number
  technicalQuestions: InterviewQuestion[]
  behavioralQuestions: InterviewQuestion[]
  skillGaps: SkillGap[]
  preparationPlan: PreparationDay[]
}

// ─── Fallback questions ───────────────────────────────────────────────────────

/**
 * Returns job-description-aware fallback questions when Gemini returns
 * fewer questions than the minimum. We scan the JD for known tech keywords
 * and surface the most relevant ones first.
 */
function buildFallbackQuestions(
  jobDescription: string,
  type: "technical" | "behavioral"
): InterviewQuestion[] {
  const jd = jobDescription.toLowerCase()

  if (type === "behavioral") {
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
        "Use the STAR method: describe a specific Situation, your Task, the Actions you personally took, and a concrete Result. Keep the story tied to this role and include what you learned.",
    }))
  }

  // Technical fallbacks — match against common tech keywords in the JD
  const topicMap: [string, string][] = [
    ["react", "React state, hooks, component boundaries, performance, and accessibility"],
    ["next", "Next.js routing, server vs client rendering, caching, and API routes"],
    ["node", "Node.js API design, async behavior, input validation, and error handling"],
    ["mongodb", "MongoDB schema design, indexing, aggregation, and data consistency"],
    ["sql", "SQL modeling, indexing, joins, transactions, and query performance"],
    ["python", "Python service design, testing, package choices, and data processing"],
    ["aws", "AWS deployment, security, monitoring, scaling, and cost control"],
    ["docker", "Docker image design, local development parity, and deployment pipelines"],
    ["api", "API contracts, authentication, rate limiting, and observability"],
    ["test", "Testing strategy, edge cases, integration tests, and CI feedback loops"],
    ["security", "Security risks, input validation, data protection, and least-privilege access"],
    ["performance", "Performance bottlenecks, measurement, caching, and profiling techniques"],
  ]

  const matchedTopics = topicMap
    .filter(([keyword]) => jd.includes(keyword))
    .map(([, topic]) => topic)

  // Put matched topics first, then fill with the rest
  const allTopics = Array.from(
    new Set([...matchedTopics, ...topicMap.map(([, topic]) => topic)])
  )

  return allTopics.map((topic) => ({
    question: `How would you approach ${topic} in this role?`,
    intention:
      "The interviewer is checking whether you can translate the job description's requirements into practical engineering decisions.",
    answer:
      "Start with the business goal and constraints, explain your technical approach, name the tradeoffs, and describe how you would test or monitor the solution. Tie your answer to a real project whenever possible.",
  }))
}

/**
 * Ensures a question array meets the minimum count.
 * Existing questions from Gemini are kept as-is; fallbacks are appended
 * only to fill the gap, and duplicates are filtered out by question text.
 */
function padQuestionsToMinimum(
  geminiQuestions: InterviewQuestion[] | undefined,
  jobDescription: string,
  type: "technical" | "behavioral",
  minimum: number
): InterviewQuestion[] {
  const existing = (geminiQuestions ?? []).filter((q) => q.question?.trim())
  const existingSet = new Set(existing.map((q) => q.question.toLowerCase()))

  const fallbacks = buildFallbackQuestions(jobDescription, type).filter(
    (q) => !existingSet.has(q.question.toLowerCase())
  )

  // Keep all Gemini questions, append fallbacks only up to the minimum
  return [...existing, ...fallbacks].slice(0, Math.max(minimum, existing.length))
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

/**
 * Builds the structured prompt we send to Gemini.
 * We truncate resume and JD text to stay within the model's context window
 * while keeping the most relevant content at the top.
 */
function buildReportPrompt({
  resume,
  selfDescription,
  jobDescription,
}: {
  resume: string
  selfDescription: string
  jobDescription: string
}): string {
  return `
You are an expert career coach and technical interviewer.

Analyze the candidate's resume against the job description and return a JSON object ONLY.
No explanation, no markdown code fences — just raw JSON.

Resume:
${resume.slice(0, 3000)}

Candidate's self-description:
${selfDescription}

Job description:
${jobDescription.slice(0, 2000)}

Return this exact JSON shape. Requirements:
- At least 12 technical questions, highly specific to the job's tech stack and responsibilities
- At least 10 behavioral questions relevant to the role and team context
- Every question must include a detailed "answer" field (3–5 sentences) so the candidate knows exactly how to respond
- skillGaps should only list skills explicitly mentioned in the JD but absent from the resume

{
  "title": "exact job title from the job description",
  "matchScore": 72,
  "technicalQuestions": [
    {
      "question": "Specific technical question based on the job's tech stack",
      "intention": "What the interviewer is testing for",
      "answer": "A detailed answer guide: what to cover, which concepts to mention, what tradeoffs to discuss, and any common mistakes to avoid"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "Behavioral question relevant to the role",
      "intention": "What trait or experience the interviewer is evaluating",
      "answer": "A STAR-method answer guide with specific Situation, Task, Action, and Result tips for this type of role"
    }
  ],
  "skillGaps": [
    { "skill": "Specific missing skill from the JD", "severity": "high" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "Focus area for this day", "tasks": ["Specific actionable task", "Another task", "Third task"] }
  ]
}
`
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Generates a complete interview report for a candidate.
 *
 * @param resume        - Plain text extracted from the candidate's PDF
 * @param selfDescription - Short background the candidate wrote about themselves
 * @param jobDescription  - Full job posting text
 * @returns A structured report ready to save to MongoDB
 */
export async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}: {
  resume: string
  selfDescription: string
  jobDescription: string
}): Promise<InterviewReportResult> {
  const prompt = buildReportPrompt({ resume, selfDescription, jobDescription })

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      logger.info("Gemini report attempt", { attempt })

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          // Ask for JSON directly — avoids markdown code fence noise in the response
          responseMimeType: "application/json",
        },
      })

      const rawText = response.text ?? ""
      logger.info("Gemini response received", { preview: rawText.slice(0, 300) })

      // Belt-and-suspenders: strip any accidental code fences before parsing
      const cleanJson = rawText.replace(/```json|```/g, "").trim()
      const parsed = JSON.parse(cleanJson) as InterviewReportResult

      // Guarantee minimum question counts regardless of what Gemini returned
      parsed.technicalQuestions = padQuestionsToMinimum(
        parsed.technicalQuestions,
        jobDescription,
        "technical",
        MIN_TECHNICAL_QUESTIONS
      )
      parsed.behavioralQuestions = padQuestionsToMinimum(
        parsed.behavioralQuestions,
        jobDescription,
        "behavioral",
        MIN_BEHAVIORAL_QUESTIONS
      )

      logger.info("Interview report ready", {
        title: parsed.title,
        technicalCount: parsed.technicalQuestions.length,
        behavioralCount: parsed.behavioralQuestions.length,
        skillGaps: parsed.skillGaps?.length ?? 0,
      })

      return parsed
    } catch (error: unknown) {
      const geminiError = error as { status?: number }
      logger.warn("Gemini attempt failed", { attempt, status: geminiError?.status })

      // 503 = Gemini overloaded — worth retrying with back-off
      const isOverloaded = geminiError?.status === 503
      const hasAttemptsLeft = attempt < MAX_ATTEMPTS

      if (isOverloaded && hasAttemptsLeft) {
        const waitMs = attempt * 4000 // 4s, 8s, 12s, 16s
        logger.info("Waiting before retry", { waitSeconds: waitMs / 1000 })
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        continue
      }

      throw error
    }
  }

  throw new Error("Gemini unavailable after multiple attempts. Please try again in a moment.")
}