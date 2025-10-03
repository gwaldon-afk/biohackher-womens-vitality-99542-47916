import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Activity, Heart, Moon, Brain, Users, Utensils, Smartphone, User, CalendarIcon, Info, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import NutritionalScorecard from "./NutritionalScorecard";
import { useNavigate } from "react-router-dom";

// Validation schemas
const sleepSchema = z.object({
  totalSleepHours: z.number().min(0).max(24),
  remHours: z.number().min(0).max(12).optional(),
  deepSleepHours: z.number().min(0).max(12).optional()
});

const stressSchema = z.object({
  hrv: z.number().min(0).max(200),
  selfReportedStress: z.number().min(1).max(10),
  selfPerceivedAge: z.number().min(10).max(120),
  subjectiveCalmnessRating: z.number().min(0).max(10)
});

const activitySchema = z.object({
  activeMinutes: z.number().min(0).max(1440),
  steps: z.number().min(0).max(100000).optional(),
  intensity: z.number().min(1).max(10),
  type: z.enum(["strength", "cardio", "hiit"])
});

const nutritionSchema = z.object({
  mealQuality: z.number().min(1).max(10)
});

const socialSchema = z.object({
  interactionQuality: z.number().min(1).max(10),
  socialTimeMinutes: z.number().min(0).max(1440)
});

const cognitiveSchema = z.object({
  meditationMinutes: z.number().min(0).max(1440),
  learningMinutes: z.number().min(0).max(1440)
});

interface LISInputFormProps {
  children: React.ReactNode;
  onScoreCalculated: () => void;
}

