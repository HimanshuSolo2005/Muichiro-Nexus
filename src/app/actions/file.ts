"use server"

import { currentUser } from "@clerk/nextjs/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

/**
 * Handles file upload to Supabase Storage and records metadata in the database.
 * @param formData - FormData containing the file to upload.
 * @returns An object indicating success or failure, and a message.
 */

export async function uploadFile(formData: FormData){
    const user = await currentUser()

    if(!user){
        return {success: false, message: "Authentication Required."}
    }

    const file = formData.get("file") as File

    if(!file || file.size == 0){
        return {success: false, message: "No file provided or file is empty."}
    }

    const supabase = createServiceSupabaseClient()

    const {data: userData, error: userError} = await supabase.from("users").select("id").eq("clerk_user_id", user.id).single()

    if(userError || !userData){
        console.error("Error fetching user ID from Supabase:", userError)
        return {success: false, message: "Could not find user in database."}
    }

    const supabaseUserId = userData.id


}