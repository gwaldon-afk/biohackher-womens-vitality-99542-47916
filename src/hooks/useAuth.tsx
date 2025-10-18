import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { detectUserLocale, updateUserLocale, getUserLocale } from '@/services/localeService';
import { getAuthRedirectUrl } from '@/utils/capacitor';
import { TEST_MODE_ENABLED, MOCK_USER, MOCK_PROFILE } from '@/config/testMode';

interface Profile {
  id: string;
  user_id: string;
  preferred_name: string;
  email: string | null;
  created_at: string;
  updated_at: string;
  country: string;
  language: string;
  currency: string;
  measurement_system: string;
  timezone: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, preferredName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(TEST_MODE_ENABLED ? (MOCK_USER as User) : null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(TEST_MODE_ENABLED ? MOCK_PROFILE : null);
  const [loading, setLoading] = useState(!TEST_MODE_ENABLED);
  const { toast } = useToast();
  const { i18n } = useTranslation();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      // If no profile exists, it will be created by the database trigger on next sign-in
      if (!data) {
        console.log('No profile found for user, will be created automatically');
        return;
      }

      setProfile(data);
      
      // Set i18n language based on user's locale preference
      if (data?.language && i18n.language !== data.language) {
        i18n.changeLanguage(data.language);
      }
      
      // Detect and update locale for new users if not set
      if (!data?.country || !data?.language) {
        const detectedLocale = await detectUserLocale();
        await updateUserLocale(userId, detectedLocale);
        
        // Refetch profile to get updated locale data
        setTimeout(() => fetchProfile(userId), 100);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Skip auth setup if in test mode
    if (TEST_MODE_ENABLED) {
      return;
    }

    // Check for existing session FIRST
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    // Set up auth state listener AFTER
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch profile when user signs in - deferred to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const claimGuestAssessments = async (sessionId: string, userId: string) => {
    try {
      // Claim all guest assessments with this session ID
      const { error } = await supabase
        .from('guest_symptom_assessments')
        .update({
          claimed_by_user_id: userId,
          claimed_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .is('claimed_by_user_id', null);

      if (error) throw error;

      // Convert guest assessments to user symptom_assessments
      const { data: guestAssessments, error: fetchError } = await supabase
        .from('guest_symptom_assessments')
        .select('*')
        .eq('session_id', sessionId)
        .eq('claimed_by_user_id', userId);

      if (fetchError) throw fetchError;

      if (guestAssessments && guestAssessments.length > 0) {
        const userAssessments = guestAssessments.map(ga => ({
          user_id: userId,
          symptom_type: ga.symptom_id,
          overall_score: ga.score,
          score_category: ga.score_category,
          answers: ga.answers,
          recommendations: {
            description: '',
            scoringGuidance: {}
          },
          completed_at: ga.completed_at
        }));

        const { error: insertError } = await supabase
          .from('symptom_assessments')
          .insert(userAssessments);

        if (insertError) throw insertError;
        
        toast({
          title: "Results Saved!",
          description: `${guestAssessments.length} assessment(s) have been added to your profile.`
        });
      }

      return { success: true, count: guestAssessments?.length || 0 };
    } catch (error) {
      console.error('Error claiming guest assessments:', error);
      return { success: false, count: 0 };
    }
  };

  const signUp = async (email: string, password: string, preferredName: string) => {
    if (TEST_MODE_ENABLED) {
      return { error: null };
    }
    
    try {
      const redirectUrl = `${getAuthRedirectUrl()}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            preferred_name: preferredName,
          },
        },
      });

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Check if there's a pending assessment session to claim
        const urlParams = new URLSearchParams(window.location.search);
        const assessmentSession = urlParams.get('assessmentSession');
        
        if (assessmentSession) {
          // Get the new user ID
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await claimGuestAssessments(assessmentSession, user.id);
          }
        }
        
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (TEST_MODE_ENABLED) {
      return { error: null };
    }
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    if (TEST_MODE_ENABLED) {
      return;
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out successfully",
          description: "See you soon!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};