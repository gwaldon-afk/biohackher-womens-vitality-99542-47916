import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Brain, 
  Dumbbell, 
  Heart, 
  Sparkles, 
  Flame,
  Moon,
  Zap,
  Activity,
  Focus,
  Smile
} from "lucide-react";

interface RecommendedAssessment {
  id: string;
  name: string;
  description: string;
  pillar: string;
  reason: string;
  icon: any;
}

interface AssessmentCategory {
  name: string;
  icon: any;
  assessments: {
    id: string;
    name: string;
    description: string;
  }[];
}

// Category groupings for "Browse by Concern" - defined outside component for stable reference
const ASSESSMENT_CATEGORIES: AssessmentCategory[] = [
  {
    name: "Energy & Fatigue",
    icon: Zap,
    assessments: [
      { id: "energy-levels", name: "Energy Levels", description: "Assess daily energy patterns" },
      { id: "energy-fluctuations", name: "Energy Fluctuations", description: "Track energy variability" },
      { id: "energy-optimization", name: "Energy Optimization", description: "Peak performance energy" },
      { id: "sleep-disruption", name: "Sleep Disruption", description: "Sleep quality assessment" }
    ]
  },
  {
    name: "Cognitive & Focus",
    icon: Brain,
    assessments: [
      { id: "cognitive-function", name: "Cognitive Function", description: "Memory and processing speed" },
      { id: "brain-fog", name: "Brain Fog", description: "Mental clarity assessment" },
      { id: "focus-optimization", name: "Focus Optimization", description: "Attention and concentration" },
      { id: "cognitive-peak", name: "Cognitive Peak", description: "Peak mental performance" },
      { id: "memory-changes", name: "Memory Changes", description: "Memory retention tracking" }
    ]
  },
  {
    name: "Physical Performance",
    icon: Dumbbell,
    assessments: [
      { id: "physical-performance", name: "Physical Performance", description: "Strength and endurance" },
      { id: "muscle-maintenance", name: "Muscle Maintenance", description: "Muscle health tracking" },
      { id: "body-composition", name: "Body Composition", description: "Body composition analysis" },
      { id: "pain-assessment", name: "Pain Assessment", description: "Physical discomfort tracking" }
    ]
  },
  {
    name: "Emotional Wellbeing",
    icon: Heart,
    assessments: [
      { id: "mood-tracking", name: "Mood Tracking", description: "Daily mood patterns" },
      { id: "mood-changes", name: "Mood Changes", description: "Emotional stability assessment" },
      { id: "anxiety-assessment", name: "Anxiety Assessment", description: "Anxiety levels tracking" },
      { id: "stress-assessment", name: "Stress Assessment", description: "Stress impact evaluation" },
      { id: "mental-resilience", name: "Mental Resilience", description: "Emotional strength assessment" }
    ]
  },
  {
    name: "Hormone Health",
    icon: Sparkles,
    assessments: [
      { id: "hormone-symptoms", name: "Hormone Symptoms", description: "Hormonal imbalance tracking" },
      { id: "hormone-optimization", name: "Hormone Optimization", description: "Hormone health optimization" },
      { id: "hot-flushes", name: "Hot Flushes", description: "Hot flush frequency tracking" },
      { id: "weight-changes", name: "Weight Changes", description: "Weight pattern analysis" }
    ]
  },
  {
    name: "Appearance & Vitality",
    icon: Sparkles,
    assessments: [
      { id: "skin-health", name: "Skin Health", description: "Skin condition assessment" },
      { id: "skin-changes", name: "Skin Changes", description: "Skin aging tracking" },
      { id: "skin-performance", name: "Skin Performance", description: "Skin vitality optimization" },
      { id: "hair-vitality", name: "Hair Vitality", description: "Hair health assessment" },
      { id: "aging-concerns", name: "Aging Concerns", description: "Visible aging tracking" },
      { id: "collagen-loss", name: "Collagen Loss", description: "Collagen health assessment" },
      { id: "recovery-appearance", name: "Recovery & Appearance", description: "Recovery impact on appearance" }
    ]
  },
  {
    name: "Sleep & Recovery",
    icon: Moon,
    assessments: [
      { id: "sleep", name: "Sleep Quality", description: "Sleep pattern analysis" },
      { id: "sleep-disruption", name: "Sleep Disruption", description: "Sleep disturbance tracking" },
      { id: "deep-sleep", name: "Deep Sleep", description: "Deep sleep optimization" },
      { id: "recovery-optimization", name: "Recovery Optimization", description: "Physical recovery tracking" }
    ]
  },
  {
    name: "Metabolic Health",
    icon: Flame,
    assessments: [
      { id: "weight-changes", name: "Weight Changes", description: "Weight pattern analysis" },
      { id: "metabolic-assessment", name: "Metabolic Assessment", description: "Metabolic health tracking" },
      { id: "blood-sugar", name: "Blood Sugar", description: "Glucose stability assessment" }
    ]
  }
];

