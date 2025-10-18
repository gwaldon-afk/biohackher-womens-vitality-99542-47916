import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TRIAGE_THEMES } from "@/data/symptomTriageMapping";
import { Clock, CheckCircle2, ArrowLeft, PlayCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAssessmentFlowStore } from "@/stores/assessmentFlowStore";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [includeCompleted, setIncludeCompleted] = useState(false);

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

  // Count new vs completed assessments
  const completedCount = filteredSymptoms.slice(0, 5).filter(s => isCompleted(s.id)).length;
  const newCount = 5 - completedCount;
  const hasCompleted = completedCount > 0;
  const hasNew = newCount > 0;

  const handleStartAssessment = (symptomId: string) => {
    // Initialize a single-assessment flow
    startFlow([symptomId], themeId, 'single');
    
    // Special routing for brain assessments
    if (symptomId === "cognitive-performance" || symptomId === "menopause-brain-health") {
      const context = symptomId === "cognitive-performance" ? "performance" : "menopause";
      navigate(`/brain-assessment?context=${context}&pillar=brain`);
    } else {
      navigate(`/assessment/${symptomId}`);
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
          {newCount > 0 && completedCount > 0 && `${newCount} New • ${completedCount} Completed`}
          {newCount > 0 && completedCount === 0 && `${newCount} Assessments`}
          {newCount === 0 && completedCount > 0 && `${completedCount} Completed`}
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
              className="group hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">{symptom.name}</h3>
                        {completed && (
                          <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
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
                  
                  {/* Individual Start/Update Button */}
                  <Button
                    onClick={() => handleStartAssessment(symptom.id)}
                    variant={completed ? "outline" : "default"}
                    size="lg"
                    className="flex-shrink-0"
                  >
                    {completed ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Update
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Section */}
      <div className="flex justify-center mt-8">
        <Button
          variant="outline"
          onClick={onBrowseAll}
          size="lg"
        >
          View all symptoms instead
        </Button>
      </div>
    </div>
  );
};

export default SymptomAssessmentSelection;
