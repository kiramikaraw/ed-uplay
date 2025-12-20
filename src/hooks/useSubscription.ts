import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number;
  features: {
    daily_games: number;
    daily_ai_chats: number;
    ad_free: boolean;
    premium_avatars: boolean;
    premium_powerups: boolean;
    max_children: number;
    pdf_reports: boolean;
    family_leaderboard?: boolean;
    unlimited_classes?: boolean;
    bulk_import?: boolean;
    advanced_analytics?: boolean;
  };
}

interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  billing_cycle: string;
  started_at: string;
  expires_at: string | null;
  plan?: SubscriptionPlan;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      // Load all plans
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);

      if (plansData) {
        setPlans(plansData as unknown as SubscriptionPlan[]);
      }

      // Load user subscription
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (subData && plansData) {
        const plan = plansData.find(p => p.id === subData.plan_id);
        const userSub = { ...subData, plan } as unknown as UserSubscription;
        setSubscription(userSub);
        setIsPremium(plan?.slug !== 'free');
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanBySlug = (slug: string) => {
    return plans.find(p => p.slug === slug);
  };

  const canAccessFeature = (feature: keyof SubscriptionPlan['features']): boolean => {
    if (!subscription?.plan) {
      const freePlan = plans.find(p => p.slug === 'free');
      if (!freePlan) return false;
      const value = freePlan.features[feature];
      return typeof value === 'boolean' ? value : (value as number) !== 0;
    }
    
    const value = subscription.plan.features[feature];
    return typeof value === 'boolean' ? value : (value as number) !== 0;
  };

  const getFeatureLimit = (feature: keyof SubscriptionPlan['features']): number => {
    if (!subscription?.plan) {
      const freePlan = plans.find(p => p.slug === 'free');
      return (freePlan?.features[feature] as number) || 0;
    }
    return (subscription.plan.features[feature] as number) || 0;
  };

  return {
    subscription,
    plans,
    loading,
    isPremium,
    getPlanBySlug,
    canAccessFeature,
    getFeatureLimit,
    refreshSubscription: loadSubscriptionData,
  };
};
