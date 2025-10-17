import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoals } from "@/hooks/useGoals";
import { useGoalInsights } from "@/hooks/useGoalInsights";
import { GoalRingVisualization } from "@/components/goals/GoalRingVisualization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, TrendingUp, Calendar, Home, List, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";

const GoalsDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goals, loading, tierFeatures } = useGoals();
  const { unacknowledgedCount } = useGoalInsights();
  const [selectedPillar, setSelectedPillar] = useState<string>("all");

  const activeGoals = goals.filter((g) => g.status === "active");
  
  const filteredGoals = selectedPillar === "all" 
    ? activeGoals 
    : activeGoals.filter((g) => g.pillar_category === selectedPillar);

  const totalProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, g) => sum + (g.current_progress || 0), 0) / activeGoals.length)
    : 0;

  const checkInsThisWeek = activeGoals.filter((g) => {
    if (!g.last_check_in_date) return false;
    const lastCheckIn = new Date(g.last_check_in_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastCheckIn >= weekAgo;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/")}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/my-goals")}
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/goals/insights")}
                className="relative"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Insights
                {unacknowledgedCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center" variant="destructive">
                    {unacknowledgedCount}
                  </Badge>
                )}
              </Button>
            </div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8 text-primary" />
              Goal Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Your longevity roadmap at a glance
            </p>
          </div>
          <Button 
            onClick={() => navigate("/my-goals/wizard")}
            size="lg"
            disabled={!tierFeatures?.isUnlimited && activeGoals.length >= (tierFeatures?.maxActiveGoals || 0)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("goals.newGoal")}
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Overall Progress</CardDescription>
              <CardTitle className="text-3xl">{totalProgress}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Across {activeGoals.length} active {activeGoals.length === 1 ? 'goal' : 'goals'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Check-ins This Week</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                {checkInsThisWeek}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keep the momentum going!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Goals</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                {activeGoals.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {tierFeatures?.isUnlimited 
                  ? 'Unlimited goals' 
                  : `${tierFeatures?.maxActiveGoals || 0 - activeGoals.length} slots remaining`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pillar Filter */}
        <Tabs value={selectedPillar} onValueChange={setSelectedPillar}>
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="all">All ({activeGoals.length})</TabsTrigger>
            <TabsTrigger value="brain">
              Brain ({activeGoals.filter(g => g.pillar_category === 'brain').length})
            </TabsTrigger>
            <TabsTrigger value="body">
              Body ({activeGoals.filter(g => g.pillar_category === 'body').length})
            </TabsTrigger>
            <TabsTrigger value="balance">
              Balance ({activeGoals.filter(g => g.pillar_category === 'balance').length})
            </TabsTrigger>
            <TabsTrigger value="beauty">
              Beauty ({activeGoals.filter(g => g.pillar_category === 'beauty').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Goal Rings Grid */}
        {filteredGoals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {selectedPillar === "all" ? "No Active Goals" : `No ${selectedPillar} Goals`}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {selectedPillar === "all" 
                  ? "Create your first health goal to start tracking progress"
                  : `Create a ${selectedPillar} goal to see it here`}
              </p>
              <Button onClick={() => navigate("/my-goals/wizard")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 place-items-center">
            {filteredGoals.slice(0, 8).map((goal) => (
              <div key={goal.id} className="space-y-2 text-center">
                <GoalRingVisualization
                  goal={goal}
                  size="md"
                  onClick={() => navigate(`/my-goals/${goal.id}`)}
                />
                <div className="space-y-1">
                  {goal.next_check_in_due && (
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Next: {new Date(goal.next_check_in_due).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show more goals message */}
        {filteredGoals.length > 8 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Showing 8 of {filteredGoals.length} goals
              </p>
              <Button variant="outline" onClick={() => navigate("/my-goals")}>
                View All Goals
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tier limit indicator */}
        {tierFeatures && !tierFeatures.isUnlimited && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Active Goals: {activeGoals.length} / {tierFeatures.maxActiveGoals}
                  </p>
                  <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(activeGoals.length / tierFeatures.maxActiveGoals) * 100}%` }}
                    />
                  </div>
                </div>
                <Button variant="outline" onClick={() => navigate("/upgrade")}>
                  {t("goals.upgradeForMore")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default GoalsDashboard;
