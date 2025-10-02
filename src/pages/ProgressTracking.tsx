import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { useMeasurements } from "@/hooks/useMeasurements";
import { MeasurementForm } from "@/components/MeasurementForm";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProgressTracking = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
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
            <Tabs defaultValue="weight" className="space-y-6">
              <TabsList>
                <TabsTrigger value="weight">Weight</TabsTrigger>
                <TabsTrigger value="body_fat">Body Fat %</TabsTrigger>
                <TabsTrigger value="muscle">Muscle Mass</TabsTrigger>
                <TabsTrigger value="measurements">Measurements</TabsTrigger>
              </TabsList>

              <TabsContent value="weight">
                <Card>
                  <CardHeader>
                    <CardTitle>Weight Trend</CardTitle>
                    <CardDescription>
                      Track your weight changes over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getChartData('weight')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="body_fat">
                <Card>
                  <CardHeader>
                    <CardTitle>Body Fat Percentage</CardTitle>
                    <CardDescription>
                      Monitor your body composition
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getChartData('body_fat_percentage')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="muscle">
                <Card>
                  <CardHeader>
                    <CardTitle>Muscle Mass</CardTitle>
                    <CardDescription>
                      Track your muscle development
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getChartData('muscle_mass')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="measurements">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Waist Circumference</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={getChartData('waist_circumference')}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Hip Circumference</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={getChartData('hip_circumference')}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default ProgressTracking;
