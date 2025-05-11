"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Save, Eye, EyeOff, Key, Settings, Cpu, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { staggerContainer, fadeIn } from "@/lib/motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Logo } from "@/components/logo"

export default function AdminApiSettingsPage() {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [apiProvider, setApiProvider] = useState("OpenAI")
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [rateLimit, setRateLimit] = useState("100")
  const [usageMonitoring, setUsageMonitoring] = useState(true)

  // Redirect if not authenticated or not admin
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-amperly-light-radial">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1cbe78]"></div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-amperly-tri py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-4" onClick={() => router.push("/admin/settings")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Settings
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Settings</h1>
          <p className="text-gray-600 mb-8">Configure API providers, keys, and usage limits for your organization.</p>

          <Tabs defaultValue="providers" className="w-full max-w-4xl">
            <TabsList className="grid grid-cols-3 mb-6 bg-white/60 backdrop-blur-sm">
              <TabsTrigger value="providers" className="data-[state=active]:bg-gradient-amperly data-[state=active]:text-white">
                API Providers
              </TabsTrigger>
              <TabsTrigger value="limits" className="data-[state=active]:bg-gradient-amperly data-[state=active]:text-white">
                Usage & Limits
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-gradient-amperly data-[state=active]:text-white">
                Monitoring
              </TabsTrigger>
            </TabsList>

            <TabsContent value="providers">
              <motion.div className="space-y-6" initial="hidden" animate="show" variants={staggerContainer(0.1)}>
                <Card className="border-transparent bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Key className="h-5 w-5 text-amperly-primary mr-2" />
                      AI Provider Configuration
                    </CardTitle>
                    <CardDescription>
                      Select your AI service provider and configure your API credentials
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="api-provider" className="text-gray-900 mb-2 block">
                        API Provider
                      </Label>
                      <Select value={apiProvider} onValueChange={setApiProvider}>
                        <SelectTrigger id="api-provider" className="w-full bg-white border-gray-200 text-gray-900 focus:border-[#1cbe78] focus:ring focus:ring-[#1cbe78]/20 focus:ring-opacity-50">
                          <SelectValue placeholder="Select API provider" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 text-gray-900">
                          <SelectItem value="OpenAI">OpenAI</SelectItem>
                          <SelectItem value="Anthropic">Anthropic</SelectItem>
                          <SelectItem value="Google">Google AI</SelectItem>
                          <SelectItem value="Cohere">Cohere</SelectItem>
                          <SelectItem value="Mistral">Mistral AI</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500 mt-2">Select your preferred AI service provider</p>
                    </div>

                    <div>
                      <Label htmlFor="api-key" className="text-gray-900 mb-2 block">
                        {apiProvider} API Key
                      </Label>
                      <div className="relative">
                        <Input
                          id="api-key"
                          type={showApiKey ? "text" : "password"}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="bg-white border-gray-200 text-gray-900 pr-10 focus:border-[#1cbe78] focus:ring focus:ring-[#1cbe78]/20 focus:ring-opacity-50"
                          placeholder="Enter your API key"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amperly-primary"
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Enter your {apiProvider} API key</p>
                      <a
                        href={apiProvider === "OpenAI" ? "https://platform.openai.com/api-keys" : "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gradient-amperly hover:opacity-80 mt-1 inline-block"
                      >
                        Get your {apiProvider} key from {apiProvider}
                      </a>
                    </div>

                    <div className="pt-4">
                      <Button className="btn-gradient-amperly transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                        <Save className="mr-2 h-4 w-4" />
                        Save Provider Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="limits">
              <motion.div variants={fadeIn("up", "tween", 0.2, 0.5)}>
                <Card className="border-transparent bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Cpu className="h-5 w-5 text-amperly-primary mr-2" />
                      API Usage Limits
                    </CardTitle>
                    <CardDescription>
                      Configure request rate limits and usage thresholds
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="rate-limit" className="text-gray-900 mb-2 block">
                        Request Rate Limit (per minute)
                      </Label>
                      <Input
                        id="rate-limit"
                        type="number"
                        value={rateLimit}
                        onChange={(e) => setRateLimit(e.target.value)}
                        className="bg-white border-gray-200 text-gray-900 w-full max-w-xs focus:border-[#1cbe78] focus:ring focus:ring-[#1cbe78]/20 focus:ring-opacity-50"
                      />
                      <p className="text-sm text-gray-500 mt-2">Limit the number of API requests per minute</p>
                    </div>

                    <div>
                      <Label htmlFor="throttling" className="text-gray-900 mb-2 block flex items-center space-x-2">
                        <Switch id="throttling" defaultChecked className="data-[state=checked]:bg-gradient-amperly" />
                        <span>Enable Request Throttling</span>
                      </Label>
                      <p className="text-sm text-gray-500 mt-2 ml-11">Automatically throttle requests when approaching limits</p>
                    </div>

                    <div>
                      <Label htmlFor="quota" className="text-gray-900 mb-2 block flex items-center space-x-2">
                        <Switch id="quota" defaultChecked className="data-[state=checked]:bg-gradient-amperly" />
                        <span>Set Monthly Quota</span>
                      </Label>
                      <div className="ml-11 mt-3">
                        <Input
                          id="quota-amount"
                          type="number"
                          defaultValue="5000"
                          className="bg-white border-gray-200 text-gray-900 w-full max-w-xs focus:border-[#1cbe78] focus:ring focus:ring-[#1cbe78]/20 focus:ring-opacity-50"
                        />
                        <p className="text-sm text-gray-500 mt-2">Maximum number of requests allowed per month</p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button className="btn-gradient-amperly transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                        <Save className="mr-2 h-4 w-4" />
                        Save Limit Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="monitoring">
              <motion.div variants={fadeIn("up", "tween", 0.3, 0.5)}>
                <Card className="border-transparent bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-amperly-primary mr-2" />
                      Usage Monitoring
                    </CardTitle>
                    <CardDescription>
                      Configure API usage tracking and alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="enable-monitoring" className="text-gray-900 mb-2 block flex items-center space-x-2">
                        <Switch 
                          id="enable-monitoring" 
                          checked={usageMonitoring}
                          onCheckedChange={setUsageMonitoring}
                          className="data-[state=checked]:bg-gradient-amperly"
                        />
                        <span>Enable Usage Monitoring</span>
                      </Label>
                      <p className="text-sm text-gray-500 mt-2 ml-11">Track API usage and display in dashboard</p>
                    </div>

                    <div>
                      <Label htmlFor="email-alerts" className="text-gray-900 mb-2 block flex items-center space-x-2">
                        <Switch id="email-alerts" defaultChecked className="data-[state=checked]:bg-gradient-amperly" />
                        <span>Email Alerts</span>
                      </Label>
                      <p className="text-sm text-gray-500 mt-2 ml-11">Send email alerts when usage exceeds thresholds</p>
                    </div>

                    <div>
                      <Label htmlFor="warning-threshold" className="text-gray-900 mb-2 block">
                        Warning Threshold (%)
                      </Label>
                      <Input
                        id="warning-threshold"
                        type="number"
                        defaultValue="80"
                        className="bg-white border-gray-200 text-gray-900 w-full max-w-xs focus:border-[#1cbe78] focus:ring focus:ring-[#1cbe78]/20 focus:ring-opacity-50"
                      />
                      <p className="text-sm text-gray-500 mt-2">Send warning when usage reaches this percentage of limit</p>
                    </div>

                    <div className="pt-4">
                      <Button className="btn-gradient-amperly transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                        <Save className="mr-2 h-4 w-4" />
                        Save Monitoring Settings
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