import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoals } from "@/hooks/useGoals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, TrendingUp, Archive, CheckCircle2, Clock, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

const MyGoals = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goals, loading, tierFeatures } = useGoals();
  const [activeTab, setActiveTab] = useState("active");

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const archivedGoals = goals.filter((g) => g.status === "archived");

  const getPillarColor = (pillar: string) => {
    const colors = {
      brain: "bg-primary",
      body: "bg-green-500",
      balance: "bg-blue-500",
      beauty: "bg-pink-500",
    };
    return colors[pillar as keyof typeof colors] || "bg-gray-500";
  };

  const getPillarIcon = (pillar: string) => {
    return pillar.charAt(0).toUpperCase() + pillar.slice(1);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/")}
        className="mb-2"
      >
        <Home className="h-4 w-4 mr-2" />
        Go Home
      </Button>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            {t("goals.pageTitle")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("goals.pageSubtitle")}
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

      {/* Tier Indicator */}
      {tierFeatures && !tierFeatures.isUnlimited && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Goals: {activeGoals.length} / {tierFeatures.maxActiveGoals}
                </p>
                <Progress 
                  value={(activeGoals.length / tierFeatures.maxActiveGoals) * 100} 
                  className="mt-2 w-64"
                />
              </div>
              <Button variant="outline" onClick={() => navigate("/upgrade")}>
                {t("goals.upgradeForMore")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="active">
            <Clock className="h-4 w-4 mr-2" />
            {t("goals.activeGoals")} ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t("goals.completedGoals")} ({completedGoals.length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            <Archive className="h-4 w-4 mr-2" />
            {t("goals.archivedGoals")} ({archivedGoals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeGoals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Goals</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first health goal to start tracking progress
                </p>
                <Button onClick={() => navigate("/my-goals/wizard")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeGoals.map((goal) => (
                <Card 
                  key={goal.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/my-goals/${goal.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getPillarColor(goal.pillar_category)}>
                        {getPillarIcon(goal.pillar_category)}
                      </Badge>
                      <span className="text-2xl font-bold">{Math.round(goal.current_progress)}%</span>
                    </div>
                    <CardTitle className="line-clamp-2">{goal.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {goal.next_check_in_due && (
                        <>
                          <Clock className="h-4 w-4" />
                          Next check-in: {new Date(goal.next_check_in_due).toLocaleDateString()}
                        </>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={goal.current_progress} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedGoals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Goals Yet</h3>
                <p className="text-muted-foreground text-center">
                  Complete your active goals to see them here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedGoals.map((goal) => (
                <Card key={goal.id} className="opacity-80">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getPillarColor(goal.pillar_category)}>
                        {getPillarIcon(goal.pillar_category)}
                      </Badge>
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <CardTitle className="line-clamp-2">{goal.title}</CardTitle>
                    <CardDescription>
                      Completed: {new Date(goal.completed_at!).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4 mt-6">
          {archivedGoals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Archive className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Archived Goals</h3>
                <p className="text-muted-foreground text-center">
                  Archive goals you no longer want to track
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {archivedGoals.map((goal) => (
                <Card key={goal.id} className="opacity-60">
                  <CardHeader>
                    <Badge className={getPillarColor(goal.pillar_category)}>
                      {getPillarIcon(goal.pillar_category)}
                    </Badge>
                    <CardTitle className="line-clamp-2 mt-2">{goal.title}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyGoals;
