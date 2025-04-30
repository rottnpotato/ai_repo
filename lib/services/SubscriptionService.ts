import Api from '../api';

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
    return Api.get<UserSubscription>(`${this.BASE_ENDPOINT}/current`);
  }
  
  /**
   * Get subscription by ID
   */
  static async GetSubscriptionById(subscriptionId: number): Promise<UserSubscription> {
    return Api.get<UserSubscription>(`${this.BASE_ENDPOINT}/${subscriptionId}`);
  }
  
  /**
   * Get all subscriptions for a specific user (admin only)
   */
  static async GetUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    return Api.get<UserSubscription[]>(`${this.BASE_ENDPOINT}/admin/users/${userId}`);
  }
  
  /**
   * Update subscription auto-renew setting
   */
  static async UpdateAutoRenew(subscriptionId: number, autoRenew: boolean): Promise<UserSubscription> {
    return Api.patch<UserSubscription>(
      `${this.BASE_ENDPOINT}/${subscriptionId}/auto-renew`, 
      { autoRenew }
    );
  }

  /**
   * Get all available subscription plans
   */
  static async GetAvailablePlans(): Promise<SubscriptionPlan[]> {
    return Api.get<SubscriptionPlan[]>(this.PLANS_ENDPOINT);
  }

  /**
   * Purchase a subscription plan
   */
  static async PurchaseSubscription(request: PurchaseSubscriptionRequest): Promise<UserSubscription> {
    return Api.post<UserSubscription>(`${this.BASE_ENDPOINT}/purchase`, request);
  }

  /**
   * Get all subscription plans
   */
  static async GetSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Api.get<SubscriptionPlan[]>('/api/subscription-plans');
  }

  /**
   * Create a new subscription plan
   */
  static async CreateSubscriptionPlan(plan: Omit<SubscriptionPlan, 'Id' | 'CreatedAt' | 'UpdatedAt'>): Promise<SubscriptionPlan> {
    return Api.post<SubscriptionPlan>('/api/subscription-plans/create', plan);
  }

  /**
   * Update an existing subscription plan
   */
  static async UpdateSubscriptionPlan(id: number, plan: Omit<SubscriptionPlan, 'Id' | 'CreatedAt' | 'UpdatedAt'>): Promise<SubscriptionPlan> {
    return Api.post<SubscriptionPlan>(`/api/subscription-plans/${id}`, plan);
  }

  /**
   * Delete a subscription plan
   */
  static async DeleteSubscriptionPlan(id: number): Promise<number> {
    return Api.delete<number>(`/api/subscription-plans/${id}`);
  }

  /**
   * Add tokens to a user subscription
   */
  static async AddTokensToUserSubscription(subscriptionId: number, request: AddTokensRequest): Promise<UserSubscription> {
    return Api.post<UserSubscription>(`/api/user-subscriptions/admin/${subscriptionId}/add-tokens`, request);
  }
}

export default SubscriptionService; 