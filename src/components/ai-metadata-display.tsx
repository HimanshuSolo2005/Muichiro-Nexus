"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Tag, FileText, Globe, Hash, ImageIcon, Palette, Eye, Camera } from "lucide-react"

interface AIMetadata {
  summary?: string
  keywords?: string[]
  contentType?: string
  language?: string
  wordCount?: number
  topics?: string[]
  analyzedAt?: string
  imageDetails?: {
    mainSubjects?: string[]
    colors?: string[]
    setting?: string
    mood?: string
    objects?: string[]
  }
  technicalDetails?: {
    quality?: string
    lighting?: string
    composition?: string
  }
}

export function AIMetadataDisplay({ metadata }: { metadata: AIMetadata }) {
  if (!metadata) return null

  const isImageAnalysis = metadata.imageDetails || metadata.technicalDetails

  return (
    <Card className="mt-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4 text-blue-500" />
          {isImageAnalysis ? "AI Vision Analysis" : "AI Analysis"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metadata.summary && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              {isImageAnalysis ? (
                <Eye className="h-3 w-3 text-gray-500" />
              ) : (
                <FileText className="h-3 w-3 text-gray-500" />
              )}
              <span className="text-xs font-medium text-gray-700">
                {isImageAnalysis ? "Visual Description" : "Summary"}
              </span>
            </div>
            <p className="text-sm text-gray-600">{metadata.summary}</p>
          </div>
        )}

        {metadata.keywords && metadata.keywords.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Tag className="h-3 w-3 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {metadata.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {metadata.imageDetails && (
          <div className="space-y-2">
            {metadata.imageDetails.mainSubjects && metadata.imageDetails.mainSubjects.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Camera className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-700">Main Subjects</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {metadata.imageDetails.mainSubjects.map((subject, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {metadata.imageDetails.colors && metadata.imageDetails.colors.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Palette className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-700">Dominant Colors</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {metadata.imageDetails.colors.map((color, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {metadata.imageDetails.objects && metadata.imageDetails.objects.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <ImageIcon className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-700">Objects Detected</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {metadata.imageDetails.objects.map((object, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {object}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          {metadata.contentType && (
            <div className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              <span className="capitalize">{metadata.contentType}</span>
            </div>
          )}
          {metadata.language && (
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span className="capitalize">{metadata.language}</span>
            </div>
          )}
          {metadata.wordCount && <span>{metadata.wordCount.toLocaleString()} words</span>}
          {metadata.imageDetails?.setting && (
            <span className="capitalize">{metadata.imageDetails.setting} setting</span>
          )}
          {metadata.imageDetails?.mood && <span className="capitalize">{metadata.imageDetails.mood} mood</span>}
        </div>

        {metadata.technicalDetails && (
          <div className="border-t pt-2 mt-2">
            <span className="text-xs font-medium text-gray-700">Technical Details: </span>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-1">
              {metadata.technicalDetails.quality && <span>Quality: {metadata.technicalDetails.quality}</span>}
              {metadata.technicalDetails.lighting && <span>Lighting: {metadata.technicalDetails.lighting}</span>}
              {metadata.technicalDetails.composition && <span>Format: {metadata.technicalDetails.composition}</span>}
            </div>
          </div>
        )}

        {metadata.topics && metadata.topics.length > 0 && (
          <div>
            <span className="text-xs font-medium text-gray-700">Topics: </span>
            <span className="text-xs text-gray-600">{metadata.topics.join(", ")}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
