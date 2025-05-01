import { useState, useEffect, useCallback } from 'react';
import { SubscriptionService, UserSubscription, SubscriptionPlan, PurchaseSubscriptionRequest } from '@/lib/services/SubscriptionService';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom hook for fetching and managing user subscription data
 */
export function UseSubscription() {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(false);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [plansError, setPlansError] = useState<ApiError | null>(null);
  const [purchaseError, setPurchaseError] = useState<ApiError | null>(null);

  const FetchSubscription = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await SubscriptionService.GetCurrentSubscription();
      setSubscription(data);
      return data;
    } catch (err) {
      const apiError = err instanceof ApiError
        ? err
        : new ApiError(500, err instanceof Error ? err.message : 'Unknown error');
      
      setError(apiError);
      console.error('Error fetching subscription:', apiError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const FetchAvailablePlans = useCallback(async () => {
    setIsLoadingPlans(true);
    setPlansError(null);
    
    try {
      const plans = await SubscriptionService.GetAvailablePlans();
      setAvailablePlans(plans);
      return plans;
    } catch (err) {
      const apiError = err instanceof ApiError
        ? err
        : new ApiError(500, err instanceof Error ? err.message : 'Unknown error');
      
      setPlansError(apiError);
      console.error('Error fetching available plans:', apiError);
      return [];
    } finally {
      setIsLoadingPlans(false);
    }
  }, []);

  const UpdateAutoRenew = useCallback(async (autoRenew: boolean) => {
    if (!subscription || !isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedSubscription = await SubscriptionService.UpdateAutoRenew(subscription.Id, autoRenew);
      setSubscription(updatedSubscription);
      return updatedSubscription;
    } catch (err) {
      const apiError = err instanceof ApiError
        ? err
        : new ApiError(500, err instanceof Error ? err.message : 'Unknown error');
      
      setError(apiError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [subscription, isAuthenticated]);

  const PurchaseSubscription = useCallback(async (request: PurchaseSubscriptionRequest) => {
    if (!isAuthenticated) return null;
    
    setIsPurchasing(true);
    setPurchaseError(null);
    
    try {
      const newSubscription = await SubscriptionService.PurchaseSubscription(request);
      setSubscription(newSubscription);
      return newSubscription;
    } catch (err) {
      const apiError = err instanceof ApiError
        ? err
        : new ApiError(500, err instanceof Error ? err.message : 'Unknown error');
      
      setPurchaseError(apiError);
      console.error('Error purchasing subscription:', apiError);
      return null;
    } finally {
      setIsPurchasing(false);
    }
  }, [isAuthenticated]);

  // Fetch subscription data on mount or when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      FetchSubscription();
    }
  }, [isAuthenticated, FetchSubscription]);

  // Fetch available plans on mount, but only if we don't have an active subscription
  useEffect(() => {
    // If we already have a subscription and it's active, we may not need plans
    // This is a default behavior that components can override by explicitly calling FetchAvailablePlans
    const hasActiveSubscription = subscription && subscription.Status === "Active";
    
    if (!hasActiveSubscription) {
      FetchAvailablePlans();
    } else {
      console.log("Active subscription detected, skipping automatic plan fetching");
    }
  }, [subscription, FetchAvailablePlans]);

  return {
    subscription,
    availablePlans,
    isLoading,
    isLoadingPlans,
    isPurchasing,
    error,
    plansError,
    purchaseError,
    FetchSubscription,
    FetchAvailablePlans,
    UpdateAutoRenew,
    PurchaseSubscription,
  };
}

export default UseSubscription; 