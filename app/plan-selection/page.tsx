"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Check, CreditCard, Info, Shield, Sparkles, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { UseSubscription } from "@/hooks/useSubscription"
import { PurchaseSubscriptionRequest, SubscriptionPlan } from "@/lib/services/SubscriptionService"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PlanSelectionPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
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
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card")
  const [autoRenew, setAutoRenew] = useState<boolean>(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    // Load subscription and available plans
    const loadData = async () => {
      const subscriptionData = await FetchSubscription()
      
      // If user already has a subscription with trial, redirect to dashboard
      if (subscriptionData && subscriptionData.Status === "Trial") {
        router.push("/dashboard")
      }
    }
    
    if (isAuthenticated && !authLoading) {
      loadData()
      FetchAvailablePlans()
    }
  }, [isAuthenticated, authLoading, FetchSubscription, FetchAvailablePlans, router])

  const isLoading = authLoading || subscriptionLoading || isLoadingPlans

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  const handleConfirmPurchase = async (planId: number) => {
    const request: PurchaseSubscriptionRequest = {
      SubscriptionPlanId: planId,
      PaymentMethod: paymentMethod,
      AutoRenew: autoRenew
    }
    
    try {
      await PurchaseSubscription(request)
      // Note: The function will never reach this point as it redirects to Stripe
      // The success/error handling will happen after redirect back from Stripe
      setSelectedPlan(null)
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "There was an error processing your subscription.",
        variant: "destructive"
      })
    }
  }

  const formatCurrency = (price: string | number | undefined, currency: string) => {
    if (price === undefined) return "$0.00"
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(parseFloat(price.toString()))
  }

  // Filter active plans
  const filteredPlans = availablePlans.filter(plan => plan.IsActive)

  // Sort plans with Trial first, then by price
  const sortedPlans = [...filteredPlans].sort((a, b) => {
    // Trial plans first
    if (a.PlanType === "Trial" && b.PlanType !== "Trial") return -1
    if (a.PlanType !== "Trial" && b.PlanType === "Trial") return 1

    // Then by price
    return parseFloat(a.Price?.toString() || "0") - parseFloat(b.Price?.toString() || "0")
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <Logo size="md" />
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => router.push("/logout")}
          >
            Logout
          </Button>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
            <p className="text-xl text-gray-600">
              Welcome to Your WordPress AI Assistant! Select a plan to get started.
            </p>
            <Button
              variant="ghost"
              className="mt-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => router.push("/dashboard")}
            >
              Subscribe Later
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {purchaseError && (
            <Alert variant="destructive" className="mb-6 max-w-4xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {purchaseError.message || "There was an error processing your subscription."}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {sortedPlans.map((plan, index) => {
              const isFree = parseFloat(plan.Price?.toString() || "0") === 0
              const isTrialPlan = plan.PlanType === "Trial"
              const priceDisplay = isFree ? "Free" : `${formatCurrency(plan.Price, plan.Currency)}`
              
              // Animation delay based on index
              const delay = index * 0.1
              
              return (
                <motion.div
                  key={plan.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay }}
                  className="h-full"
                >
                  <Card className={`h-full border-2 hover:shadow-lg transition-all duration-300 ${
                    isTrialPlan ? 'border-amber-400' : 'border-gray-200'
                  }`}>
                    <CardHeader className={`${
                      isTrialPlan ? 'bg-gradient-to-r from-amber-50 to-amber-100' : 'bg-white'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-bold">{plan.Name}</CardTitle>
                          <CardDescription className="mt-1">
                            {isTrialPlan && (
                              <div className="flex items-center text-amber-600 font-medium">
                                <Sparkles className="h-4 w-4 mr-1" />
                                Try it for free
                              </div>
                            )}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{priceDisplay}</div>
                          <div className="text-xs text-gray-500">/{plan.BillingCycle}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="mb-6 flex-grow">
                        <p className="text-gray-600 mb-4">{plan.Description}</p>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span>{plan.MaxTokens.toLocaleString()} tokens per {plan.BillingCycle}</span>
                          </li>
                          {isTrialPlan && (
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                              <span>7 days free access</span>
                            </li>
                          )}
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span>Full access to all features</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span>Email support</span>
                          </li>
                        </ul>
                      </div>
                      <Button 
                        className={`w-full ${
                          isTrialPlan 
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' 
                            : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                        } text-white`}
                        disabled={isPurchasing}
                        onClick={() => handleConfirmPurchase(plan.Id)}
                      >
                        {isPurchasing && selectedPlan === plan.Id ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          isTrialPlan ? 'Start Free Trial' : 'Select Plan'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-12 max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-start">
              <Shield className="h-6 w-6 text-blue-500 mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Secure & Flexible</h3>
                <p className="text-gray-600">
                  All plans come with secure payment processing and you can upgrade, downgrade, or cancel at any time.
                  Your subscription will automatically renew at the end of each billing period unless cancelled.
                </p>
                <p className="text-gray-600 mt-3">
                  Not ready to choose? You can also <button 
                    onClick={() => router.push("/dashboard")} 
                    className="text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    skip for now
                  </button> and subscribe later from your dashboard.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 