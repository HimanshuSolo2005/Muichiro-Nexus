"use server"

import { currentUser } from "@clerk/nextjs/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache" 

/**
 * Synchronizes the Clerk user's information with the Supabase 'users' table.
 * This function should be called after a user signs in or signs up.
 */
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
    console.error(`syncClerkUserToSupabase: User ${clerkUserId} has no primary email.`)
    return { success: false, message: "User has no primary email." }
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          clerk_user_id: clerkUserId,
          email: email,
        },
        {
          onConflict: "clerk_user_id", 
          ignoreDuplicates: false,
        },
      )
      .select() 

    if (error) {
      if (error.code === '23505' && error.message.includes('users_email_key')) {
        console.warn(`Duplicate email found for ${email}. Attempting to update existing user.`, error);

        const { data: updateData, error: updateError } = await supabase
          .from("users")
          .update({ clerk_user_id: clerkUserId })
          .eq("email", email)
          .select();

        if (updateError) {
          console.error("Error updating existing user by email:", updateError);
          return { success: false, message: `Database error: ${updateError.message}` };
        }

        if (!updateData || updateData.length === 0) {
          console.error("Update by email succeeded but no data returned, or no user found for update.");
          return { success: false, message: "Failed to update existing user by email." };
        }

        console.log("Existing user updated with Clerk ID:", updateData);
        revalidatePath('/');
        return { success: true, message: "Existing user synced successfully.", user: updateData[0] };

      } else {
        console.error("Error syncing user to Supabase:", error);
        return { success: false, message: `Database error: ${error.message}` };
      }
    }

    console.log("User synced to Supabase:", data);
    revalidatePath('/');

    return { success: true, message: "User synced successfully.", user: data?.[0] };
  } catch (e) {
    console.error("Unexpected error during user sync:", e);
    return { success: false, message: "An unexpected error occurred." };
  }
}
