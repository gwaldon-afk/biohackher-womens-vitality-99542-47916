import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Activity, Brain, Heart, Sparkles, Mail } from "lucide-react";
import { getScoreCategory, calculatePillarScores, getEatingPersonalityInsights } from "@/utils/longevityNutritionScoring";
import { NutritionPillarAnalysisCard } from "@/components/NutritionPillarAnalysisCard";
import { Accordion } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
  
  const pillarScores = calculatePillarScores({
    protein_score: assessment.protein_score,
    fiber_score: assessment.fiber_score,
    plant_diversity_score: assessment.plant_diversity_score,
    gut_symptom_score: assessment.gut_symptom_score,
    inflammation_score: assessment.inflammation_score,
    hydration_score: assessment.hydration_score,
    craving_pattern: assessment.craving_pattern,
  });

  const eatingPersonality = assessment.eating_personality 
    ? getEatingPersonalityInsights(assessment.eating_personality)
    : null;

  // Find lowest-scoring pillar to auto-expand
  const lowestPillar = Object.entries(pillarScores).reduce((lowest, [name, data]) => 
    data.percentage < lowest.percentage ? { name, ...data } : lowest
  , { name: '', percentage: 100 });

  const pillarIcons: Record<string, any> = {
    BODY: Activity,
    BRAIN: Brain,
    BALANCE: Heart,
    BEAUTY: Sparkles,
  };

  const pillarColors: Record<string, string> = {
    BODY: '#f97316',
    BRAIN: '#a855f7',
    BALANCE: '#ef4444',
    BEAUTY: '#ec4899',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Top Return Button */}
        <div className="flex justify-start">
          <Button variant="outline" onClick={() => navigate(user ? "/today" : "/")}>
            {user ? "← Return to Today" : "← Back to Home"}
          </Button>
        </div>

        {/* Overall Score Card */}
        <Card className="p-8 text-center border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
          <h1 className="text-4xl font-bold mb-4">Your Longevity Nutrition Score</h1>
          <div className="text-6xl font-bold text-primary mb-2">{scoreResult.score}</div>
          <div className="text-2xl font-semibold mb-4">{scoreResult.category}</div>
          <p className="text-muted-foreground max-w-2xl mx-auto">{scoreResult.description}</p>
        </Card>

        {/* Pillar Breakdown Visual */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-background border-primary/20">
          <h2 className="text-xl font-bold mb-6">Your Nutrition Pillars Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(pillarScores).map(([pillarName, data]) => {
              const Icon = pillarIcons[pillarName];
              const color = pillarColors[pillarName];
              return (
                <div key={pillarName} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" style={{ color }} />
                      <span className="font-medium">{pillarName}</span>
                    </div>
                    <Badge variant={data.status === 'excellent' ? 'default' : data.status === 'good' ? 'secondary' : 'outline'}>
                      {data.score}/{data.maxScore}
                    </Badge>
                  </div>
                  <Progress value={data.percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Detailed Pillar Analysis */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-2 border-primary/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-2">Detailed Pillar Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Expand each pillar to see personalized recommendations based on your assessment.
            </p>
          </div>
          
          <Accordion type="multiple" className="space-y-4">
            {Object.entries(pillarScores).map(([pillarName, data]) => (
              <NutritionPillarAnalysisCard
                key={pillarName}
                pillarName={pillarName}
                score={data.score}
                maxScore={data.maxScore}
                percentage={data.percentage}
                status={data.status}
                icon={pillarIcons[pillarName]}
                color={pillarColors[pillarName]}
                assessmentData={assessment}
                defaultOpen={pillarName === lowestPillar.name}
              />
            ))}
          </Accordion>
        </div>

        {/* Eating Personality Insights */}
        {eatingPersonality && (
          <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-secondary/10 to-background">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Eating Personality: {eatingPersonality.title}
            </h2>
            <p className="text-muted-foreground mb-4">{eatingPersonality.description}</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-orange-600">Common Challenges</h3>
                <ul className="space-y-1">
                  {eatingPersonality.challenges.map((challenge, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-orange-300">
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-green-600">Personalized Recommendations</h3>
                <ul className="space-y-1">
                  {eatingPersonality.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-green-300">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Guest Registration CTA */}
        {!user && (
          <Card className="p-8 border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/5 to-background shadow-lg">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Create Free Account & Unlock Your Protocol</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get your personalized nutrition protocol, track daily nutrition scores, and receive monthly reassessments to track your progress.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto my-6">
                <div className="text-center">
                  <div className="font-semibold">✓ Personalized Protocol</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">✓ Daily Nutrition Tracking</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">✓ Monthly Reassessments</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">✓ AI Health Assistant</div>
                </div>
              </div>
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
                Create Free Account & Unlock Protocol
              </Button>
              <p className="text-xs text-muted-foreground">Includes FREE 3-day trial • No credit card required</p>
            </div>
          </Card>
        )}

        {/* Bottom Return Button */}
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate(user ? "/today" : "/")} size="lg">
            {user ? "Return to Today" : "Back to Home"}
          </Button>
        </div>
      </div>
    </div>
  );
}
