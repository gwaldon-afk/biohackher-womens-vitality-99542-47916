import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Sun, Snowflake, Waves, Heart, AlertTriangle } from "lucide-react";
import Navigation from "@/components/Navigation";
import ResearchCitation from "@/components/ResearchCitation";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";

const Therapies = () => {
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const therapies = [
    {
      id: "red-light",
      name: "Red Light Therapy",
      icon: Sun,
      color: "text-red-500",
      description: "660nm-850nm light for cellular energy and recovery",
      protocols: [
        { name: "Face & Neck", duration: 10, distance: "15-30cm" },
        { name: "Full Body", duration: 15, distance: "45-60cm" },
        { name: "Targeted Area", duration: 8, distance: "15cm" }
      ],
      contraindications: ["Pregnancy", "Cancer treatment area", "Photosensitizing medications"],
      benefits: ["Collagen production", "Wound healing", "Reduced inflammation"],
      researchCitation: {
        title: "Low-Level Light Therapy for Skin: Review and Summary of Current Applications",
        journal: "Lasers in Surgery and Medicine",
        year: 2020,
        url: "https://pubmed.ncbi.nlm.nih.gov/33147112/",
        doi: "10.1002/lsm.23381",
        studyType: "Review" as const
      }
    },
    {
      id: "cold-therapy", 
      name: "Cold Exposure",
      icon: Snowflake,
      color: "text-blue-500",
      description: "Controlled cold exposure for metabolic and mental benefits",
      protocols: [
        { name: "Cold Shower", duration: 3, temperature: "10-15°C" },
        { name: "Ice Bath", duration: 2, temperature: "7-13°C" },
        { name: "Cryotherapy", duration: 1, temperature: "Below 0°C" }
      ],
      contraindications: ["Heart conditions", "Pregnancy", "Eating disorders"],
      benefits: ["Brown fat activation", "Mood enhancement", "Immune boost"],
      researchCitation: {
        title: "Cold Water Immersion and Other Forms of Cryotherapy: Physiological Changes Potentially Affecting Recovery From High-Intensity Exercise",
        journal: "Extreme Physiology & Medicine",
        year: 2019,
        url: "https://pubmed.ncbi.nlm.nih.gov/32020712/",
        doi: "10.1186/s13728-019-0103-9",
        studyType: "Review" as const
      }
    },
    {
      id: "contrast-therapy",
      name: "Heat/Cold Contrast", 
      icon: Waves,
      color: "text-orange-500",
      description: "Alternating hot and cold for circulation and recovery",
      protocols: [
        { name: "Sauna + Cold Plunge", duration: 20, cycles: "3 rounds" },
        { name: "Hot/Cold Shower", duration: 12, cycles: "4 rounds" },
        { name: "Steam + Ice", duration: 15, cycles: "3 rounds" }
      ],
      contraindications: ["Cardiovascular disease", "Pregnancy", "Blood pressure issues"],
      benefits: ["Enhanced circulation", "Faster recovery", "Stress resilience"],
      researchCitation: {
        title: "Contrast Water Therapy and Exercise Induced Muscle Damage: A Systematic Review and Meta-Analysis",
        journal: "PLoS ONE",
        year: 2017,
        url: "https://pubmed.ncbi.nlm.nih.gov/29083549/",
        doi: "10.1371/journal.pone.0178548",
        studyType: "Meta-analysis" as const
      }
    },
    {
      id: "breathwork",
      name: "HRV Breathwork",
      icon: Heart,
      color: "text-green-500", 
      description: "Heart rate variability training through controlled breathing",
      protocols: [
        { name: "4-7-8 Breathing", duration: 10, pattern: "4in-7hold-8out" },
        { name: "Box Breathing", duration: 15, pattern: "4in-4hold-4out-4hold" },
        { name: "Coherent Breathing", duration: 12, pattern: "5in-5out" }
      ],
      contraindications: ["Panic disorders", "Severe anxiety", "Breathing disorders"],
      benefits: ["Parasympathetic activation", "Stress reduction", "Sleep improvement"],
      researchCitation: {
        title: "The Effect of Diaphragmatic Breathing on Attention, Negative Affect and Stress in Healthy Adults",
        journal: "Frontiers in Psychology",
        year: 2017,
        url: "https://pubmed.ncbi.nlm.nih.gov/31756711/",
        doi: "10.3389/fpsyg.2017.00874",
        studyType: "RCT" as const
      }
    }
  ];

  const [selectedTherapy, setSelectedTherapy] = useState("red-light");
  const currentTherapy = therapies.find(t => t.id === selectedTherapy);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (duration: number) => {
    setCurrentTime(duration * 60);
    setActiveTimer(selectedTherapy);
    // In real app, would implement actual countdown timer
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-3xl font-bold gradient-text">Biohacking Therapies</h1>
              <ScienceBackedIcon className="h-6 w-6" />
            </div>
            <p className="text-muted-foreground">
              Science-backed protocols with built-in timers and safety guidelines
            </p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Therapy Selector */}
          <div className="space-y-4">
            {therapies.map((therapy) => (
              <Card
                key={therapy.id}
                className={`cursor-pointer transition-colors border-l-4 ${
                  selectedTherapy === therapy.id 
                    ? "border-primary bg-primary/5" 
                    : "border-transparent hover:bg-muted/50"
                }`}
                onClick={() => setSelectedTherapy(therapy.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <therapy.icon className={`h-6 w-6 ${therapy.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{therapy.name}</h3>
                        <ScienceBackedIcon className="h-3 w-3" />
                      </div>
                      {activeTimer === therapy.id && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Running
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Therapy Details */}
          <div className="lg:col-span-3">
            {currentTherapy && (
              <>
                <Card className="mb-6">
                  <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <currentTherapy.icon className={`h-8 w-8 ${currentTherapy.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentTherapy.name}</span>
                  <ScienceBackedIcon className="h-5 w-5" />
                </div>
                <CardDescription className="mt-1">{currentTherapy.description}</CardDescription>
              </div>
            </CardTitle>
                  </CardHeader>
                  
                  {activeTimer === currentTherapy.id && (
                    <CardContent>
                      <div className="bg-muted/30 rounded-lg p-6 text-center">
                        <div className="text-4xl font-mono mb-4">{formatTime(currentTime)}</div>
                        <Progress value={(currentTime / (15 * 60)) * 100} className="mb-4" />
                        <div className="flex gap-2 justify-center">
                          <Button size="sm">
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </Button>
                          <Button size="sm" variant="outline">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                <Tabs defaultValue="protocols" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="protocols">Protocols</TabsTrigger>
                    <TabsTrigger value="benefits">Benefits</TabsTrigger>
                    <TabsTrigger value="safety">Safety</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="protocols" className="mt-6">
                    <div className="grid gap-4">
                      {currentTherapy.protocols.map((protocol, index) => (
                        <Card key={index}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold mb-1">{protocol.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Duration: {protocol.duration} minutes
                                  {protocol.distance && ` • Distance: ${protocol.distance}`}
                                  {protocol.temperature && ` • Temperature: ${protocol.temperature}`}
                                  {protocol.pattern && ` • Pattern: ${protocol.pattern}`}
                                  {protocol.cycles && ` • ${protocol.cycles}`}
                                </p>
                              </div>
                              <Button
                                onClick={() => startTimer(protocol.duration)}
                                className="flex items-center gap-2"
                              >
                                <Play className="h-4 w-4" />
                                Start
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="benefits" className="mt-6">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          Evidence-Based Benefits
                          <ScienceBackedIcon className="h-4 w-4" />
                        </h3>
                        <ul className="space-y-2 mb-6">
                          {currentTherapy.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {currentTherapy.researchCitation && (
                          <div className="mt-6 pt-4 border-t">
                            <h4 className="text-sm font-semibold mb-3">Supporting Research</h4>
                            <ResearchCitation {...currentTherapy.researchCitation} />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="safety" className="mt-6">
                    <Card className="border-destructive/20 bg-destructive/5">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          <h3 className="font-semibold text-destructive">Contraindications</h3>
                        </div>
                        <p className="text-sm mb-4">Do not use this therapy if you have:</p>
                        <ul className="space-y-1">
                          {currentTherapy.contraindications.map((contra, index) => (
                            <li key={index} className="text-sm flex items-center gap-2">
                              <div className="w-1 h-1 bg-destructive rounded-full" />
                              {contra}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-muted-foreground mt-4">
                          Always consult with your healthcare provider before beginning any new therapy protocol.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Therapies;