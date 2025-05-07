import Api, { ApiError } from '../api';

// Types
export interface SubscriptionPlan {
  Id: number;
  Name: string;
  Description: string;
  PlanType: string;
  MaxTokens: number;
  Price: string | number;
  Currency: string;
  BillingCycle: string;
  IsActive: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface AddTokensRequest {
  UserId: string;
  TokenCount: number;
  Note: string;
}

export interface UserSubscription {
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

export interface PurchaseSubscriptionRequest {
  SubscriptionPlanId: number;
  PaymentMethod: string;
  AutoRenew: boolean;
}

/**
 * Validates if an object is a valid UserSubscription
 */
function isValidUserSubscription(data: any): data is UserSubscription {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.Id === 'number' &&
    typeof data.Status === 'string'
  );
}

/**
 * Validates if an array contains valid SubscriptionPlan objects
 */
function isValidSubscriptionPlanArray(data: any): data is SubscriptionPlan[] {
  return (
    Array.isArray(data) &&
    data.every(plan => 
      plan && 
      typeof plan === 'object' && 
      typeof plan.Id === 'number' &&
      typeof plan.Name === 'string'
    )
  );
}

/**
 * Subscription Service
 * Handles all subscription-related API calls
 */
export class SubscriptionService {
  private static readonly BASE_ENDPOINT = 'api/user-subscriptions';
  private static readonly PLANS_ENDPOINT = 'api/subscription-plans';
  
  /**
   * Get current user's subscription
   */
  static async GetCurrentSubscription(): Promise<UserSubscription> {
    try {
      const data = await Api.get<UserSubscription>(`${this.BASE_ENDPOINT}/current`);
      
      // Validate the returned data
      if (!isValidUserSubscription(data)) {
        console.error('[SubscriptionService] Invalid subscription data received:', data);
        throw new ApiError(500, 'Invalid subscription data received from server');
      }
      
      return data;
    } catch (error) {
      console.error('[SubscriptionService] Error in GetCurrentSubscription:', error);
      throw error;
    }
  }
  
