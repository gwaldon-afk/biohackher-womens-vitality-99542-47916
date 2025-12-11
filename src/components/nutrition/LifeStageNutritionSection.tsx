import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Cake, ChevronDown, Heart, Brain, Sparkles, Target, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getLifeStageByAge, getDecadeLabel, lifeStageNutritionData, LifeStageNutrition } from '@/data/lifeStageNutritionData';

const pillarIcons: Record<string, React.ReactNode> = {
  BODY: <Target className="h-4 w-4" />,
  BRAIN: <Brain className="h-4 w-4" />,
  BALANCE: <Heart className="h-4 w-4" />,
  BEAUTY: <Sparkles className="h-4 w-4" />,
};

const pillarColors: Record<string, string> = {
  BODY: 'bg-blue-100 text-blue-700 border-blue-200',
  BRAIN: 'bg-purple-100 text-purple-700 border-purple-200',
  BALANCE: 'bg-green-100 text-green-700 border-green-200',
  BEAUTY: 'bg-pink-100 text-pink-700 border-pink-200',
};

export function LifeStageNutritionSection() {
  const { user } = useAuth();
  const [userAge, setUserAge] = useState<number | null>(null);
  const [showOtherStages, setShowOtherStages] = useState(false);

  useEffect(() => {
    const fetchUserAge = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('user_health_profile')
        .select('date_of_birth')
        .eq('user_id', user.id)
        .single();
      
      if (data?.date_of_birth) {
        const dob = new Date(data.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        setUserAge(age);
      }
    };
    
    fetchUserAge();
  }, [user?.id]);

  const currentLifeStage = userAge ? getLifeStageByAge(userAge) : null;
  const currentDecade = userAge ? getDecadeLabel(userAge) : null;

  // Show nothing if not authenticated
  if (!user) {
    return null;
  }

  // Show prompt to complete profile if no DOB
  if (!userAge) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/30">
        <CardContent className="py-8 text-center">
          <Cake className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            Complete your health profile to see personalized life stage nutrition guidance.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!currentLifeStage) {
    return null;
  }

  const otherStages = lifeStageNutritionData.filter(
    stage => stage.decade !== currentDecade
  );

  return (
    <div className="space-y-6">
      {/* Current Life Stage Card */}
      <Card className="border-2 border-primary/30 shadow-lg bg-gradient-to-br from-[#F8C5AC]/20 via-[#E7DFD7]/10 to-background">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Cake className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                In Your {currentDecade}: {currentLifeStage.title}
              </CardTitle>
              <CardDescription>{currentLifeStage.subtitle}</CardDescription>
            </div>
            <Badge variant="default" className="bg-[#F8C5AC] text-foreground">
              Age {userAge}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Focus Areas */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Key Focus Areas
            </h4>
            <ul className="space-y-2">
              {currentLifeStage.focusAreas.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  {area}
                </li>
              ))}
            </ul>
          </div>

          {/* Priority Nutrients */}
          <div>
            <h4 className="font-semibold mb-3">Priority Nutrients for Your {currentDecade}</h4>
            <div className="grid gap-3">
              {currentLifeStage.priorityNutrients.map((nutrient, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-background/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{nutrient.name}</span>
                    <Badge className={`${pillarColors[nutrient.pillar]} text-xs`}>
                      {pillarIcons[nutrient.pillar]} {nutrient.pillar}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{nutrient.reason}</p>
                  <div className="flex flex-wrap gap-1">
                    {nutrient.sources.slice(0, 4).map((source, sIdx) => (
                      <Badge key={sIdx} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Wins */}
          <div className="p-4 rounded-lg bg-[#F8C5AC]/20 border border-[#F8C5AC]/30">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Quick Wins for Your {currentDecade}
            </h4>
            <ul className="space-y-2">
              {currentLifeStage.quickWins.map((win, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">✓</span>
                  {win}
                </li>
              ))}
            </ul>
          </div>

          {/* Hormone Considerations */}
          {currentLifeStage.hormoneConsiderations.length > 0 && (
            <div className="p-4 rounded-lg border border-muted bg-muted/30">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Hormone Health Note
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {currentLifeStage.hormoneConsiderations.map((note, idx) => (
                  <li key={idx}>• {note}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Explore Other Life Stages */}
      <Collapsible open={showOtherStages} onOpenChange={setShowOtherStages}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span>Explore Other Life Stages (great for sharing with daughters, friends)</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showOtherStages ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          {otherStages.map((stage) => (
            <LifeStageCompactCard key={stage.decade} stage={stage} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function LifeStageCompactCard({ stage }: { stage: LifeStageNutrition }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="border">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{stage.decade}: {stage.title}</CardTitle>
                <CardDescription>{stage.subtitle}</CardDescription>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <div>
              <h5 className="font-medium text-sm mb-2">Key Focus Areas</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                {stage.focusAreas.map((area, idx) => (
                  <li key={idx}>• {area}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-sm mb-2">Priority Nutrients</h5>
              <div className="flex flex-wrap gap-2">
                {stage.priorityNutrients.map((nutrient, idx) => (
                  <Badge key={idx} variant="secondary">{nutrient.name}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-medium text-sm mb-2">Quick Wins</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                {stage.quickWins.slice(0, 3).map((win, idx) => (
                  <li key={idx}>✓ {win}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
