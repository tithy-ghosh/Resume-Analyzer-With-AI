export type HomeFeatureIcon = "score" | "questions" | "resume"

export type HomeFeature = {
  title: string
  description: string
  icon: HomeFeatureIcon
}

export type HomeStep = {
  number: string
  title: string
  description: string
}

export type HomePageContent = {
  brand: string
  hero: {
    eyebrow: string
    title: string
    emphasis: string
    description: string
  }
  features: HomeFeature[]
  steps: HomeStep[]
  cta: {
    title: string
    emphasis: string
    description: string
  }
  footer: string
}

export function getHomePageContent(): HomePageContent {
  return {
    brand: "rezume.ai",
    hero: {
      eyebrow: "AI-powered interview prep",
      title: "Land your dream",
      emphasis: "job faster.",
      description:
        "Upload your resume, paste a job description, and get a match score, interview questions, skill gaps, and an ATS-optimized resume.",
    },
    features: [
      {
        title: "Match score",
        description: "See how well your profile matches the role, scored against the job description.",
        icon: "score",
      },
      {
        title: "Interview questions",
        description: "Get technical and behavioral questions tailored to the exact job.",
        icon: "questions",
      },
      {
        title: "ATS resume",
        description: "Generate a cleaner resume version with job-specific keywords.",
        icon: "resume",
      },
    ],
    steps: [
      { number: "01", title: "Upload resume", description: "Drop your PDF resume" },
      { number: "02", title: "Paste job description", description: "Any job from any site" },
      { number: "03", title: "Get your report", description: "Score, questions, gaps" },
      { number: "04", title: "Download resume", description: "ATS-ready export" },
    ],
    cta: {
      title: "Ready to ace your",
      emphasis: "next interview?",
      description: "Free to use. No credit card required.",
    },
    footer: "Built with Next.js and Gemini AI.",
  }
}
