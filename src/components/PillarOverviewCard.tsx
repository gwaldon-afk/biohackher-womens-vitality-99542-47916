import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, ArrowLeft, PlayCircle, BookOpen } from "lucide-react";
import { TRIAGE_THEMES, ASSESSMENT_OUTCOMES } from "@/data/symptomTriageMapping";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import brainPillar from "@/assets/brain-pillar.png";
import bodyPillar from "@/assets/body-pillar.png";
import beautyPillar from "@/assets/beauty-pillar.png";
import balancePillar from "@/assets/balance-pillar.png";

interface Symptom {
  id: string;
  name: string;
  icon: any;
  severity: string;
  frequency: string;
  pillars: string[];
}

interface PillarOverviewCardProps {
  pillarId: string;
  symptoms: Symptom[];
  userSymptoms: any[];
  onBack: () => void;
  onStartAssessment: (symptomId: string) => void;
  onBrowseAll: () => void;
}

const PillarOverviewCard = ({
  pillarId,
  symptoms,
  userSymptoms,
  onBack,
  onStartAssessment,
  onBrowseAll
}: PillarOverviewCardProps) => {
  const theme = TRIAGE_THEMES[pillarId];
  if (!theme) return null;

  const ThemeIcon = theme.icon;
  
  const pillarImages: Record<string, string> = {
    brain: brainPillar,
    body: bodyPillar,
    balance: balancePillar,
    beauty: beautyPillar
  };

  // Filter symptoms for this pillar
  const pillarSymptoms = symptoms.filter(symptom => 
    theme.symptomIds.includes(symptom.id)
  );

  const isCompleted = (symptomId: string) => {
    return userSymptoms.some(us => us.symptom_id === symptomId && us.is_active);
  };

  const completedCount = pillarSymptoms.filter(s => isCompleted(s.id)).length;
  const totalCount = pillarSymptoms.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to pillars
      </Button>

      {/* Pillar Hero Section */}
      <Card className="mb-8 overflow-hidden">
        <div className="relative h-64 overflow-hidden">
          <img 
            src={pillarImages[theme.pillar]} 
            alt={`${theme.title} pillar`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-4 rounded-xl bg-primary/20 backdrop-blur-sm">
                <ThemeIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text">{theme.title}</h1>
                <p className="text-lg text-muted-foreground">{theme.subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-8 space-y-6">
          {/* Description */}
          <p className="text-base text-foreground leading-relaxed">
            {theme.description}
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Assessment Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedCount} of {totalCount} completed
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Protocol Highlights */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Key Protocol Categories</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {theme.protocolHighlights.map((highlight, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">{index + 1}</span>
                  </div>
                  <span className="text-sm">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Available Assessments</h2>
          <Badge variant="outline" className="text-sm">
            <Clock className="h-3 w-3 mr-1" />
            {theme.estimatedTime} total
          </Badge>
        </div>

        <div className="space-y-4">
          {pillarSymptoms.map((symptom, index) => {
            const Icon = symptom.icon;
            const completed = isCompleted(symptom.id);
            const outcomeText = ASSESSMENT_OUTCOMES[symptom.id] || "Complete this assessment to get personalized insights and protocols";

            return (
              <Card
                key={symptom.id}
                className="group hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                          <h3 className="font-semibold text-lg">{symptom.name}</h3>
                          
                          {completed && (
                            <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              <CheckCircle2 className="h-3 w-3" />
                              Completed
                            </Badge>
                          )}
                          
                          <Badge variant="outline" className="flex items-center gap-1 text-xs">
                            <ScienceBackedIcon className="h-3 w-3" showTooltip={false} />
                            Evidence-Based
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {outcomeText}
                        </p>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>5-8 min</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => onStartAssessment(symptom.id)}
                      variant={completed ? "outline" : "default"}
                      size="lg"
                      className="flex-shrink-0"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      {completed ? "Retake" : "Start"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={onBrowseAll}
          size="lg"
        >
          Browse all symptoms
        </Button>
      </div>
    </div>
  );
};

export default PillarOverviewCard;
