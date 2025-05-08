"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Save, MessageSquare, Plus, RefreshCw, Sparkles, Pencil, Code, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { staggerContainer, fadeIn } from "@/lib/motion"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"

type VariableItem = {
  name: string
  description: string
}

export default function PromptSettingsPage() {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth()
  const router = useRouter()

  const [shortSystemPrompt, setShortSystemPrompt] = useState(
    "You are a professional product description writer specializing in e-commerce. Your task is to generate a concise and persuasive short description for a product.\n\n- Keep the description within {{max_short_length}} characters.\n- Make it engaging, clear, and action-driven.\n- Highlight key features and benefits in plain text.",
  )

  const [fullSystemPrompt, setFullSystemPrompt] = useState(
    'You are an expert product description writer for e-commerce. Your task is to generate a detailed yet clear and engaging full description for a product.\n\n- Keep the description within {{max_length}} characters.\n- Begin with a compelling introduction that captures attention.\n- Use bullet points ("- ") for key features.',
  )

  const [tagSystemPrompt, setTagSystemPrompt] = useState(
    "Generate relevant, accurate product tags for an e-commerce store that will help with SEO and customer discovery. Focus on the most important features, use cases, and categories."
  )

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Prompt Settings</h1>
            <p className="text-gray-600">Customize the AI instructions for generating different types of WooCommerce product content.</p>
          </div>

          <motion.div className="w-full" initial="hidden" animate="show" variants={staggerContainer(0.1)}>
            <Tabs defaultValue="title" className="w-full">
              <TabsList className="mb-6 grid grid-cols-5 bg-white/60 backdrop-blur-sm">
                <TabsTrigger value="title" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
                  Product Title
                </TabsTrigger>
                <TabsTrigger value="description" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
                  Description
                </TabsTrigger>
                <TabsTrigger value="features" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
                  Features
                </TabsTrigger>
                <TabsTrigger value="specs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
                  Specifications
                </TabsTrigger>
                <TabsTrigger value="seo" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
                  SEO
                </TabsTrigger>
              </TabsList>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-sm">
                <TabsContent value="title">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="title-prompt" className="text-gray-900 font-medium">
                          Product Title Generation
                        </Label>
                        <Button variant="ghost" size="sm" className="h-8 text-gray-500 hover:text-orange-500 transition-colors">
                          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset to Default
                        </Button>
                      </div>
                      <Textarea
                        id="title-prompt"
                        value={shortSystemPrompt}
                        onChange={(e) => setShortSystemPrompt(e.target.value)}
                        className="min-h-[200px] bg-white border-gray-200 text-gray-900 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        placeholder="Instructions for generating compelling product titles..."
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Base instructions for generating SEO-friendly and engaging product titles
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="description">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="short-description-prompt" className="text-gray-900 font-medium">
                          Short Description
                        </Label>
                      </div>
                      <Textarea
                        id="short-description-prompt"
                        className="min-h-[150px] bg-white border-gray-200 text-gray-900 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        placeholder="Instructions for generating concise product descriptions..."
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="full-description-prompt" className="text-gray-900 font-medium">
                          Full Description
                        </Label>
                      </div>
                      <Textarea
                        id="full-description-prompt"
                        className="min-h-[150px] bg-white border-gray-200 text-gray-900 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        placeholder="Instructions for generating detailed product descriptions..."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="features-prompt" className="text-gray-900 font-medium">
                          Key Features Generation
                        </Label>
                      </div>
                      <Textarea
                        id="features-prompt"
                        className="min-h-[200px] bg-white border-gray-200 text-gray-900 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        placeholder="Instructions for generating product key features and benefits..."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="specs">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="specs-prompt" className="text-gray-900 font-medium">
                          Technical Specifications
                        </Label>
                      </div>
                      <Textarea
                        id="specs-prompt"
                        className="min-h-[200px] bg-white border-gray-200 text-gray-900 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        placeholder="Instructions for generating technical specifications and product details..."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="seo">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="meta-title-prompt" className="text-gray-900 font-medium">
                          Meta Title
                        </Label>
                      </div>
                      <Textarea
                        id="meta-title-prompt"
                        className="min-h-[100px] bg-white border-gray-200 text-gray-900 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        placeholder="Instructions for generating SEO meta titles..."
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="meta-description-prompt" className="text-gray-900 font-medium">
                          Meta Description
                        </Label>
                      </div>
                      <Textarea
                        id="meta-description-prompt"
                        className="min-h-[100px] bg-white border-gray-200 text-gray-900 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        placeholder="Instructions for generating SEO meta descriptions..."
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="tags-prompt" className="text-gray-900 font-medium">
                          Product Tags
                        </Label>
                      </div>
                      <Textarea
                        id="tags-prompt"
                        className="min-h-[100px] bg-white border-gray-200 text-gray-900 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        placeholder="Instructions for generating product tags..."
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <div className="flex justify-end pt-4">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                <Save className="mr-2 h-4 w-4" />
                Save Prompt Settings
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 