"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Save, FileText, Settings, Lightbulb, Languages, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { staggerContainer, fadeIn } from "@/lib/motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Logo } from "@/components/logo"

export default function ContentSettingsPage() {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth()
  const router = useRouter()

  const [language, setLanguage] = useState("English")
  const [writingStyle, setWritingStyle] = useState("Professional")
  const [maxLength, setMaxLength] = useState("1000")
  const [maxShortLength, setMaxShortLength] = useState("300")
  const [maxTagCount, setMaxTagCount] = useState("3")
  const [aiModel, setAiModel] = useState("GPT-4o - Versatile, high-intelligence flagship model")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-4" onClick={() => router.push("/dashboard/settings")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
            <Logo size="md" />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => router.push("/logout")}
          >
            Logout
          </Button>
        </header>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Settings</h1>
            <p className="text-gray-600">Customize how AI-generated content is created for your WordPress site. Configure length parameters.</p>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-1 mb-6 bg-white/60 backdrop-blur-sm">
              <TabsTrigger value="general" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
                General
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <motion.div className="space-y-6" initial="hidden" animate="show" variants={staggerContainer(0.1)}>
                <Card className="border-transparent bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 text-orange-500 mr-2" />
                      Content Generation Parameters
                    </CardTitle>
                    <CardDescription>
                      Set length limits and other basic parameters for content generation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="max-length" className="text-gray-900 mb-2 block">
                          Maximum Description Length
                        </Label>
                        <Input
                          id="max-length"
                          type="number"
                          value={maxLength}
                          onChange={(e) => setMaxLength(e.target.value)}
                          className="bg-white border-gray-200 text-gray-900 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        />
                        <p className="text-sm text-gray-500 mt-2">Character limit for normal product descriptions</p>
                      </div>

                      <div>
                        <Label htmlFor="max-short-length" className="text-gray-900 mb-2 block">
                          Maximum Short Description Length
                        </Label>
                        <Input
                          id="max-short-length"
                          type="number"
                          value={maxShortLength}
                          onChange={(e) => setMaxShortLength(e.target.value)}
                          className="bg-white border-gray-200 text-gray-900 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        />
                        <p className="text-sm text-gray-500 mt-2">Character limit for short product descriptions</p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="max-tag-count" className="text-gray-900 mb-2 block">
                        Maximum Tag Count
                      </Label>
                      <Input
                        id="max-tag-count"
                        type="number"
                        value={maxTagCount}
                        onChange={(e) => setMaxTagCount(e.target.value)}
                        className="bg-white border-gray-200 text-gray-900 max-w-xs focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                      />
                      <p className="text-sm text-gray-500 mt-2">Maximum number of tags to generate for products</p>
                    </div>

                    <div className="pt-4">
                      <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                        <Save className="mr-2 h-4 w-4" />
                        Save General Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
} 