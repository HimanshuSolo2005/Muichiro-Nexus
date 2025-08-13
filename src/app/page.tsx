import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Search, Shield, Zap, Settings } from 'lucide-react'
import { LoginButton } from "@/components/auth/login-button"
import { currentUser } from "@clerk/nextjs/server"
import Link from "next/link"
import { FileUploadForm } from "@/components/file-upload-form"
import { createServiceSupabaseClient } from "@/lib/supabase/server" 
import { DownloadButton } from "@/components/download-button"
import { DeleteButton } from "@/components/delete-button" 
import { syncClerkUserToSupabase } from "./actions/users"
import { redirect } from "next/navigation"
import { SemanticSearch } from "@/components/semantic-search"

export default async function Home() {
  const user = await currentUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-100">
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cloud className="h-8 w-8 text-sky-500" />
              <a href="/" className="text-2xl font-bold text-blue-600">
                Muichiro-Nexus
              </a>
            </div>
            <LoginButton />
          </nav>
        </header>
        <main className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Store Here, Access Anywhere <span className="text-cyan-500">Powered by Tokito-AI</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Store, organize, and find your files instantly with this intelligent cloud storage platform. Access
              everything from anywhere using just your Gmail account.
              <br />
              <span className="text-cyan-400 font-bold">[Mist Breathing 5th Form]</span>
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/sign-up" passHref>
                <Button variant="default" size="lg" className="text-lg px-8 py-3 cursor-pointer">
                  Get Started Here..
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 cursor-pointer bg-transparent">
                Slay More
              </Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-16">
            <Card className="text-center hover:bg-gray-50">
              <CardHeader>
                <Cloud className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
                <CardTitle>Cloud Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Secure file storage accessible from anywhere in the world</CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center hover:bg-gray-50">
              <CardHeader>
                <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <CardTitle>AI-Powered</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Smart categorization and content analysis for all your files</CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center hover:bg-gray-50">
              <CardHeader>
                <Search className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Smart Search</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find files by content, not just names. Search inside documents and images
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center hover:bg-gray-50">
              <CardHeader>
                <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Secure Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Gmail-based authentication with enterprise-grade security</CardDescription>
              </CardContent>
            </Card>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-700 mb-2">1GB</div>
                <div className="text-sm text-gray-600">Free Storage</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-700 mb-2">AI-Powered</div>
                <div className="text-gray-600">Smart Organization</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-700 mb-2">Anywhere</div>
                <div className="text-sm text-gray-600">Access Your Files</div>
              </div>
            </div>
          </div>
        </main>
        <footer className="bg-gray-50 py-8">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>&copy; 2025 Muichiro Nexus - Mist Breathing </p>
          </div>
        </footer>
      </div>
    )
  }

  // Use the service role client for fetching files as well, to bypass RLS, it is creating really a issue, huh!!!
  const supabase = createServiceSupabaseClient()

  let supabaseUserId: string | null = null;

  const { data: userData, error: userFetchError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", user.id)
    .maybeSingle() 

  if (!userData) {
    console.warn("User not found in Supabase, attempting to sync:", userFetchError);

    const syncResult = await syncClerkUserToSupabase();

    if (syncResult.success && syncResult.user?.id) {
      console.log("User synced successfully, redirecting to refresh page.");
     
      redirect("/"); 
    } else {
      console.error("Failed to sync user to Supabase:", syncResult.message);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">Failed to sync user data. Please try again or contact support.</p>
            <p className="text-sm text-gray-500 mt-2">
              {syncResult.message ? `(Error: ${syncResult.message})` : ""}
            </p>
          </div>
        </div>
      );
    }
  } else {
    supabaseUserId = userData.id;
  }

 
  if (!supabaseUserId) {
    console.error("Supabase user ID is null after sync attempt. This should not happen.");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">An unexpected error occurred. User ID not available.</p>
      </div>
    );
  }

  const { data: files, error: filesError } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", supabaseUserId)
    .order("uploaded_at", { ascending: false }) 

  if (filesError) {
    console.error("Error fetching files:", filesError)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error loading your files. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cloud className="h-8 w-8 text-sky-500" />
              <span className="text-2xl font-bold text-blue-600">Muichiro-Nexus</span>
            </div>
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.fullName || user.emailAddresses[0]?.emailAddress || "there"}! 👋
          </h1>
          <p className="text-gray-600">
            Your personal cloud storage dashboard is ready. Start uploading and organizing your files.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:col-span-4 gap-6 mb-8">
          <Card className="col-span-full md:col-span-2 lg:col-span-2">
            <FileUploadForm />
          </Card>

          {/* File List Section */}
          <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>Manage your Files-Breathing here.</CardDescription>
          </CardHeader>
          <CardContent>
            {files && files.length > 0 ? (
              <ul className="space-y-4">
                {files.map((file) => (
                  <li key={file.id} className="p-4 border rounded-lg bg-white shadow-sm flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-semibold truncate">{file.file_name}</p>
                      <p className="text-sm text-gray-500">Size: {(file.file_size / 1024).toFixed(2)} KB</p>
                    </div>
                    <div className="flex gap-3">
                      <DownloadButton filePath={file.file_path} />
                      <DeleteButton fileId={file.id} filePath={file.file_path} fileName={file.file_name} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No files uploaded yet. Start by uploading a file!</p>
            )}
          </CardContent>
          </Card>

          {/* Semantic Search */}
          <div className="col-span-full">
            <SemanticSearch userId={supabaseUserId} />
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-green-600" />
                Smart Search
              </CardTitle>
              <CardDescription>Find files by content, not just names.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Type a question and search your files semantically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                AI Insights
              </CardTitle>
              <CardDescription>Automatic file analysis upon upload.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Text documents are chunked and embedded for rapid discovery.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-700" />
                Manage
              </CardTitle>
              <CardDescription>Download or delete your files anytime.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Full control over your storage.</p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 Muichiro Nexus - Mist Breathing</p>
        </div>
      </footer>
    </div>
  )
}
