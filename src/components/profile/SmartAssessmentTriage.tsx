import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Dumbbell, 
  Heart, 
  Sparkles, 
  Flame,
  Moon,
  Zap
} from "lucide-react";

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
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
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
