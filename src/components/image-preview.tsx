"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

interface ImagePreviewProps {
  fileName: string
  filePath: string
  mimeType: string
}

export function ImagePreview({ fileName, filePath, mimeType }: ImagePreviewProps) {
  const [showPreview, setShowPreview] = useState(false)

  if (!mimeType.startsWith("image/")) {
    return null
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cloud-storage-files/${filePath}`

  return (
    <div className="mt-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPreview(!showPreview)}
        className="flex items-center gap-2"
      >
        {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {showPreview ? "Hide Preview" : "Show Preview"}
      </Button>

      {showPreview && (
        <Card className="mt-2">
          <CardContent className="p-4">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={fileName}
              className="max-w-full h-auto max-h-64 rounded-md mx-auto block"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "none"
                target.nextElementSibling?.classList.remove("hidden")
              }}
            />
            <div className="hidden text-center text-sm text-gray-500 mt-2">Unable to load image preview</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
