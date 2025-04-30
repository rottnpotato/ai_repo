"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowRight, CircleCheck, FileText, LogOut, Mail, ShoppingBag, User, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Logo } from "@/components/logo"
import { UserDropdown } from "@/components/user-dropdown"
import { useAuth } from "@/contexts/AuthContext"
import { UseSubscription } from "@/hooks/useSubscription"
import axios from "axios"
import { UserApiService } from "@/lib/api-service"

// Interface for profile response
interface ProfileResponse {
  success: boolean;
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  }
}

// Interface for user usage stats
interface UserUsageStats {
  contentGenerated: number;
  contentLimit: number;
  apiCalls: number;
  apiCallsLimit: number;
  tokensUsed: number;
  tokensLimit: number;
}

export default function DashboardPage() {
  const { user, userStats, isAuthenticated, isLoading } = useAuth()
  const { subscription, isLoading: isLoadingSubscription } = UseSubscription()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [usageData, setUsageData] = useState<UserUsageStats>({
    contentGenerated: 0,
    contentLimit: 100,
    apiCalls: 0,
    apiCallsLimit: 500,
    tokensUsed: 0,
    tokensLimit: 50000
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch profile data from the API
  useEffect(() => {
    const FetchProfileData = async () => {
      try {
        setIsLoadingProfile(true)
        const response = await UserApiService.GetProfile();
        setProfileData(response);
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    if (isAuthenticated) {
      FetchProfileData()
    }
  }, [isAuthenticated])

  // Fetch usage statistics
  useEffect(() => {
    const FetchUsageData = async () => {
      if (!subscription) return;

      try {
        // We'll use the subscription data for token usage 
        const tokenLimit = subscription.SubscriptionPlan?.MaxTokens || 50000;
        const tokensUsed = subscription.TokensUsed || 0;

        // For now, we'll keep the content generated and API calls as placeholders
        // This would be replaced with real API endpoint data when available
        setUsageData({
          contentGenerated: userStats?.productDescriptionsGenerated || 0,
          contentLimit: userStats?.productDescriptionsLimit || 100,
          apiCalls: userStats?.apiCalls || 0,
          apiCallsLimit: userStats?.apiCallsLimit || 500,
          tokensUsed: tokensUsed,
          tokensLimit: tokenLimit
        });
      } catch (error) {
        console.error("Error setting usage data:", error);
      }
    };

    if (subscription) {
      FetchUsageData();
    }
  }, [subscription, userStats]);

  // Show loading state while either auth or subscription is loading
  if (isLoading || isLoadingSubscription || isLoadingProfile || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  const quickActions = [
    {
      title: "Generate Product Description",
      description: "Create compelling product descriptions with AI",
      icon: ShoppingBag,
      color: "bg-orange-100 text-orange-700",
      iconColor: "text-orange-500",
      path: "/generate/product",
    },
    {
      title: "Write Blog Post",
      description: "Generate engaging blog content for your store",
      icon: FileText,
      color: "bg-red-100 text-red-700",
      iconColor: "text-red-500",
      path: "/generate/blog",
    },
    {
      title: "Create Marketing Email",
      description: "Draft marketing emails that convert customers",
      icon: Mail,
      color: "bg-amber-100 text-amber-700",
      iconColor: "text-amber-500",
      path: "/generate/email",
    },
  ]

  // Usage statistics using real data
  const usageStats = [
    {
      title: "Content Generated",
      value: usageData.contentGenerated,
      limit: usageData.contentLimit,
      color: "bg-orange-500",
      percent: (usageData.contentGenerated / usageData.contentLimit) * 100,
      icon: FileText,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-100",
    },
    {
      title: "API Calls",
      value: usageData.apiCalls,
      limit: usageData.apiCallsLimit,
      color: "bg-red-500",
      percent: (usageData.apiCalls / usageData.apiCallsLimit) * 100,
      icon: Zap,
      iconColor: "text-red-500",
      iconBg: "bg-red-100",
    },
    {
      title: "Tokens Used",
      value: usageData.tokensUsed,
      limit: usageData.tokensLimit,
      color: "bg-amber-500",
      percent: (usageData.tokensUsed / usageData.tokensLimit) * 100,
      icon: CircleCheck,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-100",
    },
  ]

  // Safely handle user name with null checks
  const firstName = profileData?.user?.firstName || user?.firstName || "";
  const lastName = profileData?.user?.lastName || user?.lastName || "";
  const userName = firstName + (firstName && lastName ? " " : "") + lastName;
  const displayName = firstName || (user?.name?.split(" ")[0] || "User");
  const userEmail = profileData?.user?.email || user?.email || "";
  
  // Calculate usage percentages only if stats exists
  const productDescPercent = userStats
    ? (userStats.productDescriptionsGenerated / userStats.productDescriptionsLimit) * 100
    : 0
  const blogPostsPercent = userStats ? (userStats.blogPostsGenerated / userStats.blogPostsLimit) * 100 : 0
  const apiCallsPercent = userStats ? (userStats.apiCalls / userStats.apiCallsLimit) * 100 : 0
  
  // Prepare content based on subscription availability
  let subscriptionContent;
  
  if (!subscription) {
    subscriptionContent = (
      <Card className="border-orange-100 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">
            <div className="mr-2 p-1.5 rounded-full bg-orange-100">
              <Zap className="h-4 w-4 text-orange-500" />
            </div>
            Subscription Status
          </CardTitle>
          <CardDescription>Your subscription information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-4">
            <p className="text-gray-700 mb-4">No active subscription found</p>
            <Button 
              onClick={() => router.push("/subscription")}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Get Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  } else {
    // Get token usage from subscription data
    const tokenLimit = subscription.SubscriptionPlan?.MaxTokens || 0;
    const tokensUsed = subscription.TokensUsed;
    const tokensRemaining = subscription.TokensRemaining;
    const tokenPercent = (tokensUsed / tokenLimit) * 100;

    // Get subscription details from API response
    const subscriptionDetails = {
      name: subscription.SubscriptionPlan?.Name,
      status: subscription.Status,
      nextBillingDate: new Date(subscription.EndDate).toLocaleDateString(),
      autoRenew: subscription.AutoRenew,
      startDate: new Date(subscription.StartDate).toLocaleDateString(),
    }
    
    subscriptionContent = (
      <Card className="border-orange-100 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">
            <div className="mr-2 p-1.5 rounded-full bg-orange-100">
              <Zap className="h-4 w-4 text-orange-500" />
            </div>
            Subscription Status
          </CardTitle>
          <CardDescription>Your current plan details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xl capitalize">{subscriptionDetails.name}</h3>
              <p className="text-sm text-gray-500">
                {subscriptionDetails.status === "trial"
                  ? "Free trial ends on " + subscriptionDetails.nextBillingDate
                  : "Next billing on " + subscriptionDetails.nextBillingDate}
              </p>
            </div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {subscriptionDetails.status === "trial" ? "Trial" : "Active"}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-gray-700">Token Usage</p>
              <p className="text-sm text-gray-500">
                {tokensUsed} / {tokenLimit}
              </p>
            </div>
            <Progress
              value={tokenPercent}
              className="h-2"
              indicatorClassName={subscriptionDetails.status === "trial" ? "bg-amber-500" : "bg-green-500"}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {tokensRemaining} tokens remaining
            </p>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={() => router.push("/subscription")}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-2">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Logo size="lg" />
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Welcome back, {displayName}!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your account today.</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/subscription")}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white gap-2"
            >
              <Zap className="h-4 w-4" />
              <span>Manage Subscription</span>
            </Button>
            <UserDropdown userName={userName}>
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{userName || "Account"}</span>
              </Button>
            </UserDropdown>
          </div>
        </header>

        {/* Subscription information */}
        {subscriptionContent}

        {/* Quick Actions */}
        <Card className="border-orange-100 shadow-md my-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <div className="mr-2 p-1.5 rounded-full bg-orange-100">
                <ArrowRight className="h-4 w-4 text-orange-500" />
              </div>
              Quick Actions
            </CardTitle>
            <CardDescription>Get started with AI-powered content generation for your WooCommerce store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  className={`${action.color} rounded-xl p-5 shadow-sm cursor-pointer transition-all`}
                  onClick={() => router.push(action.path)}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.iconColor} bg-white mb-4`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm opacity-80">{action.description}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-md mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <div className="mr-2 p-1.5 rounded-full bg-orange-100">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              Usage Statistics
            </CardTitle>
            <CardDescription>Your current usage for this billing cycle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {usageStats.map((stat, index) => (
                <div key={index}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-full ${stat.iconBg}`}>
                      <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                    </div>
                    <div className="flex justify-between items-center w-full">
                      <p className="text-sm font-medium text-gray-700">{stat.title}</p>
                      <p className="text-sm text-gray-500">
                        {stat.value.toLocaleString()} / {stat.limit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Progress value={stat.percent} className="h-2" indicatorClassName={stat.color} />
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {stat.percent.toFixed(1)}% used
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* More dashboard content can go here */}
      </div>
    </div>
  )
}
