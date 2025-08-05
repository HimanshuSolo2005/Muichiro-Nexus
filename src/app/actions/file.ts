"use server"

import { currentUser } from "@clerk/nextjs/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

/**
 * Handles file upload to Supabase Storage and records metadata in the database.
 * @param formData - FormData containing the file to upload.
 * @returns An object indicating success or failure, and a message.
 */

export async function uploadFile(formData: FormData) {
    const user = await currentUser()

    if (!user) {
        return { success: false, message: "Authentication Required." }
    }

    const file = formData.get("file") as File

    if (!file || file.size == 0) {
        return { success: false, message: "No file provided or file is empty." }
    }

    const supabase = createServiceSupabaseClient()

    const { data: userData, error: userError } = await supabase.from("users").select("id").eq("clerk_user_id", user.id).single()

    if (userError || !userData) {
        console.error("Error fetching user ID from Supabase:", userError)
        return { success: false, message: "Could not find user in database." }
    }

    const supabaseUserId = userData.id

    const fileExtension = file.name.split(".").pop()
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const filePath = `${supabaseUserId}/${uniqueFileName}`

    try {
        const { data: uploadData, error: uploadError } = await supabase.storage.from("cloud-storage-files").upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
        })

        if (uploadError) {
            console.error("Error uploading file to Storage:", uploadError)
            return { success: false, message: `Failed to upload file: ${uploadError.message}` }
        }

        const { data: fileMetadata, error: insertError } = await supabase.from("files").insert({
            user_id: supabaseUserId, 
            file_name: file.name, 
            file_path: filePath, 
            file_size: file.size,
            mime_type: file.type,
        })

        if(insertError){
            console.error("Error inserting file metadata:", insertError)
            await supabase.storage.from("cloud-storage-files").remove([filePath])
            return { success: false, message: `Failed to record file metadata: ${insertError.message}` }
        }

        console.log("File uploaded and metadata recorded successfully:", fileMetadata)
        return { success: true, message: "File uploaded and metadata recorded successfully." }

    } catch (e) {
        console.error("Unexpected error during file upload:", e)
        return { success: false, message: "An unexpected error occurred during file upload." }
    }
}