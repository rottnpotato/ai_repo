import { User, UserStats, BillingRecord } from "@/contexts/auth-context"

// Mock admin user data
export const adminUser: User = {
  id: "admin_1",
  name: "Admin User",
  email: "admin@example.com",
  plan: "enterprise",
  subscriptionStatus: "active",
  nextBillingDate: "2023-12-31",
  billingCycle: "yearly",
  subscriptionStartDate: "2023-01-01",
  company: "WooProducts AI",
  apiKey: "sk_admin_WooProductsAI_12345678901234567890",
  apiKeyLastUsed: "2023-11-25T10:30:00Z",
  role: "admin",
}

// Mock list of users for admin panel
export const mockUsers: User[] = [
  {
    id: "user_1",
    name: "John Smith",
    email: "john@example.com",
    website: "https://example.com",
    plan: "professional",
    subscriptionStatus: "active",
    nextBillingDate: "2023-12-15",
    billingCycle: "monthly",
    subscriptionStartDate: "2023-01-15",
    company: "Acme Inc.",
    apiKey: "sk_test_WooProductsAI_12345678901234567890",
    apiKeyLastUsed: "2023-11-10T14:30:00Z",
    role: "user",
    pluginActivation: "active",
    tokensUsed: 15000
  },
  {
    id: "user_2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    website: "https://sarahjohnson.com",
    plan: "starter",
    subscriptionStatus: "active",
    nextBillingDate: "2023-12-20",
    billingCycle: "monthly",
    subscriptionStartDate: "2023-02-20",
    company: "Sarah's Shop",
    apiKey: "sk_test_WooProductsAI_09876543210987654321",
    apiKeyLastUsed: "2023-11-22T09:15:00Z",
    role: "user",
    pluginActivation: "inactive",
    tokensUsed: 5000
  },
  {
    id: "user_3",
    name: "Michael Davis",
    email: "michael@example.com",
    plan: "trial",
    subscriptionStatus: "trial",
    nextBillingDate: "2023-12-05",
    billingCycle: "none",
    subscriptionStartDate: "2023-11-21",
    apiKey: "sk_test_WooProductsAI_abcdefghijklmnopqrst",
    role: "user",
    pluginActivation: "active",
    tokensUsed: 1000
  },
  {
    id: "user_4",
    name: "Emily Wilson",
    email: "emily@example.com",
    website: "https://emilywilson.net",
    plan: "professional",
    subscriptionStatus: "past_due",
    nextBillingDate: "2023-11-15",
    billingCycle: "monthly",
    subscriptionStartDate: "2023-03-15",
    company: "Wilson Creations",
    apiKey: "sk_test_WooProductsAI_zyxwvutsrqponmlkjih",
    apiKeyLastUsed: "2023-10-30T17:45:00Z",
    role: "user",
    pluginActivation: "inactive",
    tokensUsed: 8000
  },
  {
    id: "user_5",
    name: "David Thompson",
    email: "david@example.com",
    website: "https://davidshop.com",
    plan: "enterprise",
    subscriptionStatus: "active",
    nextBillingDate: "2024-01-10",
    billingCycle: "yearly",
    subscriptionStartDate: "2023-01-10",
    company: "Thompson Enterprises",
    apiKey: "sk_test_WooProductsAI_qwertyuiopasdfghjkl",
    apiKeyLastUsed: "2023-11-24T11:20:00Z",
    role: "user",
  },
]

