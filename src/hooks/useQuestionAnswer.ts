/**
 * hooks/useQuestionAnswer.ts
 *
 * Manages the open/closed state and lazy AI answer fetching for a single
 * interview question accordion.
 *
 * Design decisions:
 *  - Answers are fetched on first open, not on page load — this avoids
 *    firing N parallel API calls when the page mounts and keeps costs low
 *  - Once fetched, the answer is cached in local state so re-opening the
 *    accordion doesn't trigger another API call
 *  - `fetched` is a separate flag from `answer` so we can distinguish
 *    "not fetched yet" from "fetched but empty string"
 */

"use client"

import { useState } from "react"
import { fetchQuestionAnswer } from "@/services/answerQuestionClientService"
import { useQuestionDisclosure } from "./useQuestionDisclosure"

type UseQuestionAnswerOptions = {
  question: string
  type: "technical" | "behavioral"
  jobDescription?: string
}

export function useQuestionAnswer({
  question,
  type,
  jobDescription,
}: UseQuestionAnswerOptions) {
  const disclosure = useQuestionDisclosure()
  const [answer, setAnswer] = useState("")
  const [fetched, setFetched] = useState(false)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    // Only fetch if we're opening the accordion for the first time
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
      // Show a graceful fallback rather than leaving the panel blank
      setAnswer("Could not generate an answer right now. Please try closing and reopening the question.")
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