  /**
   * Get subscription by ID
   */
  static async GetSubscriptionById(subscriptionId: number): Promise<UserSubscription> {
    try {
      if (!subscriptionId || isNaN(subscriptionId)) {
        throw new ApiError(400, 'Invalid subscription ID');
      }
      
      const data = await Api.get<UserSubscription>(`${this.BASE_ENDPOINT}/${subscriptionId}`);
      
      if (!isValidUserSubscription(data)) {
        console.error('[SubscriptionService] Invalid subscription data received:', data);
        throw new ApiError(500, 'Invalid subscription data received from server');
      }
      
      return data;
    } catch (error) {
      console.error(`[SubscriptionService] Error fetching subscription ${subscriptionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all subscriptions for a specific user (admin only)
   */
  static async GetUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    try {
      if (!userId) {
        throw new ApiError(400, 'User ID is required');
      }
      
      const data = await Api.get<UserSubscription[]>(`${this.BASE_ENDPOINT}/admin/users/${userId}`);
      
      if (!Array.isArray(data)) {
        console.error('[SubscriptionService] Invalid user subscriptions data received:', data);
        throw new ApiError(500, 'Invalid user subscriptions data received from server');
      }
      
      return data;
    } catch (error) {
      console.error(`[SubscriptionService] Error fetching subscriptions for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update subscription auto-renew setting
   */
  static async UpdateAutoRenew(subscriptionId: number, autoRenew: boolean): Promise<UserSubscription> {
    try {
      if (!subscriptionId || isNaN(subscriptionId)) {
        throw new ApiError(400, 'Invalid subscription ID');
      }
      
      const data = await Api.patch<UserSubscription>(
        `${this.BASE_ENDPOINT}/${subscriptionId}/auto-renew`, 
        { autoRenew }
      );
      
      if (!isValidUserSubscription(data)) {
        console.error('[SubscriptionService] Invalid subscription data received after update:', data);
        throw new ApiError(500, 'Invalid subscription data received from server after update');
      }
      
      return data;
    } catch (error) {
      console.error(`[SubscriptionService] Error updating auto-renew for subscription ${subscriptionId}:`, error);
      throw error;
    }
  }

  /**
   * Get all available subscription plans
   */
  static async GetAvailablePlans(): Promise<SubscriptionPlan[]> {
    try {
      const data = await Api.get<SubscriptionPlan[]>(this.PLANS_ENDPOINT);
      
      if (!isValidSubscriptionPlanArray(data)) {
        console.error('[SubscriptionService] Invalid subscription plans data received:', data);
        throw new ApiError(500, 'Invalid subscription plans data received from server');
      }
      
      return data;
    } catch (error) {
      console.error('[SubscriptionService] Error fetching available plans:', error);
      throw error;
    }
  }

  /**
   * Purchase a subscription plan
   */
  static async PurchaseSubscription(request: PurchaseSubscriptionRequest): Promise<UserSubscription> {
    try {
      if (!request || typeof request.SubscriptionPlanId !== 'number') {
        throw new ApiError(400, 'Invalid subscription purchase request');
      }
      
      const response = await Api.post<{ sessionId: string; url: string }>('/api/stripe/create-checkout', request);
      
      if (!response || !response.url) {
        throw new ApiError(500, 'Invalid response from checkout session creation');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = response.url;
      
      // Return a promise that never resolves since we're redirecting
      return new Promise(() => {});
    } catch (error) {
      console.error('[SubscriptionService] Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Get all subscription plans
   */
  static async GetSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const data = await Api.get<SubscriptionPlan[]>('/api/subscription-plans');
      
      if (!isValidSubscriptionPlanArray(data)) {
        console.error('[SubscriptionService] Invalid subscription plans data received:', data);
        throw new ApiError(500, 'Invalid subscription plans data received from server');
      }
      
      return data;
    } catch (error) {
      console.error('[SubscriptionService] Error fetching subscription plans:', error);
      throw error;
    }
  }

  /**
   * Create a new subscription plan
   */
  static async CreateSubscriptionPlan(plan: Omit<SubscriptionPlan, 'Id' | 'CreatedAt' | 'UpdatedAt'>): Promise<SubscriptionPlan> {
    try {
      if (!plan || !plan.Name || !plan.PlanType) {
        throw new ApiError(400, 'Invalid subscription plan data');
      }
      
      return await Api.post<SubscriptionPlan>('/api/subscription-plans/create', plan);
    } catch (error) {
      console.error('[SubscriptionService] Error creating subscription plan:', error);
      throw error;
    }
  }

  /**
   * Update an existing subscription plan
   */
  static async UpdateSubscriptionPlan(id: number, plan: Omit<SubscriptionPlan, 'Id' | 'CreatedAt' | 'UpdatedAt'>): Promise<SubscriptionPlan> {
    try {
      if (!id || isNaN(id)) {
        throw new ApiError(400, 'Invalid subscription plan ID');
      }
      
      if (!plan || !plan.Name || !plan.PlanType) {
        throw new ApiError(400, 'Invalid subscription plan data');
      }
      
      return await Api.patch<SubscriptionPlan>(`/api/subscription-plans/${id}`, plan);
    } catch (error) {
      console.error(`[SubscriptionService] Error updating subscription plan ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a subscription plan
   */
  static async DeleteSubscriptionPlan(id: number): Promise<number> {
    try {
      if (!id || isNaN(id)) {
        throw new ApiError(400, 'Invalid subscription plan ID');
      }
      
      return await Api.delete<number>(`/api/subscription-plans/${id}`);
    } catch (error) {
      console.error(`[SubscriptionService] Error deleting subscription plan ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add tokens to a user subscription
   */
  static async AddTokensToUserSubscription(subscriptionId: number, request: AddTokensRequest): Promise<UserSubscription> {
    try {
      if (!subscriptionId || isNaN(subscriptionId)) {
        throw new ApiError(400, 'Invalid subscription ID');
      }
      
      if (!request || typeof request.TokenCount !== 'number' || request.TokenCount <= 0) {
        throw new ApiError(400, 'Invalid token request data');
      }
      
      return await Api.post<UserSubscription>(`/api/user-subscriptions/admin/${subscriptionId}/add-tokens`, request);
    } catch (error) {
      console.error(`[SubscriptionService] Error adding tokens to subscription ${subscriptionId}:`, error);
      throw error;
    }
  }
}

export default SubscriptionService; 