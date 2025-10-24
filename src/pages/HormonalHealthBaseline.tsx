import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const HormonalHealthBaseline = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createOrUpdateProfile } = useHealthProfile();
  const { toast } = useToast();

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const bmi = useMemo(() => {
    const height = parseFloat(heightCm);
    const weight = parseFloat(weightKg);
    if (!height || !weight || height <= 0 || weight <= 0) return null;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }, [heightCm, weightKg]);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600" };
    if (bmi < 25) return { label: "Normal weight", color: "text-green-600" };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-600" };
    return { label: "Obese", color: "text-orange-600" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateOfBirth || !heightCm || !weightKg) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (user) {
        // Save to database for authenticated users
        await createOrUpdateProfile({
          date_of_birth: dateOfBirth,
          height_cm: parseFloat(heightCm),
          weight_kg: parseFloat(weightKg),
        });

        toast({
          title: "Profile updated",
          description: "Your baseline data has been saved",
        });
      } else {
        // Store in localStorage for guest users
        localStorage.setItem('guest_health_baseline', JSON.stringify({
          date_of_birth: dateOfBirth,
          height_cm: parseFloat(heightCm),
          weight_kg: parseFloat(weightKg),
          bmi: bmi
        }));

        toast({
          title: "Information saved",
          description: "Your baseline data has been saved locally",
        });
      }

      navigate("/hormonal-health/triage");
    } catch (error) {
      console.error("Error saving baseline:", error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Let's Start With Some Basics</h1>
            <p className="text-muted-foreground">
              We need a few details to personalize your hormonal health assessment.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                min="100"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="e.g., 165"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g., 65"
                required
              />
            </div>

            {bmi && (
              <Card className="p-4 bg-muted/50">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground">Your BMI:</span>
                    <span className="text-2xl font-semibold">{bmi.toFixed(1)}</span>
                    <span className={`text-sm font-medium ${getBMICategory(bmi).color}`}>
                      {getBMICategory(bmi).label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    BMI is a general indicator and may not reflect individual health
                  </p>
                </div>
              </Card>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSaving || !dateOfBirth || !heightCm || !weightKg}
            >
              {isSaving ? "Saving..." : "Continue to Assessment"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default HormonalHealthBaseline;