// Mock user stats for each user
export const mockUserStatsMap: Record<string, UserStats> = {
  user_1: {
    apiCalls: 450,
    apiCallsLimit: 1000,
    apiCallsHistory: Array.from({ length: 10 }, (_, i) => ({
      date: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000).toISOString(),
      count: Math.floor(Math.random() * 50) + 10,
    })),
    productDescriptionsGenerated: 35,
    productDescriptionsLimit: 200,
    blogPostsGenerated: 8,
    blogPostsLimit: 15,
  },
  user_2: {
    apiCalls: 120,
    apiCallsLimit: 500,
    apiCallsHistory: Array.from({ length: 10 }, (_, i) => ({
      date: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000).toISOString(),
      count: Math.floor(Math.random() * 20) + 5,
    })),
    productDescriptionsGenerated: 15,
    productDescriptionsLimit: 100,
    blogPostsGenerated: 3,
    blogPostsLimit: 5,
  },
  user_3: {
    apiCalls: 25,
    apiCallsLimit: 100,
    apiCallsHistory: Array.from({ length: 5 }, (_, i) => ({
      date: new Date(Date.now() - (4 - i) * 24 * 60 * 60 * 1000).toISOString(),
      count: Math.floor(Math.random() * 10) + 1,
    })),
    productDescriptionsGenerated: 5,
    productDescriptionsLimit: 20,
    blogPostsGenerated: 0,
    blogPostsLimit: 3,
  },
  user_4: {
    apiCalls: 800,
    apiCallsLimit: 1000,
    apiCallsHistory: Array.from({ length: 10 }, (_, i) => ({
      date: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000).toISOString(),
      count: Math.floor(Math.random() * 100) + 50,
    })),
    productDescriptionsGenerated: 178,
    productDescriptionsLimit: 200,
    blogPostsGenerated: 12,
    blogPostsLimit: 15,
  },
  user_5: {
    apiCalls: 2500,
    apiCallsLimit: 5000,
    apiCallsHistory: Array.from({ length: 10 }, (_, i) => ({
      date: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000).toISOString(),
      count: Math.floor(Math.random() * 300) + 150,
    })),
    productDescriptionsGenerated: 350,
    productDescriptionsLimit: 1000,
    blogPostsGenerated: 45,
    blogPostsLimit: 100,
  },
}

// System-wide metrics
export const systemMetrics = {
  totalUsers: 156,
  activeUsers: 134,
  totalApiCalls: 42567,
  totalTokensUsed: 12450000,
  averageDailyApiCalls: 1250,
  revenueThisMonth: "$8,745",
  revenueLastMonth: "$7,890",
  topPlan: "Professional",
  conversionRate: "12.5%",
}

// Get all users (mock implementation)
export function getAllUsers(): Promise<User[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUsers)
    }, 500)
  })
}

// Get user stats for a specific user (mock implementation)
export function getUserStats(userId: string): Promise<UserStats | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUserStatsMap[userId] || null)
    }, 300)
  })
}

// Update user tokens/limits
export function updateUserLimits(
  userId: string,
  updates: Partial<{
    apiCallsLimit: number
    productDescriptionsLimit: number
    blogPostsLimit: number
  }>
): Promise<UserStats> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userStats = { ...mockUserStatsMap[userId] }
      
      if (updates.apiCallsLimit) {
        userStats.apiCallsLimit = updates.apiCallsLimit
      }
      
      if (updates.productDescriptionsLimit) {
        userStats.productDescriptionsLimit = updates.productDescriptionsLimit
      }
      
      if (updates.blogPostsLimit) {
        userStats.blogPostsLimit = updates.blogPostsLimit
      }
      
      mockUserStatsMap[userId] = userStats
      resolve(userStats)
    }, 800)
  })
}

// Change user role
export function updateUserRole(userId: string, role: string): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userIndex = mockUsers.findIndex(user => user.id === userId)
      if (userIndex >= 0) {
        mockUsers[userIndex].role = role
        resolve(mockUsers[userIndex])
      } else {
        throw new Error("User not found")
      }
    }, 500)
  })
}

// Change user plan
export function updateUserPlan(userId: string, plan: string): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userIndex = mockUsers.findIndex(user => user.id === userId)
      if (userIndex >= 0) {
        mockUsers[userIndex].plan = plan
        resolve(mockUsers[userIndex])
      } else {
        throw new Error("User not found")
      }
    }, 500)
  })
}

// Get system metrics (mock implementation)
export function getSystemMetrics(): Promise<typeof systemMetrics> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(systemMetrics)
    }, 700)
  })
} 