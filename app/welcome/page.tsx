"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, ArrowRight, Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { UseSubscription } from "@/hooks/useSubscription"
import { PurchaseSubscriptionRequest } from "@/lib/services/SubscriptionService"

export default function WelcomePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { 
    availablePlans, 
    isLoadingPlans,
    isPurchasing,
    purchaseError,
    FetchAvailablePlans,
    PurchaseSubscription 
  } = UseSubscription()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [purchasingPlanId, setPurchasingPlanId] = useState<number | null>(null)
  const [mappedPlans, setMappedPlans] = useState<any[]>([])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (user) {
      toast({
        title: `Welcome, ${user.firstName || user.name}!`,
        description: "Thank you for signing up. Choose a plan to get started.",
      })
    }
  }, [user, toast])

  // Fetch available plans
  useEffect(() => {
    if (isAuthenticated) {
      FetchAvailablePlans()
    }
  }, [isAuthenticated, FetchAvailablePlans])

  // Map API plans to UI plans
  useEffect(() => {
    if (availablePlans && availablePlans.length > 0) {
      // Filter active plans and sort (Trial first, then by price)
      const sortedApiPlans = [...availablePlans]
        .filter(plan => plan.IsActive)
        .sort((a, b) => {
          // Trial plans first
          if (a.PlanType === "Trial" && b.PlanType !== "Trial") return -1
          if (a.PlanType !== "Trial" && b.PlanType === "Trial") return 1
          // Then by price
          return parseFloat(a.Price?.toString() || "0") - parseFloat(b.Price?.toString() || "0")
        })
      
      // Map API plans to UI format
      const uiPlans = sortedApiPlans.map(plan => {
        const isTrial = plan.PlanType === "Trial"
        return {
          id: plan.Id,
          name: plan.Name,
          price: isTrial || parseFloat(plan.Price?.toString() || "0") === 0 
            ? "Free" 
            : `$${parseFloat(plan.Price?.toString() || "0")}`,
          period: isTrial ? " 14 days" : `/${plan.BillingCycle}`,
          description: plan.Description,
          features: [
            `${plan.MaxTokens.toLocaleString()} tokens ${isTrial ? "included" : `per ${plan.BillingCycle}`}`,
            `Generate product descriptions, blog posts, and more`,
            `${isTrial ? "Limited" : "Full"} access to AI features`,
            ...(!isTrial ? ["24/7 priority support"] : [])
          ],
          highlight: isTrial ? "No credit card required" : "",
          popular: plan.Name.toLowerCase().includes("professional") || plan.Name.toLowerCase().includes("standard"),
          trial: isTrial,
          planType: plan.PlanType,
          apiPlan: plan // keep original API plan data
        }
      })
      
      setMappedPlans(uiPlans)
    }
  }, [availablePlans])
  
  const handleSelectPlan = (planId: number) => {
    setSelectedPlan(planId)
  }

  const handleSubscribeToPlan = async (planId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const plan = mappedPlans.find(p => p.id === planId)
    if (!plan) return
    
    setPurchasingPlanId(planId)
    
    try {
      const request: PurchaseSubscriptionRequest = {
        SubscriptionPlanId: planId,
        PaymentMethod: "credit_card", // Default payment method
        AutoRenew: true // Default to auto-renew
      }
      
      const result = await PurchaseSubscription(request)
      
      // The PurchaseSubscription function internally handles the redirect to Stripe
      // It redirects the browser to the Stripe checkout URL
      
      // The success/error handling will happen after redirect back from Stripe
      
    } catch (error) {
      console.error("Subscription error:", error)
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setPurchasingPlanId(null)
    }
  }

  const handleContinueWithoutPlan = () => {
    toast({
      title: "Welcome to the Dashboard",
      description: "You can subscribe to a plan anytime from your dashboard.",
    })
    router.push("/dashboard")
  }

  const isLoading = authLoading || isLoadingPlans

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  // Fallback plans if API plans aren't loaded yet
  const plans = mappedPlans.length > 0 ? mappedPlans : [
    {
      id: 1,
      name: "Free Trial",
      price: "Free",
      period: " 14 days",
      description: "Try out our AI content generation with no commitment.",
      features: [
        "10,000 tokens included",
        "Generate up to 10 product descriptions",
        "5 enhanced product listings (title, description, features)",
      ],
      highlight: "No credit card required",
      trial: true
    },
    {
      id: 2,
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small stores just getting started with AI content.",
      features: [
        "50,000 tokens per month",
        "Generate up to 50 product descriptions",
        "25 enhanced product listings",
        "24/7 priority support",
      ],
      trial: false
    },
    {
      id: 3,
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Ideal for growing stores with more content needs.",
      features: [
        "200,000 tokens per month",
        "Generate up to 200 product descriptions",
        "100 enhanced product listings (title, description, features, SEO)",
        "24/7 priority support",
      ],
      popular: true,
      trial: false
    },
    {
      id: 4,
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "For large stores with high-volume content requirements.",
      features: [
        "Unlimited tokens",
        "Unlimited product descriptions",
        "Unlimited enhanced product listings",
        "24/7 priority support",
      ],
      trial: false
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to WooProducts AI!</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose a plan that fits your needs. We offer you a 14-day free trial, no credit card required.
          </p>
          <Button
            onClick={handleContinueWithoutPlan}
            variant="outline"
            className="mt-4 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            Continue Without a Plan <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        {purchaseError && (
          <div className="max-w-4xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-medium">Subscription Error:</p>
            <p>{purchaseError.message || "There was an error processing your subscription. Please try again."}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all duration-300 ${
                selectedPlan === plan.id
                  ? "border-red-500 transform scale-105 z-10"
                  : "border-transparent hover:border-red-300"
              }`}
              onClick={() => handleSelectPlan(plan.id)}
            >
              {plan.popular && (
                <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 absolute right-0 top-0 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                {plan.trial && (
                  <div className="bg-orange-50 text-orange-700 px-3 py-2 rounded-lg text-sm font-medium mb-6">
                    {plan.trial}
                  </div>
                )}
                {plan.highlight && (
                  <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium mb-6 flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    {plan.highlight}
                  </div>
                )}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex space-x-3 h-[40px]">
                  <Button 
                    onClick={(e) => handleSubscribeToPlan(plan.id, e)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 flex-1 h-full"
                    size="sm"
                    disabled={isPurchasing || purchasingPlanId === plan.id}
                  >
                    {purchasingPlanId === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      plan.trial ? 'Start Free Trial' : 'Subscribe'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <p className="mt-4 text-gray-600">No credit card required for free trial. Cancel anytime.</p>
          <p className="mt-2 text-gray-500">
            Not ready to choose? 
            <Button 
              variant="link" 
              className="text-red-600 hover:text-red-800"
              onClick={handleContinueWithoutPlan}
            >
              Continue to dashboard without a plan
            </Button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
