import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { TrendingUp, TrendingDown, Activity, Heart, Moon, Footprints, Utensils, Thermometer } from "lucide-react";
import Navigation from "@/components/Navigation";

const Dashboard = () => {
  // Mock data - in real app would come from API/state
  const biohackherAge = 34;
  const chronologicalAge = 42;
  const improvement = chronologicalAge - biohackherAge;

  const metrics = [
    { name: "Sleep Quality", value: 78, trend: "up", icon: Moon, color: "text-blue-500" },
    { name: "HRV", value: 65, trend: "up", icon: Heart, color: "text-red-500" },
    { name: "Resting HR", value: 58, trend: "down", icon: Activity, color: "text-green-500" },
    { name: "Daily Steps", value: 85, trend: "up", icon: Footprints, color: "text-purple-500" },
    { name: "Protein Intake", value: 72, trend: "up", icon: Utensils, color: "text-orange-500" },
    { name: "Symptom Score", value: 25, trend: "down", icon: Thermometer, color: "text-pink-500" }
  ];

  const todaysNudge = {
    title: "Morning Sunlight Exposure",
    description: "Get 10-15 minutes of natural light within 2 hours of waking to optimise your circadian rhythm.",
    type: "circadian",
    evidence: "Gold"
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section - Biohackher Age */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Welcome back, <span className="gradient-text">Sarah</span>
          </h1>
          
          <Card className="max-w-md mx-auto card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Your Biohackher Age</CardTitle>
              <CardDescription>Based on your biomarkers and lifestyle data</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center mb-4">
                <ProgressCircle value={75} size="xl">
                  <div className="text-center">
                    <div className="age-score">{biohackherAge}</div>
                    <div className="text-sm text-muted-foreground">years</div>
                  </div>
                </ProgressCircle>
              </div>
              <div className="text-sm text-muted-foreground">
                You're <span className="font-semibold text-primary">{improvement} years younger</span> than your chronological age
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Nudge */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                🌅 Today's Nudge
              </CardTitle>
              <Badge variant="outline" className="evidence-gold border-yellow-500">
                {todaysNudge.evidence} Evidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-2">{todaysNudge.title}</h3>
            <p className="text-muted-foreground mb-4">{todaysNudge.description}</p>
            <Button size="sm" className="primary-gradient">
              Start Now
            </Button>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric) => (
            <Card key={metric.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                    <h3 className="font-medium">{metric.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {metric.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <ProgressCircle value={metric.value} size="md">
                    <span className="text-sm font-semibold">{metric.value}%</span>
                  </ProgressCircle>
                  
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">7-day avg</div>
                    <div className="text-sm font-medium">
                      {metric.trend === "up" ? "↗️" : "↘️"} {Math.floor(Math.random() * 10 + 1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Thermometer className="h-5 w-5" />
            Log Symptoms
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Activity className="h-5 w-5" />
            Start Therapy
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Moon className="h-5 w-5" />
            Sleep Routine
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Utensils className="h-5 w-5" />
            Track Nutrition
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;