import axios from "axios";

// Define types based on the API responses
interface User {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Status: string;
  Role: string;
  GoogleId: string | null;
  HasUsedFreeTrial: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

interface SubscriptionPlan {
  Id: number;
  Name: string;
  Description: string;
  PlanType: string;
  MaxTokens: number;
  Price: string;
  Currency: string;
  BillingCycle: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

interface UserSubscription {
  Id: number;
  UserId: string;
  SubscriptionPlanId: number;
  StartDate: string;
  EndDate: string;
  TokensUsed: number;
  TokensRemaining: number;
  Status: string;
  PaymentId: string;
  PaymentMethod: string;
  AutoRenew: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  SubscriptionPlan?: SubscriptionPlan;
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalApiCalls: number;
  totalTokensUsed: number;
  averageDailyApiCalls: number;
  revenueThisMonth: string;
  revenueLastMonth: string;
  topPlan: string;
  conversionRate: string;
}

interface ActivityDataPoint {
  date: string;
  apiCalls: number;
  userLogins: number;
}

interface UserProfileResponse {
  success: boolean;
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  };
}

interface TopPerformingUser {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: string;
  apiCalls: number;
}

// Base API URL - use environment variable if available
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

// Helper for authenticated API calls
const getAuthHeader = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

// API service for user data
export const UserApiService = {
  // Get all users (for admin)
  GetAllUsers: async (): Promise<User[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/users`, {
        withCredentials: true,
        headers: getAuthHeader()
      });
      return response.data.users || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  // Get user profile
  GetProfile: async (): Promise<UserProfileResponse | null> => {
    try {
      const response = await axios.get<UserProfileResponse>(`${API_BASE_URL}/auth/profile`, {
        withCredentials: true,
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }
};

// API service for subscription data
export const SubscriptionApiService = {
  // Get all subscription plans
  GetAllPlans: async (): Promise<SubscriptionPlan[]> => {
    try {
      const response = await axios.get<SubscriptionPlan[]>(`${API_BASE_URL}/api/subscription-plans`, {
        withCredentials: true,
        headers: getAuthHeader()
      });
      return response.data || [];
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      return [];
    }
  },

  // Create subscription plan (admin only)
  CreatePlan: async (planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
    try {
      const response = await axios.post<SubscriptionPlan>(`${API_BASE_URL}/api/subscription-plans/create`, planData, {
        withCredentials: true,
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      throw error;
    }
  },

  // Update subscription plan (admin only)
  UpdatePlan: async (planId: number, planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
    try {
      const response = await axios.post<SubscriptionPlan>(`${API_BASE_URL}/api/subscription-plans/${planId}`, planData, {
        withCredentials: true,
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      throw error;
    }
  },

  // Delete subscription plan (admin only)
  DeletePlan: async (planId: number): Promise<number> => {
    try {
      const response = await axios.delete<number>(`${API_BASE_URL}/api/subscription-plans/${planId}`, {
        withCredentials: true,
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting subscription plan:", error);
      throw error;
    }
  },

  // Add tokens to user subscription (admin only)
  AddTokensToUser: async (userSubscriptionId: number, tokenData: { UserId: string; TokenCount: number; Note?: string }): Promise<UserSubscription> => {
    try {
      const response = await axios.post<UserSubscription>(`${API_BASE_URL}/api/user-subscriptions/admin/${userSubscriptionId}/add-tokens`, tokenData, {
        withCredentials: true,
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error adding tokens to user:", error);
      throw error;
    }
  },
  
  // Get user subscriptions
  GetUserSubscriptions: async (userId: string): Promise<UserSubscription[]> => {
    try {
      const response = await axios.get<UserSubscription[]>(`${API_BASE_URL}/api/user-subscriptions/${userId}`, {
        withCredentials: true,
        headers: getAuthHeader()
      });
      return response.data || [];
    } catch (error) {
      console.error("Error fetching user subscriptions:", error);
      return [];
    }
  }
};

// API service for system metrics
export const AdminApiService = {
  // Get system metrics 
  GetSystemMetrics: async (): Promise<SystemMetrics> => {
    try {
      // Calculate system metrics from users and subscription data
      const users = await UserApiService.GetAllUsers();
      const plans = await SubscriptionApiService.GetAllPlans();
      
      // Total users and active users
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.Status === "active").length;
      
      // Most popular plan
      const planCounts = plans.reduce((acc: Record<string, number>, plan: SubscriptionPlan) => {
        acc[plan.Name] = (acc[plan.Name] || 0) + 1;
        return acc;
      }, {});
      
      const topPlanEntry = Object.entries(planCounts).sort((a, b) => b[1] - a[1])[0];
      const topPlan = topPlanEntry ? topPlanEntry[0] : "Free";
      
      // For revenue, we would ideally have an endpoint that provides this data
      // This is a simplified placeholder implementation
      return {
        totalUsers,
        activeUsers,
        totalApiCalls: 0, // Need real data source
        totalTokensUsed: 0, // Need real data source
        averageDailyApiCalls: 0, // Need real data source
        revenueThisMonth: "$0", // Need real data source
        revenueLastMonth: "$0", // Need real data source
        topPlan,
        conversionRate: "0%" // Need real data source
      };
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalApiCalls: 0,
        totalTokensUsed: 0,
        averageDailyApiCalls: 0,
        revenueThisMonth: "$0",
        revenueLastMonth: "$0",
        topPlan: "N/A",
        conversionRate: "0%"
      };
    }
  },
  
  // Generate activity data (ideally from real API endpoint)
  GenerateActivityData: async (): Promise<ActivityDataPoint[]> => {
    // In a real implementation, this would fetch from an analytics endpoint
    // For now, creating placeholder data
    const date = new Date();
    const data: ActivityDataPoint[] = [];
    
    for (let i = 30; i > 0; i--) {
      const pastDate = new Date(date);
      pastDate.setDate(date.getDate() - i);
      
      data.push({
        date: pastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        apiCalls: 0, // Replace with real data
        userLogins: 0, // Replace with real data
      });
    }
    
    return data;
  },
  
  // Get top performing users
  GetTopPerformingUsers: async (): Promise<TopPerformingUser[]> => {
    try {
      const users = await UserApiService.GetAllUsers();
      
      // In a real implementation, we would have user stats from an analytics endpoint
      // For now, returning users without real API call data
      return users.slice(0, 5).map((user: User) => ({
        id: user.Id,
        name: `${user.FirstName} ${user.LastName}`,
        email: user.Email,
        company: "Unknown", // We don't have company data in the current API
        plan: "Unknown", // We don't have direct plan info in the user data
        apiCalls: 0 // Need real data source
      }));
    } catch (error) {
      console.error("Error fetching top performing users:", error);
      return [];
    }
  }
}; 