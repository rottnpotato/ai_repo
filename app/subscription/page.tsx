"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Check, CreditCard, Info, Shield, Trash, Sparkles, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { UseSubscription } from "@/hooks/useSubscription"
import { PurchaseSubscriptionRequest, SubscriptionPlan } from "@/lib/services/SubscriptionService"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SubscriptionPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { 
    subscription, 
    availablePlans, 
    isLoading: subscriptionLoading, 
    isLoadingPlans,
    isPurchasing,
    purchaseError,
    FetchAvailablePlans,
    PurchaseSubscription
  } = UseSubscription()
  const router = useRouter()
  const { toast } = useToast()
  const [showAddCard, setShowAddCard] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card")
  const [autoRenew, setAutoRenew] = useState<boolean>(true)
  const [showConfirmPurchaseDialog, setShowConfirmPurchaseDialog] = useState(false)

  // Mock payment methods
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: "pm_1234567890",
      type: "card",
      brand: "visa",
      last4: "4242",
      expMonth: 12,
      expYear: 2025,
      isDefault: true,
    },
  ])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    FetchAvailablePlans()
  }, [FetchAvailablePlans])

  const isLoading = authLoading || subscriptionLoading || isLoadingPlans

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  const handleAddPaymentMethod = () => {
    // In a real app, this would integrate with a payment processor like Stripe
    const newCard = {
      id: `pm_${Math.random().toString(36).substring(2, 15)}`,
      type: "card",
      brand: "mastercard",
      last4: "5678",
      expMonth: 9,
      expYear: 2026,
      isDefault: false,
    }

    setPaymentMethods([...paymentMethods, newCard])
    setShowAddCard(false)
    toast({
      title: "Payment method added",
      description: "Your new payment method has been added successfully.",
    })
  }

  const handleSetDefaultPaymentMethod = (id: string) => {
    const updatedMethods = paymentMethods.map((method) => ({
      ...method,
      isDefault: method.id === id,
    }))
    setPaymentMethods(updatedMethods)
    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been updated.",
    })
  }

  const handleRemovePaymentMethod = (id: string) => {
    const updatedMethods = paymentMethods.filter((method) => method.id !== id)
    setPaymentMethods(updatedMethods)
    toast({
      title: "Payment method removed",
      description: "Your payment method has been removed.",
    })
  }

  const handleProceedToPurchase = () => {
    if (!selectedPlan) return
    
    setShowChangePlanDialog(false)
    setShowConfirmPurchaseDialog(true)
  }

  const handleConfirmPurchase = async () => {
    if (!selectedPlan) return
    
    const request: PurchaseSubscriptionRequest = {
      SubscriptionPlanId: selectedPlan,
      PaymentMethod: paymentMethod,
      AutoRenew: autoRenew
    }
    
    const result = await PurchaseSubscription(request)
    
    if (result) {
      setShowConfirmPurchaseDialog(false)
      setSelectedPlan(null)
      
      toast({
        title: "Subscription Successful",
        description: `You've successfully subscribed to the ${result.SubscriptionPlan?.Name} plan.`,
      })
    } else if (purchaseError) {
      toast({
        title: "Subscription Failed",
        description: purchaseError.message || "There was an error processing your subscription.",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  const formatCurrency = (price: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(parseFloat(price))
  }

  const getActivePlanDetails = () => {
    if (!subscription || !subscription.SubscriptionPlan) {
      return null
    }
    return subscription.SubscriptionPlan
  }

  const activePlan = getActivePlanDetails()
  const filteredPlans = availablePlans.filter(plan => plan.IsActive)

  // Sort plans with Trial first, then by price
  const sortedPlans = [...filteredPlans].sort((a, b) => {
    // Trial plans first
    if (a.PlanType === "Trial" && b.PlanType !== "Trial") return -1;
    if (a.PlanType !== "Trial" && b.PlanType === "Trial") return 1;

    // Then by price
    return parseFloat(a.Price?.toString() || "0") - parseFloat(b.Price?.toString() || "0");
  });

  // Get selected plan details
  const getSelectedPlanDetails = () => {
    if (!selectedPlan) return null;
    return sortedPlans.find(plan => plan.Id === selectedPlan);
  }

  const selectedPlanDetails = getSelectedPlanDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4">
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
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => router.push("/logout")}
          >
            Logout
          </Button>
        </header>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600 mb-8">Manage your subscription plan and payment methods.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="border-orange-100 shadow-md mb-8 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Your active subscription details</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {activePlan ? (
                    <div className="bg-orange-50 rounded-lg p-5 mb-5 border border-orange-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{activePlan.Name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {subscription!.Status === "Trial"
                              ? `Free trial - Ends on ${formatDate(subscription!.EndDate)}`
                              : `${activePlan.BillingCycle} billing - Next payment on ${formatDate(subscription!.EndDate)}`}
                          </p>
                        </div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {subscription!.Status}
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-orange-100 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Tokens Used:</span>
                          <span className="font-semibold">{subscription!.TokensUsed.toLocaleString()} / {activePlan.MaxTokens.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Type:</span>
                          <span className="font-semibold">{activePlan.PlanType}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Price:</span>
                          <span className="font-semibold">
                            {activePlan.Price === "0.00"
                              ? "Free"
                              : `${formatCurrency(activePlan.Price?.toString() || "0", activePlan.Currency)} / ${activePlan.BillingCycle}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Auto-Renew:</span>
                          <span className="font-semibold">{subscription!.AutoRenew ? "Enabled" : "Disabled"}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-orange-50 rounded-lg p-5 mb-5 border border-orange-100 text-center">
                      <div className="mb-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3">
                          <Info className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No active subscription found</h3>
                      <p className="text-sm text-gray-600 mb-4">Choose a subscription plan to get started with our services.</p>
                    </div>
                  )}

                  <Button 
                    onClick={() => setShowChangePlanDialog(true)} 
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    {activePlan ? "Change Plan" : "Choose a Plan"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-orange-100 shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment information</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-3 rounded-full mr-4">
                            <CreditCard className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">
                              {method.brand} •••• {method.last4}{" "}
                              {method.isDefault && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full">
                                  Default
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              Expires {method.expMonth}/{method.expYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!method.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefaultPaymentMethod(method.id)}
                              className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => handleRemovePaymentMethod(method.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddCard(true)} 
                    className="w-full mt-5 border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-orange-100 shadow-md sticky top-8 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                  <CardTitle>Need Help?</CardTitle>
                  <CardDescription>Resources and support</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Billing Questions</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        For questions about your bill or payment methods, contact our billing team.
                      </p>
                      <a
                        href="mailto:billing@example.com"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                      >
                        billing@example.com
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <Shield className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Security</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        We use industry-standard encryption to protect your payment information.
                      </p>
                      <a
                        href="/security"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                      >
                        Learn more
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 mt-2" 
                    onClick={() => router.push("/faq")}
                  >
                    View FAQ
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Add Payment Method Dialog */}
        <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>Enter your card information to add a new payment method.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="4242 4242 4242 4242" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiration Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name on Card</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddCard(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPaymentMethod}>Add Card</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Plan Dialog */}
        <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
          <DialogContent className="sm:max-w-4xl max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Choose a Subscription Plan</DialogTitle>
              <DialogDescription>Select a plan that best fits your needs.</DialogDescription>
            </DialogHeader>
            
            {sortedPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                {sortedPlans.map((plan, index) => {
                  const isCurrentPlan = activePlan?.Id === plan.Id;
                  const isFree = parseFloat(plan.Price?.toString() || "0") === 0;
                  const isTrialPlan = plan.PlanType === "Trial";
                  const priceDisplay = isFree ? "Free" : `${formatCurrency(plan.Price?.toString() || "0", plan.Currency)}`;
                  
                  // Animation delay based on index
                  const delay = index * 0.1;
                  
                  return (
                    <motion.div
                      key={plan.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay }}
                      className={`relative overflow-hidden rounded-xl transition-all duration-300 transform ${
                        selectedPlan === plan.Id
                          ? "scale-105 shadow-xl"
                          : "hover:scale-102 shadow-md hover:shadow-lg"
                      }`}
                    >
                      {/* Card Background */}
                      <div
                        className={`h-full flex flex-col border-2 rounded-xl overflow-hidden ${
                          selectedPlan === plan.Id
                            ? "border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50"
                            : isCurrentPlan 
                              ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {/* Plan Header */}
                        <div className={`px-5 py-4 border-b ${
                          selectedPlan === plan.Id
                            ? "border-orange-200 bg-orange-100/50"
                            : isCurrentPlan 
                              ? "border-blue-200 bg-blue-100/50"
                              : "border-gray-100"
                        }`}>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-lg text-gray-900">{plan.Name}</h3>
                            <div className="flex flex-col items-end gap-1">
                              {isCurrentPlan && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 whitespace-nowrap">
                                  Current Plan
                                </span>
                              )}
                              {isTrialPlan && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 whitespace-nowrap">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Trial
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm h-10 line-clamp-2">{plan.Description}</p>
                        </div>
                        
                        {/* Plan Price */}
                        <div className="px-5 py-4 flex flex-col items-center text-center">
                          <div className="mb-1 text-gray-500 text-sm font-medium">
                            {isTrialPlan ? "Free Trial Period" : "Monthly Subscription"}
                          </div>
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-gray-900">{priceDisplay}</span>
                            {!isFree && (
                              <span className="text-sm font-normal text-gray-500 ml-1">/{plan.BillingCycle}</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Plan Features */}
                        <div className="px-5 py-4 flex-grow bg-gray-50/80">
                          <div className="space-y-3">
                            <div className="flex items-center text-sm">
                              <div className="mr-2 p-1 rounded-full bg-green-100">
                                <Check className="h-3 w-3 text-green-600" />
                              </div>
                              <span className="text-gray-700">
                                <span className="font-semibold">{plan.MaxTokens.toLocaleString()}</span> tokens per {plan.BillingCycle}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <div className="mr-2 p-1 rounded-full bg-green-100">
                                <Check className="h-3 w-3 text-green-600" />
                              </div>
                              <span className="text-gray-700">
                                <span className="font-semibold">{plan.PlanType}</span> features included
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <div className="mr-2 p-1 rounded-full bg-green-100">
                                <Check className="h-3 w-3 text-green-600" />
                              </div>
                              <span className="text-gray-700">
                                {isTrialPlan ? "No credit card required" : "Premium support"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Selection Button */}
                        <div className="p-5 border-t border-gray-100">
                          <Button 
                            className={`w-full ${
                              isCurrentPlan
                                ? "bg-blue-500 hover:bg-blue-600 cursor-default"
                                : selectedPlan === plan.Id
                                  ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                                  : "bg-gray-800 hover:bg-gray-900"
                            }`}
                            disabled={isCurrentPlan}
                            onClick={() => setSelectedPlan(plan.Id)}
                          >
                            {isCurrentPlan 
                              ? "Current Plan" 
                              : selectedPlan === plan.Id 
                                ? "Selected" 
                                : "Select Plan"}
                          </Button>
                        </div>
                        
                        {/* Selected Indicator */}
                        {selectedPlan === plan.Id && (
                          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-amber-400"></div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Info className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg">No subscription plans available at the moment.</p>
                <p className="text-gray-500 text-sm mt-2">Please check back later or contact support.</p>
              </div>
            )}
            
            <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => setShowChangePlanDialog(false)}
                className="sm:mr-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleProceedToPurchase} 
                disabled={!selectedPlan! || (activePlan! && selectedPlan === activePlan!.Id)}
                className={`${!selectedPlan! || (activePlan! && selectedPlan === activePlan!.Id) 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'}`}
              >
                {isPurchasing ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Processing...
                  </>
                ) : (
                  "Proceed to Purchase"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Purchase Dialog */}
        <Dialog open={showConfirmPurchaseDialog} onOpenChange={setShowConfirmPurchaseDialog}>
          <DialogContent className="max-h-screen max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Confirm Subscription</DialogTitle>
              <DialogDescription>Review your subscription details before confirming.</DialogDescription>
            </DialogHeader>
            
            {selectedPlanDetails && (
              <div className="space-y-6 py-4">
                {/* Plan Summary */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{selectedPlanDetails.Name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{selectedPlanDetails.Description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Price:</span>
                      <span className="font-semibold">
                        {selectedPlanDetails.Price === "0.00"
                          ? "Free"
                          : `${formatCurrency(selectedPlanDetails.Price?.toString() || "0", selectedPlanDetails.Currency)} / ${selectedPlanDetails.BillingCycle}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Tokens:</span>
                      <span className="font-semibold">{selectedPlanDetails.MaxTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Type:</span>
                      <span className="font-semibold">{selectedPlanDetails.PlanType}</span>
                    </div>
                  </div>
                </div>
                
                {/* Payment Method */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Payment Method</Label>
                  <RadioGroup 
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-200">
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card" className="flex items-center cursor-pointer">
                        <CreditCard className="h-4 w-4 mr-2 text-gray-600" />
                        <span>Credit Card</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-200">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="cursor-pointer">PayPal</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-200">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer" className="cursor-pointer">Bank Transfer</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Auto-renew toggle */}
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                  <div>
                    <h4 className="font-medium">Auto-renew Subscription</h4>
                    <p className="text-sm text-gray-600">Your subscription will automatically renew at the end of the period.</p>
                  </div>
                  <Switch 
                    checked={autoRenew} 
                    onCheckedChange={setAutoRenew} 
                  />
                </div>
                
                {/* Warning for non-trial plans */}
                {selectedPlanDetails.PlanType !== "Trial" && selectedPlanDetails.Price !== "0.00" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Your card will be charged {formatCurrency(selectedPlanDetails.Price?.toString() || "0", selectedPlanDetails.Currency)} immediately.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            
            <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0 border-t border-gray-200 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowConfirmPurchaseDialog(false)
                  setShowChangePlanDialog(true)
                }}
                className="sm:mr-auto"
              >
                Back
              </Button>
              <Button 
                onClick={handleConfirmPurchase}
                disabled={isPurchasing}
                className={`${isPurchasing ? 'opacity-70 cursor-not-allowed' : ''} bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600`}
              >
                {isPurchasing ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Processing...
                  </>
                ) : (
                  "Confirm Subscription"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
    </div>
  )
} 