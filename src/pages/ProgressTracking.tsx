import { Suspense, lazy, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMeasurements } from "@/hooks/useMeasurements";
import { MeasurementForm } from "@/components/MeasurementForm";
import { TrendingUp, TrendingDown, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AIInsightsCard } from "@/components/AIInsightsCard";
import { MonthlyReportCard } from "@/components/MonthlyReportCard";
import { LazyOnVisible } from "@/components/performance/LazyOnVisible";

const ProgressTrackingCharts = lazy(() => import("./ProgressTrackingCharts"));

const ProgressTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { measurements, addMeasurement, loading } = useMeasurements();
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleAddMeasurement = async (data: any) => {
    try {
      await addMeasurement(data);
      setShowForm(false);
      toast({
        title: "Measurement Added",
        description: "Your progress has been recorded successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add measurement. Please try again."
      });
    }
  };

  const getChartData = (field: keyof typeof measurements[0]) => {
    return measurements
      .filter(m => m[field] !== null)
      .map(m => ({
        date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: m[field]
      }))
      .reverse();
  };

  const getTrend = (data: any[]) => {
    if (data.length < 2) return null;
    const first = data[0].value;
    const last = data[data.length - 1].value;
    return last > first ? 'up' : last < first ? 'down' : 'stable';
  };

  const latestMeasurement = measurements[0];
  const weightData = getChartData("weight");
  const bodyFatData = getChartData("body_fat_percentage");
  const muscleData = getChartData("muscle_mass");
  const waistData = getChartData("waist_circumference");
  const hipData = getChartData("hip_circumference");

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Top Return Button */}
        <div className="flex justify-start mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate(user ? '/today' : '/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Progress <span className="text-primary">Tracking</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Monitor your body measurements and wellness journey
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-5 w-5 mr-2" />
            {showForm ? 'Cancel' : 'Add Measurement'}
          </Button>
        </div>

        {showForm && (
          <div className="mb-8">
            <MeasurementForm
              onSubmit={handleAddMeasurement}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {loading ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground">Loading your progress data...</p>
            </CardContent>
          </Card>
        ) : measurements.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="text-2xl font-bold mb-2">No Measurements Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start tracking your progress by adding your first measurement.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Measurement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Latest Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {latestMeasurement.weight && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Weight</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{latestMeasurement.weight}</span>
                      <span className="text-muted-foreground mb-1">kg</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              {latestMeasurement.body_fat_percentage && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Body Fat</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{latestMeasurement.body_fat_percentage}</span>
                      <span className="text-muted-foreground mb-1">%</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              {latestMeasurement.muscle_mass && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Muscle Mass</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{latestMeasurement.muscle_mass}</span>
                      <span className="text-muted-foreground mb-1">kg</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              {latestMeasurement.waist_circumference && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Waist</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{latestMeasurement.waist_circumference}</span>
                      <span className="text-muted-foreground mb-1">cm</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Charts */}
            <LazyOnVisible
              minHeight={420}
              fallback={
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">Loading charts…</CardContent>
                </Card>
              }
            >
              <Suspense
                fallback={
                  <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">Loading charts…</CardContent>
                  </Card>
                }
              >
                <ProgressTrackingCharts
                  weightData={weightData}
                  bodyFatData={bodyFatData}
                  muscleData={muscleData}
                  waistData={waistData}
                  hipData={hipData}
                />
              </Suspense>
            </LazyOnVisible>

            {/* AI-Powered Premium Features */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <AIInsightsCard />
              <MonthlyReportCard isPremium={false} />
            </div>
          </>
        )}
        
        {/* Bottom Return Button */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/today')} 
            size="lg"
          >
            Go Back
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ProgressTracking;
