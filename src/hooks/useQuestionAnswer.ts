"use client"

import { useState } from "react"
import { fetchQuestionAnswer } from "@/services/answerQuestionClientService"
import { useQuestionDisclosure } from "./useQuestionDisclosure"

type UseQuestionAnswerOptions = {
  question: string
  type: "technical" | "behavioral"
  jobDescription?: string
}

export function useQuestionAnswer({ question, type, jobDescription }: UseQuestionAnswerOptions) {
  const disclosure = useQuestionDisclosure()
  const [answer, setAnswer] = useState("")
  const [fetched, setFetched] = useState(false)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    const shouldFetch = !disclosure.open && !fetched
    disclosure.toggle()

    if (!shouldFetch) return

    setLoading(true)
    try {
      const generatedAnswer = await fetchQuestionAnswer({
        question,
        type,
        jobDescription: jobDescription ?? "",
      })
      setAnswer(generatedAnswer)
    } catch {
      setAnswer("Could not generate answer. Please try again.")
    } finally {
      setFetched(true)
      setLoading(false)
    }
  }

  return {
    answer,
    loading,
    open: disclosure.open,
    toggle,
  }
}
