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
import { Activity, Heart, Moon, Brain, Users, Utensils, Smartphone, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Validation schemas
const sleepSchema = z.object({
  totalSleepHours: z.number().min(0).max(24),
  remPercentage: z.number().min(0).max(100),
  deepSleepPercentage: z.number().min(0).max(100)
});

const stressSchema = z.object({
  hrv: z.number().min(0).max(200),
  selfReportedStress: z.number().min(1).max(10)
});

const activitySchema = z.object({
  activeMinutes: z.number().min(0).max(1440),
  steps: z.number().min(0).max(100000),
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

  // Manual input state
  const [sleepData, setSleepData] = useState({
    totalSleepHours: 8,
    remPercentage: 25,
    deepSleepPercentage: 15
  });

  const [stressData, setStressData] = useState({
    hrv: 45,
    selfReportedStress: 5
  });

  const [activityData, setActivityData] = useState({
    activeMinutes: 60,
    steps: 8000,
    intensity: 6,
    type: "cardio" as "strength" | "cardio" | "hiit"
  });

  const [nutritionData, setNutritionData] = useState({
    mealQuality: 7
  });

  const [socialData, setSocialData] = useState({
    interactionQuality: 6,
    socialTimeMinutes: 120
  });

  const [cognitiveData, setCognitiveData] = useState({
    meditationMinutes: 20,
    learningMinutes: 45
  });

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
          description: error.errors[0].message,
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const handleManualSubmit = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const mockUserId = "123e4567-e89b-12d3-a456-426614174000";
      
      const response = await supabase.functions.invoke('score-calculate', {
        body: {
          user_id: mockUserId,
          date: new Date().toISOString().split('T')[0],
          sleep_data: sleepData,
          stress_data: stressData,
          activity_data: activityData,
          nutrition_data: nutritionData,
          social_data: socialData,
          cognitive_data: cognitiveData,
          self_reported: {
            stress_level: stressData.selfReportedStress
          }
        }
      });

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "LIS Score Calculated",
        description: `Your Longevity Impact Score: ${response.data.longevity_impact_score}`,
        variant: "default"
      });

      setOpen(false);
      onScoreCalculated();
    } catch (error) {
      console.error('Error calculating LIS:', error);
      toast({
        title: "Error",
        description: "Failed to calculate LIS score. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWearableSync = async () => {
    setLoading(true);
    try {
      // Simulate wearable data sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Wearable Data Synced",
        description: "Successfully synced data from your connected devices.",
        variant: "default"
      });

      setOpen(false);
      onScoreCalculated();
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to sync wearable data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        onClick={() => {
          console.log("Card clicked - opening modal");
          setOpen(true);
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
              Input your daily metrics to calculate your personalized LIS score
            </DialogDescription>
          </DialogHeader>

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
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Moon className="h-4 w-4 text-blue-500" />
                      Sleep Quality
                      <Badge variant="secondary">25%</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Quality sleep is crucial for cellular repair, memory consolidation, and hormone regulation. Optimal sleep duration and REM percentage directly impact longevity.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                      <Label htmlFor="remSleep">REM Sleep (%)</Label>
                      <Input
                        id="remSleep"
                        type="number"
                        min="0"
                        max="100"
                        value={sleepData.remPercentage}
                        onChange={(e) => setSleepData({...sleepData, remPercentage: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deepSleep">Deep Sleep (%)</Label>
                      <Input
                        id="deepSleep"
                        type="number"
                        min="0"
                        max="100"
                        value={sleepData.deepSleepPercentage}
                        onChange={(e) => setSleepData({...sleepData, deepSleepPercentage: parseInt(e.target.value)})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Stress Management */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4 text-red-500" />
                      Stress Management
                      <Badge variant="secondary">20%</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Chronic stress accelerates aging through inflammation and cellular damage. HRV measures autonomic nervous system balance and stress resilience.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="hrv">Heart Rate Variability</Label>
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
                      <Label htmlFor="stressLevel">Stress Level (1-10)</Label>
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
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-green-500" />
                      Physical Activity
                      <Badge variant="secondary">15%</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Regular movement improves cardiovascular health, maintains muscle mass, and enhances mitochondrial function—key factors in healthy aging.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                      <Label htmlFor="steps">Steps</Label>
                      <Input
                        id="steps"
                        type="number"
                        min="0"
                        max="100000"
                        value={activityData.steps}
                        onChange={(e) => setActivityData({...activityData, steps: parseInt(e.target.value)})}
                      />
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
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Utensils className="h-4 w-4 text-orange-500" />
                      Nutrition
                      <Badge variant="secondary">15%</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Nutrient-dense whole foods provide antioxidants, reduce inflammation, and support cellular repair mechanisms critical for longevity.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
                    </div>
                  </CardContent>
                </Card>

                {/* Social Connections */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-purple-500" />
                      Social Connections
                      <Badge variant="secondary">15%</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Strong social bonds reduce stress hormones, boost immune function, and provide emotional support—significantly impacting lifespan.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Brain className="h-4 w-4 text-pink-500" />
                      Cognitive Engagement
                      <Badge variant="secondary">10%</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Mental stimulation and mindfulness practices promote neuroplasticity, reduce cognitive decline, and support brain health throughout aging.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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

              <Separator />

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleManualSubmit} disabled={loading}>
                  {loading ? "Calculating..." : "Calculate LIS Score"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="wearable" className="space-y-6">
              <div className="text-center py-8">
                <Smartphone className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Sync Wearable Data</h3>
                <p className="text-gray-600 mb-6">
                  Automatically pull data from your connected fitness trackers and health devices
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card className="p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Moon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-medium">Sleep Tracking</h4>
                      <p className="text-sm text-gray-500">Hours, REM, Deep Sleep</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Heart className="h-6 w-6 text-red-600" />
                      </div>
                      <h4 className="font-medium">Heart Metrics</h4>
                      <p className="text-sm text-gray-500">HRV, Resting HR</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Activity className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-medium">Activity Data</h4>
                      <p className="text-sm text-gray-500">Steps, Active Minutes</p>
                    </div>
                  </Card>
                </div>

                <Button onClick={handleWearableSync} disabled={loading} size="lg">
                  {loading ? "Syncing..." : "Sync Wearable Data"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LISInputForm;