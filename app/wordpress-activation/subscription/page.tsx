"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, ArrowRight, Check, CreditCard, Edit, ExternalLink, Gift, 
  Globe, Laptop, LayoutPanelLeft, Lightbulb, MousePointerClick, PenTool, 
  Rocket, ShieldCheck, Sparkles, MessageSquare, AlertCircle, Zap, 
  Clock, BarChart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/logo"
import { useToast } from "@/hooks/use-toast"
import { UseSubscription } from "@/hooks/useSubscription"
import { SubscriptionService } from "@/lib/services/SubscriptionService"
import Image from "next/image"

// SearchParams provider component that wraps useSearchParams hook
function SearchParamsProvider({ children }: { children: (searchParams: URLSearchParams) => React.ReactNode }) {
  const searchParams = useSearchParams();
  return <>{children(searchParams)}</>;
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <Logo className="mb-8" />
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
        <h3 className="text-xl font-medium text-gray-800">Loading page parameters...</h3>
        <p className="text-gray-600 mt-2">Just a moment while we prepare your data</p>
      </div>
    </div>
  );
}

// Main subscription page wrapped with Suspense boundary for searchParams
export default function WordPressSubscriptionPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SearchParamsProvider>
        {(searchParams) => <WordPressSubscriptionContent searchParams={searchParams} />}
      </SearchParamsProvider>
    </Suspense>
  );
}

