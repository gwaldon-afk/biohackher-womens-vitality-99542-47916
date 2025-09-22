import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Sun, Lightbulb, Pill, Clock, CheckCircle2 } from "lucide-react";
import Navigation from "@/components/Navigation";

const Sleep = () => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const routines = {
    "evening-wind-down": {
      title: "Evening Wind-Down Routine",
      icon: Moon,
      description: "Prepare your body and mind for restorative sleep",
      items: [
        { id: "dim-lights", text: "Dim lights to <50 lux 2 hours before bed", time: "2h before" },
        { id: "no-screens", text: "Stop blue light screens or use blue light blockers", time: "1h before" },
        { id: "cool-temp", text: "Set room temperature to 65-68°F (18-20°C)", time: "1h before" },
        { id: "magnesium", text: "Take magnesium glycinate supplement", time: "30min before" },
        { id: "hot-bath", text: "Take warm bath or shower to drop core temperature", time: "90min before" },
        { id: "journal", text: "Write down tomorrow's priorities (brain dump)", time: "30min before" },
        { id: "read", text: "Read fiction book with warm light", time: "15min before" }
      ]
    },
    "blue-light": {
      title: "Blue Light Management", 
      icon: Lightbulb,
      description: "Optimise circadian rhythm through light exposure",
      items: [
        { id: "morning-sun", text: "Get 10-15 minutes natural sunlight within 2h of waking" },
        { id: "bright-day", text: "Maximize bright light exposure during day (>1000 lux)" },
        { id: "evening-amber", text: "Use amber/red light bulbs in evening" },
        { id: "blue-blockers", text: "Wear blue light blocking glasses after sunset" },
        { id: "no-overhead", text: "Avoid overhead lighting 2 hours before bed" },
        { id: "blackout", text: "Use blackout curtains or eye mask for darkness" },
        { id: "red-night", text: "Use red light flashlight for bathroom trips" }
      ]
    },
    "pre-sleep": {
      title: "Red Light Pre-Sleep Flow",
      icon: Sun,
      description: "Gentle red light therapy to promote melatonin production", 
      items: [
        { id: "setup-red", text: "Set up 660nm red light device" },
        { id: "distance", text: "Position 18-24 inches from face/body" },
        { id: "duration", text: "Expose for 10-15 minutes" },
        { id: "eye-position", text: "Keep eyes closed or use eye protection" },
        { id: "breathing", text: "Practice slow, deep breathing during session" },
        { id: "temperature", text: "Ensure room stays cool during therapy" },
        { id: "post-care", text: "Turn off device and transition to sleep space" }
      ]
    }
  };

  const supplements = [
    {
      name: "Magnesium Glycinate",
      dosage: "400-600mg",
      timing: "30-60 min before bed",
      benefits: "Muscle relaxation, GABA support",
      evidence: "Gold"
    },
    {
      name: "L-Theanine", 
      dosage: "200-400mg",
      timing: "1-2 hours before bed",
      benefits: "Calm alertness, reduced anxiety",
      evidence: "Silver"
    },
    {
      name: "Melatonin (Low Dose)",
      dosage: "0.5-1mg",
      timing: "2-3 hours before desired sleep",
      benefits: "Circadian rhythm regulation",
      evidence: "Gold"
    },
    {
      name: "Glycine",
      dosage: "3g",
      timing: "30 min before bed", 
      benefits: "Lower core body temperature",
      evidence: "Silver"
    }
  ];

  const [selectedRoutine, setSelectedRoutine] = useState("evening-wind-down");
  const currentRoutine = routines[selectedRoutine as keyof typeof routines];

  const toggleCheck = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getCompletionRate = () => {
    const totalItems = currentRoutine.items.length;
    const completedItems = currentRoutine.items.filter(item => checkedItems[item.id]).length;
    return Math.round((completedItems / totalItems) * 100);
  };

  const getEvidenceBadgeClass = (evidence: string) => {
    switch (evidence) {
      case "Gold": return "evidence-gold";
      case "Silver": return "evidence-silver";
      default: return "evidence-bronze";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 gradient-text">Sleep Optimisation</h1>
          <p className="text-muted-foreground">
            Evidence-based routines and protocols for restorative sleep
          </p>
        </div>

        <Tabs defaultValue="routines" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="routines">Sleep Routines</TabsTrigger>
            <TabsTrigger value="supplements">Sleep Support</TabsTrigger>
            <TabsTrigger value="tracking">Sleep Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="routines" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Routine Selector */}
              <div className="space-y-4">
                {Object.entries(routines).map(([key, routine]) => (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-colors ${
                      selectedRoutine === key 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedRoutine(key)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <routine.icon className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium text-sm">{routine.title}</h3>
                          {selectedRoutine === key && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {getCompletionRate()}% Complete
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Routine Checklist */}
              <div className="lg:col-span-3">
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <currentRoutine.icon className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle>{currentRoutine.title}</CardTitle>
                        <CardDescription>{currentRoutine.description}</CardDescription>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress: {getCompletionRate()}%</span>
                        <span>{currentRoutine.items.filter(item => checkedItems[item.id]).length} of {currentRoutine.items.length} completed</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentRoutine.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                          <Checkbox
                            id={item.id}
                            checked={checkedItems[item.id] || false}
                            onCheckedChange={() => toggleCheck(item.id)}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={item.id}
                              className={`text-sm font-medium cursor-pointer ${
                                checkedItems[item.id] ? 'line-through text-muted-foreground' : ''
                              }`}
                            >
                              {item.text}
                            </label>
                            {item.time && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {item.time}
                              </p>
                            )}
                          </div>
                          {checkedItems[item.id] && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {getCompletionRate() === 100 && (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-green-800 font-medium">Routine Complete!</p>
                        <p className="text-green-600 text-sm">Your body is ready for restorative sleep.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="supplements" className="mt-6">
            <div className="grid gap-4">
              {supplements.map((supplement, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Pill className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{supplement.name}</h3>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getEvidenceBadgeClass(supplement.evidence)}
                      >
                        {supplement.evidence} Evidence
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Dosage</p>
                        <p className="font-medium">{supplement.dosage}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Timing</p>
                        <p className="font-medium">{supplement.timing}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Benefits</p>
                        <p className="font-medium">{supplement.benefits}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="tracking" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sleep Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">7h 42m</div>
                  <p className="text-sm text-muted-foreground">Last night</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sleep Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">87%</div>
                  <p className="text-sm text-muted-foreground">Time asleep vs. time in bed</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Deep Sleep</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">1h 23m</div>
                  <p className="text-sm text-muted-foreground">18% of total sleep</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Sleep;