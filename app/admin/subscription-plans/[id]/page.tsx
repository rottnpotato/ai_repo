"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { SubscriptionService, SubscriptionPlan } from "@/lib/services/SubscriptionService"

export default function EditSubscriptionPlanPage({ params }: { params: { id: string } }) {
  const planId = parseInt(params.id)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null)
  const [formData, setFormData] = useState<Omit<SubscriptionPlan, "Id" | "CreatedAt" | "UpdatedAt">>({
    Name: "",
    Description: "",
    PlanType: "Business",
    MaxTokens: 1000,
    Price: "0",
    Currency: "USD",
    BillingCycle: "monthly",
    IsActive: true,
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchSubscriptionPlan = async () => {
      setIsLoading(true)
      try {
        // First get all plans
        const plans = await SubscriptionService.GetSubscriptionPlans()
        // Find the specific plan by ID
        const plan = plans.find(p => p.Id === planId)
        
        if (!plan) {
          toast({
            title: "Error",
            description: "Subscription plan not found. Plan ID: " + planId,
            variant: "destructive",
          })
          setIsLoading(false)
          // Removed router.push("/admin/subscription-plans") to prevent redirect loops
          return
        }
        
        setSubscriptionPlan(plan)
        setFormData({
          Name: plan.Name,
          Description: plan.Description,
          PlanType: plan.PlanType,
          MaxTokens: plan.MaxTokens,
          Price: plan.Price,
          Currency: plan.Currency,
          BillingCycle: plan.BillingCycle,
          IsActive: plan.IsActive,
        })
      } catch (error) {
        console.error("Error fetching subscription plan:", error)
        toast({
          title: "Error",
          description: "Failed to fetch subscription plan. Please try again.",
          variant: "destructive",
        })
        // Removed router.push("/admin/subscription-plans") to prevent redirect loops
      } finally {
        setIsLoading(false)
      }
    }

    if (planId) {
      fetchSubscriptionPlan()
    }
  }, [planId, router, toast])

  const handleFormChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Make sure price is a valid number
      const formattedData = {
        ...formData,
        Price: typeof formData.Price === "string" ? parseFloat(formData.Price) : formData.Price,
      }
      
      await SubscriptionService.UpdateSubscriptionPlan(planId, formattedData)
      toast({
        title: "Success",
        description: "Subscription plan updated successfully.",
      })
      router.push("/admin/subscription-plans")
    } catch (error) {
      console.error("Error updating subscription plan:", error)
      toast({
        title: "Error",
        description: "Failed to update subscription plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If we're not loading but no subscription plan was found, show a helpful message
  if (!subscriptionPlan) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/admin/subscription-plans")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Subscription Plan Not Found</h1>
              <p className="text-gray-500 mt-1">
                The subscription plan you are looking for (ID: {planId}) could not be found.
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6 pb-4">
            <p>This plan may have been deleted or you may have entered an invalid plan ID.</p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={() => router.push("/admin/subscription-plans")}
            >
              Return to Subscription Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/subscription-plans")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Subscription Plan</h1>
            <p className="text-gray-500 mt-1">
              Modify the details of an existing subscription plan
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
          <CardDescription>Update the information for this subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.Name}
                onChange={(e) => handleFormChange("Name", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="planType">Plan Type</Label>
              <Select
                value={formData.PlanType}
                onValueChange={(value) => handleFormChange("PlanType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select plan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Trial">Trial</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.Description}
                onChange={(e) => handleFormChange("Description", e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                value={formData.MaxTokens}
                onChange={(e) => handleFormChange("MaxTokens", parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.Price}
                onChange={(e) => handleFormChange("Price", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.Currency}
                onValueChange={(value) => handleFormChange("Currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billingCycle">Billing Cycle</Label>
              <Select
                value={formData.BillingCycle}
                onValueChange={(value) => handleFormChange("BillingCycle", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="biannual">Biannual</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 flex items-center">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.IsActive}
                  onCheckedChange={(checked) => handleFormChange("IsActive", checked)}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  {formData.IsActive ? "Active" : "Inactive"}
                </Label>
              </div>
              <span className="text-sm text-gray-500 ml-6">
                {formData.IsActive
                  ? "Plan is visible and available to users"
                  : "Plan is hidden from users"}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={() => router.push("/admin/subscription-plans")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 