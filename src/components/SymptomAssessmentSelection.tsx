import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TRIAGE_THEMES } from "@/data/symptomTriageMapping";
import { Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAssessmentFlowStore } from "@/stores/assessmentFlowStore";

interface Symptom {
  id: string;
  name: string;
  icon: any;
  severity: string;
  frequency: string;
  pillars: string[];
}

interface SymptomAssessmentSelectionProps {
  themeId: string;
  symptoms: Symptom[];
  userSymptoms: any[];
  onBack: () => void;
  onBrowseAll: () => void;
}

const SymptomAssessmentSelection = ({
  themeId,
  symptoms,
  userSymptoms,
  onBack,
  onBrowseAll
}: SymptomAssessmentSelectionProps) => {
  const navigate = useNavigate();
  const startFlow = useAssessmentFlowStore(state => state.startFlow);

  const theme = Object.values(TRIAGE_THEMES).find(t => t.id === themeId);
  if (!theme) return null;

  const ThemeIcon = theme.icon;

  // Filter symptoms based on theme
  const filteredSymptoms = symptoms.filter(symptom => 
    theme.symptomIds.includes(symptom.id)
  );

  const isCompleted = (symptomId: string) => {
    return userSymptoms.some(us => us.symptom_id === symptomId && us.is_active);
  };

  const handleStartFirstAssessment = () => {
    // Get first 5 symptoms from filtered symptoms
    const assessmentIds = filteredSymptoms.slice(0, 5).map(s => s.id);
    
    // Initialize the flow
    startFlow(assessmentIds, themeId, 'suggested');
    
    // Navigate to first assessment
    const firstSymptomId = assessmentIds[0];
    
    // Special routing for brain assessments
    if (firstSymptomId === "cognitive-performance" || firstSymptomId === "menopause-brain-health") {
      const context = firstSymptomId === "cognitive-performance" ? "performance" : "menopause";
      navigate(`/brain-assessment?context=${context}&pillar=brain`);
    } else {
      navigate(`/assessment/${firstSymptomId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to themes
      </Button>

      {/* Theme Header */}
      <div className="text-center mb-8 space-y-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-4 rounded-xl bg-primary/10">
            <ThemeIcon className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold gradient-text">{theme.title}</h2>
        <p className="text-lg text-muted-foreground">{theme.subtitle}</p>
        <Badge variant="outline" className="text-sm">
          5 Suggested Assessments
        </Badge>
      </div>

      {/* Assessment Selection */}
      <div className="space-y-4 mb-8">
        {filteredSymptoms.slice(0, 5).map((symptom, index) => {
          const Icon = symptom.icon;
          const completed = isCompleted(symptom.id);

          return (
            <Card
              key={symptom.id}
              className="transition-all duration-200 hover:border-primary/50"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">{symptom.name}</h3>
                      {completed && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        5-8 min
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBrowseAll}
          className="w-full sm:w-auto"
        >
          View all symptoms instead
        </Button>
        <Button
          onClick={handleStartFirstAssessment}
          size="lg"
          className="w-full sm:w-auto"
        >
          Start with {filteredSymptoms[0]?.name || 'Assessment'}
        </Button>
      </div>
    </div>
  );
};

export default SymptomAssessmentSelection;
