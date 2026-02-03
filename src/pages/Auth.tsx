import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAssessmentFlowStore } from '@/stores/assessmentFlowStore';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferredName: z.string().min(1, 'Preferred name is required').max(50, 'Name must be less than 50 characters'),
});

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const source = searchParams.get('source') || '';

  // Get session ID from URL if user is registering from guest results.
  // Fall back to known localStorage keys so deep-links still work.
  const lisGuestSessionId =
    searchParams.get('session') ||
    localStorage.getItem('guest_session_id') ||
    localStorage.getItem('lis_guest_session_id');
  const nutritionGuestSessionId =
    source === 'nutrition' ? localStorage.getItem('nutrition_guest_session') : null;
  const healthAssistantSessionId =
    source === 'health-assistant' ? localStorage.getItem('health_questions_session_id') : null;

  const assessmentSession = searchParams.get('assessmentSession');
  const returnToParam = searchParams.get('returnTo') || '';
  const returnTo = returnToParam ? decodeURIComponent(returnToParam) : '';

  // Always call useAuth - it provides mock data in test mode
  const { signIn, signUp, user } = useAuth();

  const migrateGuestLIS = async (currentUserId: string, sessionId: string) => {
    try {
      // Claim the guest assessment via RPC (guest tables are not directly selectable/updatable).
      const { data: guestAssessment, error: claimError } = await supabase.rpc('claim_guest_lis_assessment', {
        p_session_id: sessionId,
      });

      if (claimError || !guestAssessment) {
        return { migrated: false as const, reason: 'not_found' as const };
      }

      const assessmentData = (guestAssessment as any).assessment_data as any;
      const baselineData = assessmentData?.baselineData;
      const briefResults = (guestAssessment as any).brief_results as any;
      const completedAt = (guestAssessment as any).created_at || new Date().toISOString();

      const pillarScores = briefResults?.pillarScores || {};

      // Create/Update health profile from guest baseline data (idempotent)
      if (baselineData?.dateOfBirth) {
        await supabase.from('user_health_profile').upsert(
          {
            user_id: currentUserId,
            date_of_birth: baselineData.dateOfBirth,
            height_cm: baselineData.heightCm,
            weight_kg: baselineData.weightKg,
            current_bmi: baselineData.bmi,
            activity_level: baselineData.activityLevel ?? undefined,
          },
          { onConflict: 'user_id' },
        );
      }

      // Calculate user age (optional)
      const calculateAge = (dateOfBirth: string): number => {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      const userAge = baselineData?.dateOfBirth ? calculateAge(baselineData.dateOfBirth) : null;

      // Save baseline daily score (idempotent per user/date)
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('daily_scores').upsert(
        {
          user_id: currentUserId,
          date: today,
          longevity_impact_score: briefResults?.finalScore ?? 0,
          biological_age_impact: briefResults?.finalScore ?? 0,
          is_baseline: true,
          assessment_type: 'guest_migration_baseline',
          user_chronological_age: userAge ?? undefined,
          lis_version: 'LIS 2.0',
          source_type: 'manual_entry',
          sleep_score: pillarScores.Sleep ?? pillarScores.sleep ?? 0,
          stress_score: pillarScores.Stress ?? pillarScores.stress ?? 0,
          physical_activity_score: pillarScores.Body ?? pillarScores.activity ?? 0,
          nutrition_score: pillarScores.Nutrition ?? pillarScores.nutrition ?? 0,
          social_connections_score: pillarScores.Social ?? pillarScores.social ?? 0,
          cognitive_engagement_score: pillarScores.Brain ?? pillarScores.cognitive ?? 0,
          color_code:
            (briefResults?.finalScore ?? 0) >= 75
              ? 'green'
              : (briefResults?.finalScore ?? 0) >= 50
                ? 'yellow'
                : 'red',
        },
        { onConflict: 'user_id,date' },
      );

      const syntheticAssessments = [
        { assessment_id: 'sleep-quality', pillar: 'sleep', score: pillarScores.Sleep ?? pillarScores.sleep ?? 0 },
        { assessment_id: 'stress-management', pillar: 'stress', score: pillarScores.Stress ?? pillarScores.stress ?? 0 },
        { assessment_id: 'cognitive-function', pillar: 'cognitive', score: pillarScores.Brain ?? pillarScores.cognitive ?? 0 },
        { assessment_id: 'physical-activity', pillar: 'activity', score: pillarScores.Body ?? pillarScores.activity ?? 0 },
        { assessment_id: 'nutrition-quality', pillar: 'nutrition', score: pillarScores.Nutrition ?? pillarScores.nutrition ?? 0 },
        { assessment_id: 'social-connection', pillar: 'social', score: pillarScores.Social ?? pillarScores.social ?? 0 },
      ];

      await supabase
        .from('user_assessment_completions')
        .delete()
        .eq('user_id', currentUserId)
        .in('assessment_id', syntheticAssessments.map((item) => item.assessment_id));

      for (const assessment of syntheticAssessments) {
        await supabase.from('user_assessment_completions').insert({
          user_id: currentUserId,
          assessment_id: assessment.assessment_id,
          pillar: assessment.pillar,
          score: assessment.score,
          completed_at: completedAt,
        });
      }

      await supabase
        .from('assessment_progress')
        .upsert(
          {
            user_id: currentUserId,
            lis_completed: true,
            lis_completed_at: completedAt,
          },
          { onConflict: 'user_id' },
        );

      // Best-effort: generate protocols so Today can load actions
      try {
        await supabase.functions.invoke('generate-protocol-from-assessments', { body: {} });
      } catch (e) {
        console.error('Protocol generation after LIS claim failed:', e);
      }

      // Clear local storage so we don't keep re-offering migration
      localStorage.removeItem('guest_session_id');
      localStorage.removeItem('lis_guest_session_id');

      return { migrated: true as const };
    } catch (e) {
      console.error('Error migrating guest LIS assessment:', e);
      return { migrated: false as const, reason: 'error' as const };
    }
  };

  const migrateGuestNutrition = async (currentUserId: string, sessionId: string) => {
    try {
      // Claim the nutrition assessment via RPC to safely attach it to the user.
      const { data: assessment, error: claimError } = await supabase.rpc('claim_guest_nutrition_assessment', {
        p_session_id: sessionId,
      });

      if (claimError || !assessment) {
        return { migrated: false as const, reason: 'not_found' as const };
      }

      const cravingAverage = assessment.craving_details
        ? (Object.values(assessment.craving_details).reduce((sum: number, val: any) => sum + val, 0) as number) / 4
        : 3;

      // Migrate to nutrition_preferences (idempotent)
      await supabase.from('nutrition_preferences').upsert(
        {
          user_id: currentUserId,
          age: assessment.age,
          height_cm: assessment.height_cm,
          weight_kg: assessment.weight_kg,
          weight: assessment.weight_kg,
          goal_primary: assessment.goal_primary,
          activity_level: assessment.activity_level,
          nutrition_identity_type: assessment.nutrition_identity_type,
          protein_score: assessment.protein_score,
          protein_sources: assessment.protein_sources,
          plant_diversity_score: assessment.plant_diversity_score,
          fiber_score: assessment.fiber_score,
          gut_symptom_score: assessment.gut_symptom_score,
          gut_symptoms: assessment.gut_symptoms,
          inflammation_score: assessment.inflammation_score,
          inflammation_symptoms: assessment.inflammation_symptoms,
          first_meal_hour: assessment.first_meal_hour,
          last_meal_hour: assessment.last_meal_hour,
          eats_after_8pm: assessment.eats_after_8pm,
          chrononutrition_type: assessment.chrononutrition_type,
          meal_timing_window: assessment.meal_timing_window,
          menopause_stage: assessment.menopause_stage,
          craving_pattern: cravingAverage,
          craving_details: assessment.craving_details,
          hydration_score: assessment.hydration_score,
          caffeine_score: assessment.caffeine_score,
          alcohol_intake: assessment.alcohol_intake,
          allergies: assessment.allergies,
          values_dietary: assessment.values_dietary,
          confidence_in_cooking: assessment.confidence_in_cooking,
          food_preference_type: assessment.food_preference_type,
          metabolic_symptom_flags: assessment.metabolic_symptom_flags,
          longevity_nutrition_score: assessment.longevity_nutrition_score,
          assessment_completed_at: assessment.completed_at,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

      // Generate nutrition actions for the user (best-effort)
      try {
        const { generateAndSaveNutritionActions } = await import('@/services/nutritionActionService');
        await generateAndSaveNutritionActions(currentUserId, assessment, cravingAverage);
      } catch (e) {
        console.error('Nutrition actions generation failed:', e);
      }

      localStorage.removeItem('nutrition_guest_session');
      return { migrated: true as const };
    } catch (e) {
      console.error('Error migrating guest nutrition assessment:', e);
      return { migrated: false as const, reason: 'error' as const };
    }
  };

  const claimHealthAssistantSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.rpc('claim_health_questions_session', { p_session_id: sessionId });
      if (error) throw error;
      localStorage.removeItem('health_questions_session_id');
      return { claimed: true as const };
    } catch (e) {
      console.error('Error claiming health assistant session:', e);
      return { claimed: false as const };
    }
  };

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      preferredName: '',
    },
  });

  const isSafeReturnTo = (target: string) =>
    target.startsWith('/') && !target.startsWith('/auth');

  const getLisCompleted = async (userId: string) => {
    const { data, error } = await supabase
      .from('assessment_progress')
      .select('lis_completed')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking LIS completion:', error);
      return false;
    }

    return !!data?.lis_completed;
  };

  const clearPostAuthRedirect = () => {
    localStorage.removeItem('postAuthRedirect');
    sessionStorage.removeItem('postAuthRedirect');
    localStorage.removeItem('returnTo');
    sessionStorage.removeItem('returnTo');
  };

  // Redirect if already authenticated (no auto-redirect to /today)
  // BUT: Don't redirect if coming from guest session or assessment session - let them complete signup
  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      if (user && !lisGuestSessionId && !assessmentSession) {
        // If returnTo exists and is safe, redirect there (with /today guarded by LIS completion)
        if (returnTo && isSafeReturnTo(returnTo)) {
          const lisCompleted = await getLisCompleted(user.id);
          if (returnTo.startsWith('/today') && !lisCompleted) {
            clearPostAuthRedirect();
            navigate('/');
          } else {
            clearPostAuthRedirect();
            navigate(returnTo);
          }
          return;
        }

        // Default: go to public home
        clearPostAuthRedirect();
        navigate('/');
      } else if (user && assessmentSession) {
        // User logged in with assessment session - continue flow
        const flowStore = useAssessmentFlowStore.getState();
        const nextAssessmentId = flowStore.getNextAssessment();
        
        if (nextAssessmentId) {
          // Continue to next assessment
          clearPostAuthRedirect();
          navigate(`/assessment/${nextAssessmentId}`);
        } else {
          // No more assessments, go to dashboard
          clearPostAuthRedirect();
          navigate('/dashboard');
        }
      }
    };
    
    checkProfileAndRedirect();
  }, [user, navigate, lisGuestSessionId, assessmentSession, returnTo]);

  const handleSignIn = async (data: SignInData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    
    if (!error) {
      // Check onboarding and profile status
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        // If the user came from guest LIS results, claim/migrate that assessment on sign-in too.
        if (lisGuestSessionId) {
          const result = await migrateGuestLIS(currentUser.id, lisGuestSessionId);
          if (result.migrated) {
            toast.success("Your guest assessment has been added to your account.");
          } else if (result.reason === 'claimed_by_other') {
            toast.error("These guest results have already been claimed by another account.");
          } else if (result.reason === 'error') {
            toast.error("We couldn't attach your guest results yet.", {
              action: {
                label: "Retry",
                onClick: () => migrateGuestLIS(currentUser.id, lisGuestSessionId),
              },
            });
          }
        }
        // Same behavior for guest Nutrition assessments (claim on sign-in).
        if (source === 'nutrition' && nutritionGuestSessionId) {
          const result = await migrateGuestNutrition(currentUser.id, nutritionGuestSessionId);
          if (result.migrated) {
            toast.success("Your nutrition assessment has been added to your account.");
          } else if (result.reason === 'claimed_by_other') {
            toast.error("These nutrition results have already been claimed by another account.");
          }
        }
        if (source === 'health-assistant' && healthAssistantSessionId) {
          const result = await claimHealthAssistantSession(healthAssistantSessionId);
          if (result.claimed) {
            toast.success("Your conversation has been saved to your account.");
          }
        }

        // If returnTo exists and is safe, redirect there (with /today guarded by LIS completion)
        if (returnTo && isSafeReturnTo(returnTo)) {
          const lisCompleted = await getLisCompleted(currentUser.id);
          if (returnTo.startsWith('/today') && !lisCompleted) {
            clearPostAuthRedirect();
            navigate('/');
          } else {
            clearPostAuthRedirect();
            navigate(returnTo);
          }
          return;
        }

        // Default: go to public home
        clearPostAuthRedirect();
        navigate('/');
      }
    }
    setIsLoading(false);
  };

  const handleSignUp = async (data: SignUpData) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.preferredName);
    
    // Check if user is signing up from nutrition preview
    const fromNutrition = searchParams.get('source') === 'nutrition';
    
    if (!error && (lisGuestSessionId || nutritionGuestSessionId || healthAssistantSessionId)) {
      // Set first time user flag for tour modal
      localStorage.setItem('first_time_user', 'true');
      
      // User is registering from guest results - claim their assessment
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        if (lisGuestSessionId) {
          const migrated = await migrateGuestLIS(currentUser.id, lisGuestSessionId);
          if (migrated.migrated) {
            toast.success("Welcome! Your assessment has been saved.");
          } else if (migrated.reason === 'claimed_by_other') {
            toast.error("These guest results have already been claimed by another account.");
          } else if (migrated.reason === 'error') {
            toast.error("We couldn't attach your guest results yet.", {
              action: {
                label: "Retry",
                onClick: () => migrateGuestLIS(currentUser.id, lisGuestSessionId),
              },
            });
          }
        }
        
        // NEW: Nutrition Assessment Migration
        if (fromNutrition && nutritionGuestSessionId) {
          const result = await migrateGuestNutrition(currentUser.id, nutritionGuestSessionId);
          if (result.migrated) {
            toast.success("Your nutrition assessment has been saved to your account!");
          } else if (result.reason === 'claimed_by_other') {
            toast.error("These nutrition results have already been claimed by another account.");
          }
        }
        if (source === 'health-assistant' && healthAssistantSessionId) {
          await claimHealthAssistantSession(healthAssistantSessionId);
        }

        // If from nutrition, redirect to dashboard with firstLogin flag
        if (fromNutrition) {
          clearPostAuthRedirect();
          navigate('/dashboard?firstLogin=true&source=nutrition');
        } else {
          clearPostAuthRedirect();
          navigate('/lis-results');
        }
      }
    } else if (!error) {
      // Set first time user flag for tour modal
      localStorage.setItem('first_time_user', 'true');
      
      // New user without guest session
        if (fromNutrition) {
        // Redirect to dashboard with firstLogin flag for nutrition onboarding
        toast.success("Welcome! Let's get you started with nutrition tracking.");
          clearPostAuthRedirect();
          navigate('/dashboard?firstLogin=true&source=nutrition');
      } else {
        // Standard flow - go to public home
        toast.success("Welcome! Let's set up your health profile.");
          clearPostAuthRedirect();
        navigate('/');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Button
            variant="ghost"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/", { replace: false })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              Biohack<em className="italic">her</em>
            </h1>
            <p className="text-muted-foreground mt-2">
              Start your personalised longevity journey
            </p>
          </div>
        </div>

        {/* Auth Forms */}
        <Card className="card-elevated">
          <Tabs defaultValue="signin" className="w-full">
            <CardHeader className="space-y-0 pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4 mt-0">
                <div className="text-center mb-4">
                  <CardTitle className="text-xl">Welcome back!</CardTitle>
                  <CardDescription>
                    Sign in to continue your biohacking journey
                  </CardDescription>
                </div>

                <Form {...signInForm}>
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <FormField
                      control={signInForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              type="email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signInForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="Enter your password"
                                type={showPassword ? "text" : "password"}
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full primary-gradient" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4 mt-0">
                <div className="text-center mb-4">
                  <CardTitle className="text-xl">Set Up Your Profile</CardTitle>
                  <CardDescription>
                    Just your email and a password to get started
                  </CardDescription>
                </div>

                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                    <FormField
                      control={signUpForm.control}
                      name="preferredName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="What should we call you?" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              type="email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="Create a secure password"
                                type={showPassword ? "text" : "password"}
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full primary-gradient" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Setting up...' : 'Get Started'}
                    </Button>
                    
                    <div className="text-center text-xs text-muted-foreground mt-4 space-y-1">
                      <p>No payment required • Cancel anytime</p>
                      <p>Your data is private and secure</p>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{' '}
            <Link to="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;