// Main content component that receives searchParams as prop
function WordPressSubscriptionContent({ searchParams }: { searchParams: URLSearchParams }) {
  const router = useRouter()
  const { 
    subscription, 
    availablePlans, 
    isLoading: subscriptionLoading, 
    isLoadingPlans,
    isPurchasing,
    purchaseError,
    FetchAvailablePlans,
    PurchaseSubscription,
    FetchSubscription
  } = UseSubscription()
  const { toast } = useToast()
  
  // Combine related state variables into a single object to prevent multiple re-renders
  const [integrationParams, setIntegrationParams] = useState({
    activationToken: null as string | null,
    redirectBack: null as string | null,
    accessToken: null as string | null
  })
  
  const [uiState, setUiState] = useState({
    error: null as string | null,
    isRedirecting: false,
    integrationComplete: false,
    imageLoaded: false,
    selectedPlan: null as number | null
  })
  
  // Consolidated useEffect for URL parameters, subscription fetching, and plans fetching
  useEffect(() => {
    const initializeIntegration = async () => {
      // Extract parameters only once
      const token = searchParams.get("activation_token")
      const redirect = searchParams.get("redirect_back")
      const access = searchParams.get("access_token")
      
      console.log("[WP-Integration] Processing URL parameters", { token, redirect, access })
      
      // Set all state variables in a single update operation
      setIntegrationParams({
        activationToken: token,
        redirectBack: redirect,
        accessToken: access
      })
      
      try {
        // Handle error states - only set error if needed
        if ((!token && !redirect && !access) || (token && redirect && access)) {
          // Valid cases: either all parameters present, or none (normal login)
          console.log(token ? "[WP-Integration] WordPress params detected" : "[WP-Integration] Normal login flow detected")
        } else {
          // Invalid case: only some parameters present
          console.log("[WP-Integration] Partial WordPress parameters detected, showing error")
          setUiState(prev => ({
            ...prev,
            error: "Some WordPress integration parameters are missing. Please ensure you have all required parameters in the URL."
          }))
        }
        
        // Combined fetch operation to prevent multiple renders
        // Always check for subscription first
        console.log("[WP-Integration] Checking for existing subscription")
        const subscriptionData = await FetchSubscription()
        console.log("[WP-Integration] Subscription data:", subscriptionData)
        
        // Only fetch plans if needed (no active subscription)
        // Check both uppercase and lowercase status values to be safe
        if (!subscriptionData || 
            (subscriptionData.Status !== "Active" && subscriptionData.Status !== "active")) {
          console.log("[WP-Integration] No active subscription found, fetching available plans")
          await FetchAvailablePlans()
        } else {
          console.log("[WP-Integration] User has active subscription:", subscriptionData)
        }
      } catch (error) {
        console.error("[WP-Integration] Error during initialization:", error)
        // In case of error, make sure we have plans to display
        await FetchAvailablePlans()
      }
    }
    
    // Run initialization only once
    initializeIntegration()
    // Only depend on searchParams so this runs when the URL changes
    // FetchSubscription and FetchAvailablePlans are excluded to prevent unnecessary re-runs
  }, [searchParams])
  
  // Destructure state variables for convenience
  const { activationToken, redirectBack, accessToken } = integrationParams
  const { error, isRedirecting, integrationComplete, imageLoaded, selectedPlan } = uiState
  
  // Helper function to update UI state
  const updateUiState = (updates: Partial<typeof uiState>) => {
    setUiState(prev => ({ ...prev, ...updates }))
  }
  
  // Filter and sort available plans
  const sortedPlans = [...(availablePlans || [])].filter(plan => plan && plan.IsActive).sort((a, b) => {
    // Handle potentially undefined plans
    if (!a || !b) return 0;
    
    // Trial plans first
    if (a.PlanType === "Trial" && b.PlanType !== "Trial") return -1
    if (a.PlanType !== "Trial" && b.PlanType === "Trial") return 1

    // Then by price
    const aPrice = parseFloat(a.Price?.toString() || "0")
    const bPrice = parseFloat(b.Price?.toString() || "0")
    return aPrice - bPrice
  })

  // Handle opt-out (skip subscription)
  const handleOptOut = async () => {
    if (!activationToken || !redirectBack || !accessToken) {
      updateUiState({ 
        error: "Missing required WordPress integration parameters. Please return to WordPress and try again." 
      })
      return
    }
    
    try {
      updateUiState({ isRedirecting: true })
      
      // Send POST request with activation token and access token
      const response = await fetch(redirectBack, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activation_token: activationToken,
          access_token: accessToken
        })
      })
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      // Extract base URL from redirectBack
      const baseUrl = new URL(redirectBack).origin
      const wordpressAdminUrl = `${baseUrl}/wp-admin/admin.php?page=waip-settings`
      
      // Show success message after POST completes successfully
      toast({
        title: "WordPress Integration Complete",
        description: "Your WordPress site has been successfully connected. Redirecting to WordPress admin..."
      })
      
      // Update UI to show completion state
      updateUiState({ 
        isRedirecting: false,
        integrationComplete: true 
      })
      
      // Redirect to WordPress admin settings page
      window.location.href = wordpressAdminUrl
      
    } catch (err) {
      console.error("Opt-out error:", err)
      updateUiState({ 
        error: err instanceof Error ? err.message : "An unexpected error occurred",
        isRedirecting: false
      })
      
      toast({
        title: "Integration Error",
        description: err instanceof Error ? err.message : "Failed to complete WordPress integration",
        variant: "destructive"
      })
    }
  }
  
  // Handle WordPress integration
  const handleWordPressIntegration = async () => {
    if (!activationToken || !redirectBack || !accessToken) {
      updateUiState({ 
        error: "Missing required WordPress integration parameters. Please return to WordPress and try again." 
      })
      return
    }
    
    try {
      updateUiState({ isRedirecting: true })
      
      // Send POST request with activation token and access token
      const response = await fetch(redirectBack, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activation_token: activationToken,
          access_token: accessToken
        })
      })
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      // Extract base URL from redirectBack
      const baseUrl = new URL(redirectBack).origin
      const wordpressAdminUrl = `${baseUrl}/wp-admin/admin.php?page=waip-settings`
      
      // Show success message after POST completes successfully
      toast({
        title: "WordPress Integration Complete",
        description: "Your WordPress site has been successfully connected. Redirecting to WordPress admin..."
      })
      
      // Update UI to show completion state
      updateUiState({ 
        isRedirecting: false,
        integrationComplete: true 
      })
      
      // Redirect to WordPress admin settings page
      window.location.href = wordpressAdminUrl
      
    } catch (err) {
      console.error("Integration error:", err)
      updateUiState({ 
        error: err instanceof Error ? err.message : "An unexpected error occurred",
        isRedirecting: false
      })
      
      toast({
        title: "Integration Error",
        description: err instanceof Error ? err.message : "Failed to complete WordPress integration",
        variant: "destructive"
      })
    }
  }
  
  // Handle purchase subscription
  const handlePurchaseSubscription = async (planId: number) => {
    if (!activationToken || !redirectBack || !accessToken) {
      updateUiState({ error: "Missing required integration parameters" })
      return
    }
    
    try {
      const result = await PurchaseSubscription({
        SubscriptionPlanId: planId,
        PaymentMethod: "credit_card",
        AutoRenew: true
      })
      
      if (result) {
        // Set the selected plan
        updateUiState({ selectedPlan: planId })
        
        toast({
          title: "Subscription Successful",
          description: `You've successfully subscribed to the ${result.SubscriptionPlan?.Name} plan. Click "Complete Integration" to connect with WordPress.`,
        })
      }
    } catch (err) {
      console.error("Subscription error:", err)
      updateUiState({ error: err instanceof Error ? err.message : "An unexpected error occurred" })
      
      toast({
        title: "Subscription Error",
        description: err instanceof Error ? err.message : "Failed to complete subscription",
        variant: "destructive"
      })
    }
  }
  
  // Format currency helper
  const formatCurrency = (price: string | number | undefined, currency: string) => {
    if (price === undefined || price === null) return "$0.00"
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(parseFloat(price.toString()))
  }
  
  // Set of placeholder features based on plan type
  const getPlaceholderFeatures = (planType: string, isFree: boolean, tokenLimit: number) => {
    const safeTokenLimit = tokenLimit || 0;
    
    if (planType === "Trial") {
      return [
        `${safeTokenLimit} tokens per month`,
        "Up to 10 product descriptions per month",
        "Basic SEO optimization",
        "Standard support response time",
        "WordPress plugin integration"
      ]
    }
    
    if (isFree) {
      return [
       `${safeTokenLimit} tokens per month`,
        "Up to 5 product descriptions per month",
        "Basic text editing tools",
        "Community support only",
        "WordPress plugin integration"
      ]
    }
    
    // For paid plans
    return [
      `${safeTokenLimit} tokens per month`,
      "Advanced SEO optimization tools",
      "Priority customer support",
      "Bulk content generation",
      "WordPress plugin integration",
    ]
  }
  
  // Render loading state
  const isLoading = subscriptionLoading || isLoadingPlans || isPurchasing
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-8">
        <Logo className="mb-8" />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-medium text-gray-800">Loading your subscription options...</h3>
          <p className="text-gray-600 mt-2">Just a moment while we prepare your subscription details</p>
        </div>
      </div>
    )
  }
  
  // Render error state only if there's an error and WordPress parameters were expected
  if (error && (activationToken || redirectBack || accessToken)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-red-200">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <CardTitle className="text-2xl text-center font-bold">WordPress Integration Error</CardTitle>
            <CardDescription className="text-center text-red-500">
              We encountered a problem with your WordPress integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="space-y-4 mt-6">
              <p className="text-gray-600 text-center">
                You can try refreshing the page or going back to WordPress
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Refresh Page
                </Button>
                <Button
                  variant="default"
                  onClick={() => redirectBack && (window.location.href = redirectBack)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  Back to WordPress <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // If we're not in WordPress integration mode (no parameters), show the standard subscription page
  const isWordPressIntegration = activationToken && redirectBack && accessToken

  // Determine if this is a normal login or WordPress integration
  const isNormalLogin = !activationToken && !redirectBack && !accessToken
  
  // Handle active subscription scenarios regardless of integration mode
  if (subscription && (subscription.Status === "Active" || subscription.Status === "active")) {
    // Case 1: Active subscription in WordPress integration mode - show integration UI
    if (isWordPressIntegration) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <div className="hidden md:flex flex-col items-center justify-center space-y-6">
                <div className="relative w-80 h-80">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 bg-gradient-to-br from-red-400 to-orange-300 rounded-full opacity-20"></div>
                      <div className="absolute w-48 h-48 bg-gradient-to-tr from-orange-400 to-amber-300 rounded-full opacity-30"></div>
                      <Sparkles className="absolute w-16 h-16 text-amber-500" />
                    </div>
               
                </div>
                <div className="text-center space-y-4">
                  <h1 className="text-2xl font-bold text-gray-800">WordPress AI Assistant</h1>
                  <p className="text-gray-600 max-w-sm">
                    Your WordPress site is ready to be connected with our AI content capabilities.
                  </p>
                </div>
              </div>
              
              <div>
                <header className="flex flex-col items-center justify-center mb-8 text-center md:text-left md:items-start">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 mb-4">
                    <Check className="h-4 w-4 mr-2" />
                    <span>Active Subscription</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    You're Ready to Connect!
                  </h1>
                  <p className="text-xl text-gray-600">
                    Your subscription is active and ready for WordPress integration
                  </p>
                </header>
                
                <Card className="w-full shadow-xl border-green-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2" />
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span className="text-2xl">{subscription.SubscriptionPlan?.Name || "Current Plan"}</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {(subscription as any).ExpiryDate ? (
                        <span>Renews on {new Date((subscription as any).ExpiryDate).toLocaleDateString()}</span>
                      ) : "Your current subscription"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="border-b pb-4">
                      <h3 className="font-medium text-gray-900 mb-3">Subscription Details</h3>
                      <ul className="space-y-3">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <span className="font-medium text-green-600">Active</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Plan</span>
                          <span className="font-medium">{subscription.SubscriptionPlan?.Name || "Current Plan"}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Billing</span>
                          <span className="font-medium">{subscription.SubscriptionPlan?.BillingCycle || "Monthly"}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">API Tokens</span>
                          <span className="font-medium">{(subscription as any).RemainingTokens || "Unlimited"}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Integration Instructions</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                        <p className="text-blue-800 text-sm">
                          Click the button below to connect your WordPress site with our AI service using your active subscription. This will complete the integration process.
                        </p>
                      </div>
                      <ul className="space-y-2">
                        {getPlaceholderFeatures(subscription.SubscriptionPlan?.PlanType || "", false, subscription.SubscriptionPlan?.MaxTokens || 0).map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t px-6 py-4">
                    {isRedirecting ? (
                      <Button
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
                        disabled={true}
                      >
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
                        Completing Integration...
                      </Button>
                    ) : integrationComplete ? (
                      <div className="space-y-4 w-full">
                        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-green-800">Integration Complete</h4>
                            <p className="text-green-700 text-sm mt-1">
                              Your WordPress site has been successfully connected. You can now close this page and return to WordPress.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 w-full">
                        <Button
                          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                          onClick={handleOptOut}
                        >
                          Connect to WordPress
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        {error && (
                          <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      )
    }
    
    // Case 2: For normal login with active subscription, show subscription management UI
    else {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }}
            >
              <header className="flex flex-col items-center text-center mb-12">
                <Logo size="lg" className="mb-8" />
                <div className="space-y-4 max-w-3xl">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Manage Your Subscription
                  </h1>
                  <p className="text-xl text-gray-600">
                    View your current subscription details or select a new plan
                  </p>
                </div>
              </header>
              
              {error && (
                <Alert variant="destructive" className="mb-6 max-w-4xl mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              {subscription && (
                <Card className="w-full max-w-2xl mx-auto mb-8 shadow-xl border-orange-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2" />
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span className="text-2xl">{subscription.SubscriptionPlan?.Name || "Current Plan"}</span>
                      <Badge variant="outline" className={`${
                        subscription.Status === "Active" 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {subscription.Status || "Unknown"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {(subscription as any).ExpiryDate ? (
                        <span>Renews on {new Date((subscription as any).ExpiryDate).toLocaleDateString()}</span>
                      ) : "Your current subscription"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="border-b pb-4">
                      <h3 className="font-medium text-gray-900 mb-3">Subscription Details</h3>
                      <ul className="space-y-3">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <span className={`font-medium ${
                            subscription.Status === "Active" ? "text-green-600" : "text-amber-600"
                          }`}>
                            {subscription.Status || "Unknown"}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Plan</span>
                          <span className="font-medium">{subscription.SubscriptionPlan?.Name || "Current Plan"}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Billing</span>
                          <span className="font-medium">{subscription.SubscriptionPlan?.BillingCycle || "Monthly"}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">API Tokens</span>
                          <span className="font-medium">{(subscription as any).RemainingTokens || "Unlimited"}</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      )
    }
  }
  
  // If not in WordPress integration mode, show different subscription management UI
  if (isNormalLogin || !isWordPressIntegration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <header className="flex flex-col items-center text-center mb-12">
              <Logo size="lg" className="mb-8" />
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Manage Your Subscription
                </h1>
                <p className="text-xl text-gray-600">
                  View your current subscription details or select a new plan
                </p>
              </div>
            </header>
            
            {error && (
              <Alert variant="destructive" className="mb-6 max-w-4xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {subscription && (
              <Card className="w-full max-w-2xl mx-auto mb-8 shadow-xl border-orange-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2" />
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className="text-2xl">{subscription.SubscriptionPlan?.Name || "Current Plan"}</span>
                    <Badge variant="outline" className={`${
                      subscription.Status === "Active" 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {subscription.Status || "Unknown"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {(subscription as any).ExpiryDate ? (
                      <span>Renews on {new Date((subscription as any).ExpiryDate).toLocaleDateString()}</span>
                    ) : "Your current subscription"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="font-medium text-gray-900 mb-3">Subscription Details</h3>
                    <ul className="space-y-3">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <span className={`font-medium ${
                          subscription.Status === "Active" ? "text-green-600" : "text-amber-600"
                        }`}>
                          {subscription.Status || "Unknown"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Plan</span>
                        <span className="font-medium">{subscription.SubscriptionPlan?.Name || "Current Plan"}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Billing</span>
                        <span className="font-medium">{subscription.SubscriptionPlan?.BillingCycle || "Monthly"}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">API Tokens</span>
                        <span className="font-medium">{(subscription as any).RemainingTokens || "Unlimited"}</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="text-center mt-8 mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Available Subscription Plans</h2>
              <p className="text-gray-600">Choose a plan that fits your needs</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {sortedPlans.map((plan, index) => {
                const isFree = parseFloat(plan.Price?.toString() || "0") === 0;
                const isTrialPlan = plan.PlanType === "Trial";
                const priceDisplay = isFree ? "Free" : `${formatCurrency(plan.Price, plan.Currency)}`;
                
                // Animation delay based on index
                const delay = index * 0.1;
                
                // Features
                const features = getPlaceholderFeatures(plan.PlanType || "", isFree, plan.MaxTokens || 0);
                
                return (
                  <motion.div
                    key={plan.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + delay }}
                    className="h-full"
                  >
                    <Card className={`h-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                      isTrialPlan ? 'border-amber-400' : 'border-gray-200'
                    } relative overflow-hidden`}>
                      {isTrialPlan && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-amber-500 text-white text-xs font-bold px-3 py-1 transform rotate-45 translate-x-4 translate-y-2 shadow-sm">
                            TRIAL
                          </div>
                        </div>
                      )}
                      
                      <CardHeader className={`${
                        isTrialPlan ? 'bg-gradient-to-r from-amber-50 to-amber-100' : 'bg-white'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          {getPlanIcon(plan, index)}
                          <CardTitle className="text-xl font-bold">{plan.Name}</CardTitle>
                        </div>
                        <CardDescription>
                          {plan.Description || (isTrialPlan 
                            ? "Perfect for getting started with our AI tools" 
                            : "Enhance your content creation")}
                        </CardDescription>
                        <div className="mt-4">
                          <div className="text-3xl font-bold">{priceDisplay}</div>
                          <div className="text-sm text-gray-500">/{plan.BillingCycle || "month"}</div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-sm uppercase tracking-wider text-gray-500 font-medium">Features</h4>
                          <ul className="space-y-3">
                            {features.map((feature, i) => (
                              <li key={i} className="flex items-start">
                                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="border-t pt-6 bg-gray-50">
                        <Button
                          className={`w-full ${
                            isTrialPlan 
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                              : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                          } text-white`}
                          onClick={() => handlePurchaseSubscription(plan.Id)}
                          disabled={isPurchasing}
                        >
                          {isPurchasing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
                              Processing...
                            </>
                          ) : isTrialPlan ? "Start Trial" : "Select Plan"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }
  
  // For WordPress integration with active subscription but without reaching the first condition
  // (This means the user has an active subscription but we're showing the WordPress integration UI)
  if (subscription && subscription.Status === "Active") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <header className="flex flex-col items-center text-center mb-8">
              <Logo size="lg" className="mb-8" />
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Connect Your WordPress Site
                </h1>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 mb-4 mx-auto">
                  <Check className="h-4 w-4 mr-2" />
                  <span>Active Subscription: {subscription.SubscriptionPlan?.Name}</span>
                </div>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  You already have an active subscription! Complete the integration to connect your WordPress site with our AI service.
                </p>
              </div>
            </header>
            
            {error && (
              <Alert variant="destructive" className="mb-6 max-w-4xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <Card className="shadow-xl border-orange-200 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2" />
              <CardHeader>
                <CardTitle className="text-2xl text-center">Complete WordPress Integration</CardTitle>
                <CardDescription className="text-center">
                  Connect your WordPress site with your existing subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-blue-800">
                    Your subscription is already active. You can now complete the WordPress integration process to connect your site with our AI service.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Your Active Plan Features</h4>
                  <ul className="space-y-3">
                    {getPlaceholderFeatures(subscription.SubscriptionPlan?.PlanType || "", false, subscription.SubscriptionPlan?.MaxTokens || 0).map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t p-6 flex flex-col">
                {isRedirecting ? (
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
                    disabled={true}
                  >
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
                    Completing Integration...
                  </Button>
                ) : integrationComplete ? (
                  <div className="space-y-4 w-full">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-green-800">Integration Complete</h4>
                        <p className="text-green-700 text-sm mt-1">
                          Your WordPress site has been successfully connected. You can now close this page and return to WordPress.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    onClick={handleWordPressIntegration}
                  >
                    Complete WordPress Integration
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }
  
  // Remove the duplicate declaration of sortedPlans
  // We will use the sortedPlans variable that was already defined earlier
  const filteredPlans = availablePlans.filter(plan => plan.IsActive)

  // Function to get a plan-specific icon
  const getPlanIcon = (plan: any, index: number) => {
    const icons = [
      <Sparkles key={0} className="h-6 w-6 text-amber-500" />,
      <Rocket key={1} className="h-6 w-6 text-violet-500" />,
      <Zap key={2} className="h-6 w-6 text-blue-500" />,
      <ShieldCheck key={3} className="h-6 w-6 text-emerald-500" />,
      <BarChart key={4} className="h-6 w-6 text-red-500" />
    ];
    
    return icons[index % icons.length];
  };

  // Return WordPress integration UI for subscription selection
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <header className="flex flex-col items-center text-center mb-14">
            <Logo size="lg" className="mb-8" />
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-2">
                Supercharge Your WordPress Site
              </h1>
              
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Choose a subscription plan to unlock powerful AI content creation features directly in your WordPress dashboard. 
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                Select Your AI Content Plan
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> Try For Free
                </Badge>
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                  <Laptop className="h-3.5 w-3.5 mr-1" /> WordPress Plugin
                </Badge>
                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                  <Zap className="h-3.5 w-3.5 mr-1" /> AI Powered
                </Badge>
              </div>
              <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-center mb-10 max-w-3xl mx-auto">
              
              <p className="text-gray-600">
                Choose the plan that best fits your content creation needs. 
              </p>
            </div>
          </motion.div>


            </div>
            
            {/* Skip subscription button - only enable when parameters exist
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4 max-w-xl">
              <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                <Laptop className="h-4 w-4 mr-2" /> WordPress Integration
              </h3>
              <p className="text-blue-700 text-sm mb-4">
                Select a subscription plan below and then press the "Complete Integration" button to connect with WordPress. Or skip for now and complete later.
              </p>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={handleOptOut}
                disabled={isRedirecting}
              >
                {isRedirecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Skip Subscription for Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div> */}
          </header>

          {purchaseError && (
            <Alert variant="destructive" className="mb-6 max-w-4xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {purchaseError.message || "There was an error processing your subscription."}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6 max-w-4xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

         
          {/* Show Complete Integration button if a plan is selected */}
          {selectedPlan && !integrationComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 text-center"
            >
              <div className="bg-green-50 border border-green-300 rounded-lg p-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 ml-3">Plan Selected!</h3>
                </div>
                <p className="text-green-700 mb-6">
                  You've selected a subscription plan. Click the button below to complete your WordPress integration.
                </p>
                <Button 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  size="lg"
                  onClick={handleWordPressIntegration}
                  disabled={isRedirecting}
                >
                  {isRedirecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
                      Completing Integration...
                    </>
                  ) : (
                    <>
                      Complete WordPress Integration
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {integrationComplete ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full"
              >
                <Card className="shadow-xl border-green-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2" />
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <CardTitle className="text-2xl font-bold">Integration Complete!</CardTitle>
                    </div>
                    <CardDescription>
                      Your WordPress site has been successfully connected to our AI service
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <p className="text-green-800">
                        You have successfully integrated your WordPress site with our AI assistant. You can now return to WordPress and start using the plugin.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                        <Laptop className="h-4 w-4 mr-2" /> Next Steps
                      </h4>
                      <ul className="space-y-2 text-blue-700 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Go back to your WordPress admin dashboard</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Open the AI Assistant plugin settings</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Start creating AI-powered content for your website</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              sortedPlans.map((plan, index) => {
                const isFree = parseFloat(plan.Price?.toString() || "0") === 0;
                const isTrialPlan = plan.PlanType === "Trial";
                const priceDisplay = isFree ? "Free" : `${formatCurrency(plan.Price, plan.Currency)}`;
                const isSelected = selectedPlan === plan.Id;
                
                // Animation delay based on index
                const delay = index * 0.1;
                
                // Placeholder features
                const features = getPlaceholderFeatures(plan.PlanType || "", isFree, plan.MaxTokens || 0);
                
                return (
                  <motion.div
                    key={plan.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + delay }}
                    className="h-full"
                  >
                    <Card className={`h-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                      isSelected 
                        ? 'border-green-500 ring-2 ring-green-300 transform scale-[1.02]' 
                        : isTrialPlan 
                          ? 'border-amber-400' 
                          : 'border-gray-200'
                    } relative overflow-hidden`}>
                      {isTrialPlan && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-amber-500 text-white text-xs font-bold px-3 py-1 transform rotate-45 translate-x-4 translate-y-2 shadow-sm">
                            TRIAL
                          </div>
                        </div>
                      )}
                      
                      {isSelected && (
                        <div className="absolute top-3 left-3">
                          <div className="bg-green-500 text-white rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                      
                      <CardHeader className={`${
                        isSelected 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50'
                          : isTrialPlan 
                            ? 'bg-gradient-to-r from-amber-50 to-amber-100' 
                            : 'bg-white'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          {getPlanIcon(plan, index)}
                          <CardTitle className="text-xl font-bold">{plan.Name}</CardTitle>
                        </div>
                        <CardDescription>
                          {plan.Description || (isTrialPlan 
                            ? "Perfect for getting started with our AI tools" 
                            : "Enhance your WordPress content creation")}
                        </CardDescription>
                        <div className="mt-4">
                          <div className="text-3xl font-bold">{priceDisplay}</div>
                          <div className="text-sm text-gray-500">/{plan.BillingCycle || "month"}</div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-sm uppercase tracking-wider text-gray-500 font-medium">Features</h4>
                          <ul className="space-y-3">
                            {features.map((feature, i) => (
                              <li key={i} className="flex items-start">
                                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="border-t pt-6 bg-gray-50">
                        <Button
                          className={`w-full ${
                            isSelected 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                              : isTrialPlan 
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                                : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                          } text-white`}
                          onClick={() => handlePurchaseSubscription(plan.Id)}
                          disabled={isPurchasing || isRedirecting || (isSelected && !integrationComplete)}
                        >
                          {isPurchasing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
                              Processing...
                            </>
                          ) : isSelected ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Selected
                            </>
                          ) : isTrialPlan ? "Select Trial" : "Select Plan"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </div>
          
          {!integrationComplete && (
            <div className="text-center mt-16 mb-8">
              <p className="text-gray-600 mb-4">
                Not ready to choose a plan? You can always subscribe later from your WordPress dashboard.
              </p>
              <Button
                variant="outline"
                className="border-red-200 hover:bg-red-50 hover:text-red-700 transition-all duration-300"
                onClick={handleOptOut}
                disabled={isRedirecting}
              >
                {isRedirecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Integration Without a Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 