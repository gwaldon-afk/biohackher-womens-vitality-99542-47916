import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InsightsDetail = () => {
  const navigate = useNavigate();

  const insights = [
    { date: '2025-01-21', type: 'Bio Score', value: '+2', description: 'Nutrition scan completed' },
    { date: '2025-01-21', type: 'Mood', value: '7.5/10', description: 'Voice check-in recorded' },
    { date: '2025-01-20', type: 'Sleep', value: '8/10', description: 'Great recovery night' },
    { date: '2025-01-20', type: 'Energy', value: '6/10', description: 'Quick log entry' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6 pt-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard-main')}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-4xl font-bold">Insights & Logs</h1>
        </div>

        <div className="space-y-3">
          {insights.map((insight, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                      {insight.type}
                    </span>
                    <span className="text-sm text-muted-foreground">{insight.date}</span>
                  </div>
                  <p className="text-muted-foreground">{insight.description}</p>
                </div>
                <p className="text-lg font-bold">{insight.value}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightsDetail;
