"use server"

import { currentUser } from "@clerk/nextjs/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server" 
import { v4 as uuidv4 } from "uuid" // 
import { revalidatePath } from "next/cache" 
import { processFileAI } from "./ai"

/**
 * Handles file upload to Supabase Storage and records metadata in the database.
 * @param formData - FormData containing the file to upload.
 * @returns An object indicating success or failure, and a message.
 */
export async function uploadFile(formData: FormData) {
  const user = await currentUser()

  if (!user) {
    return { success: false, message: "Authentication required." }
  }

  const file = formData.get("file") as File

  if (!file || file.size === 0) {
    return { success: false, message: "No file provided or file is empty." }
  }

  // Use the service role client to bypass RLS for this project's scope
  const supabase = createServiceSupabaseClient()

  // Get the user's UUID from the Supabase 'users' table This is crucial because Supabase RLS uses the UUID from its own auth.uid() which we've now mapped to the Clerk user ID in the 'users' table.
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", user.id)
    .single()

  if (userError || !userData) {
    console.error("Error fetching user ID from Supabase:", userError)
    return { success: false, message: "Could not find user in database." }
  }

  const supabaseUserId = userData.id

  // Generate a unique file name to prevent Intersections...
  const fileExtension = file.name.split(".").pop()
  const uniqueFileName = `${uuidv4()}.${fileExtension}`
  // Define the path in Supabase Storage: user_id/unique_file_name
  const filePath = `${supabaseUserId}/${uniqueFileName}` // Use Supabase user ID for folder

  try {
    // 1. Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("cloud-storage-files") 
      .upload(filePath, file, {
        cacheControl: "3600", // Cache for 1 hour
        upsert: false, // Do not overwrite existing files with the same path
      })

    if (uploadError) {
      console.error("Error uploading file to Supabase Storage:", uploadError)
      return { success: false, message: `File upload failed: ${uploadError.message}` }
    }

    // 2. Record file metadata in the public.files table and get inserted row
    const { data: fileMetadata, error: insertError } = await supabase
      .from("files")
      .insert({
        user_id: supabaseUserId, 
        file_name: file.name, 
        file_path: filePath, 
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single()

    if (insertError || !fileMetadata) {
      console.error("Error inserting file metadata:", insertError)
      await supabase.storage.from("cloud-storage-files").remove([filePath])
      return { success: false, message: `Failed to record file metadata: ${insertError?.message}` }
    }

    // 3. AI processing (best-effort)
    try {
      await processFileAI({
        fileId: fileMetadata.id,
        userId: supabaseUserId,
        filePath,
        mimeType: file.type,
      })
    } catch (aiError) {
      console.warn("AI processing failed (non-blocking)", aiError)
    }

    console.log("File uploaded and metadata recorded successfully:", fileMetadata)
    revalidatePath('/') 
    return { success: true, message: "File uploaded successfully!" }
  } catch (e) {
    console.error("Unexpected error during file upload:", e)
    return { success: false, message: "An unexpected error occurred during file upload." }
  }
}

/**
 * Generates a public download URL for a given file path.
 * @param filePath - The path of the file in Supabase Storage.
 * @returns An object with success status, message, and the download URL.
 */
export async function getDownloadUrl(filePath: string) {
  const user = await currentUser()

  if (!user) {
    return { success: false, message: "Authentication required." }
  }

  // Use the service role client to bypass RLS for this project's scope
  const supabase = createServiceSupabaseClient()

  try {
    const { data } = supabase.storage.from("cloud-storage-files").getPublicUrl(filePath)

    if (!data?.publicUrl) {
      return { success: false, message: "Could not generate public URL for file." }
    }

    return { success: true, message: "Download URL generated.", url: data.publicUrl }
  } catch (e) {
    console.error("Error generating download URL:", e)
    return { success: false, message: "An unexpected error occurred while generating download URL." }
  }
}

/**
 * Deletes a file from Supabase Storage and its metadata from the database.
 * @param fileId - The ID of the file in the public.files table.
 * @param filePath - The path of the file in Supabase Storage.
 * @returns An object indicating success or failure, and a message.
 */
export async function deleteFile(fileId: string, filePath: string) {
  const user = await currentUser()

  if (!user) {
    return { success: false, message: "Authentication required." }
  }

  // Use the service role client to bypass RLS for my project...
  const supabase = createServiceSupabaseClient()

  try {
    // 1. Delete the file from Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("cloud-storage-files")
      .remove([filePath])

    if (storageError) {
      console.error("Error deleting file from Supabase Storage:", storageError)
      return { success: false, message: `File deletion from storage failed: ${storageError.message}` }
    }

    // 2. Delete the file metadata from the public.files table
    const { error: dbError } = await supabase
      .from("files")
      .delete()
      .eq("id", fileId)

    if (dbError) {
      console.error("Error deleting file metadata from database:", dbError)
      // IMPORTANT: If DB deletion fails, you might want to log this and have a cleanup stuff, as the file is already gone from storage.
      return { success: false, message: `File metadata deletion failed: ${dbError.message}` }
    }

    console.log(`File ${fileId} and its metadata deleted successfully.`)
    revalidatePath('/') 
    return { success: true, message: "File deleted successfully!" }
  } catch (e) {
    console.error("Unexpected error during file deletion:", e)
    return { success: false, message: "An unexpected error occurred during file deletion." }
  }
}
