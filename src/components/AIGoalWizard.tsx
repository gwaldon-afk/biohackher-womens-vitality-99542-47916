import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoals } from "@/hooks/useGoals";
import { useAuth } from "@/hooks/useAuth";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Sparkles, Loader2, Brain, Zap, Heart, Flower2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GoalSuggestionCard } from "./GoalSuggestionCard";
import { AIGoalChat } from "./AIGoalChat";
import { ToolkitSelectionDialog } from "./ToolkitSelectionDialog";
import { ToolkitItemWithCategory } from "@/services/toolkitService";

const PILLAR_OPTIONS = [
  { value: 'brain', label: 'Brain', icon: Brain, description: 'Cognitive health, focus, memory' },
  { value: 'body', label: 'Body', icon: Zap, description: 'Physical fitness, strength, vitality' },
  { value: 'balance', label: 'Balance', icon: Heart, description: 'Stress, sleep, hormones' },
  { value: 'beauty', label: 'Beauty', icon: Flower2, description: 'Skin, hair, longevity markers' },
];

const GOAL_EXAMPLES = [
  { text: "I want to improve my sleep quality and wake up feeling refreshed", pillar: "balance" },
  { text: "I need more energy throughout the day without relying on caffeine", pillar: "body" },
  { text: "I want to improve my focus and mental clarity for work", pillar: "brain" },
  { text: "I want to reduce visible signs of aging and improve skin health", pillar: "beauty" },
];

export default function AIGoalWizard() {
  const navigate = useNavigate();
  const { createGoal } = useGoals();
  const { user } = useAuth();
  const { profile } = useHealthProfile();
  const { toast } = useToast();

  const [step, setStep] = useState<'input' | 'generating' | 'suggestion'>("input");
  const [goalDescription, setGoalDescription] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<string>("");
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToolkitDialog, setShowToolkitDialog] = useState(false);

  const handleExampleClick = (example: typeof GOAL_EXAMPLES[0]) => {
    setGoalDescription(example.text);
    setSelectedPillar(example.pillar);
  };

  const handleGenerateSuggestion = async () => {
    if (!goalDescription.trim()) {
      toast({
        title: "Description required",
        description: "Please describe your health goal",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPillar) {
      toast({
        title: "Pillar required",
        description: "Please select a health pillar",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setStep("generating");

    try {
      const { data, error } = await supabase.functions.invoke('generate-goal-suggestions', {
        body: {
          goalDescription,
          pillar: selectedPillar,
          userProfile: profile,
          assessmentData: null, // Could fetch recent assessment data here
        },
      });

      if (error) throw error;

      console.log('AI Suggestion:', data.suggestion);
      setAiSuggestion(data.suggestion);
      setStep("suggestion");
    } catch (error: any) {
      console.error('Error generating goal:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Could not generate goal suggestion. Please try again.",
        variant: "destructive",
      });
      setStep("input");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!aiSuggestion) return;

    const goalData = {
      title: aiSuggestion.title,
      pillar_category: aiSuggestion.pillar_category,
      status: 'active' as const,
      healthspan_target: aiSuggestion.healthspan_target,
      aging_blueprint: {
        interventions: aiSuggestion.interventions,
      },
      barriers_plan: aiSuggestion.barriers_plan,
      check_in_frequency: aiSuggestion.check_in_frequency,
      ai_optimization_plan: aiSuggestion.ai_reasoning,
      biological_age_impact_predicted: aiSuggestion.biological_age_impact_predicted,
      current_progress: 0,
      next_check_in_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const result = await createGoal(goalData);
    if (result) {
      navigate(`/my-goals/${result.id}`);
    }
  };

  const handleRegenerate = () => {
    setStep("input");
    setAiSuggestion(null);
  };

  const handleSuggestionUpdate = (updatedSuggestion: any) => {
    setAiSuggestion(updatedSuggestion);
  };

  const handleToolkitItemsSelected = (items: ToolkitItemWithCategory[]) => {
    // Convert toolkit items to interventions format
    const newInterventions = items.map(item => ({
      name: item.name,
      type: item.category.name.toLowerCase().includes('supplement') ? 'supplement' : 
            item.category.name.toLowerCase().includes('nutrition') ? 'nutrition' : 'lifestyle',
      dosage: item.protocols?.[0]?.dosage || 'As recommended',
      reasoning: item.description,
      timing: item.protocols?.[0]?.timing || 'Daily',
      priority: 'medium' as const,
    }));

    setAiSuggestion({
      ...aiSuggestion,
      interventions: [...aiSuggestion.interventions, ...newInterventions],
    });

    toast({
      title: "Interventions added",
      description: `Added ${items.length} item${items.length !== 1 ? 's' : ''} to your goal`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/my-goals")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Goals
      </Button>

      {step === "input" && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Create Your Health Goal</h1>
            <p className="text-muted-foreground">
              Tell me what you want to achieve, and I'll create a personalized plan with evidence-based interventions
            </p>
          </div>

          {/* Goal Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Start Examples</CardTitle>
              <CardDescription>Click any example to get started</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GOAL_EXAMPLES.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-3 px-4 text-left justify-start whitespace-normal"
                  onClick={() => handleExampleClick(example)}
                >
                  <span className="text-sm">{example.text}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Goal Description Input */}
          <Card>
            <CardHeader>
              <CardTitle>What's your health goal?</CardTitle>
              <CardDescription>
                Describe what you want to achieve in your own words. Be as specific as you like.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="Example: I want to improve my sleep quality because I've been waking up feeling tired..."
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label>Which health pillar does this relate to?</Label>
                <RadioGroup value={selectedPillar} onValueChange={setSelectedPillar}>
                  {PILLAR_OPTIONS.map((pillar) => {
                    const Icon = pillar.icon;
                    return (
                      <div key={pillar.value} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value={pillar.value} id={pillar.value} />
                        <Label 
                          htmlFor={pillar.value} 
                          className="flex items-start gap-3 flex-1 cursor-pointer"
                        >
                          <Icon className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-semibold">{pillar.label}</div>
                            <div className="text-sm text-muted-foreground">{pillar.description}</div>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              <Button 
                onClick={handleGenerateSuggestion} 
                className="w-full"
                size="lg"
                disabled={!goalDescription.trim() || !selectedPillar}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate My Personalized Plan
              </Button>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>Powered by AI • Evidence-based recommendations • Personalized to your health profile</p>
          </div>
        </div>
      )}

      {step === "generating" && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Creating Your Personalized Plan</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Analyzing your health profile and generating evidence-based interventions tailored to your goal...
          </p>
        </div>
      )}

      {step === "suggestion" && aiSuggestion && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Your Personalized Health Plan</h1>
            <p className="text-muted-foreground">
              Review your AI-generated goal and interventions below
            </p>
          </div>

          <GoalSuggestionCard 
            suggestion={aiSuggestion}
            onCreateGoal={handleCreateGoal}
            onRegenerate={handleRegenerate}
            onSuggestionUpdate={handleSuggestionUpdate}
            onAddToolkitItems={() => setShowToolkitDialog(true)}
          />

          <AIGoalChat 
            currentSuggestion={aiSuggestion}
            onSuggestionUpdate={handleSuggestionUpdate}
          />

          <ToolkitSelectionDialog
            open={showToolkitDialog}
            onOpenChange={setShowToolkitDialog}
            pillarFilter={selectedPillar}
            onItemsSelected={handleToolkitItemsSelected}
          />
        </div>
      )}
    </div>
  );
}
