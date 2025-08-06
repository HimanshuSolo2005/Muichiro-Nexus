"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react'
import { deleteFile } from "@/app/actions/file" 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog" 

export function DeleteButton({ fileId, filePath, fileName }: { fileId: string, filePath: string, fileName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const result = await deleteFile(fileId, filePath)
      if (!result.success) {
        setDeleteError(result.message || "Failed to delete file.")
      }
    } catch (e) {
      console.error("Delete error:", e)
      setDeleteError("An unexpected error occurred during deletion.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Delete" disabled={isDeleting}>
          {isDeleting ? (
            <span className="animate-spin">☁️</span> // Simple spinner
          ) : (
            <Trash2 className="h-5 w-5 text-red-500" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete <span className="font-bold">{fileName}</span> from your storage and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
        {deleteError && <p className="text-red-500 text-sm mt-2">{deleteError}</p>}
      </AlertDialogContent>
    </AlertDialog>
  )
}
