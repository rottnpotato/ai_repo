"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, RefreshCcw, ChevronUp, ChevronDown, Zap, AlertTriangle, Calendar, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { User } from "@/contexts/auth-context"
import { AdminService } from "@/lib/services/AdminService"
import { SubscriptionService, UserSubscription } from "@/lib/services/SubscriptionService"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function TokensPageClient({ params }: { params: { userId: string } }) {
  const [user, setUser] = useState<User | null>(null)
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([])
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [tokenAmount, setTokenAmount] = useState(100)
  const [tokenNote, setTokenNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>(params.userId)
  const router = useRouter()
  const { toast } = useToast()

  // Extract user ID from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get the URL path and extract the UUID between "users/" and "/tokens"
      const path = window.location.pathname;
      const matches = path.match(/\/users\/([^\/]+)\/tokens/);
      
      if (matches && matches[1]) {
        const extractedUserId = matches[1];
        console.log("Extracted user ID from URL:", extractedUserId);
        setUserId(extractedUserId);
      } else {
        console.log("Falling back to params userId:", params.userId);
      }
    }
  }, [params.userId]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Fetching data for user ID:", userId)
        
        // First, try to fetch user subscriptions directly
        try {
          const subscriptions = await SubscriptionService.GetUserSubscriptions(userId)
          
          if (Array.isArray(subscriptions) && subscriptions.length > 0) {
            console.log("Successfully fetched user subscriptions:", subscriptions)
            setUserSubscriptions(subscriptions)
            
            // Find an active subscription if available
            const activeSubscription = subscriptions.find(sub => sub.Status === "active")
            if (activeSubscription) {
              setSelectedSubscriptionId(activeSubscription.Id)
            } else {
              // Otherwise use the first subscription
              setSelectedSubscriptionId(subscriptions[0].Id)
            }
            
            // Now fetch basic user info
            try {
              // Fetch all users
              const response = await AdminService.GetAllUsers()
              
              if (!response.success || !response.users || !Array.isArray(response.users)) {
                console.warn("Failed to fetch users data. Using subscription data for user info.")
                
                // Create a minimal user object from subscription data
                if (subscriptions[0].UserId) {
                  setUser({
                    id: subscriptions[0].UserId,
                    name: `User ${subscriptions[0].UserId.substring(0, 8)}...`,
                    email: "",
                    role: "user",
                    // Add required properties to fix TypeScript errors
                    plan: 'free',
                    subscriptionStatus: 'active',
                    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    billingCycle: 'monthly',
                    subscriptionStartDate: new Date().toISOString(),
                    apiKey: 'sk_placeholder_' + Math.random().toString(36).substring(2, 15),
                    status: "active"
                  })
                }
              } else {
                // Find the user with the specified ID
                const backendUser = AdminService.FindUserById(response.users, userId)
                
                if (backendUser) {
                  // Convert backend user to frontend user format
                  const foundUser = AdminService.MapBackendUserToFrontend(backendUser)
                  setUser(foundUser)
                } else {
                  console.warn("User not found in users list. Using subscription data for user info.")
                  
                  // Create a minimal user object from subscription data
                  setUser({
                    id: subscriptions[0].UserId,
                    name: `User ${subscriptions[0].UserId.substring(0, 8)}...`,
                    email: "",
                    role: "user",
                    // Add required properties to fix TypeScript errors
                    plan: 'free',
                    subscriptionStatus: 'active',
                    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    billingCycle: 'monthly',
                    subscriptionStartDate: new Date().toISOString(),
                    apiKey: 'sk_placeholder_' + Math.random().toString(36).substring(2, 15),
                    status: "active"
                  })
                }
              }
            } catch (userError) {
              console.error("Error fetching user details:", userError)
              
              // Create a minimal user object from subscription data
              setUser({
                id: subscriptions[0].UserId,
                name: `User ${subscriptions[0].UserId.substring(0, 8)}...`,
                email: "",
                role: "user",
                // Add required properties to fix TypeScript errors
                plan: 'free',
                subscriptionStatus: 'active',
                nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                billingCycle: 'monthly',
                subscriptionStartDate: new Date().toISOString(),
                apiKey: 'sk_placeholder_' + Math.random().toString(36).substring(2, 15),
                status: "active"
              })
            }
          } else {
            throw new Error("No subscriptions found for this user")
          }
        } catch (subscriptionError) {
          console.error("Error fetching user subscriptions:", subscriptionError)
          
          // If subscription fetch fails, try the original approach with user data first
          const response = await AdminService.GetAllUsers()
          
          if (!response.success || !response.users || !Array.isArray(response.users)) {
            setError("Failed to fetch users data. Please try again later.")
            throw new Error("Failed to fetch users data")
          }
          
          console.log("User ID from URL:", userId)
          console.log("Available User IDs:", response.users.map(u => u.Id))
          
          const backendUser = AdminService.FindUserById(response.users, userId)
          
          if (!backendUser) {
            setError(`User with ID "${userId}" could not be found. Please check the ID and try again.`)
            throw new Error(`User with ID "${userId}" could not be found`)
          }

          const foundUser = AdminService.MapBackendUserToFrontend(backendUser)
          setUser(foundUser)
          
          // Try again to fetch subscriptions
          try {
            const subscriptions = await SubscriptionService.GetUserSubscriptions(userId)
            
            if (Array.isArray(subscriptions) && subscriptions.length > 0) {
              setUserSubscriptions(subscriptions)
              
              const activeSubscription = subscriptions.find(sub => sub.Status === "active")
              if (activeSubscription) {
                setSelectedSubscriptionId(activeSubscription.Id)
              } else {
                setSelectedSubscriptionId(subscriptions[0].Id)
              }
            } else {
              toast({
                title: "Warning",
                description: "No subscription data found for this user.",
                variant: "destructive",
              })
            }
          } catch (retryError) {
            console.error("Error fetching user subscriptions (retry):", retryError)
            toast({
              title: "Warning",
              description: "Could not retrieve subscription information for this user.",
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error)
        setError(`Failed to load user data. Error: ${error instanceof Error ? error.message : "Unknown error"}`)
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchUserData()
    }
  }, [userId, toast])

  const handleAddTokens = async () => {
    if (!user || !selectedSubscriptionId) return

    try {
      setIsUpdating(true)
      
      const request = {
        UserId: user.id,
        TokenCount: tokenAmount,
        Note: tokenNote
      }

      const updatedSubscription = await SubscriptionService.AddTokensToUserSubscription(
        selectedSubscriptionId, 
        request
      )
      
      // Update the subscription in the list
      setUserSubscriptions(prevSubscriptions => 
        prevSubscriptions.map(sub => 
          sub.Id === updatedSubscription.Id ? updatedSubscription : sub
        )
      )
      
      setTokenAmount(100)
      setTokenNote("")
      
      toast({
        title: "Tokens Added",
        description: `Successfully added ${tokenAmount} tokens to ${user.name}'s account.`,
      })
    } catch (error) {
      console.error("Error adding tokens:", error)
      toast({
        title: "Update Failed",
        description: "There was an error adding tokens to the user's account.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Display an error message if user not found
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/users")} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Error</h1>
            <p className="text-gray-500 mt-1">
              Something went wrong while loading user data
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">User Not Found</CardTitle>
            <CardDescription>
              There was an error retrieving the requested user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center py-6">
              <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">User ID Error</h3>
              <p className="text-gray-700 mb-6">
                {error}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                The user ID in the URL may be incorrect or the user may have been deleted.
                Try returning to the users page and selecting the user again.
              </p>
              <Button onClick={() => router.push("/admin/users")}>
                Return to User Management
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Check if we have subscriptions
  const hasSubscriptions = userSubscriptions.length > 0
  
  // Get the selected subscription
  const selectedSubscription = hasSubscriptions 
    ? userSubscriptions.find(sub => sub.Id === selectedSubscriptionId) || userSubscriptions[0]
    : null

  // Calculate usage percentages if we have subscription data
  const tokensUsedPercent = selectedSubscription
    ? (selectedSubscription.TokensUsed / (selectedSubscription.TokensUsed + selectedSubscription.TokensRemaining)) * 100
    : 0

  return (
    <div>
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/users")} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Manage Tokens</h1>
          <p className="text-gray-500 mt-1">
            Adjust token limits and usage for <span className="font-medium">{user.name}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">{user.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subscriptions</p>
                <p className="font-medium">{userSubscriptions.length || "No active subscriptions"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Current Usage</CardTitle>
                <CardDescription>Overview of token usage</CardDescription>
              </div>
              {hasSubscriptions && (
                <div className="w-64">
                  <Label htmlFor="subscription-select" className="text-sm mb-2 block">
                    Select Subscription
                  </Label>
                  <Select
                    value={selectedSubscriptionId?.toString()}
                    onValueChange={(value) => setSelectedSubscriptionId(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subscription" />
                    </SelectTrigger>
                    <SelectContent>
                      {userSubscriptions.map((sub) => (
                        <SelectItem key={sub.Id} value={sub.Id.toString()}>
                          {sub.SubscriptionPlan?.Name || "Subscription"} - {sub.Status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedSubscription ? (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-blue-100">
                        <Zap className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="font-medium">Tokens</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={selectedSubscription.Status === "active" ? "default" : "destructive"}
                        className="capitalize"
                      >
                        {selectedSubscription.Status}
                      </Badge>
                      <p className="text-sm text-gray-500">
                        {selectedSubscription.TokensUsed.toLocaleString()} / {(selectedSubscription.TokensUsed + selectedSubscription.TokensRemaining).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Progress value={tokensUsedPercent} className="h-2" indicatorClassName="bg-blue-600" />
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-gray-500">Used: {selectedSubscription.TokensUsed.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Remaining: {selectedSubscription.TokensRemaining.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Subscription Plan</p>
                    <p className="text-sm">{selectedSubscription.SubscriptionPlan?.Name || "Unknown Plan"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Plan Type</p>
                    <p className="text-sm capitalize">{selectedSubscription.SubscriptionPlan?.PlanType || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Start Date</p>
                    <p className="text-sm">{new Date(selectedSubscription.StartDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">End Date</p>
                    <p className="text-sm">{new Date(selectedSubscription.EndDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Renewal</p>
                    <div className="flex items-center gap-1">
                      {selectedSubscription.AutoRenew ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <p className="text-sm">Auto-renew enabled</p>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <p className="text-sm">Auto-renew disabled</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Payment Method</p>
                    <p className="text-sm capitalize">{selectedSubscription.PaymentMethod}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Subscription Found</h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  This user doesn't have any subscriptions or the subscription data couldn't be retrieved.
                </p>
                <Button variant="outline" onClick={() => router.push("/admin/users")}>
                  Return to User Management
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="add-tokens">
        <TabsList className="mb-6">
          <TabsTrigger value="add-tokens">Add Tokens</TabsTrigger>
          <TabsTrigger value="all-subscriptions">All Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="add-tokens">
          <Card>
            <CardHeader>
              <CardTitle>Add Tokens</CardTitle>
              <CardDescription>
                {selectedSubscription?.Status === "active" 
                  ? "Provide additional tokens to the user's subscription"
                  : "To add tokens, select an active subscription"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSubscription && selectedSubscription.Status === "active" ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="token-amount">Token Amount</Label>
                      <div className="flex mt-2 mb-1">
                        <Input
                          id="token-amount"
                          type="number"
                          min="1"
                          value={tokenAmount}
                          onChange={(e) => setTokenAmount(parseInt(e.target.value) || 0)}
                        />
                        <div className="flex flex-col ml-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-b-none border-b-0"
                            onClick={() => setTokenAmount(prev => prev + 100)}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-t-none"
                            onClick={() => setTokenAmount(prev => Math.max(1, prev - 100))}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        Tokens will be added to the current balance of {selectedSubscription.TokensRemaining.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="token-note">Note (Optional)</Label>
                      <Textarea
                        id="token-note"
                        placeholder="Reason for adding tokens"
                        value={tokenNote}
                        onChange={(e) => setTokenNote(e.target.value)}
                        className="mt-2"
                        rows={3}
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => router.push("/admin/users")}>
                      Cancel
                    </Button>
                    <Button 
                      className="gap-2"
                      onClick={handleAddTokens}
                      disabled={isUpdating || tokenAmount <= 0}
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCcw className="h-4 w-4 animate-spin" /> Adding Tokens...
                        </>
                      ) : (
                        "Add Tokens"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Cannot Add Tokens</h3>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    {!selectedSubscription 
                      ? "The user needs a subscription before tokens can be added." 
                      : "Only active subscriptions can have tokens added. This subscription is currently " + selectedSubscription.Status + "."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>All Subscriptions</CardTitle>
              <CardDescription>Overview of all user subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {hasSubscriptions ? (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-6">
                    {userSubscriptions.map((subscription) => (
                      <Card key={subscription.Id} className="mb-4 overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">
                              {subscription.SubscriptionPlan?.Name || "Subscription Plan"}
                            </CardTitle>
                            <Badge 
                              variant={subscription.Status === "active" ? "default" : "destructive"}
                              className="capitalize"
                            >
                              {subscription.Status}
                            </Badge>
                          </div>
                          <CardDescription>ID: {subscription.Id}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                              <span className="font-medium">Plan Type:</span>{" "}
                              {subscription.SubscriptionPlan?.PlanType || "Unknown"}
                            </div>
                            <div>
                              <span className="font-medium">Price:</span>{" "}
                              {subscription.SubscriptionPlan?.Price 
                                ? `${subscription.SubscriptionPlan.Price} ${subscription.SubscriptionPlan.Currency}`
                                : "Free"}
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">Date Range:</span>{" "}
                              {new Date(subscription.StartDate).toLocaleDateString()} - {new Date(subscription.EndDate).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Tokens Used:</span>{" "}
                              {subscription.TokensUsed.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Tokens Remaining:</span>{" "}
                              {subscription.TokensRemaining.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Auto-Renew:</span>{" "}
                              {subscription.AutoRenew ? "Yes" : "No"}
                            </div>
                            <div>
                              <span className="font-medium">Payment Method:</span>{" "}
                              <span className="capitalize">{subscription.PaymentMethod}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end pt-2">
                          <Button 
                            size="sm" 
                            variant={selectedSubscriptionId === subscription.Id ? "default" : "outline"}
                            onClick={() => setSelectedSubscriptionId(subscription.Id)}
                          >
                            {selectedSubscriptionId === subscription.Id ? "Currently Selected" : "Select Subscription"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Subscriptions Found</h3>
                  <p className="text-sm text-gray-500 text-center">
                    This user doesn't have any subscription records.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 