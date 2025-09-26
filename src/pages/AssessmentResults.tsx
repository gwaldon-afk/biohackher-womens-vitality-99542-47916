import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle, Info, Moon, Lightbulb, Pill, Heart, Thermometer, Bone, Brain, Battery, Scale, Scissors, Shield, Calendar, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";

interface AssessmentScore {
  overall: number;
  category: 'excellent' | 'good' | 'fair' | 'poor';
  primaryIssues: string[];
  detailScores?: Record<string, number>;
}

interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'routine' | 'supplement' | 'environment' | 'lifestyle' | 'diet' | 'therapy';
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
    const answers: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('q')) {
        const questionNum = key.substring(1);
        answers[questionNum] = value;
      }
    });
    
    if (symptomId && Object.keys(answers).length > 0) {
      const calculatedScore = calculateScore(symptomId, answers);
      const personalizedRecommendations = generateRecommendations(symptomId, calculatedScore, answers);
      
      setScore(calculatedScore);
      setRecommendations(personalizedRecommendations);
    }
  }, [symptomId, searchParams]);

  const getSymptomName = (id: string) => {
    const nameMap: Record<string, string> = {
      "hot-flashes": "Hot Flashes",
      "sleep": "Sleep Issues",
      "joint-pain": "Joint Pain",
      "brain-fog": "Brain Fog",
      "energy-levels": "Low Energy",
      "bloating": "Bloating",
      "weight-changes": "Weight Changes",
      "hair-thinning": "Hair Thinning",
      "anxiety": "Anxiety",
      "irregular-periods": "Irregular Periods",
      "headaches": "Headaches",
      "night-sweats": "Night Sweats",
      "memory-issues": "Memory Issues",
      "gut": "Gut Health"
    };
    return nameMap[id] || id;
  };

  const calculateScore = (symptomType: string, answers: Record<string, string>): AssessmentScore => {
    switch (symptomType) {
      case 'sleep':
        return calculateSleepScore(answers);
      case 'hot-flashes':
        return calculateHotFlashesScore(answers);
      case 'joint-pain':
        return calculateJointPainScore(answers);
      case 'gut':
        return calculateGutScore(answers);
      default:
        return calculateGenericScore(answers);
    }
  };

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

    let category: 'excellent' | 'good' | 'fair' | 'poor';
    if (overallScore >= 85) category = 'excellent';
    else if (overallScore >= 70) category = 'good';
    else if (overallScore >= 50) category = 'fair';
    else category = 'poor';

    return {
      overall: Math.max(0, overallScore),
      category,
      primaryIssues,
      detailScores: {
        'Sleep Quality': sleepQualityScore,
        'Fall Asleep Time': fallAsleepScore,
        'Sleep Continuity': nightWakingsScore
      }
    };
  };

  const calculateHotFlashesScore = (answers: Record<string, string>): AssessmentScore => {
    let overallScore = 100;
    const primaryIssues: string[] = [];

    // Frequency (Question 1)
    switch (answers['1']) {
      case 'frequent':
        overallScore -= 40;
        primaryIssues.push('Very frequent hot flashes');
        break;
      case 'daily':
        overallScore -= 30;
        primaryIssues.push('Daily hot flashes');
        break;
      case 'weekly':
        overallScore -= 15;
        primaryIssues.push('Weekly hot flashes');
        break;
      case 'rare':
        overallScore -= 5;
        break;
    }

    // Severity (Question 2)
    switch (answers['2']) {
      case 'extreme':
        overallScore -= 35;
        primaryIssues.push('Severe intensity');
        break;
      case 'severe':
        overallScore -= 25;
        primaryIssues.push('High intensity');
        break;
      case 'moderate':
        overallScore -= 15;
        primaryIssues.push('Moderate intensity');
        break;
      case 'mild':
        overallScore -= 5;
        break;
    }

    // Timing patterns (Question 3)
    if (answers['3'] === 'night') {
      primaryIssues.push('Night-time hot flashes disrupting sleep');
    } else if (answers['3'] === 'triggers') {
      primaryIssues.push('Trigger-based hot flashes');
    }

    let category: 'excellent' | 'good' | 'fair' | 'poor';
    if (overallScore >= 85) category = 'excellent';
    else if (overallScore >= 70) category = 'good';
    else if (overallScore >= 50) category = 'fair';
    else category = 'poor';

    return {
      overall: Math.max(0, overallScore),
      category,
      primaryIssues
    };
  };

  const calculateJointPainScore = (answers: Record<string, string>): AssessmentScore => {
    let overallScore = 100;
    const primaryIssues: string[] = [];

    // Location affects mobility impact
    if (answers['1'] === 'multiple') {
      overallScore -= 25;
      primaryIssues.push('Multiple joint involvement');
    } else if (answers['1'] === 'hips') {
      overallScore -= 20;
      primaryIssues.push('Hip joint pain affecting mobility');
    } else if (answers['1'] === 'knees') {
      overallScore -= 15;
      primaryIssues.push('Knee pain affecting movement');
    } else if (answers['1'] === 'hands') {
      overallScore -= 10;
      primaryIssues.push('Hand joint pain affecting daily tasks');
    }

    // Pain intensity (Question 2)
    switch (answers['2']) {
      case 'extreme':
        overallScore -= 40;
        primaryIssues.push('Severe pain intensity');
        break;
      case 'severe':
        overallScore -= 30;
        primaryIssues.push('High pain intensity');
        break;
      case 'moderate':
        overallScore -= 20;
        primaryIssues.push('Moderate pain levels');
        break;
      case 'mild':
        overallScore -= 10;
        break;
    }

    let category: 'excellent' | 'good' | 'fair' | 'poor';
    if (overallScore >= 85) category = 'excellent';
    else if (overallScore >= 70) category = 'good';
    else if (overallScore >= 50) category = 'fair';
    else category = 'poor';

    return {
      overall: Math.max(0, overallScore),
      category,
      primaryIssues
    };
  };

  const calculateGutScore = (answers: Record<string, string>): AssessmentScore => {
    let overallScore = 100;
    const primaryIssues: string[] = [];

    // Frequency (Question 1)
    switch (answers['1']) {
      case 'frequent':
        overallScore -= 35;
        primaryIssues.push('Daily digestive issues');
        break;
      case 'daily':
        overallScore -= 25;
        primaryIssues.push('Regular digestive discomfort');
        break;
      case 'weekly':
        overallScore -= 15;
        primaryIssues.push('Weekly digestive symptoms');
        break;
      case 'rare':
        overallScore -= 5;
        break;
    }

    // Symptom type (Question 2)
    switch (answers['2']) {
      case 'pain':
        overallScore -= 25;
        primaryIssues.push('Abdominal pain and cramping');
        break;
      case 'bloating':
        overallScore -= 20;
        primaryIssues.push('Bloating and gas issues');
        break;
      case 'diarrhea':
        overallScore -= 25;
        primaryIssues.push('Loose stools and diarrhea');
        break;
      case 'constipation':
        overallScore -= 20;
        primaryIssues.push('Constipation issues');
        break;
      case 'reflux':
        overallScore -= 15;
        primaryIssues.push('Acid reflux and heartburn');
        break;
    }

    // Energy after meals (Question 3)
    switch (answers['3']) {
      case 'exhausted':
        overallScore -= 20;
        primaryIssues.push('Severe post-meal fatigue');
        break;
      case 'tired':
        overallScore -= 15;
        primaryIssues.push('Post-meal energy dips');
        break;
      case 'neutral':
        overallScore -= 5;
        break;
      case 'energized':
        break;
    }

    // Overall comfort (Question 5)
    switch (answers['5']) {
      case 'poor':
        overallScore -= 25;
        primaryIssues.push('Poor overall digestive comfort');
        break;
      case 'moderate':
        overallScore -= 15;
        primaryIssues.push('Moderate digestive discomfort');
        break;
      case 'good':
        break;
    }

    let category: 'excellent' | 'good' | 'fair' | 'poor';
    if (overallScore >= 85) category = 'excellent';
    else if (overallScore >= 70) category = 'good';
    else if (overallScore >= 50) category = 'fair';
    else category = 'poor';

    return {
      overall: Math.max(0, overallScore),
      category,
      primaryIssues
    };
  };

  const calculateGenericScore = (answers: Record<string, string>): AssessmentScore => {
    // Generic scoring for symptoms without specific logic yet
    let overallScore = 75; // Default moderate score
    const primaryIssues = ['Assessment completed'];

    let category: 'excellent' | 'good' | 'fair' | 'poor';
    if (overallScore >= 85) category = 'excellent';
    else if (overallScore >= 70) category = 'good';
    else if (overallScore >= 50) category = 'fair';
    else category = 'poor';

    return {
      overall: overallScore,
      category,
      primaryIssues
    };
  };

  const generateRecommendations = (symptomType: string, score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    switch (symptomType) {
      case 'sleep':
        return generateSleepRecommendations(score, answers);
      case 'hot-flashes':
        return generateHotFlashesRecommendations(score, answers);
      case 'joint-pain':
        return generateJointPainRecommendations(score, answers);
      case 'gut':
        return generateGutRecommendations(score, answers);
      default:
        return generateGenericRecommendations(symptomType, score);
    }
  };

  const generateSleepRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    const recs: Recommendation[] = [];

    recs.push({
      title: "Evening Wind-Down Routine",
      description: "Create a consistent pre-sleep routine starting 2 hours before bed. Dim lights, avoid screens, and practice relaxation techniques.",
      priority: 'high',
      category: 'routine',
      icon: Moon
    });

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
    }

    return recs;
  };

  const generateHotFlashesRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    const recs: Recommendation[] = [];

    recs.push({
      title: "Cooling Techniques",
      description: "Keep a portable fan nearby, dress in breathable layers, and use cooling towels or cooling pads during episodes.",
      priority: 'high',
      category: 'lifestyle',
      icon: Thermometer
    });

    if (answers['2'] === 'severe' || answers['2'] === 'extreme') {
      recs.push({
        title: "Black Cohosh Supplement",
        description: "Consider 40-80mg daily of standardized black cohosh extract, which has shown effectiveness for hot flash reduction.",
        priority: 'high',
        category: 'supplement',
        icon: Pill
      });

      recs.push({
        title: "Hormone Balance Support",
        description: "Include phytoestrogen-rich foods like soy, flax seeds, and legumes. Consider consulting about bioidentical hormone options.",
        priority: 'medium',
        category: 'diet',
        icon: Heart
      });
    }

    if (answers['3'] === 'night') {
      recs.push({
        title: "Night-time Environment Setup",
        description: "Use moisture-wicking sleepwear, cooling mattress pads, and keep room temperature cool (65-68°F).",
        priority: 'high',
        category: 'environment',
        icon: Moon
      });
    }

    return recs;
  };

  const generateJointPainRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    const recs: Recommendation[] = [];

    recs.push({
      title: "Anti-Inflammatory Protocol",
      description: "Incorporate turmeric (curcumin) 500-1000mg daily with black pepper for absorption. Add omega-3 fatty acids 2-3g daily.",
      priority: 'high',
      category: 'supplement',
      icon: Pill
    });

    if (answers['2'] === 'severe' || answers['2'] === 'extreme') {
      recs.push({
        title: "Gentle Movement Therapy",
        description: "Start with low-impact exercises like water therapy, tai chi, or gentle yoga to maintain joint mobility without strain.",
        priority: 'high',
        category: 'therapy',
        icon: Heart
      });

      recs.push({
        title: "Heat and Cold Therapy",
        description: "Alternate between warm compresses (15 min) and cold therapy (10 min) to reduce inflammation and pain.",
        priority: 'medium',
        category: 'therapy',
        icon: Thermometer
      });
    }

    if (answers['1'] === 'multiple') {
      recs.push({
        title: "Systemic Anti-Inflammatory Diet",
        description: "Eliminate processed foods, sugar, and inflammatory oils. Focus on Mediterranean diet rich in antioxidants and omega-3s.",
        priority: 'high',
        category: 'diet',
        icon: Heart
      });
    }

    return recs;
  };

  const generateGutRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    const recs: Recommendation[] = [];

    recs.push({
      title: "Digestive Enzyme Support",
      description: "Take broad-spectrum digestive enzymes with meals to improve breakdown and absorption of nutrients.",
      priority: 'high',
      category: 'supplement',
      icon: Pill
    });

    if (answers['2'] === 'bloating') {
      recs.push({
        title: "FODMAP Elimination Protocol",
        description: "Try a low-FODMAP diet for 2-4 weeks to identify trigger foods, then systematically reintroduce to find your tolerance levels.",
        priority: 'high',
        category: 'diet',
        icon: Heart
      });
    }

    if (answers['2'] === 'constipation') {
      recs.push({
        title: "Fiber and Hydration Protocol",
        description: "Increase soluble fiber gradually, drink 8-10 glasses of water daily, and consider magnesium oxide 400-600mg at bedtime.",
        priority: 'high',
        category: 'lifestyle',
        icon: Heart
      });
    }

    if (answers['3'] === 'exhausted' || answers['3'] === 'tired') {
      recs.push({
        title: "Gut-Brain Axis Support",
        description: "Include probiotic-rich foods and consider a high-quality multi-strain probiotic (50+ billion CFU) to support gut-brain communication.",
        priority: 'medium',
        category: 'supplement',
        icon: Brain
      });
    }

    return recs;
  };

  const generateGenericRecommendations = (symptomType: string, score: AssessmentScore): Recommendation[] => {
    return [
      {
        title: "Comprehensive Assessment Complete",
        description: "Your symptom assessment has been recorded. Consider consulting with a healthcare professional for personalized treatment options.",
        priority: 'medium',
        category: 'lifestyle',
        icon: CheckCircle2
      },
      {
        title: "Holistic Wellness Approach",
        description: "Focus on sleep quality, stress management, regular exercise, and anti-inflammatory nutrition to support overall health.",
        priority: 'medium',
        category: 'lifestyle',
        icon: Heart
      }
    ];
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
            onClick={() => navigate('/symptoms')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Symptoms
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 gradient-text">
              {getSymptomName(symptomId!)} Assessment Results
            </h1>
            <p className="text-muted-foreground">
              Personalized recommendations based on your assessment
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
                  Your Assessment Score
                </CardTitle>
                <CardDescription>Based on your responses</CardDescription>
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
            {score.detailScores && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {Object.entries(score.detailScores).map(([category, scoreValue]) => (
                  <div key={category}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm">{scoreValue}%</span>
                    </div>
                    <Progress value={scoreValue} className="h-2" />
                  </div>
                ))}
              </div>
            )}
            
            {score.primaryIssues.length > 0 && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Key Areas Identified:</h4>
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="routine">Routines</TabsTrigger>
            <TabsTrigger value="supplement">Supplements</TabsTrigger>
            <TabsTrigger value="diet">Diet</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            <TabsTrigger value="therapy">Therapy</TabsTrigger>
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
          
          {['routine', 'supplement', 'diet', 'lifestyle', 'therapy'].map(category => (
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
              onClick={() => {
                // Navigate to relevant biohacking page based on symptom type
                if (symptomId === 'sleep') navigate('/sleep');
                else if (symptomId === 'gut' || symptomId === 'bloating') navigate('/supplements');
                else navigate('/therapies');
              }}
              className="bg-primary hover:bg-primary-dark text-primary-foreground"
            >
              Explore Related Biohacking Tools
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