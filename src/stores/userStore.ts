// Zustand store for user data
import { create } from 'zustand';

interface Profile {
  id: string;
  user_id: string;
  preferred_name: string;
  email: string | null;
  country: string | null;
  language: string | null;
  currency: string | null;
  measurement_system: string | null;
  timezone: string | null;
  onboarding_completed: boolean;
  user_stream: 'performance' | 'menopause';
  device_permissions: {
    camera: boolean;
    microphone: boolean;
    light_sensor: boolean;
    motion: boolean;
  };
  created_at: string;
  updated_at: string;
}

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
  profile: Profile | null;
  subscription: Subscription | null;
  setProfile: (profile: Profile | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  subscription: null,
  
  setProfile: (profile) => set({ profile }),
  
  setSubscription: (subscription) => set({ subscription }),
  
  updateProfile: (updates) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...updates } : null
  })),
  
  clearUser: () => set({ profile: null, subscription: null })
}));
