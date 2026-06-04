type AnalyzeInput = {
  resume: File
  jobDescription: string
  selfDescription: string
}

export async function createInterviewReport(input: AnalyzeInput): Promise<string> {
  const formData = new FormData()
  formData.append("resume", input.resume)
  formData.append("jobDescription", input.jobDescription)
  formData.append("selfDescription", input.selfDescription)

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message ?? "Something went wrong")
  }

  if (!data.reportId) {
    throw new Error("Report ID missing from response")
  }

  return data.reportId
}
