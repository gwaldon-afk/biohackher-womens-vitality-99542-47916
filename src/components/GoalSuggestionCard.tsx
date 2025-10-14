import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Target, 
  Pill, 
  Apple, 
  Activity, 
  Lightbulb,
  Shield,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Info,
  Edit,
  Plus
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Intervention {
  name: string;
  type: 'supplement' | 'lifestyle' | 'practice' | 'nutrition';
  dosage: string;
  reasoning: string;
  timing: string;
  priority: 'high' | 'medium' | 'low';
}

interface GoalSuggestion {
  title: string;
  pillar_category: string;
  healthspan_target: {
    metric: string;
    target_value: string;
    timeframe_days: number;
    reasoning: string;
  };
  interventions: Intervention[];
  barriers_plan: {
    common_barriers: string[];
    solutions: string[];
    support_needed: string;
  };
  check_in_frequency: string;
  biological_age_impact_predicted?: number;
  ai_reasoning: string;
}

interface GoalSuggestionCardProps {
  suggestion: GoalSuggestion;
  onCreateGoal: () => void;
  onRegenerate: () => void;
  onSuggestionUpdate?: (updatedSuggestion: GoalSuggestion) => void;
  onAddToolkitItems?: () => void;
}

const INTERVENTION_ICONS = {
  supplement: Pill,
  lifestyle: Activity,
  practice: Lightbulb,
  nutrition: Apple,
};

const PRIORITY_COLORS = {
  high: 'bg-red-500/10 text-red-700 dark:text-red-400',
  medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  low: 'bg-green-500/10 text-green-700 dark:text-green-400',
};

export function GoalSuggestionCard({ 
  suggestion, 
  onCreateGoal, 
  onRegenerate,
  onSuggestionUpdate,
  onAddToolkitItems 
}: GoalSuggestionCardProps) {
  const [editingTarget, setEditingTarget] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(suggestion.title);
  const [tempTarget, setTempTarget] = useState(suggestion.healthspan_target);

  const handleTitleSave = () => {
    if (onSuggestionUpdate) {
      onSuggestionUpdate({ ...suggestion, title: tempTitle });
    }
    setEditingTitle(false);
  };

  const handleTargetSave = () => {
    if (onSuggestionUpdate) {
      onSuggestionUpdate({ 
        ...suggestion, 
        healthspan_target: tempTarget 
      });
    }
    setEditingTarget(false);
  };

  return (
    <Card className="border-2">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Dialog open={editingTitle} onOpenChange={setEditingTitle}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                    <CardTitle className="text-2xl hover:text-primary transition-colors">
                      {suggestion.title}
                    </CardTitle>
                    <Edit className="h-4 w-4 ml-2 text-muted-foreground" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Goal Title</DialogTitle>
                    <DialogDescription>
                      Make this goal title more personal to you
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Goal Title</Label>
                      <Input 
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        placeholder="Enter goal title"
                      />
                    </div>
                    <Button onClick={handleTitleSave} className="w-full">
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Badge variant="secondary" className="capitalize">
                {suggestion.pillar_category}
              </Badge>
            </div>
            <CardDescription className="text-base">
              {suggestion.ai_reasoning}
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-sm">This plan was generated using AI analysis of your health profile and evidence-based research.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Healthspan Target */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Your Target</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{suggestion.healthspan_target.reasoning}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Dialog open={editingTarget} onOpenChange={setEditingTarget}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Target</DialogTitle>
                  <DialogDescription>
                    Adjust your goal target to match your preferences
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Metric</Label>
                    <Input 
                      value={tempTarget.metric}
                      onChange={(e) => setTempTarget({ ...tempTarget, metric: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Target Value</Label>
                    <Input 
                      value={tempTarget.target_value}
                      onChange={(e) => setTempTarget({ ...tempTarget, target_value: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Timeframe (days)</Label>
                    <Input 
                      type="number"
                      value={tempTarget.timeframe_days}
                      onChange={(e) => setTempTarget({ ...tempTarget, timeframe_days: parseInt(e.target.value) })}
                    />
                  </div>
                  <Button onClick={handleTargetSave} className="w-full">
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-primary">
                  {suggestion.healthspan_target.target_value}
                </span>
                <span className="text-muted-foreground">{suggestion.healthspan_target.metric}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                within {suggestion.healthspan_target.timeframe_days} days
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Interventions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Your Action Plan</h3>
            </div>
            {onAddToolkitItems && (
              <Button variant="outline" size="sm" onClick={onAddToolkitItems}>
                <Plus className="h-4 w-4 mr-2" />
                Add from Toolkit
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {suggestion.interventions.map((intervention, index) => {
              const Icon = INTERVENTION_ICONS[intervention.type];
              return (
                <Card key={index} className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-1">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold">{intervention.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {intervention.dosage} • {intervention.timing}
                            </p>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={PRIORITY_COLORS[intervention.priority]}
                          >
                            {intervention.priority} priority
                          </Badge>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-start gap-2 text-sm text-muted-foreground cursor-help hover:text-foreground transition-colors">
                                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                <p className="line-clamp-2">{intervention.reasoning}</p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-sm">
                              <p className="text-sm">{intervention.reasoning}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Barriers & Solutions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Staying on Track</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-orange-500/5 border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-base">Common Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {suggestion.barriers_plan.common_barriers.map((barrier, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{barrier}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-green-500/5 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-base">Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {suggestion.barriers_plan.solutions.map((solution, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{solution}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Check-in Frequency */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Check-in Schedule</p>
              <p className="text-sm text-muted-foreground capitalize">
                {suggestion.check_in_frequency} progress tracking
              </p>
            </div>
          </div>
          {suggestion.biological_age_impact_predicted && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Predicted Impact</p>
              <p className="font-semibold text-primary">
                {suggestion.biological_age_impact_predicted > 0 ? '+' : ''}
                {suggestion.biological_age_impact_predicted} years
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button onClick={onCreateGoal} className="flex-1" size="lg">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Create This Goal
          </Button>
          <Button onClick={onRegenerate} variant="outline" size="lg">
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
