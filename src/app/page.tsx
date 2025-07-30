import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Search, Shield, Zap } from "lucide-react";


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via white to-cyan-100">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-700">Muichiro-Nexus</span>
          </div>
          <Button variant="outline">Sign In</Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Store Here, Access Anywhere <span className="text-cyan-600">Powered by Tokito-AI</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Store, organize, and find your files instantly with this intelligent cloud storage platform. Access
            everything from anywhere using just your Gmail account.<br />
            <span className="text-cyan-400 font-bold">[Mist Breathing 5th Form]</span>
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="default" size="lg" className="text-lg px-8 py-3">
              Get Started Here..
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Slay More
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Cloud className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
              <CardTitle>Cloud Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Secure file storage accessible from anywhere in the world</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <CardTitle>AI-Powered</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Smart categorization and content analysis for all your files</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Search className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Smart Search</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Find files by content, not just names. Search inside documents and images</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Secure Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Secure file storage accessible from anywhere in the world</CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>

  );
}