export const SmartAssessmentTriage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState<RecommendedAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch latest LIS assessment
        const { data: lisData } = await supabase
          .from("daily_scores")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_baseline", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Fetch latest Hormone Compass
        const { data: hormoneData } = await supabase
          .from("hormone_compass_stages")
          .select("hormone_indicators")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const recommendations: RecommendedAssessment[] = [];

        // Analyze LIS scores
        if (lisData) {
          if ((lisData.sleep_score || 0) < 70) {
            recommendations.push({
              id: "sleep",
              name: "Sleep Quality Assessment",
              description: "Your LIS sleep score suggests room for improvement",
              pillar: "body",
              reason: "LIS sleep score below optimal",
              icon: Moon
            });
          }
          if ((lisData.cognitive_engagement_score || 0) < 70) {
            recommendations.push({
              id: "cognitive-function",
              name: "Cognitive Function Assessment",
              description: "Your cognitive engagement could benefit from deeper analysis",
              pillar: "brain",
              reason: "LIS cognitive score below optimal",
              icon: Brain
            });
          }
          if ((lisData.stress_score || 0) < 70) {
            recommendations.push({
              id: "stress-assessment",
              name: "Stress Assessment",
              description: "Your stress levels indicate a need for stress management support",
              pillar: "balance",
              reason: "LIS stress score below optimal",
              icon: Heart
            });
          }
          if ((lisData.physical_activity_score || 0) < 70) {
            recommendations.push({
              id: "physical-performance",
              name: "Physical Performance Assessment",
              description: "Your activity levels suggest potential for optimization",
              pillar: "body",
              reason: "LIS activity score below optimal",
              icon: Dumbbell
            });
          }
        }

        // Analyze Hormone Compass scores
        if (hormoneData?.hormone_indicators) {
          const indicators = hormoneData.hormone_indicators as Record<string, any>;
          const scores = indicators?.domain_scores as Record<string, number> | undefined;
          
          // Only proceed if scores exists
          if (scores) {
            if ((scores.mood || 0) < 3) {
              recommendations.push({
                id: "mood-tracking",
                name: "Mood Tracking Assessment",
                description: "Your hormone compass mood score suggests emotional support needed",
                pillar: "balance",
                reason: "Hormone Compass mood score low",
                icon: Smile
              });
            }
            if ((scores.energy || 0) < 3) {
              recommendations.push({
                id: "energy-levels",
                name: "Energy Levels Assessment",
                description: "Your hormone compass energy score indicates fatigue patterns",
                pillar: "body",
                reason: "Hormone Compass energy score low",
                icon: Zap
              });
            }
            if ((scores.cognitive || 0) < 3) {
              recommendations.push({
                id: "brain-fog",
                name: "Brain Fog Assessment",
                description: "Your cognitive symptoms warrant deeper investigation",
                pillar: "brain",
                reason: "Hormone Compass cognitive score low",
                icon: Focus
              });
            }
          }
        }

        // Fallback recommendations if no data
        if (recommendations.length === 0) {
          recommendations.push(
            {
              id: "energy-levels",
              name: "Energy Levels Assessment",
              description: "Start with understanding your daily energy patterns",
              pillar: "body",
              reason: "Foundation assessment",
              icon: Zap
            },
            {
              id: "sleep",
              name: "Sleep Quality Assessment",
              description: "Sleep is the foundation of health optimization",
              pillar: "body",
              reason: "Foundation assessment",
              icon: Moon
            },
            {
              id: "stress-assessment",
              name: "Stress Assessment",
              description: "Understand your stress patterns for better balance",
              pillar: "balance",
              reason: "Foundation assessment",
              icon: Heart
            }
          );
        }

        setRecommended(recommendations.slice(0, 4));
      } catch (error) {
        console.error("Error loading recommendations:", error);
        // Set fallback recommendations even on error
        setRecommended([
          {
            id: "energy-levels",
            name: "Energy Levels Assessment",
            description: "Start with understanding your daily energy patterns",
            pillar: "body",
            reason: "Foundation assessment",
            icon: Zap
          },
          {
            id: "sleep",
            name: "Sleep Quality Assessment",
            description: "Sleep is the foundation of health optimization",
            pillar: "body",
            reason: "Foundation assessment",
            icon: Moon
          },
          {
            id: "stress-assessment",
            name: "Stress Assessment",
            description: "Understand your stress patterns for better balance",
            pillar: "balance",
            reason: "Foundation assessment",
            icon: Heart
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [user]);

  const getPillarColor = (pillar: string) => {
    const colors: Record<string, string> = {
      brain: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
      body: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
      balance: "text-green-600 bg-green-50 dark:bg-green-950/30",
      beauty: "text-pink-600 bg-pink-50 dark:bg-pink-950/30"
    };
    return colors[pillar] || "text-gray-600 bg-gray-50";
  };

  return (
    <div className="space-y-8">
      {/* Recommended For You */}
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Recommended For You</h3>
          <p className="text-sm text-muted-foreground">
            Based on your LIS and Hormone Compass results, these assessments can provide deeper insights into your priority areas
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </CardHeader>
                </Card>
              ))}
            </>
          ) : (
            recommended.map(assessment => {
              const Icon = assessment.icon;
              return (
                <Card 
                  key={assessment.id}
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/symptom-assessment/${assessment.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getPillarColor(assessment.pillar)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{assessment.name}</CardTitle>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {assessment.reason}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      {assessment.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      size="sm" 
                      className="w-full group-hover:bg-primary/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/symptom-assessment/${assessment.id}`);
                      }}
                    >
                      Start Assessment
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Browse by Concern */}
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Browse by Concern</h3>
          <p className="text-sm text-muted-foreground">
            Explore all 31 micro-assessments organized by health focus area
          </p>
        </div>

        <div className="grid gap-4">
          {ASSESSMENT_CATEGORIES.map(category => {
            const Icon = category.icon;
            return (
              <Card key={category.name}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {category.assessments.map(assessment => (
                      <Button
                        key={assessment.id}
                        variant="outline"
                        className="justify-start h-auto py-3 px-4 text-left"
                        onClick={() => navigate(`/symptom-assessment/${assessment.id}`)}
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-medium text-sm">{assessment.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {assessment.description}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
