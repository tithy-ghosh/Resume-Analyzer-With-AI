"use client"

import { useMemo } from "react"
import { getHomePageContent } from "@/services/homePageService"

export function useHomePage() {
  return useMemo(() => {
    const content = getHomePageContent()

    return {
      content,
      routes: {
        home: "/",
        login: "/login",
        register: "/register",
        howItWorks: "#how-it-works",
      },
    }
  }, [])
}
