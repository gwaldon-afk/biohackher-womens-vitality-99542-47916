import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Navigation from "@/components/Navigation";
import { useSymptomTracking } from "@/hooks/useSymptomTracking";
import { useToast } from "@/hooks/use-toast";
import { SymptomTrendChart } from "@/components/SymptomTrendChart";
import { SymptomCorrelationChart } from "@/components/SymptomCorrelationChart";
import { TrendingUp, Plus, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COMMON_SYMPTOMS = [
  { id: 'hot-flashes', name: 'Hot Flushes' },
  { id: 'sleep', name: 'Sleep Issues' },
  { id: 'joint-pain', name: 'Joint Pain' },
  { id: 'brain-fog', name: 'Brain Fog' },
  { id: 'anxiety', name: 'Anxiety' },
  { id: 'fatigue', name: 'Fatigue' },
  { id: 'mood-swings', name: 'Mood Swings' },
  { id: 'headaches', name: 'Headaches' }
];

const SymptomTrends = () => {
  const { toast } = useToast();
  const { logSymptom, getSymptomTrends, getCorrelationData } = useSymptomTracking();
  
  const [selectedSymptom, setSelectedSymptom] = useState(COMMON_SYMPTOMS[0].id);
  const [severity, setSeverity] = useState([5]);
  const [notes, setNotes] = useState("");
  const [trendData, setTrendData] = useState<any[]>([]);
  const [correlationData, setCorrelationData] = useState<any>({ symptomData: [], adherenceData: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrendData();
  }, [selectedSymptom]);

  const loadTrendData = async () => {
    setLoading(true);
    try {
      const trends = await getSymptomTrends(selectedSymptom, 30);
      setTrendData(trends);
      
      const correlation = await getCorrelationData(selectedSymptom, 30);
      setCorrelationData(correlation);
    } finally {
      setLoading(false);
    }
  };

  const handleLogSymptom = async () => {
    try {
      await logSymptom(selectedSymptom, severity[0], notes);
      toast({
        title: "Symptom Logged",
        description: "Your symptom has been tracked successfully."
      });
      setNotes("");
      loadTrendData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log symptom. Please try again."
      });
    }
  };

  const symptomName = COMMON_SYMPTOMS.find(s => s.id === selectedSymptom)?.name || selectedSymptom;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-primary">Symptom</span> Tracking & Trends
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your symptoms over time and discover patterns
          </p>
        </div>

        <Tabs defaultValue="log" className="space-y-6">
          <TabsList>
            <TabsTrigger value="log">
              <Plus className="h-4 w-4 mr-2" />
              Log Symptom
            </TabsTrigger>
            <TabsTrigger value="trends">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Trends
            </TabsTrigger>
          </TabsList>

          {/* Log Symptom Tab */}
          <TabsContent value="log">
            <Card>
              <CardHeader>
                <CardTitle>Log Today's Symptoms</CardTitle>
                <CardDescription>
                  Track how you're feeling today to build insights over time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="symptom">Symptom</Label>
                  <Select value={selectedSymptom} onValueChange={setSelectedSymptom}>
                    <SelectTrigger id="symptom">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_SYMPTOMS.map(symptom => (
                        <SelectItem key={symptom.id} value={symptom.id}>
                          {symptom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Severity: {severity[0]}/10</Label>
                  <Slider
                    value={severity}
                    onValueChange={setSeverity}
                    max={10}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>None</span>
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any triggers, observations, or additional context..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={handleLogSymptom} className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Log Symptom for Today
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="mb-4">
              <Label>Select Symptom to Analyze</Label>
              <Select value={selectedSymptom} onValueChange={setSelectedSymptom}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_SYMPTOMS.map(symptom => (
                    <SelectItem key={symptom.id} value={symptom.id}>
                      {symptom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Loading trend data...
                </CardContent>
              </Card>
            ) : trendData.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start logging this symptom to see trends and patterns
                  </p>
                  <Button onClick={() => document.querySelector('[value="log"]')?.dispatchEvent(new MouseEvent('click'))}>
                    Log Your First Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <SymptomTrendChart data={trendData} symptomName={symptomName} />
                
                {correlationData.adherenceData.length > 0 && (
                  <SymptomCorrelationChart
                    symptomData={correlationData.symptomData}
                    adherenceData={correlationData.adherenceData}
                    symptomName={symptomName}
                  />
                )}

                {/* Insights Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pattern Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {trendData.length >= 7 && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm">
                          📊 You've tracked {symptomName.toLowerCase()} for {trendData.length} days
                        </p>
                      </div>
                    )}
                    {correlationData.adherenceData.length > 0 && (
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm">
                          💡 Higher protocol adherence correlates with symptom changes. Keep tracking to see more patterns!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SymptomTrends;