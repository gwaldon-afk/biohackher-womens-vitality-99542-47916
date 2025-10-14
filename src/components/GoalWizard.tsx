import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoals } from "@/hooks/useGoals";
import { useGoalTemplates } from "@/hooks/useGoalTemplates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Target, Brain, Dumbbell, Heart, Sparkles, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

const PILLAR_ICONS = {
  brain: Brain,
  body: Dumbbell,
  balance: Heart,
  beauty: Sparkles,
};

const GoalWizard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createGoal } = useGoals();
  const { templates, loading } = useGoalTemplates();
  
  const [step, setStep] = useState(1);
  const [goalData, setGoalData] = useState({
    pillar_category: "",
    template_id: "",
    title: "",
    healthspan_target: "",
    aging_blueprint: [] as string[],
    check_in_frequency: "weekly",
    barriers_plan: [] as string[],
  });

  const handlePillarSelect = (pillar: string) => {
    setGoalData({ ...goalData, pillar_category: pillar });
    setStep(2);
  };

  const handleTemplateSelect = (template: any) => {
    setGoalData({
      ...goalData,
      template_id: template.id,
      title: template.name,
      healthspan_target: JSON.stringify(template.default_healthspan_target),
      aging_blueprint: template.default_interventions?.protocols || [],
    });
    setStep(3);
  };

  const handleCreateGoal = async () => {
    const result = await createGoal({
      pillar_category: goalData.pillar_category as any,
      template_id: goalData.template_id || null,
      title: goalData.title,
      status: "active",
      healthspan_target: JSON.parse(goalData.healthspan_target),
      aging_blueprint: { protocols: goalData.aging_blueprint },
      barriers_plan: goalData.barriers_plan.map(b => ({ barrier: b, strategy: "" })),
      longevity_metrics: {},
      check_in_frequency: goalData.check_in_frequency,
      current_progress: 0,
    });

    if (result) {
      toast({
        title: "Goal created!",
        description: "Your health goal has been created successfully.",
      });
      navigate(`/my-goals/${result.id}`);
    }
  };

  const pillarTemplates = templates.filter(t => t.pillar_category === goalData.pillar_category);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back to Goals button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate("/my-goals")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Goals
      </Button>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 4 && <div className={`flex-1 h-1 mx-2 ${s < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Choose Pillar</span>
          <span>Select Template</span>
          <span>Customize Goal</span>
          <span>Set Check-ins</span>
        </div>
      </div>

      {/* Step 1: Choose Pillar */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Choose Your Health Pillar
            </CardTitle>
            <CardDescription>
              Select which area of health you want to focus on
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {["brain", "body", "balance", "beauty"].map((pillar) => {
              const Icon = PILLAR_ICONS[pillar as keyof typeof PILLAR_ICONS];
              return (
                <Card
                  key={pillar}
                  className="cursor-pointer hover:border-primary transition-all"
                  onClick={() => handlePillarSelect(pillar)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Icon className="h-12 w-12 mb-3 text-primary" />
                    <h3 className="font-semibold text-lg capitalize">{pillar}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Template */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose a Goal Template</CardTitle>
            <CardDescription>
              Select a pre-built template or start from scratch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading templates...</p>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setGoalData({
                      ...goalData,
                      template_id: "",
                      title: "",
                      healthspan_target: JSON.stringify({ description: "" }),
                      aging_blueprint: [],
                    });
                    setStep(3);
                  }}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Start from scratch
                </Button>
                
                {pillarTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:border-primary transition-all"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                        {template.is_premium_only && (
                          <Badge variant="secondary">Premium</Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </>
            )}
            
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Customize Goal (HACK Model) */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Customize Your Goal</CardTitle>
            <CardDescription>
              Define your healthspan target and aging blueprint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* H - Healthspan Target */}
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                value={goalData.title}
                onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
                placeholder="e.g., Optimize Brain Health"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="healthspan">
                <strong>H</strong>ealthspan Target
              </Label>
              <Textarea
                id="healthspan"
                value={goalData.healthspan_target ? JSON.parse(goalData.healthspan_target).description || "" : ""}
                onChange={(e) =>
                  setGoalData({
                    ...goalData,
                    healthspan_target: JSON.stringify({ description: e.target.value }),
                  })
                }
                placeholder="What specific health outcome do you want to achieve? (e.g., Maintain cognitive sharpness and memory into my 80s)"
                rows={3}
              />
            </div>

            {/* A - Aging Blueprint */}
            <div className="space-y-2">
              <Label>
                <strong>A</strong>ging Blueprint (Interventions)
              </Label>
              <Textarea
                value={goalData.aging_blueprint.join("\n")}
                onChange={(e) =>
                  setGoalData({
                    ...goalData,
                    aging_blueprint: e.target.value.split("\n").filter(Boolean),
                  })
                }
                placeholder="List your interventions (one per line)&#10;e.g., Daily meditation&#10;Omega-3 supplementation&#10;Regular cardio exercise"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => setStep(4)} disabled={!goalData.title}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Check-ins & Barriers */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Set Up Check-ins & Plan for Barriers</CardTitle>
            <CardDescription>
              How often will you review progress and what might get in your way?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* C - Check-in Frequency */}
            <div className="space-y-3">
              <Label>
                <strong>C</strong>heck-in Frequency
              </Label>
              <RadioGroup
                value={goalData.check_in_frequency}
                onValueChange={(value) =>
                  setGoalData({ ...goalData, check_in_frequency: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly" className="font-normal">Weekly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="biweekly" id="biweekly" />
                  <Label htmlFor="biweekly" className="font-normal">Every 2 weeks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="font-normal">Monthly</Label>
                </div>
              </RadioGroup>
            </div>

            {/* K - Knowledge/Barriers */}
            <div className="space-y-2">
              <Label>
                <strong>K</strong>nowledge of Barriers
              </Label>
              <Textarea
                value={goalData.barriers_plan.join("\n")}
                onChange={(e) =>
                  setGoalData({
                    ...goalData,
                    barriers_plan: e.target.value.split("\n").filter(Boolean),
                  })
                }
                placeholder="What might prevent you from achieving this goal? (one per line)&#10;e.g., Busy work schedule&#10;Travel disruptions&#10;Lack of motivation"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleCreateGoal} disabled={!goalData.title}>
                <Check className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoalWizard;
