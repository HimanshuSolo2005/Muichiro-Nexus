"use server"

import { currentUser } from "@clerk/nextjs/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"

export interface SearchFilters{
    fileType ?: "all" | "document" | "image"
    analyzed ?: "all" | "analyzed" | "unanalyzed"
    dataRange ?: "all" | "today" | "week" | "month" 
}

export async function searchFiles(query: string, filters: SearchFilters={}) {
    const user = await currentUser();

    if(!user){
        return{success : false, message : "Unauthorized User", results : []}
    }
    if(!query.trim()){
        return {success : false, message : "Must Enter the Query.."}
    }
    const supabase = createServiceSupabaseClient();
}
