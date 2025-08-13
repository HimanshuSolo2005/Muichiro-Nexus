"use server"

import { createServiceSupabaseClient } from "@/lib/supabase/server"
import { embedTexts } from "@/lib/embeddings"

function sanitizeText(input: string): string {
  return input.replace(/\u0000/g, " ").trim()
}

function chunkText(
  text: string,
  options: { chunkSizeChars?: number; overlapChars?: number } = {},
): string[] {
  const chunkSize = options.chunkSizeChars ?? 1500
  const overlap = options.overlapChars ?? 200

  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const slice = text.slice(start, end)
    chunks.push(slice)
    if (end === text.length) break
    start = end - overlap
    if (start < 0) start = 0
  }

  return chunks
}

async function downloadTextFromStorage(
  bucket: string,
  path: string,
  mimeType: string,
): Promise<string | null> {
  const supabase = createServiceSupabaseClient()
  const { data, error } = await supabase.storage.from(bucket).download(path)
  if (error || !data) {
    console.error("AI: Failed to download file for processing", error)
    return null
  }

  try {
    if (
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/xml" ||
      mimeType === "text/markdown"
    ) {
      const text = await data.text()
      return sanitizeText(text)
    }

    // Basic fallback: try to read as text anyway
    const fallback = await data.text()
    return sanitizeText(fallback)
  } catch (e) {
    console.warn("AI: Unable to interpret file as text for embedding", e)
    return null
  }
}

export async function processFileAI(params: {
  fileId: string
  userId: string
  filePath: string
  mimeType: string
}) {
  const { fileId, userId, filePath, mimeType } = params

  const text = await downloadTextFromStorage("cloud-storage-files", filePath, mimeType)
  if (!text || text.length === 0) {
    console.info("AI: Skipping embedding; no textual content extracted")
    return { success: false, message: "No textual content to embed" }
  }

  const chunks = chunkText(text)
  if (chunks.length === 0) {
    return { success: false, message: "No chunks generated" }
  }

  const embeddings = await embedTexts(chunks)

  const rows = chunks.map((content, index) => ({
    user_id: userId,
    file_id: fileId,
    file_path: filePath,
    chunk_index: index,
    content,
    embedding: embeddings[index] as number[],
  }))

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase.from("file_chunks").insert(rows)
  if (error) {
    console.error("AI: Failed to insert embeddings into file_chunks", error)
    return { success: false, message: `Embedding insert failed: ${error.message}` }
  }

  return { success: true, message: "Embeddings created" }
}