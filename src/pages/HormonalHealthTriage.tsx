import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { toast } from "@/hooks/use-toast";
import { Heart, AlertCircle, Loader2 } from "lucide-react";

const HORMONAL_CONCERNS = [
  {
    id: "irregular-cycles",
    label: "Irregular menstrual cycles",
    keywords: ["cycle", "period", "menstrual"],
  },
  {
    id: "heavy-periods",
    label: "Heavy or painful periods",
    keywords: ["heavy", "painful", "cramps"],
  },
  {
    id: "hot-flashes",
    label: "Hot flashes or night sweats",
    keywords: ["hot flash", "night sweats", "menopause"],
  },
  {
    id: "mood-changes",
    label: "Mood swings or anxiety",
    keywords: ["mood", "anxiety", "depression"],
  },
  {
    id: "sleep-issues",
    label: "Sleep disturbances",
    keywords: ["sleep", "insomnia", "tired"],
  },
  {
    id: "low-libido",
    label: "Low libido or sexual concerns",
    keywords: ["libido", "sex", "desire"],
  },
  {
    id: "fertility",
    label: "Fertility concerns or planning pregnancy",
    keywords: ["fertility", "pregnant", "conceive"],
  },
  {
    id: "weight-changes",
    label: "Unexplained weight changes",
    keywords: ["weight", "metabolism"],
  },
  {
    id: "energy-fatigue",
    label: "Chronic fatigue or low energy",
    keywords: ["fatigue", "energy", "tired"],
  },
  {
    id: "skin-hair",
    label: "Skin or hair changes",
    keywords: ["skin", "hair", "acne"],
  },
];

const HormonalHealthTriage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, userAge, loading } = useHealthProfile();
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConcernToggle = (concernId: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concernId)
        ? prev.filter((id) => id !== concernId)
        : [...prev, concernId]
    );
  };

  const handleContinue = async () => {
    if (selectedConcerns.length === 0) {
      toast({
        title: "Please select at least one concern",
        description: "This helps us provide the most relevant assessment",
        variant: "destructive",
      });
      return;
    }

    // Store selected concerns for later use
    localStorage.setItem('hormonal_concerns', JSON.stringify(selectedConcerns));

    // Check for baseline data (either in profile or localStorage)
    const hasProfileData = profile && profile.date_of_birth;
    const hasGuestData = localStorage.getItem('guest_health_baseline');

    if (!hasProfileData && !hasGuestData) {
      toast({
        title: "We need a few details first",
        description: "Let's collect some basic information to personalize your assessment.",
      });
      navigate("/hormonal-health/baseline");
      return;
    }

    setIsProcessing(true);

    try {
      // All users go to the same 7-question assessment
      const targetRoute = "/onboarding/hormone-compass-menopause";

      navigate(targetRoute);
    } catch (error) {
      console.error("Error processing triage:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Hormonal Health Assessment
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Help us understand your concerns so we can provide the most relevant
            assessment and recommendations
          </p>
          {userAge && (
            <p className="text-sm text-muted-foreground mt-2">
              Based on your profile (Age: {userAge}), we'll personalize your experience
            </p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What are you experiencing?</CardTitle>
            <CardDescription>
              Select all concerns that apply to you (choose at least one)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {HORMONAL_CONCERNS.map((concern) => (
                <div
                  key={concern.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={concern.id}
                    checked={selectedConcerns.includes(concern.id)}
                    onCheckedChange={() => handleConcernToggle(concern.id)}
                  />
                  <Label
                    htmlFor={concern.id}
                    className="flex-1 cursor-pointer text-base"
                  >
                    {concern.label}
                  </Label>
                </div>
              ))}
            </div>

            {selectedConcerns.length > 0 && (
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    You've selected {selectedConcerns.length}{" "}
                    concern{selectedConcerns.length !== 1 ? "s" : ""}. We'll
                    guide you to the most appropriate assessment.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Back to Home
              </Button>
              <Button
                onClick={handleContinue}
                disabled={selectedConcerns.length === 0 || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue to Assessment"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HormonalHealthTriage;
