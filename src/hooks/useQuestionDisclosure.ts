"use client"

import { useState } from "react"

export function useQuestionDisclosure() {
  const [open, setOpen] = useState(false)

  return {
    open,
    toggle: () => setOpen((current) => !current),
  }
}
