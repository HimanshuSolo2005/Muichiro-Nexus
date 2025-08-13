import { NextRequest, NextResponse } from "next/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"
import { embed } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, query, topK = 8 } = body as {
      userId: string
      query: string
      topK?: number
    }

    if (!userId || !query || typeof query !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-large"),
      value: query,
    })

    const supabase = createServiceSupabaseClient()

    const { data, error } = await supabase.rpc("match_file_chunks", {
      p_user_id: userId,
      p_query_embedding: embedding,
      p_match_count: topK,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ matches: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 })
  }
}