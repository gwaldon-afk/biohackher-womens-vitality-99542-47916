import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, TrendingUp, Snowflake, Dumbbell, Heart, Moon, ChevronDown } from "lucide-react";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import ResearchCitation from "@/components/ResearchCitation";
import { getResearchByStage } from "@/data/cycleCoachingResearch";

const Coaching = () => {
  const [currentStage, setCurrentStage] = useState("follicular");
  const [currentDay, setCurrentDay] = useState(12);

  const cycleStages = {
    follicular: {
      name: "Follicular Phase",
      days: "1-14",
      hormone: "Estrogen ↗️",
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200"
    },
    ovulatory: {
      name: "Ovulatory Phase", 
      days: "12-16",
      hormone: "LH Peak 🏔️",
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200"
    },
    luteal: {
      name: "Luteal Phase",
      days: "15-28", 
      hormone: "Progesterone ↗️",
      color: "text-purple-600",
      bgColor: "bg-purple-50 border-purple-200"
    },
    menstrual: {
      name: "Menstrual Phase",
      days: "1-5",
      hormone: "All hormones ↘️", 
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-200"
    },
    perimenopause: {
      name: "Perimenopause",
      days: "Variable cycles",
      hormone: "Fluctuating hormones 🌊",
      color: "text-orange-600", 
      bgColor: "bg-orange-50 border-orange-200"
    },
    menopause: {
      name: "Menopause/Post",
      days: "No cycles",
      hormone: "Low estrogen & progesterone",
      color: "text-teal-600",
      bgColor: "bg-teal-50 border-teal-200"
    }
  };

  const recommendations = {
    follicular: {
      training: [
        "High-intensity workouts (HIIT, sprints)",
        "Heavy strength training (1-5 reps)",
        "New skill acquisition",
        "Plyometric exercises"
      ],
      recovery: [
        "Active recovery days with light movement", 
        "Dynamic stretching and mobility work",
        "Moderate cold exposure (2-3 min)"
      ],
      nutrition: [
        "Higher carb intake to fuel workouts",
        "Iron-rich foods during menstruation",
        "Anti-inflammatory foods"
      ],
      biohacking: [
        "Intermittent fasting (16:8) well-tolerated",
        "Cold therapy for recovery",
        "Red light therapy for energy"
      ]
    },
    luteal: {
      training: [
        "Moderate intensity workouts", 
        "Strength training (6-12 reps)",
        "Yoga and pilates",
        "Swimming or walking"
      ],
      recovery: [
        "Prioritize sleep (8-9 hours)",
        "Gentle stretching and massage",
        "Warm baths with magnesium"
      ],
      nutrition: [
        "Complex carbs for mood stability",
        "Magnesium-rich foods", 
        "Omega-3 fatty acids",
        "Reduce caffeine if sensitive"
      ],
      biohacking: [
        "Avoid aggressive fasting",
        "Gentle sauna sessions",
        "Breathwork for stress management",
        "Blue light management crucial"
      ]
    },
    perimenopause: {
      training: [
        "Strength training 3-4x/week (essential)", 
        "High-intensity intervals 2x/week max",
        "Resistance bands and bodyweight",
        "Balance and coordination work"
      ],
      recovery: [
        "Prioritize sleep quality over quantity",
        "Stress management is critical",
        "Regular massage or self-massage"
      ],
      nutrition: [
        "Protein: 1.6-2g/kg body weight",
        "Phytoestrogen foods (soy, flax)",
        "Calcium and vitamin D",
        "Limit alcohol and refined sugars"
      ],
      biohacking: [
        "Careful with fasting (12-14h max)",
        "Cold exposure in small doses",
        "HRV training for resilience",
        "Consistent meal timing"
      ]
    },
    menopause: {
      training: [
        "Progressive strength training (non-negotiable)",
        "Weight-bearing exercises for bones", 
        "Functional movement patterns",
        "Low-impact cardio"
      ],
      recovery: [
        "Active recovery essential",
        "Heat therapy (sauna, hot yoga)",
        "Mindfulness and meditation"
      ],
      nutrition: [
        "High protein (2g/kg minimum)",
        "Collagen support nutrients",
        "Heart-healthy fats",
        "Bone-supporting nutrients"
      ],
      biohacking: [
        "Avoid prolonged fasting",
        "Gentle cold exposure",
        "Consistent circadian rhythm",
        "HRT consideration discussion"
      ]
    }
  };

  const currentStageData = cycleStages[currentStage as keyof typeof cycleStages];
  const currentRecommendations = recommendations[currentStage as keyof typeof recommendations];
  const stageResearch = getResearchByStage(currentStage);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold gradient-text">Cycle-Aware Coaching</h1>
            <ScienceBackedIcon className="h-6 w-6" />
          </div>
          <p className="text-muted-foreground text-center">
            Optimise your training, recovery, and nutrition based on your hormonal stage
          </p>
        </div>

        {/* Stage Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Object.entries(cycleStages).map(([key, stage]) => (
            <Card
              key={key}
              className={`cursor-pointer transition-colors ${
                currentStage === key 
                  ? stage.bgColor 
                  : "hover:bg-muted/50"
              }`}
              onClick={() => setCurrentStage(key)}
            >
              <CardContent className="p-4 text-center">
                <h3 className={`font-medium text-sm ${stage.color}`}>{stage.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{stage.days}</p>
                <p className="text-xs mt-1">{stage.hormone}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Stage Overview */}
        <Card className={`mb-8 ${currentStageData.bgColor}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={`text-2xl ${currentStageData.color}`}>
                  {currentStageData.name}
                </CardTitle>
                <CardDescription>
                  Day {currentDay} • {currentStageData.hormone}
                </CardDescription>
              </div>
              <Badge variant="outline" className={currentStageData.color}>
                Current Phase
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Recommendations Tabs */}
        <Tabs defaultValue="training" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Training
            </TabsTrigger>
            <TabsTrigger value="recovery" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Recovery
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Nutrition
            </TabsTrigger>
            <TabsTrigger value="biohacking" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Biohacking
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="training" className="mt-6">
            <Card>
              <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Training Recommendations
                <ScienceBackedIcon className="h-4 w-4" />
              </CardTitle>
                <CardDescription>
                  Optimise your workouts based on your current hormonal state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentRecommendations?.training?.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button className="w-full md:w-auto">
                    <Calendar className="h-4 w-4 mr-2" />
                    Plan This Week's Workouts
                  </Button>
                </div>

                {stageResearch && stageResearch.training.length > 0 && (
                  <Collapsible className="mt-6">
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                      <ChevronDown className="h-4 w-4" />
                      View Supporting Research ({stageResearch.training.length} studies)
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-3">
                      {stageResearch.training.map((study, index) => (
                        <ResearchCitation
                          key={index}
                          title={study.title}
                          journal={study.journal}
                          year={study.year}
                          url={study.url}
                          doi={study.doi}
                          studyType={study.studyType}
                          sampleSize={study.sampleSize}
                        />
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recovery" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Recovery Protocols
                </CardTitle>
                <CardDescription>
                  Support your body's natural recovery processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentRecommendations?.recovery?.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                {stageResearch && stageResearch.recovery.length > 0 && (
                  <Collapsible className="mt-6">
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                      <ChevronDown className="h-4 w-4" />
                      View Supporting Research ({stageResearch.recovery.length} studies)
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-3">
                      {stageResearch.recovery.map((study, index) => (
                        <ResearchCitation
                          key={index}
                          title={study.title}
                          journal={study.journal}
                          year={study.year}
                          url={study.url}
                          doi={study.doi}
                          studyType={study.studyType}
                          sampleSize={study.sampleSize}
                        />
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="nutrition" className="mt-6">
            <Card>
              <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Nutrition Focus
                <ScienceBackedIcon className="h-4 w-4" />
              </CardTitle>
                <CardDescription>
                  Eat to support your hormonal phase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentRecommendations?.nutrition?.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                {stageResearch && stageResearch.nutrition.length > 0 && (
                  <Collapsible className="mt-6">
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                      <ChevronDown className="h-4 w-4" />
                      View Supporting Research ({stageResearch.nutrition.length} studies)
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-3">
                      {stageResearch.nutrition.map((study, index) => (
                        <ResearchCitation
                          key={index}
                          title={study.title}
                          journal={study.journal}
                          year={study.year}
                          url={study.url}
                          doi={study.doi}
                          studyType={study.studyType}
                          sampleSize={study.sampleSize}
                        />
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="biohacking" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Biohacking Protocols
                </CardTitle>
                <CardDescription>
                  Advanced interventions tailored to your cycle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentRecommendations?.biohacking?.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                {stageResearch && stageResearch.biohacking.length > 0 && (
                  <Collapsible className="mt-6">
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                      <ChevronDown className="h-4 w-4" />
                      View Supporting Research ({stageResearch.biohacking.length} studies)
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-3">
                      {stageResearch.biohacking.map((study, index) => (
                        <ResearchCitation
                          key={index}
                          title={study.title}
                          journal={study.journal}
                          year={study.year}
                          url={study.url}
                          doi={study.doi}
                          studyType={study.studyType}
                          sampleSize={study.sampleSize}
                        />
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Moon className="h-5 w-5" />
            Log Cycle Day
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Snowflake className="h-5 w-5" />
            Start Cold Therapy
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Dumbbell className="h-5 w-5" />
            Today's Workout
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Coaching;