import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Sun, Lightbulb, Pill, Clock, CheckCircle2, Brain, Heart, Activity, FlaskConical, TestTube, FileText, Stethoscope } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";

const Sleep = () => {
  const [selectedSection, setSelectedSection] = useState("overview");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const sections = [
    {
      id: "overview",
      title: "Longevity Overview",
      icon: Heart,
      color: "bg-primary text-primary-foreground"
    },
    {
      id: "science",
      title: "Current Research",
      icon: FlaskConical,
      color: "bg-secondary text-secondary-foreground"
    },
    {
      id: "conditions",
      title: "Related Medical Conditions",
      icon: Stethoscope,
      color: "bg-accent text-accent-foreground"
    },
    {
      id: "hacks",
      title: "Sleep Hacks",
      icon: Lightbulb,
      color: "bg-muted text-muted-foreground"
    }
  ];

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
    "red-light": {
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

  const renderOverview = () => (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-primary" />
            <CardTitle>Why Sleep Is Critical for Longevity</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Quality sleep is one of the most powerful longevity interventions available. During sleep, your body activates crucial repair mechanisms that directly impact aging and lifespan.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Brain Detoxification
              </h4>
              <p className="text-sm text-muted-foreground">
                The glymphatic system clears toxic proteins like amyloid-beta and tau during deep sleep, reducing Alzheimer's risk.
              </p>
            </div>
            
            <div className="bg-secondary/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-secondary-dark" />
                Cellular Repair
              </h4>
              <p className="text-sm text-muted-foreground">
                Growth hormone release peaks during deep sleep, promoting tissue repair and muscle recovery.
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-lg">
            <h4 className="font-semibold mb-3 text-lg">Longevity Impact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Adults sleeping 7-8 hours nightly have 15% lower mortality risk{" "}
                  <a 
                    href="https://pubmed.ncbi.nlm.nih.gov/20469800/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Link clicked:', e.currentTarget.href);
                    }}
                  >
                    (Research)
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Poor sleep ages immune system by 3-5 years accelerating cellular aging{" "}
                  <a 
                    href="https://www.pnas.org/doi/10.1073/pnas.1417490112" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Link clicked:', e.currentTarget.href);
                    }}
                  >
                    (Research)
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Quality sleep improves telomere length maintenance{" "}
                  <a 
                    href="https://pubmed.ncbi.nlm.nih.gov/25425069/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Link clicked:', e.currentTarget.href);
                    }}
                  >
                    (Research)
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderScience = () => (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-secondary-dark">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FlaskConical className="h-6 w-6 text-secondary-dark" />
            <CardTitle>Latest Sleep Research</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TestTube className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Circadian Biology Research (2024)</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Recent studies show that circadian disruption accelerates aging by disrupting cellular clocks in every organ system.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">Nature Medicine</Badge>
                <a 
                  href="https://www.nature.com/articles/s41591-023-02535-8" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:text-primary-dark underline"
                >
                  Read Study →
                </a>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-secondary-dark" />
                <h4 className="font-semibold">Glymphatic System Discovery</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                The brain's waste clearance system is 60% more active during sleep, particularly during slow-wave sleep phases.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">Science Translational Medicine</Badge>
                <a 
                  href="https://www.science.org/doi/10.1126/scitranslmed.aah6455" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:text-primary-dark underline"
                >
                  Read Study →
                </a>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-accent-foreground" />
                <h4 className="font-semibold">Sleep & Longevity Genes</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Poor sleep quality downregulates longevity genes including SIRT1, FOXO3, and mTOR pathway components.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">Cell Metabolism</Badge>
                <a 
                  href="https://www.cell.com/cell-metabolism/fulltext/S1550-4131(18)30124-1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:text-primary-dark underline"
                >
                  Read Study →
                </a>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Key Research Findings</h4>
            <ul className="text-sm space-y-2">
              <li>• Sleep debt cannot be fully "paid back" on weekends 
                <a 
                  href="https://pubmed.ncbi.nlm.nih.gov/30281059/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 text-primary hover:text-primary-dark underline text-xs"
                >
                  (Study)
                </a>
              </li>
              <li>• Each hour of sleep debt increases mortality risk by 9%
                <a 
                  href="https://academic.oup.com/sleep/article/33/5/585/2454673" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 text-primary hover:text-primary-dark underline text-xs"
                >
                  (Study)
                </a>
              </li>
              <li>• Deep sleep percentage declines by 2% per decade after age 30
                <a 
                  href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3119836/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 text-primary hover:text-primary-dark underline text-xs"
                >
                  (Study)
                </a>
              </li>
              <li>• Sleep timing consistency matters more than duration for longevity
                <a 
                  href="https://www.science.org/doi/10.1126/sciadv.abd8888" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 text-primary hover:text-primary-dark underline text-xs"
                >
                  (Study)
                </a>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConditions = () => (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-accent-foreground">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Stethoscope className="h-6 w-6 text-accent-foreground" />
            <CardTitle>Sleep-Related Health Conditions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Poor sleep quality and duration are linked to numerous chronic conditions that accelerate aging and reduce lifespan.
          </p>
          
          <div className="grid gap-4">
            <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
              <h4 className="font-semibold text-destructive mb-2">High Risk Conditions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>• Cardiovascular disease</div>
                <div>• Type 2 diabetes</div>
                <div>• Alzheimer's disease</div>
                <div>• Depression & anxiety</div>
                <div>• Immune dysfunction</div>
                <div>• Obesity</div>
              </div>
            </div>
            
            <div className="border border-warning/20 rounded-lg p-4 bg-warning/5">
              <h4 className="font-semibold text-warning-foreground mb-2">Moderate Risk Conditions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>• Hypertension</div>
                <div>• Metabolic syndrome</div>
                <div>• Chronic inflammation</div>
                <div>• Hormonal imbalances</div>
                <div>• Digestive disorders</div>
                <div>• Chronic pain</div>
              </div>
            </div>
          </div>
          
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Assess Your Sleep-Related Symptoms</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Take our comprehensive symptom assessment to identify potential sleep-related health issues.
            </p>
            <Button 
              onClick={() => navigate("/assessment/sleep")}
              className="bg-primary hover:bg-primary-dark text-primary-foreground"
            >
              Start Symptom Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHacks = () => (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-muted-foreground">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-muted-foreground" />
            <CardTitle>Evidence-Based Sleep Optimization</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
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
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {getCompletionRate() === 100 && (
                        <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg text-center">
                          <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                          <p className="text-success font-medium">Routine Complete!</p>
                          <p className="text-success/80 text-sm">Your body is ready for restorative sleep.</p>
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
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case "overview":
        return renderOverview();
      case "science":
        return renderScience();
      case "conditions":
        return renderConditions();
      case "hacks":
        return renderHacks();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 gradient-text">Sleep Optimization for Longevity</h1>
          <p className="text-muted-foreground">
            Evidence-based approach to optimizing sleep for maximum lifespan and healthspan
          </p>
        </div>

        {/* Section Selector with Radio Buttons */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Explore Sleep Topics</h2>
            <RadioGroup 
              value={selectedSection} 
              onValueChange={setSelectedSection}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {sections.map((section) => (
                <div key={section.id} className="relative">
                  <RadioGroupItem 
                    value={section.id} 
                    id={section.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={section.id}
                    className={`
                      flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer
                      transition-all hover:shadow-md
                      peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-lg
                      ${selectedSection === section.id ? section.color : 'border-border bg-card'}
                    `}
                  >
                    <section.icon className={`h-6 w-6 ${selectedSection === section.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-medium text-center ${selectedSection === section.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {section.title}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Dynamic Content Based on Selected Section */}
        {renderContent()}
      </main>
    </div>
  );
};

export default Sleep;