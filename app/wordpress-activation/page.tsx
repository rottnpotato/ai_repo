"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { WordPressAuthProvider } from "@/contexts/WordPressAuthContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AlertCircle, Loader2, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Logo } from "@/components/logo"
import { UseWordPressIntegration } from "@/contexts/WordPressIntegrationContext"
import Image from "next/image"

// Create a client component that uses useSearchParams
function WordPressActivationPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { SetIntegrationActive } = UseWordPressIntegration()
  
  const [activationToken, setActivationToken] = useState<string | null>(null)
  const [redirectBack, setRedirectBack] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("login")
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)

  useEffect(() => {
    // Extract query parameters
    const token = searchParams.get("activation_token")
    const redirect = searchParams.get("redirect_back")
    const status = searchParams.get("integration_status")
    
    if (!token) {
      setError("Missing activation token")
      return
    }
    
    setActivationToken(token)
    setRedirectBack(redirect)
    
    // Check if returning with successful integration
    if (status === "success") {
      SetIntegrationActive()
    }
  }, [searchParams, SetIntegrationActive])

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-amperly-light p-4">
        <Card className="w-full max-w-md shadow-xl border-amperly-primary-light">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <CardTitle className="text-2xl text-center font-bold">Authentication Error</CardTitle>
            <CardDescription className="text-center text-amperly-primary">
              We couldn't complete your WordPress integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <WordPressAuthProvider>
      <div className="min-h-screen flex items-center justify-center bg-gradient-amperly-light p-4">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
          <div className="hidden md:flex flex-col items-center justify-center space-y-6">
            <div className="relative w-80 h-80">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-gradient-to-br from-[#1cbe78]/20 to-[#0183c7]/20 rounded-full opacity-20"></div>
                  <div className="absolute w-48 h-48 bg-gradient-to-tr from-[#1cbe78]/30 to-[#0183c7]/30 rounded-full opacity-30"></div>
                  <Sparkles className="absolute w-16 h-16 text-[#1cbe78]" />
                </div>
              
            </div>
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-gray-800">Connect Your WordPress Site</h1>
              <p className="text-gray-600 max-w-sm">
                Seamlessly integrate your WordPress site with our powerful AI assistant to enhance your content creation workflow.
              </p>
              <div className="flex items-center justify-center space-x-2 mt-4">
                <div className="w-3 h-3 bg-[#1cbe78] rounded-full"></div>
                <div className="w-2 h-2 bg-[#0183c7] rounded-full"></div>
                <div className="w-3 h-3 bg-[#1cbe78]/70 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <Card className="w-full shadow-xl border-amperly-primary-light bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-2">
                <Logo />
              </div>
              <CardTitle className="text-2xl text-center font-bold text-gradient-amperly">
                WordPress Plugin Authentication
              </CardTitle>
              <CardDescription className="text-center">
                Please log in or sign up to activate your WordPress plugin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="data-[state=active]:bg-gradient-amperly data-[state=active]:text-white">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-amperly data-[state=active]:text-white">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <LoginForm 
                    activationToken={activationToken} 
                    redirectBack={redirectBack}
                  />
                </TabsContent>
                <TabsContent value="signup">
                  <SignupForm 
                    activationToken={activationToken} 
                    redirectBack={redirectBack}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <p className="text-sm text-gray-500">
                By connecting, you agree to our{" "}
                <a href="#" className="text-amperly-primary hover:text-amperly-primary-hover">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-amperly-primary hover:text-amperly-primary-hover">Privacy Policy</a>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </WordPressAuthProvider>
  )
}

// Loading component for Suspense
function WordPressActivationPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-amperly-light p-4">
      <Card className="w-full max-w-md shadow-xl border-amperly-primary-light">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <CardTitle className="text-2xl text-center font-bold">Loading</CardTitle>
          <CardDescription className="text-center">
            Preparing WordPress integration...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-amperly-primary" />
        </CardContent>
      </Card>
    </div>
  );
}

// Main page component with Suspense boundary
export default function WordPressActivationPage() {
  return (
    <Suspense fallback={<WordPressActivationPageLoading />}>
      <WordPressActivationPageContent />
    </Suspense>
  );
}

// Import login and signup forms at the bottom to avoid having to define them here
import { LoginForm } from "@/app/wordpress-activation/components/LoginForm"
import { SignupForm } from "@/app/wordpress-activation/components/SignupForm" 