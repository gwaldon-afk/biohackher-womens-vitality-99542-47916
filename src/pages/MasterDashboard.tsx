import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useAssessmentProgress } from "@/hooks/useAssessmentProgress";
import { Navigate } from "react-router-dom";
import { Trophy, TrendingUp, Activity, Package, Heart, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const MasterDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, isLoading, allComplete } = useAssessmentProgress();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
        <div className="max-w-6xl mx-auto space-y-6 pt-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!allComplete) {
    return <Navigate to="/today" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto space-y-8 pt-8 pb-16">
        {/* Top Return Button */}
        <div className="flex justify-start mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/today')}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Return to Today
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <Trophy className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Master Longevity Dashboard</h1>
            <p className="text-muted-foreground">Your complete health constellation unlocked</p>
          </div>
        </div>

        {/* Unified Health Overview */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Unified Health Overview</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">LIS Assessment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">Completed</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {progress?.lis_completed_at && 
                    new Date(progress.lis_completed_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Nutrition Score</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">Completed</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {progress?.nutrition_completed_at && 
                    new Date(progress.nutrition_completed_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Hormone Compass</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">Completed</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {progress?.hormone_completed_at && 
                    new Date(progress.hormone_completed_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cross-Assessment Insights */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Cross-Assessment Insights</h2>
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                How Your Scores Connect
              </CardTitle>
              <CardDescription>
                Understanding the relationships between your assessments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your complete health profile shows how different aspects of your wellbeing influence each other. 
                By completing all three assessments, you've unlocked personalized insights that consider your 
                longevity impact, nutritional status, and hormonal health together.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="font-semibold mb-2">Key Connections Identified:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Your nutrition choices directly impact your LIS score and biological aging</li>
                  <li>• Hormonal balance influences your energy levels and recovery</li>
                  <li>• Combined protocols address root causes across all three dimensions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Unified Protocol */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Unified 90-Day Protocol</h2>
          <Card>
            <CardHeader>
              <CardTitle>Integrated Recommendations</CardTitle>
              <CardDescription>
                Combining insights from all three assessments into one actionable plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your personalized protocol combines recommendations from LIS, Nutrition, and Hormone Compass 
                assessments, removing duplicates and prioritizing actions for maximum impact.
               </p>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Visit your <span className="font-semibold text-foreground">My Protocol</span> page to view 
                  your complete unified protocol and start tracking your progress.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Bottom Return Button */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            onClick={() => navigate('/today')} 
            size="lg"
          >
            Return to Today
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;
