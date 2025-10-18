import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TRIAGE_THEMES, TRIAGE_OPTION_OTHER } from "@/data/symptomTriageMapping";
import { Clock } from "lucide-react";

interface SymptomTriageEntryProps {
  onThemeSelect: (themeId: string) => void;
  onBrowseAll: () => void;
}

const SymptomTriageEntry = ({ onThemeSelect, onBrowseAll }: SymptomTriageEntryProps) => {
  const themes = Object.values(TRIAGE_THEMES);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text">
          What's your main health concern right now?
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the area that resonates most with you. We'll guide you to the most relevant assessments.
        </p>
      </div>

      {/* Theme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {themes.map((theme) => {
          const Icon = theme.icon;
          return (
            <Card
              key={theme.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary"
              onClick={() => onThemeSelect(theme.id)}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {theme.pillar}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {theme.estimatedTime}
                  </div>
                </div>
                <CardTitle className="text-xl">{theme.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {theme.subtitle}
                </p>
                <p className="text-xs font-medium text-primary">
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
