import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TRIAGE_THEMES, TRIAGE_OPTION_OTHER } from "@/data/symptomTriageMapping";
import { Clock } from "lucide-react";
import brainPillar from "@/assets/brain-pillar.png";
import bodyPillar from "@/assets/body-pillar.png";
import beautyPillar from "@/assets/beauty-pillar.png";
import balancePillar from "@/assets/balance-pillar.png";

interface SymptomTriageEntryProps {
  onThemeSelect: (themeId: string) => void;
  onBrowseAll: () => void;
}

const SymptomTriageEntry = ({ onThemeSelect, onBrowseAll }: SymptomTriageEntryProps) => {
  const themes = Object.values(TRIAGE_THEMES);
  
  const pillarImages: Record<string, string> = {
    brain: brainPillar,
    body: bodyPillar,
    balance: balancePillar,
    beauty: beautyPillar
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text">
          Choose Your Health Pillar
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the area you'd like to focus on. Each pillar contains targeted assessments and science-backed protocols.
        </p>
      </div>

      {/* Pillar Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {themes.map((theme) => {
          const Icon = theme.icon;
          return (
            <Card
              key={theme.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary overflow-hidden"
              onClick={() => onThemeSelect(theme.id)}
            >
              {/* Pillar Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
                <img 
                  src={pillarImages[theme.pillar]} 
                  alt={`${theme.title} pillar`}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{theme.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {theme.estimatedTime}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  {theme.subtitle}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {theme.description}
                </p>
                <p className="text-sm font-medium text-primary pt-2">
                  {theme.cta} →
                </p>
              </CardContent>
            </Card>
          );
        })}

        {/* Other/Browse All Option */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-dashed hover:border-primary"
          onClick={onBrowseAll}
        >
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-muted">
                <TRIAGE_OPTION_OTHER.icon className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-xl">{TRIAGE_OPTION_OTHER.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {TRIAGE_OPTION_OTHER.subtitle}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SymptomTriageEntry;
