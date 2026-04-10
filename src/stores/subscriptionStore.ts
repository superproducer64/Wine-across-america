import { create } from 'zustand';

interface SubscriptionStore {
  isSubscribed: boolean;
  isLoading: boolean;
  expiresAt: string | null;
  checkSubscription: (userId: string) => Promise<void>;
  setSubscribed: (value: boolean, expiresAt?: string | null) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  isSubscribed: false,
  isLoading: false,
  expiresAt: null,

  checkSubscription: async (_userId: string) => {
    set({ isLoading: true });
    // TODO: integrate RevenueCat — for now stub to free
    // const customerInfo = await Purchases.getCustomerInfo();
    // const activeEntitlements = customerInfo.entitlements.active;
    // const isPro = 'pro' in activeEntitlements;
    set({ isSubscribed: false, isLoading: false });
  },

  setSubscribed: (value, expiresAt = null) =>
    set({ isSubscribed: value, expiresAt }),
}));
