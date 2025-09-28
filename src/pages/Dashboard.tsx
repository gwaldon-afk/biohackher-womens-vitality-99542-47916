import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { History, FileText, Activity, Settings, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  currentScore: number;
  weeklyTrend: 'up' | 'down' | 'stable';
  lastAssessment: string;
  totalAssessments: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({
    currentScore: 72.5,
    weeklyTrend: 'up',
    lastAssessment: '3 days ago',
    totalAssessments: 8
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Primary action buttons with clear hierarchy
  const primaryActions = [
    {
      title: "View My Data",
      subtitle: "Assessment History & Reports",
      icon: History,
      variant: "default" as const,
      onClick: () => navigate('/assessment-history'),
      className: "bg-primary text-primary-foreground hover:bg-primary/90"
    },
    {
      title: "Take Symptom Assessment",
      subtitle: "Complete your wellness check",
      icon: FileText,
      variant: "outline" as const,
      onClick: () => navigate('/symptoms'),
      className: "border-primary/20 text-primary hover:bg-primary/5"
    },
    {
      title: "Sync Wearables",
      subtitle: "Update health data",
      icon: Activity,
      variant: "outline" as const,
      onClick: () => handleSyncWearables(),
      className: "border-muted-foreground/20 hover:bg-muted/50"
    },
    {
      title: "Settings",
      subtitle: "Account & preferences",
      icon: Settings,
      variant: "ghost" as const,
      onClick: () => navigate('/settings'),
      className: "hover:bg-muted/50"
    }
  ];

  const handleSyncWearables = () => {
    setLoading(true);
    // Simulate sync process
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Sync Complete",
        description: "Health data updated successfully",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Daily LIS Quick Access */}
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/symptoms')}
            className="w-full md:w-auto bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            Take Today's Daily Longevity Assessment
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-primary">Sarah</span>
          </h1>
          <p className="text-muted-foreground">Your personalized health dashboard</p>
        </div>

        {/* Quick Summary Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <ProgressCircle value={data.currentScore} size="lg" className="text-primary">
                          <div className="text-center">
                            <div className="text-xl font-bold">{data.currentScore}</div>
                            <div className="text-xs text-muted-foreground">LIS Score</div>
                          </div>
                        </ProgressCircle>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p className="text-sm font-medium mb-2">Longevity Impact Score (LIS)</p>
                      <p className="text-xs">
                        LIS measures your daily habits' impact on biological aging. 
                        Scores 80+ indicate aging-reversing habits, 60-80 are neutral, 
                        and below 60 may accelerate aging. Based on sleep, nutrition, 
                        activity, stress, social connections, and cognitive engagement.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* LIS Analysis */}
                <div className="space-y-2 flex-1">
                  <div className="text-sm font-medium text-gray-900">LIS Analysis</div>
                  <div className="text-sm text-muted-foreground">
                    {data.currentScore >= 80 ? (
                      <span className="text-green-600 font-medium">
                        🎯 Excellent! Your habits are supporting healthy aging and longevity.
                      </span>
                    ) : data.currentScore >= 60 ? (
                      <span className="text-blue-600 font-medium">
                        👍 Good foundation. Small improvements could enhance your longevity impact.
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium">
                        ⚠️ Focus needed. Your current habits may accelerate aging processes.
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Last assessment: {data.lastAssessment}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Total assessments: {data.totalAssessments}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-4">
                {/* Weekly Trend - moved to right */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Weekly Trend:</span>
                  {data.weeklyTrend === 'up' ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Improving</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-sm font-medium">Needs attention</span>
                    </div>
                  )}
                </div>
                
                {/* Health Status */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {data.currentScore >= 80 ? 'Great!' : data.currentScore >= 60 ? 'Good' : 'Focus'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Health Status
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {primaryActions.map((action, index) => (
            <Button
              key={action.title}
              variant={action.variant}
              onClick={action.onClick}
              disabled={action.title === 'Sync Wearables' && loading}
              className={`h-24 p-6 flex items-center gap-4 justify-start text-left ${action.className}`}
            >
              <action.icon className="h-6 w-6 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-base">{action.title}</div>
                <div className="text-sm opacity-80">{action.subtitle}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary mb-1">8</div>
            <div className="text-xs text-muted-foreground">Assessments</div>
          </Card>
          
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-green-600 mb-1">5</div>
            <div className="text-xs text-muted-foreground">Good Days</div>
          </Card>
          
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-amber-600 mb-1">2</div>
            <div className="text-xs text-muted-foreground">Focus Areas</div>
          </Card>
          
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600 mb-1">72%</div>
            <div className="text-xs text-muted-foreground">Avg Score</div>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-background rounded border">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Complete your weekly assessment to maintain tracking</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-background rounded border">
              <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm">Review your sleep quality patterns in Reports</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-background rounded border">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Sync your fitness tracker for more accurate data</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button variant="link" onClick={() => navigate('/reports')} className="text-sm">
            View Detailed Reports →
          </Button>
          <Button variant="link" onClick={() => navigate('/nutrition')} className="text-sm">
            Nutrition Guidance →
          </Button>
          <Button variant="link" onClick={() => navigate('/sleep')} className="text-sm">
            Sleep Optimization →
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;