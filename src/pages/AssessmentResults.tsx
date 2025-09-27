import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle, Info, Moon, Lightbulb, Pill, Heart, Thermometer, Bone, Brain, Battery, Scale, Scissors, Shield, Calendar, Zap, ChevronDown, ShoppingCart } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  analysis?: string;
  improvement?: string;
  timeline?: string;
}

const AssessmentResults = () => {
  const { symptomId } = useParams<{ symptomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [score, setScore] = useState<AssessmentScore | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
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
      
      // Save assessment to database
      saveAssessment(answers, calculatedScore, personalizedRecommendations);
    }
  }, [symptomId, searchParams]);

  const saveAssessment = async (
    answers: Record<string, string>, 
    calculatedScore: AssessmentScore, 
    personalizedRecommendations: Recommendation[]
  ) => {
    if (!user || !symptomId || isSaving) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('symptom_assessments')
      .insert([{
        user_id: user.id,
        symptom_type: symptomId,
        answers,
        overall_score: calculatedScore.overall,
        score_category: calculatedScore.category,
        primary_issues: calculatedScore.primaryIssues,
        detail_scores: calculatedScore.detailScores || {},
        recommendations: personalizedRecommendations.map(rec => ({
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          category: rec.category
        }))
      }]);

      if (error) {
        console.error('Error saving assessment:', error);
        toast({
          variant: "destructive",
          title: "Save Error",
          description: "Failed to save your assessment results."
        });
      } else {
        console.log('Assessment saved successfully');
      }
    } catch (error) {
      console.error('Unexpected error saving assessment:', error);
    } finally {
      setIsSaving(false);
    }
  };

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
      icon: Moon,
      analysis: `Based on your sleep quality rating of "${answers['1']}", establishing a consistent bedtime routine is crucial for signaling to your body that it's time to sleep. Your current sleep patterns suggest that your circadian rhythm may need reinforcement.`,
      improvement: "Start with just 30 minutes of routine and gradually extend to 2 hours. Track your sleep onset time to measure improvement.",
      timeline: "Expect to see improvements in sleep onset within 2-3 weeks of consistent practice"
    });

    if (answers['2'] === 'slow' || answers['2'] === 'very-slow') {
      recs.push({
        title: "Magnesium Glycinate Supplement",
        description: "Take 400-600mg of magnesium glycinate 30-60 minutes before bed to help relax muscles and support GABA production.",
        priority: 'high',
        category: 'supplement',
        icon: Pill,
        analysis: `Your reported difficulty falling asleep ("${answers['2']}") indicates potential magnesium deficiency, which affects muscle relaxation and neurotransmitter balance. Magnesium glycinate is the most bioavailable form for sleep support.`,
        improvement: "Start with 200mg and gradually increase to 400-600mg based on tolerance. Take with a small amount of food to prevent stomach upset.",
        timeline: "Most people notice improved sleep onset within 1-2 weeks of consistent use"
      });

      recs.push({
        title: "Blue Light Management",
        description: "Use blue light blocking glasses 2 hours before bed and ensure your bedroom is completely dark with blackout curtains.",
        priority: 'medium',
        category: 'environment',
        icon: Lightbulb,
        analysis: "Blue light exposure suppresses melatonin production by up to 85%, directly impacting your ability to fall asleep quickly. Your slow sleep onset suggests circadian rhythm disruption.",
        improvement: "Install blue light filtering apps on devices, use amber glasses after sunset, and create a dark sleep environment with blackout curtains or eye masks.",
        timeline: "Melatonin production improvements can be seen within 3-5 days of consistent blue light management"
      });
    }

    if (answers['3'] === 'often' || answers['3'] === 'frequently') {
      recs.push({
        title: "Sleep Environment Optimization",
        description: "Keep your bedroom temperature between 65-68°F (18-20°C) and ensure it's as quiet as possible. Consider a white noise machine.",
        priority: 'high',
        category: 'environment',
        icon: Moon,
        analysis: `Your frequent night wakings ("${answers['3']}") suggest sleep architecture disruption. Temperature fluctuations and noise disturbances are primary causes of sleep fragmentation.`,
        improvement: "Invest in a programmable thermostat, blackout curtains, and white noise machine. Track wake-ups to identify patterns and triggers.",
        timeline: "Sleep continuity improvements typically occur within 1-2 weeks of environmental optimization"
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
      icon: Thermometer,
      analysis: `Your hot flash frequency indicates hormonal fluctuations affecting your body's temperature regulation. Quick cooling strategies can reduce episode intensity by 40-60%.`,
      improvement: "Create a cooling kit with portable fan, cooling towels, and breathable clothing. Practice deep breathing during episodes to activate parasympathetic response.",
      timeline: "Immediate relief during episodes, with overall episode intensity reducing over 2-4 weeks of consistent management"
    });

    if (answers['2'] === 'severe' || answers['2'] === 'extreme') {
      recs.push({
        title: "Black Cohosh Supplement",
        description: "Consider 40-80mg daily of standardized black cohosh extract, which has shown effectiveness for hot flash reduction.",
        priority: 'high',
        category: 'supplement',
        icon: Pill,
        analysis: `Given your severe hot flash intensity ("${answers['2']}"), research shows black cohosh can reduce frequency by 50-75% through its phytoestrogenic effects on hormone receptors.`,
        improvement: "Start with 40mg daily and increase to 80mg if needed. Take with meals to improve absorption and reduce stomach upset.",
        timeline: "Significant improvements typically seen within 4-8 weeks of consistent use"
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
      icon: Pill,
      analysis: `Your joint pain pattern suggests chronic inflammation. Curcumin can reduce inflammatory markers by 40-60%, while omega-3s help resolve inflammation at the cellular level.`,
      improvement: "Take curcumin with meals and black pepper (piperine) for 20x better absorption. Choose high-quality fish oil with EPA:DHA ratio of 2:1.",
      timeline: "Initial pain reduction within 2-3 weeks, with significant improvements in joint mobility after 6-8 weeks"
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
      icon: Pill,
      analysis: `Your digestive symptoms indicate potential enzyme insufficiency, which affects 30-40% of adults. Poor digestion leads to nutrient malabsorption and inflammation.`,
      improvement: "Take enzymes 15-20 minutes before meals. Choose a formula with protease, lipase, and amylase. Start with smaller meals to reduce digestive burden.",
      timeline: "Digestive comfort improvements within 1-2 weeks, with better nutrient absorption noticeable in 4-6 weeks"
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

  const getOptimalTargets = (symptomId: string): string[] => {
    switch (symptomId) {
      case 'sleep':
        return [
          'Fall asleep within 10-20 minutes consistently',
          'Sleep 7-9 hours uninterrupted per night',
          'Wake up feeling refreshed 90% of mornings',
          'Maintain consistent sleep/wake times within 30 minutes',
          'Achieve 20-25% deep sleep and 20-25% REM sleep'
        ];
      case 'hot-flashes':
        return [
          'Reduce episodes to less than 2 mild flashes per week',
          'Episode intensity rated 2/10 or lower',
          'No night-time disruptions to sleep',
          'Episodes lasting less than 2 minutes',
          'Complete confidence in social/work situations'
        ];
      case 'joint-pain':
        return [
          'Morning stiffness lasting less than 15 minutes',
          'Pain levels consistently below 3/10',
          'Full range of motion in affected joints',
          'Ability to exercise 4-5 times per week pain-free',
          'No activity limitations due to joint discomfort'
        ];
      case 'gut':
        return [
          'Regular, comfortable bowel movements daily',
          'No bloating or gas after meals',
          'Sustained energy 2-4 hours post-meal',
          'Ability to digest all food groups comfortably',
          'Stable digestive patterns regardless of stress'
        ];
      default:
        return [
          'Symptoms occur less than 10% of the time',
          'Minimal impact on daily activities and quality of life',
          'Consistent management through lifestyle strategies',
          'High confidence in symptom control'
        ];
    }
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

        {/* Personalized Analysis Summary */}
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Personalized Health Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background/80 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-primary">What Your Assessment Reveals</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on your responses, your {getSymptomName(symptomId!).toLowerCase()} issues show a pattern that affects 
                    {score.category === 'poor' ? ' your daily quality of life significantly' : 
                     score.category === 'fair' ? ' your wellbeing moderately' : 
                     score.category === 'good' ? ' you occasionally' : ' you minimally'}. 
                    The primary areas we've identified can be addressed through targeted interventions.
                  </p>
                </div>
                <div className="bg-background/80 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-success">Your Improvement Potential</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {score.category === 'poor' ? 'With focused intervention, you can expect 60-80% improvement in symptoms within 8-12 weeks.' :
                     score.category === 'fair' ? 'Your symptoms are very manageable - expect 70-90% improvement within 4-8 weeks.' :
                     score.category === 'good' ? 'Fine-tuning your approach can bring you to optimal health within 2-6 weeks.' :
                     'You\'re doing great! Small optimizations can perfect your health within 2-4 weeks.'}
                  </p>
                  <div className="bg-success/10 p-3 rounded-lg">
                    <h5 className="text-sm font-semibold text-success mb-1">Optimal Target Goals:</h5>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {getOptimalTargets(symptomId!).map((target, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-success" />
                          <span>{target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {score.primaryIssues.length > 0 && (
                <div className="bg-warning/5 border border-warning/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-warning">Priority Focus Areas</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your assessment identified {score.primaryIssues.length} key area{score.primaryIssues.length > 1 ? 's' : ''} that will have the biggest impact on your health when addressed:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {score.primaryIssues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="text-sm">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
        <div className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {/* All Recommendations Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center p-4 h-auto min-h-[80px] bg-background hover:bg-muted">
                  <span className="font-medium">All</span>
                  <span className="text-xs text-muted-foreground mt-1 text-center leading-tight">Complete approach</span>
                  <ChevronDown className="h-4 w-4 mt-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto bg-background border shadow-lg z-50">
                {recommendations.map((rec, index) => (
                  <DropdownMenuItem key={index} className="flex items-start gap-3 p-4 hover:bg-muted">
                    <rec.icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Routines Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center p-4 h-auto min-h-[80px] bg-background hover:bg-muted">
                  <span className="font-medium">Routines</span>
                  <span className="text-xs text-muted-foreground mt-1 text-center leading-tight">Wind-down practices</span>
                  <ChevronDown className="h-4 w-4 mt-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto bg-background border shadow-lg z-50">
                {recommendations.filter(rec => rec.category === 'routine').map((rec, index) => (
                  <DropdownMenuItem key={index} className="flex items-start gap-3 p-4 hover:bg-muted">
                    <rec.icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Supplements Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center p-4 h-auto min-h-[80px] bg-background hover:bg-muted">
                  <span className="font-medium">Supplements</span>
                  <span className="text-xs text-muted-foreground mt-1 text-center leading-tight">Natural support</span>
                  <ChevronDown className="h-4 w-4 mt-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto bg-background border shadow-lg z-50">
                {recommendations.filter(rec => rec.category === 'supplement').map((rec, index) => (
                  <DropdownMenuItem key={index} className="flex items-start gap-3 p-4 hover:bg-muted">
                    <rec.icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Diet Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center p-4 h-auto min-h-[80px] bg-background hover:bg-muted">
                  <span className="font-medium">Diet</span>
                  <span className="text-xs text-muted-foreground mt-1 text-center leading-tight">Sleep-friendly foods</span>
                  <ChevronDown className="h-4 w-4 mt-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto bg-background border shadow-lg z-50">
                {recommendations.filter(rec => rec.category === 'diet').map((rec, index) => (
                  <DropdownMenuItem key={index} className="flex items-start gap-3 p-4 hover:bg-muted">
                    <rec.icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Lifestyle Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center p-4 h-auto min-h-[80px] bg-background hover:bg-muted">
                  <span className="font-medium">Lifestyle</span>
                  <span className="text-xs text-muted-foreground mt-1 text-center leading-tight">Daily habits</span>
                  <ChevronDown className="h-4 w-4 mt-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto bg-background border shadow-lg z-50">
                {recommendations.filter(rec => rec.category === 'lifestyle').map((rec, index) => (
                  <DropdownMenuItem key={index} className="flex items-start gap-3 p-4 hover:bg-muted">
                    <rec.icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Therapy Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center p-4 h-auto min-h-[80px] bg-background hover:bg-muted">
                  <span className="font-medium">Therapy</span>
                  <span className="text-xs text-muted-foreground mt-1 text-center leading-tight">Relaxation techniques</span>
                  <ChevronDown className="h-4 w-4 mt-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto bg-background border shadow-lg z-50">
                {recommendations.filter(rec => rec.category === 'therapy').map((rec, index) => (
                  <DropdownMenuItem key={index} className="flex items-start gap-3 p-4 hover:bg-muted">
                    <rec.icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Educational Knowledge Section */}
        <Card className="mb-8 bg-gradient-to-r from-secondary/5 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Understanding Your {getSymptomName(symptomId!)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Knowledge Content Based on Symptom Type */}
              {symptomId === 'sleep' && (
                <div className="space-y-4">
                  <div className="bg-background/80 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-primary">Sleep Science Fundamentals</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Quality sleep occurs in 90-120 minute cycles, alternating between light sleep, deep sleep, and REM sleep. 
                      Deep sleep (20-25% of total) is crucial for physical recovery and immune function, while REM sleep (20-25%) 
                      consolidates memories and supports emotional regulation.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-success/10 p-3 rounded-lg">
                        <h5 className="text-sm font-semibold text-success mb-1">Optimal Sleep Architecture:</h5>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• 10-20 minutes to fall asleep</li>
                          <li>• 20-25% deep sleep (stages 3-4)</li>
                          <li>• 20-25% REM sleep</li>
                          <li>• Less than 5% awake time</li>
                        </ul>
                      </div>
                      <div className="bg-warning/10 p-3 rounded-lg">
                        <h5 className="text-sm font-semibold text-warning mb-1">Common Sleep Disruptors:</h5>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Blue light exposure after sunset</li>
                          <li>• Temperature above 68°F (20°C)</li>
                          <li>• Caffeine within 8 hours of bedtime</li>
                          <li>• Alcohol consumption (disrupts REM)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-background/80 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-primary">Circadian Rhythm Optimization</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your circadian rhythm is controlled by light exposure and controls melatonin production. Bright light in the morning 
                      and darkness at night help maintain healthy sleep-wake cycles.
                    </p>
                    <div className="bg-primary/5 p-3 rounded-lg">
                      <h5 className="text-sm font-semibold text-primary mb-1">Evidence-Based Sleep Hygiene:</h5>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Get 10-15 minutes of morning sunlight within 1 hour of waking</li>
                        <li>• Maintain consistent sleep/wake times (±30 minutes)</li>
                        <li>• Keep bedroom temperature between 65-68°F (18-20°C)</li>
                        <li>• Use blackout curtains or eye mask for complete darkness</li>
                        <li>• Stop eating 3 hours before bedtime</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {symptomId === 'hot-flashes' && (
                <div className="space-y-4">
                  <div className="bg-background/80 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-primary">Hormone Changes & Hot Flashes</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Hot flashes occur when declining estrogen levels affect the hypothalamus, your body's temperature control center. 
                      This triggers sudden dilation of blood vessels, causing the characteristic warmth, sweating, and flushing.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-success/10 p-3 rounded-lg">
                        <h5 className="text-sm font-semibold text-success mb-1">Natural Estrogen Support:</h5>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Phytoestrogens (soy, flax, legumes)</li>
                          <li>• Black cohosh (40-80mg daily)</li>
                          <li>• Red clover isoflavones</li>
                          <li>• Evening primrose oil</li>
                        </ul>
                      </div>
                      <div className="bg-warning/10 p-3 rounded-lg">
                        <h5 className="text-sm font-semibold text-warning mb-1">Common Triggers to Avoid:</h5>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Spicy foods and hot beverages</li>
                          <li>• Alcohol and caffeine</li>
                          <li>• Stress and tight clothing</li>
                          <li>• Hot environments and saunas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {symptomId === 'joint-pain' && (
                <div className="space-y-4">
                  <div className="bg-background/80 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-primary">Joint Health & Inflammation</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Joint pain often results from chronic low-grade inflammation that breaks down cartilage and synovial fluid. 
                      Hormonal changes during perimenopause can increase inflammatory markers like IL-6 and TNF-alpha.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-success/10 p-3 rounded-lg">
                        <h5 className="text-sm font-semibold text-success mb-1">Anti-Inflammatory Protocol:</h5>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Curcumin 500-1000mg with bioperine</li>
                          <li>• Omega-3 fatty acids 2-3g daily</li>
                          <li>• Tart cherry juice (natural COX-2 inhibitor)</li>
                          <li>• Boswellia serrata extract</li>
                        </ul>
                      </div>
                      <div className="bg-warning/10 p-3 rounded-lg">
                        <h5 className="text-sm font-semibold text-warning mb-1">Pro-Inflammatory Foods:</h5>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Processed foods and trans fats</li>
                          <li>• Refined sugars and carbohydrates</li>
                          <li>• Vegetable oils (corn, soy, sunflower)</li>
                          <li>• Excessive omega-6 fatty acids</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {symptomId === 'gut' && (
                <div className="space-y-4">
                  <div className="bg-background/80 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-primary">Gut Health & Microbiome</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your gut microbiome contains 100 trillion bacteria that influence digestion, immunity, and even mood through 
                      the gut-brain axis. Hormonal changes can disrupt this delicate ecosystem, leading to digestive symptoms.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-success/10 p-3 rounded-lg">
                        <h5 className="text-sm font-semibold text-success mb-1">Microbiome Support:</h5>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Diverse fiber sources (20-30g daily)</li>
                          <li>• Fermented foods (kefir, kimchi, sauerkraut)</li>
                          <li>• Multi-strain probiotics (50+ billion CFU)</li>
                          <li>• Prebiotic foods (garlic, onions, chicory)</li>
                        </ul>
                      </div>
                      <div className="bg-warning/10 p-3 rounded-lg">
                        <h5 className="text-sm font-semibold text-warning mb-1">Gut Disruptors:</h5>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Artificial sweeteners and emulsifiers</li>
                          <li>• Chronic stress and poor sleep</li>
                          <li>• Antibiotics and NSAIDs</li>
                          <li>• Ultra-processed foods</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-primary/5 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-primary">Evidence-Based Lifestyle Medicine</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Research shows that 80% of chronic health conditions can be prevented or improved through lifestyle interventions. 
                  The key is implementing evidence-based strategies consistently over time.
                </p>
                <Button 
                  onClick={() => navigate('/shop')}
                  className="bg-primary hover:bg-primary-dark text-primary-foreground"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Shop Evidence-Based Solutions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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