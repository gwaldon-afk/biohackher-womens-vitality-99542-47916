import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoals } from "@/hooks/useGoals";
import { useGoalTemplates } from "@/hooks/useGoalTemplates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Heart, Scale, Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type Pillar = "brain" | "body" | "balance" | "beauty";

interface SelectedGoal {
  templateId?: string;
  pillar: Pillar;
  title: string;
  description: string;
  isCustom: boolean;
}

const pillarConfig = {
  brain: { 
    icon: Brain, 
    color: "bg-purple-500", 
    gradient: "from-purple-500 to-purple-600",
    label: "Brain",
    description: "Cognitive health, mental clarity, learning"
  },
  body: { 
    icon: Heart, 
    color: "bg-green-500", 
    gradient: "from-green-500 to-emerald-600",
    label: "Body",
    description: "Physical fitness, strength, vitality"
  },
  balance: { 
    icon: Scale, 
    color: "bg-blue-500", 
    gradient: "from-blue-500 to-cyan-600",
    label: "Balance",
    description: "Stress, sleep, emotional wellbeing"
  },
  beauty: { 
    icon: Sparkles, 
    color: "bg-pink-500", 
    gradient: "from-pink-500 to-rose-600",
    label: "Beauty",
    description: "Skin, hair, aging, radiance"
  },
};

export const GoalDiscoveryWizard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createGoals, loading } = useGoals();
  const { templates } = useGoalTemplates();
  
  const [step, setStep] = useState(1);
  const [selectedPillars, setSelectedPillars] = useState<Pillar[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<SelectedGoal[]>([]);
  const [customGoalInput, setCustomGoalInput] = useState({ title: "", description: "" });

  const togglePillar = (pillar: Pillar) => {
    setSelectedPillars(prev => 
      prev.includes(pillar) 
        ? prev.filter(p => p !== pillar)
        : [...prev, pillar]
    );
  };

  const addTemplateGoal = (templateId: string, pillar: Pillar) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const goal: SelectedGoal = {
      templateId,
      pillar,
      title: template.name,
      description: template.description,
      isCustom: false,
    };

    setSelectedGoals(prev => [...prev, goal]);
  };

  const addCustomGoal = (pillar: Pillar) => {
    if (!customGoalInput.title.trim()) {
      toast.error("Please enter a goal title");
      return;
    }

    const goal: SelectedGoal = {
      pillar,
      title: customGoalInput.title,
      description: customGoalInput.description,
      isCustom: true,
    };

    setSelectedGoals(prev => [...prev, goal]);
    setCustomGoalInput({ title: "", description: "" });
  };

  const removeGoal = (index: number) => {
    setSelectedGoals(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinish = async () => {
    if (selectedGoals.length === 0) {
      toast.error("Please select at least one goal");
      return;
    }

    const goalData = selectedGoals.map(goal => ({
      title: goal.title,
      pillar_category: goal.pillar,
      template_id: goal.templateId || null,
      status: 'active' as const,
      current_progress: 0,
      check_in_frequency: 'weekly',
      healthspan_target: { description: goal.description },
      aging_blueprint: {},
      barriers_plan: {},
      longevity_metrics: {},
      related_assessment_ids: [],
    }));

    const success = await createGoals(goalData);
    if (success) {
      toast.success(`${selectedGoals.length} goals created successfully!`);
      navigate("/goals-dashboard");
    }
  };

  const currentPillar = selectedPillars[step - 2];
  const pillarTemplates = templates.filter(t => t.pillar_category === currentPillar);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of {selectedPillars.length + 2}</span>
            <span className="text-sm text-muted-foreground">{selectedGoals.length} goals selected</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(step / (selectedPillars.length + 2)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-4xl mb-2">Let's Design Your Longevity Roadmap</CardTitle>
                  <CardDescription className="text-lg">
                    Select the areas of health you want to focus on, and we'll help you create personalized goals.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 mt-6">
                    {(Object.keys(pillarConfig) as Pillar[]).map((pillar) => {
                      const config = pillarConfig[pillar];
                      const Icon = config.icon;
                      const isSelected = selectedPillars.includes(pillar);

                      return (
                        <Card
                          key={pillar}
                          className={`cursor-pointer transition-all ${
                            isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                          }`}
                          onClick={() => togglePillar(pillar)}
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg bg-gradient-to-br ${config.gradient}`}>
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">{config.label}</h3>
                                <p className="text-sm text-muted-foreground">{config.description}</p>
                              </div>
                              {isSelected && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="flex justify-between mt-8">
                    <Button variant="ghost" onClick={() => navigate("/goals-dashboard")}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => setStep(2)}
                      disabled={selectedPillars.length === 0}
                    >
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Steps 2+: Goal Selection per Pillar */}
          {step > 1 && step <= selectedPillars.length + 1 && (
            <motion.div
              key={`pillar-${currentPillar}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    {(() => {
                      const Icon = pillarConfig[currentPillar].icon;
                      return <Icon className="h-8 w-8 text-primary" />;
                    })()}
                    <CardTitle className="text-3xl">{pillarConfig[currentPillar].label} Goals</CardTitle>
                  </div>
                  <CardDescription>
                    Choose from our expert-designed goals or create your own
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Template Goals */}
                  <div className="grid gap-3">
                    {pillarTemplates.map((template) => {
                      const alreadySelected = selectedGoals.some(g => g.templateId === template.id);
                      
                      return (
                        <Card 
                          key={template.id}
                          className={alreadySelected ? 'bg-muted/50' : ''}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{template.name}</h4>
                                <p className="text-sm text-muted-foreground">{template.description}</p>
                              </div>
                              <Button
                                size="sm"
                                variant={alreadySelected ? "secondary" : "default"}
                                onClick={() => addTemplateGoal(template.id, currentPillar)}
                                disabled={alreadySelected}
                              >
                                {alreadySelected ? "Added" : "Add"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Custom Goal */}
                  <Card className="border-dashed">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-3">Create Custom Goal</h4>
                      <div className="space-y-3">
                        <Input
                          placeholder="Goal title..."
                          value={customGoalInput.title}
                          onChange={(e) => setCustomGoalInput(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <Textarea
                          placeholder="Description (optional)..."
                          value={customGoalInput.description}
                          onChange={(e) => setCustomGoalInput(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => addCustomGoal(currentPillar)}
                        >
                          Add Custom Goal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Navigation */}
                  <div className="flex justify-between mt-6">
                    <Button variant="ghost" onClick={() => setStep(step - 1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button onClick={() => setStep(step + 1)}>
                      {step === selectedPillars.length + 1 ? "Review" : "Next Pillar"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Final Step: Review & Confirm */}
          {step === selectedPillars.length + 2 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">Review Your Goals</CardTitle>
                  <CardDescription>
                    {selectedGoals.length} goals ready to create
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {selectedGoals.map((goal, index) => {
                      const config = pillarConfig[goal.pillar];
                      const Icon = config.icon;

                      return (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient}`}>
                                  <Icon className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold">{goal.title}</h4>
                                    {goal.isCustom && <Badge variant="secondary" className="text-xs">Custom</Badge>}
                                  </div>
                                  {goal.description && (
                                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeGoal(index)}
                              >
                                Remove
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="flex justify-between">
                    <Button variant="ghost" onClick={() => setStep(step - 1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button 
                      onClick={handleFinish}
                      disabled={loading || selectedGoals.length === 0}
                    >
                      {loading ? "Creating..." : `Create ${selectedGoals.length} Goals`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
