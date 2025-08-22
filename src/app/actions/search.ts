"use server"

import { currentUser } from "@clerk/nextjs/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"

export interface SearchResult {
  id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_at: string
  ai_analyzed: boolean
  ai_metadata: any
  relevanceScore: number
  matchedFields: string[]
}

export interface SearchFilters {
  fileType?: "all" | "document" | "image"
  analyzed?: "all" | "analyzed" | "unanalyzed"
  dateRange?: "all" | "today" | "week" | "month"
}

/**
 * Searches through files using AI metadata and file information
 * @param query - Search query string
 * @param filters - Optional filters to apply
 * @returns Array of matching files with relevance scores
 */
export async function searchFiles(query: string, filters: SearchFilters = {}) {
  const user = await currentUser()

  if (!user) {
    return { success: false, message: "Authentication required.", results: [] }
  }

  if (!query.trim()) {
    return { success: false, message: "Search query is required.", results: [] }
  }

  const supabase = createServiceSupabaseClient()

  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", user.id)
      .single()

    if (userError || !userData) {
      return { success: false, message: "User not found.", results: [] }
    }

    let dbQuery = supabase.from("files").select("*").eq("user_id", userData.id)

    if (filters.fileType && filters.fileType !== "all") {
      if (filters.fileType === "document") {
        dbQuery = dbQuery.in("mime_type", [
          "text/plain",
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ])
      } else if (filters.fileType === "image") {
        dbQuery = dbQuery.like("mime_type", "image/%")
      }
    }

    if (filters.analyzed && filters.analyzed !== "all") {
      dbQuery = dbQuery.eq("ai_analyzed", filters.analyzed === "analyzed")
    }

    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date()
      let dateThreshold: Date

      switch (filters.dateRange) {
        case "today":
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          dateThreshold = new Date(0)
      }

      dbQuery = dbQuery.gte("uploaded_at", dateThreshold.toISOString())
    }

    const { data: files, error: filesError } = await dbQuery.order("uploaded_at", { ascending: false })

    if (filesError) {
      console.error("Error fetching files:", filesError)
      return { success: false, message: "Error searching files.", results: [] }
    }

    if (!files || files.length === 0) {
      return { success: true, message: "No files found.", results: [] }
    }

    const searchResults: SearchResult[] = []
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(/\s+/).filter((word) => word.length > 0)

    for (const file of files) {
      let relevanceScore = 0
      const matchedFields: string[] = []

      if (file.file_name.toLowerCase().includes(queryLower)) {
        relevanceScore += 10
        matchedFields.push("filename")
      }

      if (file.ai_metadata) {
        const metadata = file.ai_metadata

        if (metadata.summary && metadata.summary.toLowerCase().includes(queryLower)) {
          relevanceScore += 8
          matchedFields.push("summary")
        }

        if (metadata.keywords && Array.isArray(metadata.keywords)) {
          for (const keyword of metadata.keywords) {
            if (keyword.toLowerCase().includes(queryLower)) {
              relevanceScore += 6
              matchedFields.push("keywords")
              break
            }
          }
        }

        if (metadata.topics && Array.isArray(metadata.topics)) {
          for (const topic of metadata.topics) {
            if (topic.toLowerCase().includes(queryLower)) {
              relevanceScore += 5
              matchedFields.push("topics")
              break
            }
          }
        }

        if (metadata.imageDetails) {
          const imageDetails = metadata.imageDetails

          if (imageDetails.mainSubjects && Array.isArray(imageDetails.mainSubjects)) {
            for (const subject of imageDetails.mainSubjects) {
              if (subject.toLowerCase().includes(queryLower)) {
                relevanceScore += 7
                matchedFields.push("subjects")
                break
              }
            }
          }

          if (imageDetails.objects && Array.isArray(imageDetails.objects)) {
            for (const object of imageDetails.objects) {
              if (object.toLowerCase().includes(queryLower)) {
                relevanceScore += 6
                matchedFields.push("objects")
                break
              }
            }
          }

          if (imageDetails.colors && Array.isArray(imageDetails.colors)) {
            for (const color of imageDetails.colors) {
              if (color.toLowerCase().includes(queryLower)) {
                relevanceScore += 4
                matchedFields.push("colors")
                break
              }
            }
          }

          if (imageDetails.text && imageDetails.text.toLowerCase().includes(queryLower)) {
            relevanceScore += 9
            matchedFields.push("image-text")
          }

          if (imageDetails.setting && imageDetails.setting.toLowerCase().includes(queryLower)) {
            relevanceScore += 3
            matchedFields.push("setting")
          }
          if (imageDetails.mood && imageDetails.mood.toLowerCase().includes(queryLower)) {
            relevanceScore += 3
            matchedFields.push("mood")
          }
        }

        if (metadata.contentType && metadata.contentType.toLowerCase().includes(queryLower)) {
          relevanceScore += 4
          matchedFields.push("content-type")
        }
      }

      let wordMatches = 0
      for (const word of queryWords) {
        const searchText = `${file.file_name} ${JSON.stringify(file.ai_metadata || {})}`.toLowerCase()
        if (searchText.includes(word)) {
          wordMatches++
        }
      }

      if (wordMatches > 1) {
        relevanceScore += wordMatches * 2
      }

      if (relevanceScore > 0) {
        searchResults.push({
          ...file,
          relevanceScore,
          matchedFields: [...new Set(matchedFields)], 
        })
      }
    }

    searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore)

    return {
      success: true,
      message: `Found ${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`,
      results: searchResults,
    }
  } catch (e) {
    console.error("Unexpected error during search:", e)
    return { success: false, message: "An unexpected error occurred during search.", results: [] }
  }
}
