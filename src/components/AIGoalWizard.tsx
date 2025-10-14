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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Sparkles, Loader2, Brain, Zap, Heart, Flower2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GoalSuggestionCard } from "./GoalSuggestionCard";
import { GoalReframeCard } from "./GoalReframeCard";
import { AIGoalChat } from "./AIGoalChat";
import { ToolkitSelectionDialog } from "./ToolkitSelectionDialog";
import { ToolkitItemWithCategory } from "@/services/toolkitService";
import { HACKProtocolInfo } from "./HACKProtocolInfo";

type WizardStep = 'input' | 'generating-reframe' | 'reframe-review' | 'generating-plan' | 'suggestion';

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

  const [step, setStep] = useState<WizardStep>("input");
  const [goalDescription, setGoalDescription] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<string>("");
  const [goalReframe, setGoalReframe] = useState<any>(null);
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

    setIsGenerating(true);
    setStep("generating-reframe");

    try {
      // Stage 1: Generate just the reframed goal
      const { data, error } = await supabase.functions.invoke('generate-goal-suggestions', {
        body: {
          goalDescription,
          pillar: selectedPillar,
          userProfile: profile,
          assessmentData: null,
          stage: 'reframe'
        },
      });

      if (error) throw error;

      console.log('Goal Reframe:', data.suggestion);
      setGoalReframe(data.suggestion);
      setStep("reframe-review");
      toast({
        title: "Goal reframed!",
        description: "Review and continue to generate your full plan",
      });
    } catch (error: any) {
      console.error('Error generating reframe:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Could not reframe goal. Please try again.",
        variant: "destructive",
      });
      setStep("input");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptReframe = async () => {
    if (!goalReframe) return;

    setIsGenerating(true);
    setStep("generating-plan");

    try {
      // Stage 2: Generate full plan
      const { data, error } = await supabase.functions.invoke('generate-goal-suggestions', {
        body: {
          goalDescription: `${goalReframe.title}. ${goalReframe.description}`,
          pillar: goalReframe.pillar,
          userProfile: profile,
          assessmentData: null,
          stage: 'expand'
        },
      });

      if (error) throw error;

      console.log('Full Plan:', data.suggestion);
      setAiSuggestion(data.suggestion);
      setStep("suggestion");
      toast({
        title: "Plan ready!",
        description: "Your personalized HACK Protocol plan is complete",
      });
    } catch (error: any) {
      console.error('Error generating full plan:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Could not generate full plan. Please try again.",
        variant: "destructive",
      });
      setStep("reframe-review");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateReframe = () => {
    setGoalReframe(null);
    setStep("input");
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
    setGoalReframe(null);
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
              Tell me what you want to achieve, and I'll create a personalized plan using the HACK Protocol
            </p>
          </div>

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
                <p className="text-sm text-muted-foreground mt-2">
                  The AI will automatically analyze and assign the relevant health pillar(s) for your goal.
                </p>
              </div>

              <Button
                onClick={handleGenerateSuggestion} 
                className="w-full"
                size="lg"
                disabled={!goalDescription.trim()}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Review Goal and Generate My Personalised Plan
              </Button>
            </CardContent>
          </Card>

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

          {/* HACK Protocol Info - Collapsible */}
          <Collapsible>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">What is the HACK Protocol?</CardTitle>
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <HACKProtocolInfo />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <div className="text-center text-sm text-muted-foreground">
            <p>Powered by AI • Evidence-based recommendations • Personalized to your health profile</p>
          </div>
        </div>
      )}

      {step === "generating-reframe" && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Reframing Your Goal</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Using the HACK Protocol framework to structure your health goal...
          </p>
        </div>
      )}

      {step === "reframe-review" && goalReframe && (
        <GoalReframeCard
          reframe={goalReframe}
          onAccept={handleAcceptReframe}
          onRegenerate={handleRegenerateReframe}
          isLoading={isGenerating}
        />
      )}

      {step === "generating-plan" && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Generating Your Full Plan</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Creating detailed interventions, barriers analysis, and check-in schedule...
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
