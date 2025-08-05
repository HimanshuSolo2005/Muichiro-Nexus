"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { uploadFile } from "@/app/actions/file"
import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Uploading..." : "Upload File"}
    </Button>
  )
}

export function FileUploadForm() {
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setMessage(null)
    setIsError(false)

    const result = await uploadFile(formData)

    if (result.success) {
      setMessage(result.message)
      setIsError(false)
      const fileInput = document.getElementById("file-input") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } else {
      setMessage(result.message)
      setIsError(true)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload Your Files</CardTitle>
        <CardDescription>Select a file to upload to Muichiro's Nexus Storage.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="file-input">File</Label>
            <Input id="file-input" name="file" type="file" required />
          </div>
          <SubmitButton />
          {message && <p className={`text-sm text-center ${isError ? "text-red-500" : "text-green-500"}`}>{message}</p>}
        </form>
      </CardContent>
    </Card>
  )
}