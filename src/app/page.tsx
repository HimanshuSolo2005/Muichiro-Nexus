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
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>Manage your Files-Breathing here.</CardDescription>
          </CardHeader>
          <CardContent>
            {files && files.length > 0 ? (
              <div className="grid gap-4">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex flex-col">
                      <span className="font-medium">{file.file_name}</span>
                      <span className="text-sm text-gray-500">
                        {(file.file_size / 1024 / 1024).toFixed(2)} MB -{" "}
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <DownloadButton filePath={file.file_path} />
                      <DeleteButton fileId={file.id} filePath={file.file_path} fileName={file.file_name} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No files uploaded yet. Start File-Breathing Now</p>
            )}
          </CardContent>
        </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Search className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Smart Search</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">Find files using AI-powered content search</CardDescription>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Cloud className="h-12 w-12 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">My Files</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">Browse and manage all your stored files</CardDescription>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Settings className="h-12 w-12 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">Manage your account and storage preferences</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Storage Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Storage Overview</CardTitle>
            <CardDescription>Your current storage usage and limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">0 MB</div>
                <div className="text-sm text-gray-600">Used</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">1 GB</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{files?.length || 0}</div>
                <div className="text-sm text-gray-600">Files</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "0%" }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">0% of storage used</p>
            </div>
          </CardContent>
        </Card>


        
      </main>
    </div>
  )
}
