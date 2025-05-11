"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Settings, FileText, MessageSquare, ChevronRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { useAuth } from "@/contexts/auth-context"
import { staggerContainer, fadeIn } from "@/lib/motion"

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-amperly-light-radial">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1cbe78]"></div>
      </div>
    )
  }

  const settingsLinks = [
    {
      title: "Content Settings",
      description: "Customize content generation parameters and styles",
      icon: <FileText className="h-5 w-5 text-amperly-primary" />,
      href: "/dashboard/settings/content",
    },
    {
      title: "Prompt Settings",
      description: "Manage AI prompts for different content types",
      icon: <MessageSquare className="h-5 w-5 text-amperly-secondary" />,
      href: "/dashboard/settings/prompts",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-amperly-light-conic py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-4" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Logo size="md" />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amperly-primary text-amperly-primary hover:bg-amperly-primary-light"
            onClick={() => router.push("/logout")}
          >
            Logout
          </Button>
        </header>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600 mb-8">Configure your AI content generation settings and preferences.</p>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl"
            initial="hidden"
            animate="show"
            variants={staggerContainer(0.1)}
          >
            {settingsLinks.map((link, index) => (
              <motion.div key={link.href} variants={fadeIn("up", "tween", 0.1 * (index + 1), 0.5)}>
                <Link href={link.href} className="block h-full group">
                  <Card className="h-full transition-all duration-300 border-transparent bg-white/80 backdrop-blur-sm hover:shadow-lg hover:shadow-[#1cbe78]/20 hover:border-[#1cbe78]/30 group-hover:translate-y-[-2px]">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg group-hover:text-gradient-amperly">
                        <span className="mr-2">{link.icon}</span>
                        {link.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600">{link.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-end">
                        <div className="text-sm font-medium text-gradient-amperly flex items-center">
                          Configure
                          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1 text-amperly-secondary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
            
            {isAdmin && (
              <motion.div variants={fadeIn("up", "tween", 0.3, 0.5)}>
                <Link href="/admin/settings/api-settings" className="block h-full group">
                  <Card className="h-full transition-all duration-300 border-transparent bg-[#e5f8f3]/80 backdrop-blur-sm hover:shadow-lg hover:shadow-[#1cbe78]/20 hover:border-[#1cbe78]/30 group-hover:translate-y-[-2px]">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg group-hover:text-gradient-amperly">
                        <span className="mr-2"><Settings className="h-5 w-5 text-amperly-primary" /></span>
                        Admin API Settings
                      </CardTitle>
                      <CardDescription className="text-gray-600">Configure API keys and provider settings (Admin only)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-end">
                        <div className="text-sm font-medium text-gradient-amperly flex items-center">
                          Configure
                          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1 text-amperly-secondary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 