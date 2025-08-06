"use client" 

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import { getDownloadUrl } from "@/app/actions/file" 

export function DownloadButton({ filePath }: { filePath: string }) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadError(null)
    try {
      const result = await getDownloadUrl(filePath)
      if (result.success && result.url) {
        window.open(result.url, "_blank") 
      } else {
        setDownloadError(result.message || "Failed to get download URL.")
      }
    } catch (e) {
      console.error("Download error:", e)
      setDownloadError("An unexpected error occurred during download.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button variant="ghost" size="icon" title="Download" onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? (
        <span className="animate-spin">☁️</span> //just a simple spinner...
      ) : (
        <Download className="h-5 w-5" />
      )}
      {downloadError && <span className="sr-only text-red-500">{downloadError}</span>}
    </Button>
  )
}
