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
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await SubscriptionService.GetCurrentSubscription();
      
      // Add a safety check to ensure data is valid
      if (!data) {
        console.warn('[UseSubscription] Received empty data from GetCurrentSubscription');
        setSubscription(null);
        return null;
      }
      
      // Log the data for debugging
      console.log('[UseSubscription] Subscription data received:', data);
      
      // Set the subscription state with the validated data
      setSubscription(data);
      return data;
    } catch (err) {
      const apiError = err instanceof ApiError
        ? err
        : new ApiError(500, err instanceof Error ? err.message : 'Unknown error');
      
      setError(apiError);
      console.error('[UseSubscription] Error fetching subscription:', apiError);
      setSubscription(null);
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
      
      // Add safety check for plans data
      if (!plans || !Array.isArray(plans)) {
        console.warn('[UseSubscription] Received invalid plans data:', plans);
        setAvailablePlans([]);
        return [];
      }
      
      console.log('[UseSubscription] Available plans received:', plans.length);
      setAvailablePlans(plans);
      return plans;
    } catch (err) {
      const apiError = err instanceof ApiError
        ? err
        : new ApiError(500, err instanceof Error ? err.message : 'Unknown error');
      
      setPlansError(apiError);
      console.error('[UseSubscription] Error fetching available plans:', apiError);
      setAvailablePlans([]);
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
      // Ensure subscription ID is valid
      if (!subscription.Id) {
        throw new Error('Missing subscription ID');
      }
      
      const updatedSubscription = await SubscriptionService.UpdateAutoRenew(subscription.Id, autoRenew);
      
      // Safety check for returned data
      if (!updatedSubscription) {
        throw new Error('Empty response when updating auto renew');
      }
      
      setSubscription(updatedSubscription);
      return updatedSubscription;
    } catch (err) {
      const apiError = err instanceof ApiError
        ? err
        : new ApiError(500, err instanceof Error ? err.message : 'Unknown error');
      
      setError(apiError);
      console.error('[UseSubscription] Error updating auto renew:', apiError);
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
      // Validate request data
      if (!request || typeof request.SubscriptionPlanId !== 'number') {
        throw new Error('Invalid subscription purchase request');
      }
      
      const newSubscription = await SubscriptionService.PurchaseSubscription(request);
      
      // Safety check for returned data
      if (!newSubscription) {
        throw new Error('Empty response when purchasing subscription');
      }
      
      setSubscription(newSubscription);
      return newSubscription;
    } catch (err) {
      const apiError = err instanceof ApiError
        ? err
        : new ApiError(500, err instanceof Error ? err.message : 'Unknown error');
      
      setPurchaseError(apiError);
      console.error('[UseSubscription] Error purchasing subscription:', apiError);
      return null;
    } finally {
      setIsPurchasing(false);
    }
  }, [isAuthenticated]);

  // Fetch subscription data on mount or when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[UseSubscription] Auth state changed, fetching subscription');
      FetchSubscription();
    } else {
      console.log('[UseSubscription] Not authenticated, skipping subscription fetch');
      // Clear subscription when not authenticated
      setSubscription(null);
    }
  }, [isAuthenticated, FetchSubscription]);

  // Fetch available plans on mount, but only if we don't have an active subscription
  useEffect(() => {
    // Check both uppercase and lowercase status values to be safe
    const hasActiveSubscription = subscription && 
      (subscription.Status === "Active" || subscription.Status === "active");
    
    if (!hasActiveSubscription) {
      console.log('[UseSubscription] No active subscription, fetching available plans');
      FetchAvailablePlans();
    } else {
      console.log('[UseSubscription] Active subscription detected, skipping automatic plan fetching');
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