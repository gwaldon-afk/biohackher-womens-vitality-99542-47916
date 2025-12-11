import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertTriangle, TrendingUp, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProtocols, useMultipleProtocolItems } from '@/queries/protocolQueries';
import { useAuth } from '@/hooks/useAuth';
import { ProtocolItemRow } from '@/components/ProtocolItemRow';
import { AssessmentHistoryDialog } from './AssessmentHistoryDialog';

interface Props {
  onRetakeAssessment: () => void;
}

export function LongevityNutritionScoreCard({ onRetakeAssessment }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);

  // Fetch from correct table: longevity_nutrition_assessments
  const { data: latestAssessment, isLoading } = useQuery({
    queryKey: ['longevity-nutrition-assessment', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('longevity_nutrition_assessments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });
  
  const hasScore = !!latestAssessment?.longevity_nutrition_score;
  const assessmentDate = latestAssessment?.completed_at 
    ? new Date(latestAssessment.completed_at) 
    : latestAssessment?.created_at
    ? new Date(latestAssessment.created_at)
    : null;
  
  const isStale = assessmentDate 
    ? (Date.now() - assessmentDate.getTime()) > (90 * 24 * 60 * 60 * 1000) 
    : false;

  // Fetch nutrition-specific protocols
  const { data: protocols = [] } = useProtocols(user?.id);
  const nutritionProtocols = protocols.filter(p => p.is_active);

  // Fetch all protocol items for nutrition protocols
  const nutritionProtocolIds = nutritionProtocols.map(p => p.id);
  const { data: protocolItems = [] } = useMultipleProtocolItems(nutritionProtocolIds);

  // Group items by tier based on notes field
  const immediateItems = protocolItems.filter(item => 
    item.notes?.toLowerCase().includes('immediate')
  );
  const foundationItems = protocolItems.filter(item => 
    item.notes?.toLowerCase().includes('foundation')
  );
  const optimizationItems = protocolItems.filter(item => 
    item.notes?.toLowerCase().includes('optimization')
  );

  // Helper functions for scoring
  const getScoreGrade = (score: number): string => {
    if (score >= 90) return 'A - Optimal';
    if (score >= 80) return 'B+ - Excellent';
    if (score >= 70) return 'B - Good';
    if (score >= 60) return 'C - Fair';
    if (score >= 50) return 'D - Needs Improvement';
    return 'F - Critical Attention Needed';
  };

  const getGradeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 70) return "default";
    if (score >= 50) return "secondary";
    return "destructive";
  };

  // Calculate pillar scores from assessment data
  const calculateBodyScore = (): number => {
    if (!latestAssessment) return 0;
    return Math.round(((latestAssessment.protein_score || 0) / 5) * 100);
  };

  const calculateBrainScore = (): number => {
    if (!latestAssessment) return 0;
    return Math.round((1 - ((latestAssessment.inflammation_score || 0) / 6)) * 100);
  };

  const calculateBalanceScore = (): number => {
    if (!latestAssessment) return 0;
    const chrono = latestAssessment.eats_after_8pm ? 40 : 80;
    const craving = ((5 - (latestAssessment.craving_pattern || 3)) / 5) * 100;
    return Math.round((chrono + craving) / 2);
  };

  const calculateBeautyScore = (): number => {
    if (!latestAssessment) return 0;
    const gut = ((5 - (latestAssessment.gut_symptom_score || 0)) / 5) * 100;
    const hydration = ((latestAssessment.hydration_score || 3) / 5) * 100;
    return Math.round((gut + hydration) / 2);
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!hasScore) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Take Your Longevity Nutrition Assessment</CardTitle>
          <CardDescription>
            Get a comprehensive 0-100 nutrition score based on 15 key longevity factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetakeAssessment} size="lg" className="w-full md:w-auto">
            Take Longevity Nutrition Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  const score = latestAssessment.longevity_nutrition_score!;

  return (
    <div className="space-y-6">
      {/* Staleness Warning */}
      {isStale && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900 dark:text-amber-400">Assessment Outdated</AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            Your last assessment was completed {formatDistanceToNow(assessmentDate!)} ago. 
            We recommend retaking every 3 months to track progress.
          </AlertDescription>
        </Alert>
      )}

      {/* Score Display Card */}
      <Card className="border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Your Longevity Nutrition Score</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4" />
                Last assessed: {assessmentDate ? format(assessmentDate, 'MMMM d, yyyy') : 'Unknown'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowHistory(true)} size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Past Assessments
              </Button>
              <Button variant="outline" onClick={onRetakeAssessment} size="sm">
                Retake Assessment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Large Score Display */}
          <div className="flex items-center justify-center py-8">
            <div className="text-6xl font-bold text-primary">
              {score}
            </div>
            <div className="ml-4 text-xl text-muted-foreground">/100</div>
          </div>

          {/* Grade Badge */}
          <div className="flex justify-center mb-6">
            <Badge 
              variant={getGradeVariant(score)} 
              className="text-lg px-6 py-2"
            >
              {getScoreGrade(score)}
            </Badge>
          </div>

          {/* Pillar Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <PillarScoreCard pillar="BODY" score={calculateBodyScore()} />
            <PillarScoreCard pillar="BRAIN" score={calculateBrainScore()} />
            <PillarScoreCard pillar="BALANCE" score={calculateBalanceScore()} />
            <PillarScoreCard pillar="BEAUTY" score={calculateBeautyScore()} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <Button variant="outline" asChild className="flex-1">
              <Link to={`/longevity-nutrition/results?latest=true`}>
                View Detailed Results
              </Link>
            </Button>
            <Button variant="secondary" onClick={onRetakeAssessment} className="flex-1">
              Retake to Track Progress
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Protocol Items Display with Add to Cart */}
      {nutritionProtocols.length > 0 && protocolItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Nutrition Protocol</CardTitle>
            <CardDescription>
              Personalized supplement and nutrition recommendations based on your assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-4">
              {/* Immediate Actions Tier */}
              {immediateItems.length > 0 && (
                <AccordionItem value="immediate" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Immediate</Badge>
                      <span className="font-semibold">Start These First</span>
                      <Badge variant="secondary">{immediateItems.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    {immediateItems.map(item => (
                      <ProtocolItemRow 
                        key={item.id} 
                        item={item}
                        showBuyButton={true}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Foundation Tier */}
              {foundationItems.length > 0 && (
                <AccordionItem value="foundation" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Foundation</Badge>
                      <span className="font-semibold">Build Your Base</span>
                      <Badge variant="secondary">{foundationItems.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    {foundationItems.map(item => (
                      <ProtocolItemRow 
                        key={item.id} 
                        item={item}
                        showBuyButton={true}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Optimization Tier */}
              {optimizationItems.length > 0 && (
                <AccordionItem value="optimization" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Optimization</Badge>
                      <span className="font-semibold">Advanced Longevity</span>
                      <Badge variant="secondary">{optimizationItems.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    {optimizationItems.map(item => (
                      <ProtocolItemRow 
                        key={item.id} 
                        item={item}
                        showBuyButton={true}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>

            {/* Link to Full Protocol Page */}
            <Button variant="outline" asChild className="mt-6 w-full">
              <Link to="/my-protocol" className="flex items-center justify-center gap-2">
                View Full Protocol Details & Track Completion
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Historical Assessment Dialog */}
      <AssessmentHistoryDialog 
        open={showHistory} 
        onOpenChange={setShowHistory}
        userId={user?.id}
      />
    </div>
  );
}

// Helper component for pillar score display
function PillarScoreCard({ pillar, score }: { pillar: string; score: number }) {
  return (
    <Card className="text-center">
      <CardContent className="pt-4">
        <div className="text-sm font-semibold text-muted-foreground mb-2">{pillar}</div>
        <div className="text-3xl font-bold text-primary">{score}</div>
      </CardContent>
    </Card>
  );
}
