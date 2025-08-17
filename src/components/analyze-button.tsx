"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Brain, Loader2 } from "lucide-react"
import { analyzeFile } from "@/app/actions/file"

export function AnalyzeButton({ fileId, isAnalyzed }: { fileId: string; isAnalyzed: boolean }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setAnalyzeError(null)

    try {
      const result = await analyzeFile(fileId)
      if (!result.success) {
        setAnalyzeError(result.message || "Analysis failed.")
      }
    } catch (e) {
      console.error("Analyze error:", e)
      setAnalyzeError("An unexpected error occurred during analysis.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isAnalyzed) {
    return (
      <Button variant="ghost" size="icon" title="Already analyzed" disabled>
        <Brain className="h-5 w-5 text-green-500" />
      </Button>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <Button variant="ghost" size="icon" title="Analyze with AI" onClick={handleAnalyze} disabled={isAnalyzing}>
        {isAnalyzing ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        ) : (
          <Brain className="h-5 w-5 text-blue-500" />
        )}
      </Button>
      {analyzeError && <span className="text-xs text-red-500 mt-1 max-w-20 text-center">{analyzeError}</span>}
    </div>
  )
}
