
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface SubscriptionHook {
  isLoading: boolean;
  hasActiveSubscription: boolean;
  subscriptionTier: 'free' | 'basic' | 'premium' | 'pro' | null;
  expiresAt: Date | null;
  error: Error | null;
}

export const useSubscription = (): SubscriptionHook => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'basic' | 'premium' | 'pro' | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsLoading(false);
        setHasActiveSubscription(false);
        setSubscriptionTier('free');
        return;
      }

      try {
        // For demo purposes we'll simulate a subscription check
        // In a real app, you would call your backend API to check the subscription status
        setTimeout(() => {
          // Mock subscription data - in a real app this would come from your backend
          const mockSubscriptionData = {
            active: true,
            tier: 'premium' as const,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          };

          setHasActiveSubscription(mockSubscriptionData.active);
          setSubscriptionTier(mockSubscriptionData.tier);
          setExpiresAt(mockSubscriptionData.expiresAt);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error checking subscription:', err);
        setError(err instanceof Error ? err : new Error('Failed to check subscription'));
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  return {
    isLoading,
    hasActiveSubscription,
    subscriptionTier,
    expiresAt,
    error
  };
};
