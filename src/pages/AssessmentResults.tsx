import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle, Info, Moon, Lightbulb, Pill } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";

interface AssessmentScore {
  overall: number;
  sleepQuality: number;
  fallAsleepTime: number;
  nightWakings: number;
  category: 'excellent' | 'good' | 'fair' | 'poor';
  primaryIssues: string[];
}

interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'routine' | 'supplement' | 'environment' | 'lifestyle';
  icon: any;
}

const AssessmentResults = () => {
  const { symptomId } = useParams<{ symptomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [score, setScore] = useState<AssessmentScore | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  useEffect(() => {
    // Get answers from URL params (passed from assessment completion)
    const answers = {
      1: searchParams.get('q1') || '',
      2: searchParams.get('q2') || '',
      3: searchParams.get('q3') || ''
    };
    
    if (symptomId === 'sleep' && answers[1]) {
      const calculatedScore = calculateSleepScore(answers);
      const personalizedRecommendations = generateRecommendations(calculatedScore, answers);
      
      setScore(calculatedScore);
      setRecommendations(personalizedRecommendations);
    }
  }, [symptomId, searchParams]);

  const calculateSleepScore = (answers: Record<string, string>): AssessmentScore => {
    let overallScore = 100;
    let sleepQualityScore = 100;
    let fallAsleepScore = 100;
    let nightWakingsScore = 100;
    const primaryIssues: string[] = [];

    // Sleep Quality Assessment (Question 1)
    switch (answers['1']) {
      case 'poor':
        sleepQualityScore = 25;
        overallScore -= 40;
        primaryIssues.push('Poor sleep quality');
        break;
      case 'fair':
        sleepQualityScore = 50;
        overallScore -= 25;
        primaryIssues.push('Inconsistent sleep quality');
        break;
      case 'good':
        sleepQualityScore = 75;
        overallScore -= 10;
        break;
      case 'excellent':
        sleepQualityScore = 100;
        break;
    }

    // Fall Asleep Time Assessment (Question 2)
    switch (answers['2']) {
      case 'very-slow':
        fallAsleepScore = 20;
        overallScore -= 30;
        primaryIssues.push('Difficulty falling asleep');
        break;
      case 'slow':
        fallAsleepScore = 50;
        overallScore -= 20;
        primaryIssues.push('Takes too long to fall asleep');
        break;
      case 'normal':
        fallAsleepScore = 80;
        overallScore -= 5;
        break;
      case 'quick':
        fallAsleepScore = 100;
        break;
    }

    // Night Wakings Assessment (Question 3)
    switch (answers['3']) {
      case 'frequently':
        nightWakingsScore = 20;
        overallScore -= 35;
        primaryIssues.push('Frequent night wakings');
        break;
      case 'often':
        nightWakingsScore = 40;
        overallScore -= 25;
        primaryIssues.push('Multiple night wakings');
        break;
      case 'sometimes':
        nightWakingsScore = 70;
        overallScore -= 15;
        primaryIssues.push('Occasional night wakings');
        break;
      case 'rarely':
        nightWakingsScore = 100;
        break;
    }

    // Determine category
    let category: 'excellent' | 'good' | 'fair' | 'poor';
    if (overallScore >= 85) category = 'excellent';
    else if (overallScore >= 70) category = 'good';
    else if (overallScore >= 50) category = 'fair';
    else category = 'poor';

    return {
      overall: Math.max(0, overallScore),
      sleepQuality: sleepQualityScore,
      fallAsleepTime: fallAsleepScore,
      nightWakings: nightWakingsScore,
      category,
      primaryIssues
    };
  };

  const generateRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    const recs: Recommendation[] = [];

    // Always include basic sleep hygiene
    recs.push({
      title: "Evening Wind-Down Routine",
      description: "Create a consistent pre-sleep routine starting 2 hours before bed. Dim lights, avoid screens, and practice relaxation techniques.",
      priority: 'high',
      category: 'routine',
      icon: Moon
    });

    // Recommendations based on specific issues
    if (answers['2'] === 'slow' || answers['2'] === 'very-slow') {
      recs.push({
        title: "Magnesium Glycinate Supplement",
        description: "Take 400-600mg of magnesium glycinate 30-60 minutes before bed to help relax muscles and support GABA production.",
        priority: 'high',
        category: 'supplement',
        icon: Pill
      });

      recs.push({
        title: "Blue Light Management",
        description: "Use blue light blocking glasses 2 hours before bed and ensure your bedroom is completely dark with blackout curtains.",
        priority: 'medium',
        category: 'environment',
        icon: Lightbulb
      });
    }

    if (answers['3'] === 'often' || answers['3'] === 'frequently') {
      recs.push({
        title: "Sleep Environment Optimization",
        description: "Keep your bedroom temperature between 65-68°F (18-20°C) and ensure it's as quiet as possible. Consider a white noise machine.",
        priority: 'high',
        category: 'environment',
        icon: Moon
      });

      recs.push({
        title: "L-Theanine for Night Wakings",
        description: "Take 200-400mg of L-Theanine 1-2 hours before bed to promote calm alertness and reduce anxiety-related wakings.",
        priority: 'medium',
        category: 'supplement',
        icon: Pill
      });
    }

    if (answers['1'] === 'poor' || answers['1'] === 'fair') {
      recs.push({
        title: "Circadian Rhythm Reset",
        description: "Get 10-15 minutes of natural sunlight within 2 hours of waking and maintain consistent sleep-wake times even on weekends.",
        priority: 'high',
        category: 'lifestyle',
        icon: Lightbulb
      });

      recs.push({
        title: "Glycine for Sleep Quality",
        description: "Take 3g of glycine 30 minutes before bed to help lower your core body temperature and improve deep sleep phases.",
        priority: 'medium',
        category: 'supplement',
        icon: Pill
      });
    }

    // Add progressive recommendations based on overall score
    if (score.overall < 60) {
      recs.push({
        title: "Sleep Restriction Therapy",
        description: "Temporarily limit time in bed to only when you're actually sleeping to improve sleep efficiency and consolidation.",
        priority: 'high',
        category: 'lifestyle',
        icon: Moon
      });
    }

    return recs.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="h-5 w-5" />;
    if (score >= 50) return <Minus className="h-5 w-5" />;
    return <TrendingDown className="h-5 w-5" />;
  };

  const getCategoryBadge = (category: string) => {
    const variants = {
      excellent: "bg-success/10 text-success border-success/20",
      good: "bg-primary/10 text-primary border-primary/20", 
      fair: "bg-warning/10 text-warning border-warning/20",
      poor: "bg-destructive/10 text-destructive border-destructive/20"
    };
    return variants[category as keyof typeof variants] || variants.fair;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium': return <Info className="h-4 w-4 text-warning" />;
      case 'low': return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!score) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading Assessment Results...</h1>
            <p className="text-muted-foreground">Analyzing your responses and generating personalized recommendations.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/sleep')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sleep Optimization
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 gradient-text">Your Sleep Assessment Results</h1>
            <p className="text-muted-foreground">
              Personalized recommendations based on your sleep patterns
            </p>
          </div>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-8 border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  {getScoreIcon(score.overall)}
                  Your Sleep Score
                </CardTitle>
                <CardDescription>Based on your assessment responses</CardDescription>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
                  {Math.round(score.overall)}
                </div>
                <Badge className={getCategoryBadge(score.category)}>
                  {score.category.charAt(0).toUpperCase() + score.category.slice(1)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Sleep Quality</span>
                  <span className="text-sm">{score.sleepQuality}%</span>
                </div>
                <Progress value={score.sleepQuality} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Fall Asleep Time</span>
                  <span className="text-sm">{score.fallAsleepTime}%</span>
                </div>
                <Progress value={score.fallAsleepTime} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Sleep Continuity</span>
                  <span className="text-sm">{score.nightWakings}%</span>
                </div>
                <Progress value={score.nightWakings} className="h-2" />
              </div>
            </div>
            
            {score.primaryIssues.length > 0 && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Primary Areas for Improvement:</h4>
                <div className="flex flex-wrap gap-2">
                  {score.primaryIssues.map((issue, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {issue}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Recommendations</TabsTrigger>
            <TabsTrigger value="routine">Routines</TabsTrigger>
            <TabsTrigger value="supplement">Supplements</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4">
              {recommendations.map((rec, index) => (
                <Card key={index} className={`${rec.priority === 'high' ? 'border-l-4 border-l-destructive' : rec.priority === 'medium' ? 'border-l-4 border-l-warning' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <rec.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{rec.title}</h3>
                          {getPriorityIcon(rec.priority)}
                          <Badge variant="outline" className="text-xs">
                            {rec.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {['routine', 'supplement', 'environment', 'lifestyle'].map(category => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid gap-4">
                {recommendations
                  .filter(rec => rec.category === category)
                  .map((rec, index) => (
                    <Card key={index} className={`${rec.priority === 'high' ? 'border-l-4 border-l-destructive' : rec.priority === 'medium' ? 'border-l-4 border-l-warning' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <rec.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{rec.title}</h3>
                              {getPriorityIcon(rec.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/sleep')}
              className="bg-primary hover:bg-primary-dark text-primary-foreground"
            >
              Explore Sleep Optimization Tools
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/symptoms')}
            >
              View All Symptoms
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Remember: These recommendations are for educational purposes only. Consult with a healthcare professional for personalized medical advice.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AssessmentResults;