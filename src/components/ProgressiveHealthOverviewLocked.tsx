import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProgressiveHealthOverviewLockedProps {
  assessmentCount: number;
  onCreateProfile: () => void;
  onContinueWithout?: () => void;
}

export const ProgressiveHealthOverviewLocked = ({
  assessmentCount,
  onCreateProfile,
  onContinueWithout
}: ProgressiveHealthOverviewLockedProps) => {
  return (
    <Card className="border-primary/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Unlock Your Complete Health Analysis
            </CardTitle>
            <CardDescription className="mt-2">
              {assessmentCount} assessments completed - Your detailed insights are ready!
            </CardDescription>
          </div>
          <Badge variant="default" className="shrink-0">
            Premium Feature
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Blurred Preview */}
        <div className="relative">
          <div className="h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center border border-primary/20 backdrop-blur-sm">
            <div className="text-center space-y-3">
              <div className="w-32 h-32 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <BarChart3 className="h-16 w-16 text-primary/40" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                6-Category Health Radar Chart
              </p>
            </div>
          </div>
          
          {/* Lock Overlay */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Lock className="h-12 w-12 text-primary mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                Create your free profile to unlock
              </p>
            </div>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Create your free profile to unlock:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <div className="bg-primary/10 p-2 rounded-md shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">AI-Powered Pattern Detection</h4>
                <p className="text-xs text-muted-foreground">
                  See hidden connections between your symptoms
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <div className="bg-primary/10 p-2 rounded-md shrink-0">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">6-Category Health Radar</h4>
                <p className="text-xs text-muted-foreground">
                  Visual breakdown across all health categories
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <div className="bg-primary/10 p-2 rounded-md shrink-0">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Track Progress Over Time</h4>
                <p className="text-xs text-muted-foreground">
                  Monitor improvements and identify trends
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <div className="bg-primary/10 p-2 rounded-md shrink-0">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Personalized Priority List</h4>
                <p className="text-xs text-muted-foreground">
                  AI-recommended actions for maximum impact
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-4">
          <Button 
            onClick={onCreateProfile} 
            size="lg" 
            className="w-full"
          >
            <Lock className="mr-2 h-4 w-4" />
            Create Free Profile & Save Results
          </Button>
          
          {onContinueWithout && (
            <Button 
              variant="ghost" 
              onClick={onContinueWithout}
              className="w-full text-muted-foreground"
            >
              Continue without saving (results will be lost)
            </Button>
          )}
        </div>

        {/* Trust Indicator */}
        <p className="text-xs text-center text-muted-foreground">
          Free forever · No credit card required · Your data stays private
        </p>
      </CardContent>
    </Card>
  );
};
