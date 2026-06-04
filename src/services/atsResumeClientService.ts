type JsPdfConstructor = new (options: {
  orientation: "portrait"
  unit: "mm"
  format: "a4"
}) => {
  internal: {
    pageSize: {
      getWidth: () => number
      getHeight: () => number
    }
  }
  setFont: (fontName: string, fontStyle: string) => void
  setFontSize: (size: number) => void
  setTextColor: (...color: number[]) => void
  text: (text: string | string[], x: number, y: number) => void
  setDrawColor: (...color: number[]) => void
  line: (x1: number, y1: number, x2: number, y2: number) => void
  splitTextToSize: (text: string, maxWidth: number) => string[]
  addPage: () => void
  save: (filename: string) => void
}

type WindowWithJsPdf = Window & {
  jspdf?: {
    jsPDF: JsPdfConstructor
  }
}

export async function generateAtsResume(reportId: string): Promise<string> {
  const response = await fetch("/api/ats-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message ?? "Could not generate ATS resume")
  }

  return data.atsResume ?? ""
}

export async function copyText(value: string) {
  await navigator.clipboard.writeText(value)
}

export function downloadTextFile(value: string, filename = "ats-resume.txt") {
  const blob = new Blob([value], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadResumePdf(resume: string) {
  const { jsPDF } = (window as WindowWithJsPdf).jspdf ?? {}

  if (!jsPDF) {
    downloadTextFile(resume)
    return
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const maxWidth = pageWidth - margin * 2
  const lineHeight = 6
  let y = margin

  for (const line of resume.split("\n")) {
    const trimmed = line.trim()
    const isSectionHeading =
      trimmed &&
      trimmed === trimmed.toUpperCase() &&
      trimmed.length > 2 &&
      !trimmed.includes("@") &&
      !trimmed.match(/^\d/)

    if (isSectionHeading) {
      if (y > margin + 10) y += 4
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(26, 26, 26)
      doc.text(trimmed, margin, y)
      y += 2
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageWidth - margin, y)
      y += lineHeight
      continue
    }

    if (trimmed === "") {
      y += 3
      continue
    }

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)
    doc.setTextColor(60, 60, 60)

    for (const wrappedLine of doc.splitTextToSize(trimmed, maxWidth)) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage()
        y = margin
      }

      doc.text(wrappedLine, margin, y)
      y += lineHeight
    }
  }

  doc.save("ats-resume.pdf")
}
