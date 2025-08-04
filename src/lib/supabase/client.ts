"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useAuth } from "@clerk/nextjs"

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export function useSupabaseClient() {
  const { getToken } = useAuth()

  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: {
      fetch: async (url: string | URL | Request, options = {}) => {
        const clerkToken = await getToken({ template: "supabase" })

        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: clerkToken ? `Bearer ${clerkToken}` : "",
          },
        })
      },
    },
  })
}
