import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useHormoneCompass } from "@/hooks/useHormoneCompass";
import { HormoneCompassInsightCard } from "./HormoneCompassInsightCard";

export const HormoneCompassInsightsFeed = () => {
  const { insights, isEnabled, isLoading } = useHormoneCompass();

  if (!isEnabled || isLoading) return null;
  if (!insights || insights.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <CardTitle>HormoneCompass™ Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <HormoneCompassInsightCard key={insight.id} insight={insight} />
        ))}
      </CardContent>
    </Card>
  );
};
