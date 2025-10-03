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
import { Heart, Scale, Cigarette, Users, Calendar } from "lucide-react";

export const LIS2InitialAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createOrUpdateProfile } = useHealthProfile();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date_of_birth: "",
    height_cm: "",
    weight_kg: "",
    is_current_smoker: false,
    is_former_smoker: false,
    date_quit_smoking: "",
    initial_subjective_age: "",
    social_engagement_baseline: 3,
  });

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async () => {
    try {
      const chronologicalAge = calculateAge(formData.date_of_birth);
      const subjectiveAgeDelta = parseInt(formData.initial_subjective_age) - chronologicalAge;

      await createOrUpdateProfile({
        date_of_birth: formData.date_of_birth,
        height_cm: parseFloat(formData.height_cm),
        weight_kg: parseFloat(formData.weight_kg),
        is_current_smoker: formData.is_current_smoker,
        is_former_smoker: formData.is_former_smoker,
        date_quit_smoking: formData.date_quit_smoking || undefined,
        initial_subjective_age_delta: subjectiveAgeDelta,
        social_engagement_baseline: formData.social_engagement_baseline,
      });

      toast({
        title: "Profile Created!",
        description: "Your LIS 2.0 baseline has been established. Start tracking today!",
      });

      navigate("/dashboard");
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
        <Label htmlFor="dob">Date of Birth</Label>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            id="dob"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
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
        disabled={!formData.date_of_birth || !formData.height_cm || !formData.weight_kg}
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
        </Label>
        <RadioGroup
          value={
            formData.is_current_smoker
              ? "current"
              : formData.is_former_smoker
              ? "former"
              : "never"
          }
          onValueChange={(value) => {
            setFormData({
              ...formData,
              is_current_smoker: value === "current",
              is_former_smoker: value === "former",
            });
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="never" id="never" />
            <Label htmlFor="never">Never smoked</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="former" id="former" />
            <Label htmlFor="former">Former smoker</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="current" id="current" />
            <Label htmlFor="current">Current smoker</Label>
          </div>
        </RadioGroup>

        {formData.is_former_smoker && (
          <div className="space-y-2 ml-6">
            <Label htmlFor="quit-date">Date Quit Smoking</Label>
            <Input
              id="quit-date"
              type="date"
              value={formData.date_quit_smoking}
              onChange={(e) => setFormData({ ...formData, date_quit_smoking: e.target.value })}
            />
          </div>
        )}
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
    const chronologicalAge = formData.date_of_birth ? calculateAge(formData.date_of_birth) : 0;

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
    <div className="container max-w-2xl mx-auto py-8">
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
