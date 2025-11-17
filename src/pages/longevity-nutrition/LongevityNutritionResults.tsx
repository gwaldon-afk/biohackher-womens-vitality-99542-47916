import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getScoreCategory } from "@/utils/longevityNutritionScoring";

export default function LongevityNutritionResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      const id = searchParams.get("id");
      if (!id) {
        navigate("/longevity-nutrition");
        return;
      }

      const { data, error } = await supabase
        .from("longevity_nutrition_assessments")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        navigate("/longevity-nutrition");
        return;
      }

      setAssessment(data);
      setLoading(false);
    };

    fetchAssessment();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assessment) return null;

  const scoreResult = getScoreCategory(assessment.longevity_nutrition_score);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <Card className="p-8 text-center border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
          <h1 className="text-4xl font-bold mb-4">Your Longevity Nutrition Score</h1>
          <div className="text-6xl font-bold text-primary mb-2">{scoreResult.score}</div>
          <div className="text-2xl font-semibold mb-4">{scoreResult.category}</div>
          <p className="text-muted-foreground max-w-2xl mx-auto">{scoreResult.description}</p>
        </Card>

        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate(user ? "/today" : "/")} size="lg">
            {user ? "Return to Today" : "Back to Home"}
          </Button>
        </div>
      </div>
    </div>
  );
}
