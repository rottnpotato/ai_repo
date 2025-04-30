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
  type ApiProviderSettings 
} from "@/lib/api-providers"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
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
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500 mt-1">Configure your plugin settings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsResetDialogOpen(true)}
            disabled={isSaving}
          >
            Reset to Defaults
          </Button>
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
      
      {saveSuccess === true && (
        <div className="mb-4 bg-green-50 text-green-700 px-4 py-2 rounded-md flex items-center">
          <Check className="h-5 w-5 mr-2" />
          Settings saved successfully!
        </div>
      )}
      
      {saveSuccess === false && (
        <div className="mb-4 bg-red-50 text-red-700 px-4 py-2 rounded-md flex items-center">
          <X className="h-5 w-5 mr-2" />
          Error saving settings. Please try again.
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">AI API Configuration</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic settings for your WooProducts AI plugin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plugin-name">Plugin Name</Label>
                  <Input 
                    id="plugin-name" 
                    defaultValue="WooProducts AI" 
                  />
                  <p className="text-sm text-gray-500">
                    The name displayed in the WordPress admin area
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Plugin Description</Label>
                  <Textarea 
                    id="description"
                    rows={3}
                    defaultValue="AI-powered content generation for WooCommerce products"
                  />
                  <p className="text-sm text-gray-500">
                    Brief description of what your plugin does
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>AI API Configuration</CardTitle>
              <CardDescription>
                Configure AI providers and API keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ai-provider">AI Provider</Label>
                <Select
                  value={currentProviderId}
                  onValueChange={handleProviderChange}
                >
                  <SelectTrigger id="ai-provider">
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
                <p className="text-sm text-gray-500">
                  {currentProvider?.description || "Select an AI provider to use"}
                </p>
              </div>
              
              {currentProvider && (
                <>
                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor={`${currentProviderId}-api-key`}>
                      {currentProvider.apiKeyName}
                    </Label>
                    <Input
                      id={`${currentProviderId}-api-key`}
                      type="password"
                      placeholder={currentProvider.apiKeyPlaceholder}
                      value={currentProviderSettings?.apiKey || ""}
                      onChange={(e) => handleApiKeyChange(currentProviderId, e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      Your API key for accessing {currentProvider.name} services
                    </p>
                  </div>
                  
                  {currentProvider.baseUrl !== undefined && (
                    <div className="space-y-2">
                      <Label htmlFor={`${currentProviderId}-base-url`}>Base URL</Label>
                      <Input
                        id={`${currentProviderId}-base-url`}
                        placeholder={currentProvider.baseUrl}
                        value={currentProviderSettings?.baseUrl || ""}
                        onChange={(e) => handleBaseUrlChange(currentProviderId, e.target.value)}
                      />
                      <p className="text-sm text-gray-500">
                        The base URL for API requests
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor={`${currentProviderId}-model`}>Model</Label>
                    <Input
                      id={`${currentProviderId}-model`}
                      placeholder="Default model"
                      value={currentProviderSettings?.modelName || ""}
                      onChange={(e) => handleModelNameChange(currentProviderId, e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      The AI model to use for generating content
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={!currentProviderSettings?.apiKey || isTesting}
                      className="gap-2"
                    >
                      {isTesting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        "Test Connection"
                      )}
                    </Button>
                    
                    {testResult && (
                      <div className={`flex items-center gap-2 ${
                        testResult.success ? "text-green-600" : "text-red-600"
                      }`}>
                        {testResult.success ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <AlertCircle className="h-5 w-5" />
                        )}
                        <span>{testResult.message}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Rate Limiting</CardTitle>
              <CardDescription>
                Configure API usage limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Max Tokens Per Request</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    defaultValue="4096"
                  />
                  <p className="text-sm text-gray-500">
                    Maximum number of tokens to use in each API request
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cooldown-period">Cooldown Period (seconds)</Label>
                  <Input
                    id="cooldown-period"
                    type="number"
                    defaultValue="1"
                  />
                  <p className="text-sm text-gray-500">
                    Time to wait between consecutive API requests
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Additional configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="custom-instructions">Default System Instructions</Label>
                <Textarea
                  id="custom-instructions"
                  rows={5}
                  defaultValue="You are an AI assistant specializing in generating high-quality WooCommerce product descriptions, blog posts, and marketing content. Focus on being persuasive, concise, and SEO-friendly."
                />
                <p className="text-sm text-gray-500">
                  Default system instructions sent to the AI
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-temperature">Default Temperature</Label>
                <Input
                  id="default-temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  defaultValue="0.7"
                />
                <p className="text-sm text-gray-500">
                  Controls randomness of AI responses (0.0-2.0)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset settings?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all settings to their default values. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetSettings}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 