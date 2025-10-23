// Zustand store for subscription data only
// Profile data is managed by useAuth hook
import { create } from 'zustand';

interface Subscription {
  id: string;
  user_id: string;
  subscription_tier: string;
  subscription_status: string;
  trial_start_date: string | null;
  trial_end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface UserStore {
  subscription: Subscription | null;
  setSubscription: (subscription: Subscription | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  subscription: null,
  
  setSubscription: (subscription) => set({ subscription }),
  
  clearUser: () => set({ subscription: null })
}));
