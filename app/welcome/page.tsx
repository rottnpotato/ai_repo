"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function WelcomePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (user) {
      toast({
        title: `Welcome, ${user.firstName || user.name}!`,
        description: "Thank you for signing up. Choose a plan to get started.",
      })
    }
  }, [user, toast])

  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan)
  }

  const handleStartTrial = (plan: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPlan(plan);
    toast({
      title: "Trial Started",
      description: `You've started a free trial of the ${plan} plan!`,
    });
    router.push("/dashboard");
  }

  const handleSubscribe = (plan: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPlan(plan);
    toast({
      title: "Subscription Started",
      description: `You've subscribed to the ${plan} plan!`,
    });
    router.push("/dashboard");
  }

  const handleContinue = () => {
    if (selectedPlan) {
      toast({
        title: "Plan Selected",
        description: `You've selected the ${selectedPlan} plan. Your free trial has started!`,
      })
      router.push("/dashboard")
    } else {
      toast({
        title: "Please select a plan",
        description: "You need to select a plan to continue.",
        variant: "destructive",
      })
    }
  }

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  const plans = [
    {
      id: "trial",
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
    },
    {
      id: "starter",
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small stores just getting started with AI content.",
      features: [
        "50,000 tokens per month",
        "Generate up to 50 product descriptions",
        "25 enhanced product listings (title, description, features, and more)",
        "24/7 priority support",
      ],
    },
    {
      id: "professional",
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
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "For large stores with high-volume content requirements.",
      features: [
        "Unlimited tokens",
        "Unlimited product descriptions",
        "Unlimited enhanced product listings (title, description, features, and more)",
        "24/7 priority support",
      ],
      trial: "",
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
        </motion.div>

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
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex space-x-3 h-[40px]">
                  {plan.id === "trial" ? (
                    <Button 
                      onClick={(e) => handleStartTrial(plan.id, e)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 flex-1 h-full"
                      size="sm"
                    >
                      Start Trial
                    </Button>
                  ) : (
                    <Button 
                      onClick={(e) => handleSubscribe(plan.id, e)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 flex-1 h-full"
                      size="sm"
                    >
                      Subscribe
                    </Button>
                  )}
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
          {/* <Button
            onClick={handleContinue}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-8 py-3 text-lg"
            size="lg"
          >
            Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
          </Button> */}
          <p className="mt-4 text-gray-600">No credit card required. Cancel anytime.</p>
        </motion.div>
      </div>
    </div>
  )
}
