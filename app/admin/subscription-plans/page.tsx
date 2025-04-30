"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  PlusCircle,
  Trash2,
  Edit,
  AlertCircle,
  Check,
  X,
  Tag,
  CalendarClock,
  Coins,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { SubscriptionService, SubscriptionPlan } from "@/lib/services/SubscriptionService"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

export default function SubscriptionPlansPage() {
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
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
    fetchSubscriptionPlans()
  }, [])

  const fetchSubscriptionPlans = async () => {
    setIsLoading(true)
    try {
      const plans = await SubscriptionService.GetSubscriptionPlans()
      setSubscriptionPlans(plans)
    } catch (error) {
      console.error("Error fetching subscription plans:", error)
      toast({
        title: "Error",
        description: "Failed to fetch subscription plans. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePlan = async () => {
    try {
      // Make sure price is a valid number
      const formattedData = {
        ...formData,
        Price: typeof formData.Price === "string" ? parseFloat(formData.Price) : formData.Price,
      }
      
      const newPlan = await SubscriptionService.CreateSubscriptionPlan(formattedData)
      setSubscriptionPlans((prev) => [...prev, newPlan])
      setFormData({
        Name: "",
        Description: "",
        PlanType: "Business",
        MaxTokens: 1000,
        Price: "0",
        Currency: "USD",
        BillingCycle: "monthly",
        IsActive: true,
      })
      setIsCreateDialogOpen(false)
      toast({
        title: "Success",
        description: "Subscription plan created successfully.",
      })
    } catch (error) {
      console.error("Error creating subscription plan:", error)
      toast({
        title: "Error",
        description: "Failed to create subscription plan. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePlan = async () => {
    if (!selectedPlanId) return

    try {
      await SubscriptionService.DeleteSubscriptionPlan(selectedPlanId)
      setSubscriptionPlans((prev) => prev.filter((plan) => plan.Id !== selectedPlanId))
      setIsDeleteDialogOpen(false)
      setSelectedPlanId(null)
      toast({
        title: "Success",
        description: "Subscription plan deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting subscription plan:", error)
      toast({
        title: "Error",
        description: "Failed to delete subscription plan. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatPrice = (price: string | number, currency: string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(numPrice)
  }

  const handleFormChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-gray-500 mt-1">
            Manage all subscription plans available to users
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Subscription Plan</DialogTitle>
              <DialogDescription>
                Add a new subscription plan for your users.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={formData.Name}
                  onChange={(e) => handleFormChange("Name", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  value={formData.Description}
                  onChange={(e) => handleFormChange("Description", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="planType" className="text-right">
                  Plan Type
                </Label>
                <Select
                  value={formData.PlanType}
                  onValueChange={(value) => handleFormChange("PlanType", value)}
                >
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxTokens" className="text-right">
                  Max Tokens
                </Label>
                <Input
                  id="maxTokens"
                  type="number"
                  className="col-span-3"
                  value={formData.MaxTokens}
                  onChange={(e) => handleFormChange("MaxTokens", parseInt(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  className="col-span-3"
                  value={formData.Price}
                  onChange={(e) => handleFormChange("Price", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currency" className="text-right">
                  Currency
                </Label>
                <Select
                  value={formData.Currency}
                  onValueChange={(value) => handleFormChange("Currency", value)}
                >
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="billingCycle" className="text-right">
                  Billing Cycle
                </Label>
                <Select
                  value={formData.BillingCycle}
                  onValueChange={(value) => handleFormChange("BillingCycle", value)}
                >
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Active
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.IsActive}
                    onCheckedChange={(checked) => handleFormChange("IsActive", checked)}
                  />
                  <span className="text-sm text-gray-500">
                    {formData.IsActive ? "Plan is active and available to users" : "Plan is inactive and hidden from users"}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlan}>Create Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : subscriptionPlans.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Subscription Plans</h3>
            <p className="text-center text-gray-500 mb-6">
              You haven't created any subscription plans yet.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>Create Your First Plan</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <Card key={plan.Id} className="overflow-hidden">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{plan.Name}</CardTitle>
                    <Badge
                      variant={plan.IsActive ? "default" : "outline"}
                      className="mt-2"
                    >
                      {plan.IsActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/subscription-plans/${plan.Id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedPlanId(plan.Id)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-500">{plan.Description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <span>Type: {plan.PlanType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      <span>
                        {plan.BillingCycle.charAt(0).toUpperCase() +
                          plan.BillingCycle.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-primary" />
                      <span>{formatPrice(plan.Price, plan.Currency)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{plan.MaxTokens.toLocaleString()} tokens</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 px-6 py-3">
                <div className="text-xs text-gray-500 w-full flex justify-between">
                  <span>ID: {plan.Id}</span>
                  <span>
                    {plan.CreatedAt && new Date(plan.CreatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Subscription Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscription plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 