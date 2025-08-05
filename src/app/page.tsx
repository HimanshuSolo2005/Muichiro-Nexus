"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Search, Shield, Zap, Upload, Settings } from "lucide-react"
import { LoginButton } from "@/components/auth/login-button"
import { useUser } from "@clerk/nextjs"
import { useEffect } from "react" 
import { syncClerkUserToSupabase } from "./actions/users"
import Link from "next/link" 

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser()


  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      syncClerkUserToSupabase()
    }
  }, [isLoaded, isSignedIn, user]) 

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Wait, Breathing...</p>
        </div>
      </div>
    )
  }


  if (!isSignedIn) {
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
                {" "}
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
                <div className="text-gray-600">Free Storage</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-700 mb-2">AI-Powered</div>
                <div className="text-gray-600">Smart Organization</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-700 mb-2">Anywhere</div>
                <div className="text-gray-600">Access Your Files</div>
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

  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.fullName || user.emailAddresses[0]?.emailAddress || "there"}! 👋
          </h1>
          <p className="text-gray-600">
            Your personal cloud storage dashboard is ready. Start uploading and organizing your files.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Upload className="h-12 w-12 text-sky-500 mx-auto mb-2" /> 
              <CardTitle className="text-lg">Upload Files</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">Drag and drop or browse to upload your files</CardDescription>
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

        <Card>
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
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">1 GB</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">0</div>
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
