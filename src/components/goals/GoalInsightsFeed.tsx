import { useState } from "react";
import { useGoalInsights } from "@/hooks/useGoalInsights";
import { GoalInsightCard } from "./GoalInsightCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Filter } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface GoalInsightsFeedProps {
  goalId?: string;
}

export const GoalInsightsFeed = ({ goalId }: GoalInsightsFeedProps) => {
  const { 
    insights, 
    isLoading, 
    generateInsights, 
    isGenerating,
    markAsAcknowledged,
    dismissInsight 
  } = useGoalInsights(goalId);

  const [filterType, setFilterType] = useState<string>("all");

  const filteredInsights = filterType === "all" 
    ? insights 
    : insights.filter(i => i.insight_type === filterType);

  const handleGenerate = () => {
    if (goalId) {
      generateInsights({ goalId, triggerType: 'manual' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold">AI Insights</h3>
          <p className="text-sm text-muted-foreground">
            Personalized recommendations based on your progress
          </p>
        </div>
        {goalId && (
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate New Insights'}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Tabs value={filterType} onValueChange={setFilterType}>
        <TabsList className="grid grid-cols-6 w-full max-w-2xl">
          <TabsTrigger value="all">All ({insights.length})</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="motivation">Motivation</TabsTrigger>
          <TabsTrigger value="barrier">Barriers</TabsTrigger>
          <TabsTrigger value="optimization">Optimize</TabsTrigger>
          <TabsTrigger value="celebration">Wins</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No Insights Yet</CardTitle>
            <CardDescription className="text-center mb-4">
              {goalId 
                ? "Generate insights to get personalized recommendations for this goal"
                : "Complete check-ins to start receiving AI-powered insights"}
            </CardDescription>
            {goalId && (
              <Button onClick={handleGenerate} disabled={isGenerating}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Insights
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredInsights.map((insight) => (
              <GoalInsightCard
                key={insight.id}
                insight={insight}
                onAcknowledge={markAsAcknowledged}
                onDismiss={dismissInsight}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
