import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TRIAGE_THEMES } from "@/data/symptomTriageMapping";
import { Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);

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

  const toggleAssessment = (symptomId: string) => {
    setSelectedAssessments(prev => 
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleStartAssessments = () => {
    if (selectedAssessments.length === 0) return;
    
    // Navigate to first selected assessment
    const firstSymptomId = selectedAssessments[0];
    
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
        {filteredSymptoms.map((symptom) => {
          const Icon = symptom.icon;
          const completed = isCompleted(symptom.id);
          const selected = selectedAssessments.includes(symptom.id);

          return (
            <Card
              key={symptom.id}
              className={`cursor-pointer transition-all duration-200 ${
                selected ? "border-primary shadow-md" : "hover:border-primary/50"
              }`}
              onClick={() => toggleAssessment(symptom.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => toggleAssessment(symptom.id)}
                    className="mt-1"
                  />
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
                      <span>Severity tracking: {symptom.severity}</span>
                      <span>Frequency: {symptom.frequency}</span>
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
          onClick={handleStartAssessments}
          disabled={selectedAssessments.length === 0}
          size="lg"
          className="w-full sm:w-auto"
        >
          Start {selectedAssessments.length > 0 ? `${selectedAssessments.length} ` : ''}Assessment{selectedAssessments.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
};

export default SymptomAssessmentSelection;
