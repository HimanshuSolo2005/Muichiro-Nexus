/**
 * Utility functions for parsing different file types
 * Uses dynamic imports to avoid build-time issues
 */

export async function parsePdf(buffer: ArrayBuffer): Promise<string> {
  try {
    // just trying to import pdf-parse with better error handling😮‍💨
    const pdfParse = await import("pdf-parse")

    const pdfBuffer = Buffer.from(buffer)

    // parse the PDF with options to avoid file system access
    const data = await pdfParse.default(pdfBuffer, {
      max: 0, // parse all pages
      version: "v1.10.100", // specify version to avoid auto detection
    })

    return data.text || ""
  } catch (error) {
    console.error("PDF parsing error:", error)

    // If pdf-parse fails, try a fallback approach
    try {
      return await parsePdfFallback(buffer)
    } catch (fallbackError) {
      console.error("PDF fallback parsing error:", fallbackError)
      throw new Error("Failed to parse PDF file. The PDF might be corrupted or password-protected.")
    }
  }
}

async function parsePdfFallback(buffer: ArrayBuffer): Promise<string> {
  // simple fallback - just return a message indicating pdf was detected
  const decoder = new TextDecoder("utf-8", { fatal: false })
  const text = decoder.decode(buffer)

  // check if it's actually a pdf by looking for pdf header like stuff...
  if (text.startsWith("%PDF")) {
    return "PDF document detected but text extraction failed. Please try a different PDF file or convert to text format."
  }

  throw new Error("Invalid PDF format")
}

export async function parseDocx(buffer: ArrayBuffer): Promise<string> {
  try {
    const mammoth = await import("mammoth")
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
    return result.value || ""
  } catch (error) {
    console.error("DOCX parsing error:", error)
    throw new Error("Failed to parse DOCX file. The document might be corrupted or password-protected.")
  }
}

export async function parseText(buffer: ArrayBuffer): Promise<string> {
  try {
    const decoder = new TextDecoder("utf-8")
    return decoder.decode(buffer)
  } catch (error) {
    console.error("Text parsing error:", error)
    throw new Error("Failed to parse text file")
  }
}

export function getSupportedFileTypes(): string[] {
  return [
    "text/plain",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ]
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith("image/")
}

export function getFileTypeCategory(mimeType: string): "document" | "image" | "other" {
  if (isImageFile(mimeType)) return "image"
  if (
    [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ].includes(mimeType)
  ) {
    return "document"
  }
  return "other"
}
