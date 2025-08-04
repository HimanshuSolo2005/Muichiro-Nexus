'use server'

import { currentUser } from "@clerk/nextjs/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"

export async function syncClerkUserToSupabase() {
    const user = await currentUser()

    if (!user) {
        console.warn("syncClerkUserToSupabase: No Clerk user found. Cannot sync.")
        return { success: false, message: "No authenticated user." }
    }
    const supabase = createServiceSupabaseClient()

    const clerkUserId = user.id
    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
        console.error(`syncClerkToSupabase: User ${clerkUserId} has no primary email.`)
        return { success: false, message: "User has no primary email." }
    }

    try {
        const {data, error} = await supabase.from("users").upsert({
            clerk_user_id: clerkUserId,
            email: email,
        },
        {
            onConflict: "clerk_user_id",
            ignoreDuplicates: false,
        },
    )
    .select()

    if(error){
        console.error("Error syncing user to Supabase:", error)
        return { success: false, message: `Datbase error: ${error.message}`}
    }

    console.log("User synced to Supabase:", data)
    return { success: true, message: "User synced to Successfully.", user: data?.[0] }

    } catch (e) {
        console.error("Unexpected error during user sync:", e)
        return {success: false, message: " An unexpected error occurred."}
    }
}