const LISInputForm = ({ children, onScoreCalculated }: LISInputFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useHealthProfile();
  const { subscription, canSubmitDaily, getDaysRemainingInTrial } = useSubscription();

  // Manual input state
  const [sleepData, setSleepData] = useState({
    totalSleepHours: 8,
    remHours: undefined as number | undefined,
    deepSleepHours: undefined as number | undefined
  });

  const [stressData, setStressData] = useState({
    hrv: 45,
    selfReportedStress: 5,
    selfPerceivedAge: 35,
    subjectiveCalmnessRating: 5
  });

  const [activityData, setActivityData] = useState({
    activeMinutes: 60,
    steps: undefined as number | undefined,
    intensity: 6,
    type: "cardio" as "strength" | "cardio" | "hiit"
  });

  const [nutritionData, setNutritionData] = useState({
    mealQuality: 7
  });

  // Add state for nutrition input mode
  const [nutritionInputMode, setNutritionInputMode] = useState<"simple" | "detailed">("simple");
  const [showScorecard, setShowScorecard] = useState(false);
  const [scorecardDialogOpen, setScorecardDialogOpen] = useState(false);

  const [socialData, setSocialData] = useState({
    interactionQuality: 6,
    socialTimeMinutes: 120
  });

  const [cognitiveData, setCognitiveData] = useState({
    meditationMinutes: 20,
    learningMinutes: 45
  });

  // Add date state for the score entry
  const [scoreDate, setScoreDate] = useState<Date>(new Date());

  // Nutritional scorecard state
  const [nutritionalScore, setNutritionalScore] = useState(0);
  const [nutritionalGrade, setNutritionalGrade] = useState('C');

  const validateInputs = () => {
    try {
      sleepSchema.parse(sleepData);
      stressSchema.parse(stressData);
      activitySchema.parse(activityData);
      nutritionSchema.parse(nutritionData);
      socialSchema.parse(socialData);
      cognitiveSchema.parse(cognitiveData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: "Please check all input values are within valid ranges.",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const calculateScore = () => {
    // Placeholder calculation - would be replaced with actual scoring logic
    const sleepScore = (sleepData.totalSleepHours / 8) * 25;
    const stressScore = ((200 - stressData.hrv) / 200 + (10 - stressData.selfReportedStress) / 10) * 10;
    const activityScore = (activityData.activeMinutes / 60) * 15;
    const nutritionScore = nutritionInputMode === "detailed" && nutritionalScore !== 0 
      ? (nutritionalScore + 10) / 20 * 15  // Convert nutritional score to 15-point scale
      : (nutritionData.mealQuality / 10) * 15;
    const socialScore = ((socialData.interactionQuality / 10) + (socialData.socialTimeMinutes / 120)) * 7.5;
    const cognitiveScore = ((cognitiveData.meditationMinutes + cognitiveData.learningMinutes) / 65) * 10;
    
    return Math.round(sleepScore + stressScore + activityScore + nutritionScore + socialScore + cognitiveScore);
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;
    
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your score.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const dateString = format(scoreDate, 'yyyy-MM-dd');

      // Call the score-calculate edge function with metrics
      const { data: response, error: functionError } = await supabase.functions.invoke('score-calculate', {
        body: {
          user_id: user.id,
          date: dateString,
          sleep: {
            total_hours: sleepData.totalSleepHours,
            rem_hours: sleepData.remHours ?? null,
            deep_sleep_hours: sleepData.deepSleepHours ?? null
          },
          stress: {
            hrv: stressData.hrv,
            self_reported: stressData.selfReportedStress,
            self_perceived_age: stressData.selfPerceivedAge,
            subjective_calmness_rating: stressData.subjectiveCalmnessRating
          },
          activity: {
            steps: activityData.steps ?? null,
            active_minutes: activityData.activeMinutes,
            activity_intensity: activityData.intensity
          },
          nutrition: {
            meal_quality_score: nutritionInputMode === "simple" ? nutritionData.mealQuality : null,
            nutritional_detailed_score: nutritionInputMode === "detailed" ? nutritionalScore : null
          },
          social: {
            social_time_minutes: socialData.socialTimeMinutes,
            interaction_quality: socialData.interactionQuality
          },
          cognitive: {
            meditation_minutes: cognitiveData.meditationMinutes,
            learning_minutes: cognitiveData.learningMinutes
          },
          assessment_type: 'daily_tracking',
          is_baseline: false,
          input_mode: activeTab,
          source_type: 'manual_entry'
        }
      });

      if (functionError) throw functionError;

      const scoreValue = response?.score?.longevity_impact_score || 0;
      const version = response?.version || 'LIS 1.0';

      toast({
        title: `${version} Score Calculated!`,
        description: `Your Longevity Impact Score: ${scoreValue}/100 for ${format(scoreDate, 'dd/MM/yyyy')}`,
        variant: "default"
      });

      setOpen(false);
      onScoreCalculated();
    } catch (error) {
      console.error('Error calculating score:', error);
      toast({
        title: "Error",
        description: `Failed to calculate your score: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWearableSync = async () => {
    setLoading(true);
    try {
      // Placeholder for wearable sync logic
      toast({
        title: "Sync Started",
        description: "Syncing with your wearable devices...",
        variant: "default"
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Sync Complete",
        description: "Your wearable data has been updated.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to sync with wearable devices.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate current score for display
  const currentScore = calculateScore();

  // Check subscription access before opening modal
  const handleOpenModal = () => {
    if (!canSubmitDaily()) {
      navigate('/upgrade');
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <div
        onClick={() => {
          console.log("Card clicked - opening modal");
          handleOpenModal();
        }}
        className="cursor-pointer"
      >
        {children}
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Update Your Longevity Impact Score
            </DialogTitle>
            <DialogDescription>
              Input your daily metrics to calculate your personalised LIS score
              {subscription?.subscription_status === 'trialing' && (
                <Badge variant="secondary" className="ml-2">
                  {getDaysRemainingInTrial()} days trial remaining
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* LIS 2.0 Setup Prompt */}
          {!profileLoading && !profile && (
            <Alert className="mb-4 border-primary/50 bg-primary/5">
              <Info className="h-4 w-4" />
              <AlertTitle>Unlock LIS 2.0 (Recommended)</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="text-sm mb-2">
                  Complete your health profile to activate LIS 2.0 with scientifically validated scoring based on subjective age (HR≈2.11) and social engagement (HR≈1.72).
                </p>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    navigate('/lis2-setup');
                  }}
                >
                  Complete LIS 2.0 Setup (2 minutes)
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!profileLoading && profile && (
            <Alert className="mb-4 border-green-500/50 bg-green-500/5">
              <Info className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">LIS 2.0 Active</AlertTitle>
              <AlertDescription className="text-sm text-green-600">
                Your scores are using the latest LIS 2.0 methodology with personalized health profile.
              </AlertDescription>
            </Alert>
          )}

          {/* Wearable Connection Banner */}
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Connect a wearable for automatic tracking
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Manual entry is available, but connecting a device will save you time with automatic daily updates.
                </p>
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-blue-600 dark:text-blue-400 text-xs mt-2"
                  onClick={() => window.location.href = '/settings?tab=integrations'}
                >
                  Connect Device →
                </Button>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <Label className="text-sm font-medium mb-2 block">Day</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !scoreDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scoreDate ? format(scoreDate, "dd/MM/yyyy") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scoreDate}
                  onSelect={(date) => date && setScoreDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Manual Input
              </TabsTrigger>
              <TabsTrigger value="wearable" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Sync Wearables
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sleep Quality */}
                <Card className="h-[400px] flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Moon className="h-4 w-4 text-blue-500" />
                      Sleep Quality
                      <Badge variant="secondary">25%</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Quality sleep is crucial for cellular repair, memory consolidation, and hormone regulation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1">
                    <div>
                      <Label htmlFor="totalSleep">Total Sleep (hours)</Label>
                      <Input
                        id="totalSleep"
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={sleepData.totalSleepHours}
                        onChange={(e) => setSleepData({...sleepData, totalSleepHours: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="remSleep" className="flex items-center gap-2">
                        REM Sleep (hours)
                        <Badge variant="secondary" className="text-xs">Optional</Badge>
                      </Label>
                      <Input
                        id="remSleep"
                        type="number"
                        min="0"
                        max="12"
                        step="0.5"
                        placeholder="Leave blank if unknown"
                        value={sleepData.remHours ?? ''}
                        onChange={(e) => setSleepData({...sleepData, remHours: e.target.value ? parseFloat(e.target.value) : undefined})}
                      />
                      <p className="text-xs text-muted-foreground mt-1">From sleep tracker or leave blank</p>
                    </div>
                    <div>
                      <Label htmlFor="deepSleep" className="flex items-center gap-2">
                        Deep Sleep (hours)
                        <Badge variant="secondary" className="text-xs">Optional</Badge>
                      </Label>
                      <Input
                        id="deepSleep"
                        type="number"
                        min="0"
                        max="12"
                        step="0.5"
                        placeholder="Leave blank if unknown"
                        value={sleepData.deepSleepHours ?? ''}
                        onChange={(e) => setSleepData({...sleepData, deepSleepHours: e.target.value ? parseFloat(e.target.value) : undefined})}
                      />
                      <p className="text-xs text-muted-foreground mt-1">From sleep tracker or leave blank</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Stress Management - LIS 2.0 */}
                <Card className="h-[400px] flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4 text-red-500" />
                      Stress & Subjective Age
                      <Badge variant="secondary">30%</Badge>
                      <Badge variant="outline" className="text-xs">LIS 2.0</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Subjective age is a powerful predictor of longevity (HR≈2.11)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 overflow-y-auto">
                    <div>
                      <Label htmlFor="selfPerceivedAge">How old do you feel today?</Label>
                      <Input
                        id="selfPerceivedAge"
                        type="number"
                        min="10"
                        max="120"
                        value={stressData.selfPerceivedAge}
                        onChange={(e) => setStressData({...stressData, selfPerceivedAge: parseInt(e.target.value)})}
                        placeholder="Enter your subjective age"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Your true biological age signal
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="calmnessRating">Morning Recovery/Calmness (0-10)</Label>
                      <Input
                        id="calmnessRating"
                        type="number"
                        min="0"
                        max="10"
                        value={stressData.subjectiveCalmnessRating}
                        onChange={(e) => setStressData({...stressData, subjectiveCalmnessRating: parseInt(e.target.value)})}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        0 = Extremely stressed, 10 = Completely recovered
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <Label htmlFor="hrv" className="text-xs text-muted-foreground">HRV (Optional)</Label>
                      <Input
                        id="hrv"
                        type="number"
                        min="0"
                        max="200"
                        value={stressData.hrv}
                        onChange={(e) => setStressData({...stressData, hrv: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stressLevel" className="text-xs text-muted-foreground">Stress Level (1-10, Optional)</Label>
                      <Input
                        id="stressLevel"
                        type="number"
                        min="1"
                        max="10"
                        value={stressData.selfReportedStress}
                        onChange={(e) => setStressData({...stressData, selfReportedStress: parseInt(e.target.value)})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Physical Activity */}
                <Card className="h-[400px] flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-green-500" />
                      Physical Activity
                      <Badge variant="secondary">15%</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Regular movement improves cardiovascular health and maintains muscle mass.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1">
                    <div>
                      <Label htmlFor="activeMinutes">Active Minutes</Label>
                      <Input
                        id="activeMinutes"
                        type="number"
                        min="0"
                        max="1440"
                        value={activityData.activeMinutes}
                        onChange={(e) => setActivityData({...activityData, activeMinutes: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="steps" className="flex items-center gap-2">
                        Steps
                        <Badge variant="secondary" className="text-xs">Optional</Badge>
                      </Label>
                      <Input
                        id="steps"
                        type="number"
                        min="0"
                        max="100000"
                        placeholder="Leave blank if not tracked"
                        value={activityData.steps ?? ''}
                        onChange={(e) => setActivityData({...activityData, steps: e.target.value ? parseInt(e.target.value) : undefined})}
                      />
                      <p className="text-xs text-muted-foreground mt-1">From tracker or leave blank</p>
                    </div>
                    <div>
                      <Label htmlFor="intensity">Intensity (1-10)</Label>
                      <Input
                        id="intensity"
                        type="number"
                        min="1"
                        max="10"
                        value={activityData.intensity}
                        onChange={(e) => setActivityData({...activityData, intensity: parseInt(e.target.value)})}
                      />
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <p><strong>1-3:</strong> Light (walking, stretching)</p>
                        <p><strong>4-6:</strong> Moderate (brisk walk, cycling)</p>
                        <p><strong>7-10:</strong> Vigorous (running, HIIT)</p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="activityType">Activity Type</Label>
                      <Select
                        value={activityData.type}
                        onValueChange={(value: "strength" | "cardio" | "hiit") => 
                          setActivityData({...activityData, type: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strength">Strength Training</SelectItem>
                          <SelectItem value="cardio">Cardio</SelectItem>
                          <SelectItem value="hiit">HIIT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Nutrition */}
                <Card className="h-[400px] flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Utensils className="h-4 w-4 text-orange-500" />
                      Nutrition
                      <Badge variant="secondary">15%</Badge>
                      {nutritionalScore !== 0 && (
                        <Badge variant="outline" className="ml-auto">
                          Score: {nutritionalScore} ({nutritionalGrade})
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Nutrient-dense whole foods provide antioxidants and reduce inflammation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1">
                    <div>
                      <Label className="text-sm font-medium">Choose tracking method:</Label>
                      <RadioGroup
                        value={nutritionInputMode}
                        onValueChange={(value: "simple" | "detailed") => {
                          setNutritionInputMode(value);
                          if (value === "simple") {
                            setShowScorecard(false);
                            // Reset nutritional score when switching back to simple
                            setNutritionalScore(0);
                            setNutritionalGrade('C');
                          } else if (value === "detailed") {
                            // Automatically open scorecard when selecting detailed mode
                            setScorecardDialogOpen(true);
                          }
                        }}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="simple" id="nutrition-simple" />
                          <Label htmlFor="nutrition-simple" className="text-sm cursor-pointer">
                            Simple meal quality (1-10)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="detailed" id="nutrition-detailed" />
                          <Label htmlFor="nutrition-detailed" className="text-sm cursor-pointer">
                            Complete Nutrition Scorecard
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {nutritionInputMode === "simple" && (
                      <div>
                        <Label htmlFor="mealQuality">Meal Quality (1-10)</Label>
                        <Input
                          id="mealQuality"
                          type="number"
                          min="1"
                          max="10"
                          value={nutritionData.mealQuality}
                          onChange={(e) => setNutritionData({mealQuality: parseInt(e.target.value)})}
                        />
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          <p><strong>1-3:</strong> Poor quality</p>
                          <p><strong>4-6:</strong> Moderate quality</p>
                          <p><strong>7-8:</strong> Good quality</p>
                          <p><strong>9-10:</strong> Excellent quality</p>
                        </div>
                      </div>
                    )}

                    {nutritionInputMode === "detailed" && nutritionalScore !== 0 && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Daily Nutrition Score</p>
                            <p className="text-xs text-muted-foreground">Calculated from completed scorecard</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {nutritionalScore} ({nutritionalGrade})
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full"
                          onClick={() => setScorecardDialogOpen(true)}
                        >
                          Update Scorecard
                        </Button>
                      </div>
                    )}

                    {nutritionInputMode === "detailed" && nutritionalScore === 0 && (
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          Complete the nutrition scorecard to get your daily score
                        </p>
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setScorecardDialogOpen(true);
                          }}
                        >
                          Open Scorecard
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Social Connections */}
                <Card className="h-[400px] flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-purple-500" />
                      Social Connections
                      <Badge variant="secondary">15%</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Strong social bonds reduce stress hormones and boost immune function.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1">
                    <div>
                      <Label htmlFor="interactionQuality">Interaction Quality (1-10)</Label>
                      <Input
                        id="interactionQuality"
                        type="number"
                        min="1"
                        max="10"
                        value={socialData.interactionQuality}
                        onChange={(e) => setSocialData({...socialData, interactionQuality: parseInt(e.target.value)})}
                      />
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <p><strong>1-3:</strong> Minimal</p>
                        <p><strong>4-6:</strong> Moderate</p>
                        <p><strong>7-8:</strong> Meaningful</p>
                        <p><strong>9-10:</strong> Deep connection</p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="socialTime">Social Time (minutes)</Label>
                      <Input
                        id="socialTime"
                        type="number"
                        min="0"
                        max="1440"
                        value={socialData.socialTimeMinutes}
                        onChange={(e) => setSocialData({...socialData, socialTimeMinutes: parseInt(e.target.value)})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Cognitive Engagement */}
                <Card className="h-[400px] flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Brain className="h-4 w-4 text-pink-500" />
                      Cognitive Engagement
                      <Badge variant="secondary">10%</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Mental stimulation promotes neuroplasticity and supports brain health.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1">
                    <div>
                      <Label htmlFor="meditationMinutes">Meditation (minutes)</Label>
                      <Input
                        id="meditationMinutes"
                        type="number"
                        min="0"
                        max="1440"
                        value={cognitiveData.meditationMinutes}
                        onChange={(e) => setCognitiveData({...cognitiveData, meditationMinutes: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="learningMinutes">Learning (minutes)</Label>
                      <Input
                        id="learningMinutes"
                        type="number"
                        min="0"
                        max="1440"
                        value={cognitiveData.learningMinutes}
                        onChange={(e) => setCognitiveData({...cognitiveData, learningMinutes: parseInt(e.target.value)})}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Remove the scorecard from bottom - now it's in a dialog */}

              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Score: <span className="font-bold text-foreground">{currentScore}/100</span>
                  </p>
                </div>
                <Button onClick={handleSubmit} disabled={loading} className="min-w-32">
                  {loading ? "Saving..." : "Update Score"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="wearable" className="space-y-6">
              <div className="text-center py-12 space-y-4">
                <Smartphone className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">Sync Your Wearables</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Connect your fitness trackers and health devices to automatically import your daily metrics.
                </p>
                <div className="space-y-2">
                  <Button onClick={handleWearableSync} disabled={loading} className="w-full max-w-xs">
                    {loading ? "Syncing..." : "Sync Apple Health"}
                  </Button>
                  <Button onClick={handleWearableSync} disabled={loading} variant="outline" className="w-full max-w-xs">
                    {loading ? "Syncing..." : "Sync Google Fit"}
                  </Button>
                  <Button onClick={handleWearableSync} disabled={loading} variant="outline" className="w-full max-w-xs">
                    {loading ? "Syncing..." : "Sync Fitbit"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Nutritional Scorecard Dialog */}
      <Dialog open={scorecardDialogOpen} onOpenChange={setScorecardDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Daily Nutritional Scorecard
            </DialogTitle>
            <DialogDescription>
              Complete your nutrition assessment to get your daily score
            </DialogDescription>
          </DialogHeader>
          
          <NutritionalScorecard 
            onScoreCalculated={(score, grade) => {
              setNutritionalScore(score);
              setNutritionalGrade(grade);
              // Close the scorecard dialog after calculation
              setScorecardDialogOpen(false);
            }}
            hasDairySensitivity={false} // This could be set based on user profile
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LISInputForm;