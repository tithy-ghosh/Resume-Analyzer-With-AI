type AnswerQuestionRequest = {
  question: string
  type: "technical" | "behavioral"
  jobDescription: string
}

type AnswerQuestionResponse = {
  answer?: string
}

export async function fetchQuestionAnswer(payload: AnswerQuestionRequest) {
  const response = await fetch("/api/answer-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Unable to generate question answer.")
  }

  const data = (await response.json()) as AnswerQuestionResponse
  return data.answer ?? ""
}
