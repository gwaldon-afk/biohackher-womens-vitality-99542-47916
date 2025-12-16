import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Apple, Check } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import NutritionalScorecard from "@/components/NutritionalScorecard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';

export const NutritionScorecardWidget = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(() => {
    const visits = parseInt(localStorage.getItem("nutritionVisits") || "0");
    return visits < 2; // Auto-collapse after 2 visits
  });
  const [hasLoggedToday, setHasLoggedToday] = useState(false);

  useEffect(() => {
    // Increment visit count on mount
    const visits = parseInt(localStorage.getItem("nutritionVisits") || "0");
    localStorage.setItem("nutritionVisits", String(visits + 1));
    
    // Check if user has logged nutrition today
    if (user) {
      checkTodayLog();
    }
  }, [user]);

  const checkTodayLog = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_nutrition_scores')
      .select('*')
      .eq('user_id', user.id)
      .eq('score_date', today)
      .maybeSingle();
    
    if (!error && data) {
      setHasLoggedToday(true);
    }
  };

  const handleScoreCalculated = async (score: number, grade: string) => {
    // Note: Actual saving now happens in NutritionalScorecard via useNutritionTracking hook
    // This callback just updates local state
    if (!user) return;
    setHasLoggedToday(true);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-6 hover:bg-transparent"
          >
            <div className="flex items-center gap-3">
              <Apple className="h-5 w-5 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold text-foreground">{t('today.nutrition.dailyLog')}</h3>
                <p className="text-sm text-muted-foreground">
                  {hasLoggedToday ? (
                    <span className="flex items-center gap-1 text-primary">
                      <Check className="h-4 w-4" /> {t('today.nutrition.loggedToday')}
                    </span>
                  ) : (
                    t('today.nutrition.trackMeals')
                  )}
                </p>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="px-6 pb-6 pt-0">
            <NutritionalScorecard 
              onScoreCalculated={handleScoreCalculated}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
