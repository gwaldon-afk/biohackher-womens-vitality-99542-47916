import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Scale, Cigarette, Users, Calendar, Sparkles, ArrowLeft, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";

export const LIS2InitialAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createOrUpdateProfile } = useHealthProfile();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [formData, setFormData] = useState({
    year_of_birth: "",
    height_cm: "",
    weight_kg: "",
    smoking_cessation_category: "never" as "never" | "current" | "quit_within_1y" | "quit_1_5y" | "quit_over_5y",
    initial_subjective_age: "",
    social_engagement_baseline: 3,
  });

  const calculateAge = (yearOfBirth: string) => {
    const today = new Date();
    return today.getFullYear() - parseInt(yearOfBirth);
  };

  const handleExit = () => {
    // Navigate to home for guests, dashboard for authenticated users
    navigate(user ? '/dashboard' : '/');
  };

  const handleSubmit = async () => {
    try {
      const chronologicalAge = calculateAge(formData.year_of_birth);
      const subjectiveAgeDelta = parseInt(formData.initial_subjective_age) - chronologicalAge;

      // Convert year to date format (January 1st of birth year)
      const dateOfBirth = `${formData.year_of_birth}-01-01`;

      await createOrUpdateProfile({
        date_of_birth: dateOfBirth,
        height_cm: parseFloat(formData.height_cm),
        weight_kg: parseFloat(formData.weight_kg),
        smoking_cessation_category: formData.smoking_cessation_category,
        is_current_smoker: formData.smoking_cessation_category === "current",
        is_former_smoker: formData.smoking_cessation_category !== "never" && formData.smoking_cessation_category !== "current",
        initial_subjective_age_delta: subjectiveAgeDelta,
        social_engagement_baseline: formData.social_engagement_baseline,
      });

      // Calculate a simple baseline score for demonstration
      const baselineScore = 70 + (formData.social_engagement_baseline * 2);

      toast({
        title: "Profile Created!",
        description: "Your LIS 2.0 baseline has been established. Start tracking today!",
      });

      navigate(`/lis-results?score=${baselineScore}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="yob">Year of Birth</Label>
        <p className="text-xs text-muted-foreground">
          We use this to calculate your longevity metrics. You can add your full birthday later for celebrations!
        </p>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            id="yob"
            type="number"
            placeholder="1990"
            min="1900"
            max={new Date().getFullYear()}
            value={formData.year_of_birth}
            onChange={(e) => setFormData({ ...formData, year_of_birth: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="170"
            value={formData.height_cm}
            onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="70"
            value={formData.weight_kg}
            onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
            required
          />
        </div>
      </div>

      {formData.height_cm && formData.weight_kg && (
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            <span className="text-sm font-medium">
              BMI: {((parseFloat(formData.weight_kg) / Math.pow(parseFloat(formData.height_cm) / 100, 2))).toFixed(1)}
            </span>
          </div>
        </div>
      )}

      <Button
        onClick={() => setStep(2)}
        disabled={!formData.year_of_birth || !formData.height_cm || !formData.weight_kg}
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Cigarette className="h-4 w-4" />
          Smoking Status
          <ScienceBackedIcon evidenceKey="assessment:smoking-cessation" />
        </Label>
        <p className="text-xs text-muted-foreground">
          Select the option that best describes your smoking history. These timeframes are based on cardiovascular research.
        </p>
        <RadioGroup
          value={formData.smoking_cessation_category}
          onValueChange={(value: any) => {
            setFormData({
              ...formData,
              smoking_cessation_category: value,
            });
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="never" id="never" />
            <Label htmlFor="never" className="font-normal">Never smoked</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="current" id="current" />
            <Label htmlFor="current" className="font-normal">Current smoker</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="quit_within_1y" id="quit_within_1y" />
            <Label htmlFor="quit_within_1y" className="font-normal">Within 1 year</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="quit_1_5y" id="quit_1_5y" />
            <Label htmlFor="quit_1_5y" className="font-normal">1-5 years ago</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="quit_over_5y" id="quit_over_5y" />
            <Label htmlFor="quit_over_5y" className="font-normal">5+ years ago</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button onClick={() => setStep(3)} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const chronologicalAge = formData.year_of_birth ? calculateAge(formData.year_of_birth) : 0;

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            How old do you feel today?
          </Label>
          <Input
            type="number"
            placeholder="Enter your subjective age"
            value={formData.initial_subjective_age}
            onChange={(e) => setFormData({ ...formData, initial_subjective_age: e.target.value })}
            required
          />
          {chronologicalAge > 0 && formData.initial_subjective_age && (
            <p className="text-sm text-muted-foreground">
              Your chronological age: {chronologicalAge} years
              <br />
              Subjective age delta: {parseInt(formData.initial_subjective_age) - chronologicalAge} years
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Social Engagement
          </Label>
          <p className="text-sm text-muted-foreground">
            How often do you feel socially engaged and supported by close family and friends?
          </p>
          <div className="space-y-2">
            <Slider
              value={[formData.social_engagement_baseline]}
              onValueChange={([value]) => setFormData({ ...formData, social_engagement_baseline: value })}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Rarely/Never</span>
              <span className="font-medium">Score: {formData.social_engagement_baseline}</span>
              <span>Daily/Always</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep(2)}>
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.initial_subjective_age}
            className="flex-1"
          >
            Complete Setup
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      {/* Exit Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit LIS 2.0 Setup?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will not be saved. You can complete this setup anytime {user ? 'from your dashboard' : 'from the home page'} to start tracking your longevity score.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Setup</AlertDialogCancel>
            <AlertDialogAction onClick={handleExit}>
              Exit Setup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header with Exit Button */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowExitDialog(true)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel Setup
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowExitDialog(true)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Welcome Banner */}
      <Alert className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <Sparkles className="h-5 w-5 text-primary" />
        <AlertTitle className="text-lg font-semibold">Welcome to LIS 2.0!</AlertTitle>
        <AlertDescription className="mt-2">
          Before you can start tracking your daily longevity score, we need to establish your personal baseline. 
          This one-time setup takes about 2 minutes and includes:
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Basic health metrics (year of birth, height, weight)</li>
            <li>Lifestyle factors (smoking status)</li>
            <li>Initial subjective age assessment</li>
            <li>Social engagement baseline</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>LIS 2.0 Initial Assessment</CardTitle>
          <CardDescription>
            Step {step} of 3: Let's establish your personal baseline for longevity tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </CardContent>
      </Card>
    </div>
  );
};
