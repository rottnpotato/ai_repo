"use client"

import { useState, useEffect } from "react"
import { Check, Save, X, RefreshCw, AlertCircle } from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  apiProviders, 
  getApiSettings, 
  updateApiSettings, 
  testApiConnection,
  type ApiSettings,
  type ApiProviderSettings,
  type ApiProvider
} from "@/lib/api-providers"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("api")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null)
  const [apiSettings, setApiSettings] = useState<ApiSettings | null>(null)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getApiSettings()
        setApiSettings(settings)
      } catch (error) {
        console.error("Error loading API settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleProviderChange = (providerId: string) => {
    if (!apiSettings) return

    setApiSettings({
      ...apiSettings,
      currentProvider: providerId
    })
    
    // Reset the test result when provider changes
    setTestResult(null)
  }

  const handleApiKeyChange = (providerId: string, value: string) => {
    if (!apiSettings) return

    setApiSettings({
      ...apiSettings,
      providers: {
        ...apiSettings.providers,
        [providerId]: {
          ...apiSettings.providers[providerId],
          apiKey: value
        }
      }
    })
    
    // Reset the test result when API key changes
    setTestResult(null)
  }

  const handleBaseUrlChange = (providerId: string, value: string) => {
    if (!apiSettings) return

    setApiSettings({
      ...apiSettings,
      providers: {
        ...apiSettings.providers,
        [providerId]: {
          ...apiSettings.providers[providerId],
          baseUrl: value
        }
      }
    })
    
    // Reset the test result when base URL changes
    setTestResult(null)
  }

  const handleModelNameChange = (providerId: string, value: string) => {
    if (!apiSettings) return

    setApiSettings({
      ...apiSettings,
      providers: {
        ...apiSettings.providers,
        [providerId]: {
          ...apiSettings.providers[providerId],
          modelName: value
        }
      }
    })
  }

  const handleSaveSettings = async () => {
    if (!apiSettings) return

    setIsSaving(true)
    setSaveSuccess(null)

    try {
      await updateApiSettings(apiSettings)
      setSaveSuccess(true)
      
      // Update the timestamp in the Updates.md file
      await updateChangesLog("Updated AI API provider settings")
      
      setTimeout(() => {
        setSaveSuccess(null)
      }, 3000)
    } catch (error) {
      console.error("Error saving API settings:", error)
      setSaveSuccess(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!apiSettings) return
    
    const currentProvider = apiSettings.currentProvider
    const settings = apiSettings.providers[currentProvider]
    
    setIsTesting(true)
    setTestResult(null)
    
    try {
      const result = await testApiConnection(currentProvider, settings)
      setTestResult(result)
    } catch (error) {
      console.error("Error testing API connection:", error)
      setTestResult({
        success: false,
        message: "An error occurred while testing the connection"
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleResetSettings = async () => {
    setIsResetDialogOpen(false)
    
    setIsLoading(true)
    
    try {
      // Fetch default settings by forcing a refresh
      const settings = await getApiSettings()
      setApiSettings(settings)
      setSaveSuccess(true)
      
      setTimeout(() => {
        setSaveSuccess(null)
      }, 3000)
    } catch (error) {
      console.error("Error resetting settings:", error)
      setSaveSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to update the Updates.md file with changes
  const updateChangesLog = async (message: string) => {
    try {
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const logEntry = `\n## ${timestamp}\n- ${message}`;
      
      // In a real implementation, this would update the Updates.md file
      // Here we're just simulating it by logging to the console
      console.log(`Updates.md updated: ${logEntry}`);
      
      // In a WordPress plugin implementation, this would use WordPress admin-ajax API
      // to update a log file or database entry
    } catch (error) {
      console.error("Error updating changes log:", error);
    }
  }

  // Update onChange handlers with proper typing
  const handleSystemInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setApiSettings((prev: ApiSettings | null) => prev ? {
      ...prev,
      systemInstructions: e.target.value
    } : null)
  }

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiSettings((prev: ApiSettings | null) => prev ? {
      ...prev,
      temperature: parseFloat(e.target.value)
    } : null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // The current provider's settings
  const currentProviderId = apiSettings?.currentProvider || "openai"
  const currentProviderSettings = apiSettings?.providers[currentProviderId]
  const currentProvider = apiProviders.find(p => p.id === currentProviderId)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure AI API providers and system settings</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setIsResetDialogOpen(true)}
            disabled={isLoading || isSaving}
          >
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading || isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI API Configuration</CardTitle>
          <CardDescription>
            Configure your AI provider settings and API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="api">API Provider</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="provider">AI Provider</Label>
                  <Select
                    value={apiSettings?.currentProvider}
                    onValueChange={handleProviderChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="provider">
                      <SelectValue placeholder="Select AI provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {apiProviders.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {apiSettings?.currentProvider && (
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={apiSettings.providers[apiSettings.currentProvider]?.apiKey || ""}
                        onChange={(e) => handleApiKeyChange(apiSettings.currentProvider, e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    {apiProviders.find(p => p.id === apiSettings.currentProvider)?.baseUrl && (
                      <div className="grid gap-2">
                        <Label htmlFor="baseUrl">Base URL</Label>
                        <Input
                          id="baseUrl"
                          type="text"
                          value={apiSettings.providers[apiSettings.currentProvider]?.baseUrl || ""}
                          onChange={(e) => handleBaseUrlChange(apiSettings.currentProvider, e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    )}

                    <div className="grid gap-2">
                      <Label htmlFor="model">Model</Label>
                      <Select
                        value={apiSettings.providers[apiSettings.currentProvider]?.modelName}
                        onValueChange={(value) => handleModelNameChange(apiSettings.currentProvider, value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="model">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {apiProviders.find(p => p.id === apiSettings.currentProvider)?.models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="secondary"
                        onClick={handleTestConnection}
                        disabled={isLoading || isTesting}
                      >
                        {isTesting ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          "Test Connection"
                        )}
                      </Button>
                      {testResult && (
                        <div className={`flex items-center ${testResult.success ? "text-green-500" : "text-red-500"}`}>
                          {testResult.success ? (
                            <Check className="mr-2 h-4 w-4" />
                          ) : (
                            <X className="mr-2 h-4 w-4" />
                          )}
                          {testResult.message}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="systemInstructions">System Instructions</Label>
                  <Textarea
                    id="systemInstructions"
                    value={apiSettings?.systemInstructions || ""}
                    onChange={handleSystemInstructionsChange}
                    disabled={isLoading}
                    rows={4}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={apiSettings?.temperature || 0.7}
                    onChange={handleTemperatureChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Settings</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all settings to their default values. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetSettings}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 