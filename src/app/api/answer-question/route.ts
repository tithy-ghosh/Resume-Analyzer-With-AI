import { NextResponse } from "next/server"
import { auth } from "../../../../auth"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! })

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { question, type, jobDescription } = await request.json()

    if (!question || !type) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const isBehavioral = type === "behavioral"

    const prompt = isBehavioral
      ? `You are a senior career coach helping a candidate prepare for a job interview.

The candidate is preparing for this role:
${jobDescription ? jobDescription.slice(0, 1500) : "a software engineering role"}

Write a complete, realistic STAR-format answer for this behavioral interview question:
"${question}"

Structure it clearly with these labeled sections:
Situation: (2-3 sentences setting up a realistic scenario)
Task: (1-2 sentences describing the candidate's responsibility)
Action: (3-5 sentences describing specific actions they took — be concrete and detailed)
Result: (1-2 sentences with a measurable or meaningful outcome)

Then add a short "Key takeaway" line at the end.

Write it as a first-person answer the candidate can read, study, and adapt to their own experience. Be specific, professional, and realistic. Do NOT use generic filler. Make the scenario feel real.`
      : `You are a senior software engineer and interviewer helping a candidate prepare.

The candidate is applying for this role:
${jobDescription ? jobDescription.slice(0, 1500) : "a software engineering role"}

Write a complete, detailed technical answer for this interview question:
"${question}"

Your answer should:
- Start with a clear, direct explanation of the core concept
- Include a concrete real-world example or scenario
- Cover at least 2-3 specific implementation details, tradeoffs, or edge cases
- Mention relevant tools, patterns, or best practices
- End with how you'd validate or measure success

Write it as a first-person answer (2-4 paragraphs) the candidate can read, study, and adapt. Be specific and technical — avoid vague advice. Make it feel like what a strong engineer would actually say in an interview.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })

    const answer = response.text ?? ""

    return NextResponse.json({ answer }, { status: 200 })
  } catch (error) {
    console.error("Answer question error:", error)
    return NextResponse.json({ message: "Failed to generate answer" }, { status: 500 })
  }
}