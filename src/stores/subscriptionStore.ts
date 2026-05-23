import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface SubscriptionStore {
  isSubscribed: boolean;
  tier: 'free' | 'pro';
  isLoading: boolean;
  expiresAt: string | null;
  checkSubscription: (userId: string) => Promise<void>;
  setSubscribed: (value: boolean, expiresAt?: string | null) => void;
  purchaseSubscription: (plan: 'monthly' | 'annual') => Promise<void>;
  restorePurchases: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  isSubscribed: false,
  tier: 'free',
  isLoading: false,
  expiresAt: null,

  checkSubscription: async (userId: string) => {
    set({ isLoading: true });
    try {
      // Authoritative source: Supabase user_profiles.subscription_tier
      // (updated by RevenueCat webhook on subscription events)
      const { data } = await supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      const tier = (data?.subscription_tier ?? 'free') as 'free' | 'pro';
      set({ isSubscribed: tier === 'pro', tier, isLoading: false });

      // Secondary: sync RevenueCat SDK if native module is available
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Purchases = require('react-native-purchases').default;
        const customerInfo = await Purchases.getCustomerInfo();
        const rcIsPro = 'pro' in customerInfo.entitlements.active;
        if (rcIsPro !== (tier === 'pro')) {
          set({ isSubscribed: rcIsPro, tier: rcIsPro ? 'pro' : 'free' });
        }
      } catch {
        // react-native-purchases not installed — Supabase value is authoritative
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setSubscribed: (value, expiresAt = null) =>
    set({ isSubscribed: value, tier: value ? 'pro' : 'free', expiresAt }),

  purchaseSubscription: async (plan: 'monthly' | 'annual') => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Purchases = require('react-native-purchases').default;
      const offerings = await Purchases.getOfferings();
      const pkg =
        plan === 'monthly'
          ? offerings.current?.monthly
          : offerings.current?.annual;
      if (!pkg) throw new Error('Subscription package not available');
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPro = 'pro' in customerInfo.entitlements.active;
      set({ isSubscribed: isPro, tier: isPro ? 'pro' : 'free' });
    } catch (e: unknown) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (!err.userCancelled) throw e;
    }
  },

  restorePurchases: async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Purchases = require('react-native-purchases').default;
      const customerInfo = await Purchases.restorePurchases();
      const isPro = 'pro' in customerInfo.entitlements.active;
      set({ isSubscribed: isPro, tier: isPro ? 'pro' : 'free' });
    } catch {
      // not installed — no-op
    }
  },
}));
