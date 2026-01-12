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
  const guestSessionId =
    searchParams.get('session') ||
    (source === 'lis-results'
      ? localStorage.getItem('lis_guest_session_id')
      : source === 'nutrition'
        ? localStorage.getItem('nutrition_guest_session')
        : null);

  const assessmentSession = searchParams.get('assessmentSession');
  const returnToParam = searchParams.get('returnTo') || '';
  const returnTo = returnToParam ? decodeURIComponent(returnToParam) : '';

  // Always call useAuth - it provides mock data in test mode
  const { signIn, signUp, user } = useAuth();

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

  // Redirect if already authenticated and check for health profile AND onboarding
  // BUT: Don't redirect if coming from guest session or assessment session - let them complete signup
  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      if (user && !guestSessionId && !assessmentSession) {
        // Check onboarding status first
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();
        
        // If onboarding not completed, redirect to unified assessment
        if (profile && !profile.onboarding_completed) {
          const onboardingPath = returnTo
            ? `/guest-lis-assessment?returnTo=${encodeURIComponent(returnTo)}`
            : '/guest-lis-assessment';
          navigate(onboardingPath);
          return;
        }

        // If returnTo exists, redirect there directly
        if (returnTo) {
          navigate(returnTo);
          return;
        }

        // Check if user has completed initial assessment
        const { data: healthProfile } = await supabase
          .from('user_health_profile')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!healthProfile) {
          navigate('/guest-lis-assessment');
        } else {
          navigate('/dashboard');
        }
      } else if (user && assessmentSession) {
        // User logged in with assessment session - continue flow
        const flowStore = useAssessmentFlowStore.getState();
        const nextAssessmentId = flowStore.getNextAssessment();
        
        if (nextAssessmentId) {
          // Continue to next assessment
          navigate(`/assessment/${nextAssessmentId}`);
        } else {
          // No more assessments, go to dashboard
          navigate('/dashboard');
        }
      }
    };
    
    checkProfileAndRedirect();
  }, [user, navigate, guestSessionId, assessmentSession, returnTo]);

  const handleSignIn = async (data: SignInData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    
    if (!error) {
      // Check onboarding and profile status
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        // If returnTo exists, redirect there directly
        if (returnTo) {
          navigate(returnTo);
          return;
        }

        // If no returnTo, check health profile and redirect appropriately
        // Check health profile
        const { data: healthProfile } = await supabase
          .from('user_health_profile')
          .select('id')
          .eq('user_id', currentUser.id)
          .maybeSingle();
        
        if (!healthProfile) {
          navigate('/guest-lis-assessment');
        } else {
          navigate('/dashboard');
        }
      }
    }
    setIsLoading(false);
  };

  const handleSignUp = async (data: SignUpData) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.preferredName);
    
    // Check if user is signing up from nutrition preview
    const fromNutrition = searchParams.get('source') === 'nutrition';
    
    if (!error && guestSessionId) {
      // Set first time user flag for tour modal
      localStorage.setItem('first_time_user', 'true');
      
      // User is registering from guest results - claim their assessment
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        // Get the guest assessment data
        const { data: guestAssessment } = await supabase
          .from('guest_lis_assessments')
          .select('*')
          .eq('session_id', guestSessionId)
          .maybeSingle();
        
        if (guestAssessment) {
          const assessmentData = guestAssessment.assessment_data as any;
          const baselineData = assessmentData.baselineData;
          
          // Create health profile from guest data
          await supabase.from('user_health_profile').insert({
            user_id: currentUser.id,
            date_of_birth: baselineData.dateOfBirth,
            height_cm: baselineData.heightCm,
            weight_kg: baselineData.weightKg,
            current_bmi: baselineData.bmi,
          });
          
          // Create baseline daily_score from guest assessment
          const briefResults = guestAssessment.brief_results as any;
          
          // Calculate user age
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
          
          const userAge = calculateAge(baselineData.dateOfBirth);
          
          // Insert baseline daily score
          await supabase.from('daily_scores').insert({
            user_id: currentUser.id,
            date: new Date().toISOString().split('T')[0],
            longevity_impact_score: briefResults.finalScore,
            biological_age_impact: briefResults.finalScore,
            is_baseline: true,
            assessment_type: 'guest_migration_baseline',
            user_chronological_age: userAge,
            lis_version: 'LIS 2.0',
            source_type: 'manual_entry',
            sleep_score: briefResults.pillarScores.Sleep || briefResults.pillarScores.sleep,
            stress_score: briefResults.pillarScores.Stress || briefResults.pillarScores.stress,
            physical_activity_score: briefResults.pillarScores.Body || briefResults.pillarScores.activity,
            nutrition_score: briefResults.pillarScores.Nutrition || briefResults.pillarScores.nutrition,
            social_connections_score: briefResults.pillarScores.Social || briefResults.pillarScores.social,
            cognitive_engagement_score: briefResults.pillarScores.Brain || briefResults.pillarScores.cognitive,
            color_code: briefResults.finalScore >= 75 ? 'green' : briefResults.finalScore >= 50 ? 'yellow' : 'red'
          });
          
          // Mark guest assessment as claimed
          await supabase
            .from('guest_lis_assessments')
            .update({ 
              claimed_by_user_id: currentUser.id,
              claimed_at: new Date().toISOString()
            })
            .eq('session_id', guestSessionId);
          
          toast.success("Welcome! Your assessment has been saved.");
          
          // If from nutrition, redirect to dashboard with firstLogin flag
          if (fromNutrition) {
            navigate('/dashboard?firstLogin=true&source=nutrition');
          } else {
            navigate('/lis-results');
          }
        }
        
        // NEW: Nutrition Assessment Migration
        if (fromNutrition) {
          const { data: guestNutritionAssessment } = await supabase
            .from('longevity_nutrition_assessments')
            .select('*')
            .eq('session_id', guestSessionId)
            .is('user_id', null)
            .maybeSingle();
          
          if (guestNutritionAssessment) {
            const cravingAverage = guestNutritionAssessment.craving_details
              ? (Object.values(guestNutritionAssessment.craving_details).reduce(
                  (sum: number, val: any) => sum + val, 0) as number) / 4
              : 3;

            // Migrate to nutrition_preferences
            await supabase.from('nutrition_preferences').upsert({
              user_id: currentUser.id,
              age: guestNutritionAssessment.age,
              height_cm: guestNutritionAssessment.height_cm,
              weight_kg: guestNutritionAssessment.weight_kg,
              weight: guestNutritionAssessment.weight_kg,
              goal_primary: guestNutritionAssessment.goal_primary,
              activity_level: guestNutritionAssessment.activity_level,
              nutrition_identity_type: guestNutritionAssessment.nutrition_identity_type,
              protein_score: guestNutritionAssessment.protein_score,
              protein_sources: guestNutritionAssessment.protein_sources,
              plant_diversity_score: guestNutritionAssessment.plant_diversity_score,
              fiber_score: guestNutritionAssessment.fiber_score,
              gut_symptom_score: guestNutritionAssessment.gut_symptom_score,
              gut_symptoms: guestNutritionAssessment.gut_symptoms,
              inflammation_score: guestNutritionAssessment.inflammation_score,
              inflammation_symptoms: guestNutritionAssessment.inflammation_symptoms,
              first_meal_hour: guestNutritionAssessment.first_meal_hour,
              last_meal_hour: guestNutritionAssessment.last_meal_hour,
              eats_after_8pm: guestNutritionAssessment.eats_after_8pm,
              chrononutrition_type: guestNutritionAssessment.chrononutrition_type,
              meal_timing_window: guestNutritionAssessment.meal_timing_window,
              menopause_stage: guestNutritionAssessment.menopause_stage,
              craving_pattern: cravingAverage,
              craving_details: guestNutritionAssessment.craving_details,
              hydration_score: guestNutritionAssessment.hydration_score,
              caffeine_score: guestNutritionAssessment.caffeine_score,
              alcohol_intake: guestNutritionAssessment.alcohol_intake,
              allergies: guestNutritionAssessment.allergies,
              values_dietary: guestNutritionAssessment.values_dietary,
              confidence_in_cooking: guestNutritionAssessment.confidence_in_cooking,
              food_preference_type: guestNutritionAssessment.food_preference_type,
              metabolic_symptom_flags: guestNutritionAssessment.metabolic_symptom_flags,
              longevity_nutrition_score: guestNutritionAssessment.longevity_nutrition_score,
              assessment_completed_at: guestNutritionAssessment.completed_at,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

            // Mark guest assessment as claimed
            await supabase
              .from('longevity_nutrition_assessments')
              .update({
                claimed_at: new Date().toISOString(),
                claimed_by_user_id: currentUser.id
              })
              .eq('id', guestNutritionAssessment.id);

            // Generate nutrition actions for new user
            const { generateAndSaveNutritionActions } = await import('@/services/nutritionActionService');
            await generateAndSaveNutritionActions(
              currentUser.id, 
              guestNutritionAssessment, 
              cravingAverage
            );

            localStorage.removeItem('nutrition_guest_session');
            toast.success("Your nutrition assessment has been saved to your account!");
          }
        }
      }
    } else if (!error) {
      // Set first time user flag for tour modal
      localStorage.setItem('first_time_user', 'true');
      
      // New user without guest session
      if (fromNutrition) {
        // Redirect to dashboard with firstLogin flag for nutrition onboarding
        toast.success("Welcome! Let's get you started with nutrition tracking.");
        navigate('/dashboard?firstLogin=true&source=nutrition');
      } else {
        // Standard flow - redirect to unified assessment
        toast.success("Welcome! Let's set up your health profile.");
        const onboardingPath = returnTo
          ? `/guest-lis-assessment?returnTo=${encodeURIComponent(returnTo)}`
          : '/guest-lis-assessment';
        navigate(onboardingPath);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
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