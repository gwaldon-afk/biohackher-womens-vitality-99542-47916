import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle, Info, Moon, Lightbulb, Pill, Heart, Thermometer, Bone, Brain, Battery, Scale, Scissors, Shield, Calendar, Zap, ChevronDown, ShoppingCart, Droplets, Target, Activity, Sparkles, TestTube } from "lucide-react";
import Navigation from "@/components/Navigation";
import ProtocolCard from "@/components/ProtocolCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { matchProductsToAssessment, calculateBundlePrice } from "@/utils/productMatcher";
import { useCart } from "@/hooks/useCart";

interface AssessmentScore {
  overall: number;
  category: 'excellent' | 'good' | 'fair' | 'poor';
  primaryIssues: string[];
  detailScores?: Record<string, number>;
}

interface SupplementInfo {
  name: string;
  dosage: string;
  price?: string;
  selected: boolean;
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
  supplements?: SupplementInfo[];
  personalisedAssessment?: string;
}

const AssessmentResults = () => {
  const { symptomId } = useParams<{ symptomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [score, setScore] = useState<AssessmentScore | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRecommendationCategory, setSelectedRecommendationCategory] = useState("all");
  const [isSaving, setIsSaving] = useState(false);
  const [supplementSelections, setSupplementSelections] = useState<Record<number, SupplementInfo[]>>({});
  const { addToCart } = useCart();
  
  // Get product recommendations based on assessment
  const productRecommendations = score ? matchProductsToAssessment(symptomId || '', score.overall) : [];
  const bundlePricing = calculateBundlePrice(productRecommendations);

  const handleSupplementToggle = (recIndex: number, suppIndex: number) => {
    setSupplementSelections(prev => {
      const updated = { ...prev };
      if (!updated[recIndex]) {
        updated[recIndex] = [...(recommendations[recIndex]?.supplements || [])];
      }
      updated[recIndex][suppIndex].selected = !updated[recIndex][suppIndex].selected;
      return updated;
    });
  };

  const handleAddAllToCart = (recIndex: number) => {
    const supplements = supplementSelections[recIndex] || recommendations[recIndex]?.supplements || [];
    const selectedSupplements = supplements.filter(s => s.selected);
    
    if (selectedSupplements.length === 0) {
      toast({
        variant: "destructive",
        title: "No supplements selected",
        description: "Please select at least one supplement to add to cart."
      });
      return;
    }

    toast({
      title: "Added to Cart",
      description: `${selectedSupplements.length} supplement(s) added to your cart.`
    });
    
    // Here you would typically integrate with your e-commerce system
    console.log('Adding to cart:', selectedSupplements);
  };

  const getCurrentSupplements = (recIndex: number): SupplementInfo[] => {
    return supplementSelections[recIndex] || recommendations[recIndex]?.supplements || [];
  };
  
  useEffect(() => {
    const answers: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('q')) {
        const questionNum = key.substring(1);
        answers[questionNum] = value;
      }
    });
    
    if (symptomId && Object.keys(answers).length > 0) {
      // New assessment with answers in URL
      const calculatedScore = calculateScore(symptomId, answers);
      const personalisedRecommendations = generateRecommendations(symptomId, calculatedScore, answers);
      
      setScore(calculatedScore);
      setRecommendations(personalisedRecommendations);
      
      // Initialize supplement selections
      const initialSelections: Record<number, SupplementInfo[]> = {};
      personalisedRecommendations.forEach((rec, index) => {
        if (rec.category === 'supplement' && rec.supplements) {
          initialSelections[index] = [...rec.supplements];
        }
      });
      setSupplementSelections(initialSelections);
      
      // Save assessment to database
      saveAssessment(answers, calculatedScore, personalisedRecommendations);
    } else if (symptomId && user) {
      // Load existing assessment from database
      loadExistingAssessment();
    }
  }, [symptomId, searchParams, user]);

  const loadExistingAssessment = async () => {
    if (!user || !symptomId) return;
    
    try {
      const { data, error } = await supabase
        .from('symptom_assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('symptom_type', symptomId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading assessment:', error);
        toast({
          variant: "destructive",
          title: "Loading Error",
          description: "No assessment found for this symptom. Please complete an assessment first."
        });
        navigate('/symptoms');
        return;
      }

      if (data) {
        const assessmentScore: AssessmentScore = {
          overall: data.overall_score,
          category: data.score_category as 'excellent' | 'good' | 'fair' | 'poor',
          primaryIssues: data.primary_issues || [],
          detailScores: (data.detail_scores as Record<string, number>) || {}
        };

        // Generate recommendations based on saved data
        const personalisedRecommendations = generateRecommendations(symptomId, assessmentScore, (data.answers as Record<string, string>) || {});
        
        setScore(assessmentScore);
        setRecommendations(personalisedRecommendations);
        
        // Initialize supplement selections
        const initialSelections: Record<number, SupplementInfo[]> = {};
        personalisedRecommendations.forEach((rec, index) => {
          if (rec.category === 'supplement' && rec.supplements) {
            initialSelections[index] = [...rec.supplements];
          }
        });
        setSupplementSelections(initialSelections);
      }
    } catch (error) {
      console.error('Unexpected error loading assessment:', error);
      toast({
        variant: "destructive",
        title: "Loading Error",
        description: "Failed to load assessment results."
      });
    }
  };

  const saveAssessment = async (
    answers: Record<string, string>, 
    calculatedScore: AssessmentScore, 
    personalisedRecommendations: Recommendation[]
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
        recommendations: personalisedRecommendations.map(rec => ({
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
      "hot-flashes": "Hot Flushes",
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
      "gut": "Gut Health",
      "sexual-function": "Sexual Function",
      // Brain Pillar Assessments
      "brain-brain-fog-assessment": "Brain Fog Assessment",
      "brain-memory-&-focus-analysis": "Memory & Focus Analysis",
      // Body Pillar Assessments
      "body-energy-&-fatigue-assessment": "Energy & Fatigue Assessment",
      "body-mobility-&-strength-analysis": "Mobility & Strength Analysis",
      // Balance Pillar Assessments
      "balance-stress-&-anxiety-assessment": "Stress & Anxiety Assessment",
      "balance-hormonal-balance-evaluation": "Hormonal Balance Evaluation",
      // Beauty Pillar Assessments
      "beauty-skin-health-assessment": "Skin Health Assessment",
      "beauty-hair-&-nail-analysis": "Hair & Nail Analysis"
    };
    return nameMap[id] || id;
  };

  const isPillarAssessment = symptomId?.includes('-');
  const pillarName = isPillarAssessment ? symptomId?.split('-')[0] : null;
  
  const getBackRoute = () => {
    if (isPillarAssessment && pillarName) {
      return `/pillars?pillar=${pillarName}`;
    }
    return '/symptoms';
  };

  const getBackText = () => {
    if (isPillarAssessment && pillarName) {
      return `Back to ${pillarName.charAt(0).toUpperCase() + pillarName.slice(1)} Pillar`;
    }
    return 'Back to Symptoms';
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
      case 'brain-fog':
      case 'brain-brain-fog-assessment':
        return calculateBrainFogScore(answers);
      case 'sexual-function':
        return calculateSexualFunctionScore(answers);
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
        primaryIssues.push('Very frequent hot flushes');
        break;
      case 'daily':
        overallScore -= 30;
        primaryIssues.push('Daily hot flushes');
        break;
      case 'weekly':
        overallScore -= 15;
        primaryIssues.push('Weekly hot flushes');
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
      primaryIssues.push('Night-time hot flushes disrupting sleep');
    } else if (answers['3'] === 'triggers') {
      primaryIssues.push('Trigger-based hot flushes');
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
      case 'energised':
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

  const calculateBrainFogScore = (answers: Record<string, string>): AssessmentScore => {
    let overallScore = 100;
    const primaryIssues: string[] = [];

    // Frequency (Question 1)
    switch (answers['1']) {
      case 'constant':
        overallScore -= 45;
        primaryIssues.push('Persistent mental cloudiness');
        break;
      case 'daily':
        overallScore -= 35;
        primaryIssues.push('Daily brain fog episodes');
        break;
      case 'weekly':
        overallScore -= 20;
        primaryIssues.push('Frequent mental fog');
        break;
      case 'rare':
        overallScore -= 5;
        break;
    }

    // Severity/Impact (Question 2)
    switch (answers['2']) {
      case 'severe':
        overallScore -= 35;
        primaryIssues.push('Significant functional impairment');
        break;
      case 'moderate':
        overallScore -= 25;
        primaryIssues.push('Moderate impact on daily tasks');
        break;
      case 'mild':
        overallScore -= 15;
        primaryIssues.push('Mild cognitive slowdown');
        break;
      case 'minimal':
        overallScore -= 5;
        break;
    }

    // Timing pattern (Question 3)
    switch (answers['3']) {
      case 'morning':
        primaryIssues.push('Morning cognitive difficulty');
        break;
      case 'afternoon':
        primaryIssues.push('Post-lunch mental fatigue');
        break;
      case 'evening':
        primaryIssues.push('Evening mental exhaustion');
        break;
      case 'variable':
        primaryIssues.push('Unpredictable brain fog pattern');
        break;
    }

    // Accompanying symptoms (Question 4)
    switch (answers['4']) {
      case 'all':
        primaryIssues.push('Multiple cognitive symptoms');
        overallScore -= 10;
        break;
      case 'concentration':
        primaryIssues.push('Difficulty concentrating');
        break;
      case 'memory':
        primaryIssues.push('Memory problems');
        break;
      case 'words':
        primaryIssues.push('Word-finding difficulties');
        break;
    }

    // Add trigger info if provided (Question 5)
    if (answers['5'] && answers['5'].trim().length > 0) {
      const triggers = answers['5'].toLowerCase();
      if (triggers.includes('stress')) primaryIssues.push('Stress-triggered');
      if (triggers.includes('sleep')) primaryIssues.push('Sleep-related');
      if (triggers.includes('hormone')) primaryIssues.push('Hormone-related');
      if (triggers.includes('diet') || triggers.includes('food')) primaryIssues.push('Diet-related');
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

  const calculateSexualFunctionScore = (answers: Record<string, string>): AssessmentScore => {
    let overallScore = 100;
    const primaryIssues: string[] = [];
    let libidoScore = 100;
    let arousalScore = 100;
    let painScore = 100;
    let satisfactionScore = 100;

    // Question 1: Overall libido
    switch (answers['1']) {
      case 'absent':
        libidoScore = 20;
        overallScore -= 30;
        primaryIssues.push('Significantly diminished libido');
        break;
      case 'low':
        libidoScore = 50;
        overallScore -= 20;
        primaryIssues.push('Low sexual desire');
        break;
      case 'moderate':
        libidoScore = 70;
        overallScore -= 10;
        primaryIssues.push('Reduced libido frequency');
        break;
      case 'strong':
        libidoScore = 100;
        break;
    }

    // Question 2: Libido change over time
    switch (answers['2']) {
      case 'sudden-decline':
        overallScore -= 20;
        primaryIssues.push('Sudden libido decline requiring evaluation');
        break;
      case 'gradual-decline':
        overallScore -= 15;
        primaryIssues.push('Gradual decline in sexual interest');
        break;
      case 'fluctuates':
        overallScore -= 8;
        break;
      case 'no-change':
        break;
    }

    // Question 3: Vaginal dryness (critical for comfort)
    switch (answers['3']) {
      case 'severe':
        painScore = 20;
        overallScore -= 25;
        primaryIssues.push('Severe vaginal dryness causing pain');
        break;
      case 'frequent':
        painScore = 50;
        overallScore -= 18;
        primaryIssues.push('Frequent vaginal dryness affecting intimacy');
        break;
      case 'occasional':
        painScore = 75;
        overallScore -= 10;
        primaryIssues.push('Occasional vaginal dryness');
        break;
      case 'none':
        painScore = 100;
        break;
    }

    // Question 4: Arousal ability
    switch (answers['4']) {
      case 'very-difficult':
        arousalScore = 25;
        overallScore -= 20;
        primaryIssues.push('Significant difficulty achieving arousal');
        break;
      case 'difficult':
        arousalScore = 50;
        overallScore -= 15;
        primaryIssues.push('Difficulty with arousal');
        break;
      case 'somewhat-easy':
        arousalScore = 75;
        overallScore -= 8;
        break;
      case 'easy':
        arousalScore = 100;
        break;
    }

    // Question 5: Pain during activity
    switch (answers['5']) {
      case 'severe':
        painScore = Math.min(painScore, 20);
        overallScore -= 25;
        primaryIssues.push('Severe pain during intimacy - medical evaluation recommended');
        break;
      case 'moderate':
        painScore = Math.min(painScore, 50);
        overallScore -= 18;
        primaryIssues.push('Moderate pain affecting enjoyment');
        break;
      case 'mild':
        painScore = Math.min(painScore, 75);
        overallScore -= 10;
        primaryIssues.push('Mild discomfort during intimacy');
        break;
      case 'none':
        // No additional impact
        break;
    }

    // Question 6: Orgasm satisfaction
    switch (answers['6']) {
      case 'dissatisfied':
        satisfactionScore = 30;
        overallScore -= 15;
        primaryIssues.push('Difficulty achieving orgasm');
        break;
      case 'somewhat-satisfied':
        satisfactionScore = 65;
        overallScore -= 8;
        break;
      case 'satisfied':
        satisfactionScore = 85;
        break;
      case 'very-satisfied':
        satisfactionScore = 100;
        break;
    }

    // Question 7 & 8: Frequency and changes
    if (answers['7'] === 'rarely' || answers['7'] === 'never') {
      overallScore -= 10;
      if (!primaryIssues.includes('Low sexual desire') && !primaryIssues.includes('Significantly diminished libido')) {
        primaryIssues.push('Infrequent sexual activity');
      }
    }

    if (answers['8'] === 'decreased-significantly') {
      overallScore -= 12;
      if (answers['2'] !== 'sudden-decline' && answers['2'] !== 'gradual-decline') {
        primaryIssues.push('Significant decrease in sexual frequency');
      }
    }

    // Question 9: Emotional factors
    if (answers['9'] === 'major' || answers['9'] === 'moderate') {
      overallScore -= 10;
      primaryIssues.push('Emotional factors significantly impacting intimacy');
    }

    // Question 10: Relationship satisfaction
    if (answers['10'] === 'dissatisfied') {
      overallScore -= 10;
      primaryIssues.push('Relationship concerns affecting intimacy');
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
        'Libido & Desire': libidoScore,
        'Arousal Function': arousalScore,
        'Comfort & Pain': painScore,
        'Sexual Satisfaction': satisfactionScore
      }
    };
  };

  const calculateGenericScore = (answers: Record<string, string>): AssessmentScore => {
    // Generic scoring for symptoms without specific logic yet
    let overallScore = 75; // Default moderate score
    const primaryIssues: string[] = [];

    // Try to extract some meaningful info from answers
    Object.entries(answers).forEach(([key, value]) => {
      if (value && typeof value === 'string' && value.length > 3 && !value.includes('?')) {
        primaryIssues.push(value.substring(0, 50));
      }
    });

    // If no meaningful issues found, add a generic placeholder
    if (primaryIssues.length === 0) {
      primaryIssues.push('General assessment');
    }

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
      case 'brain-fog':
      case 'brain-brain-fog-assessment':
        return generateBrainFogRecommendations(score, answers);
      case 'brain-memory-&-focus-analysis':
        return generateMemoryFocusRecommendations(score, answers);
      case 'energy-levels':
      case 'body-energy-&-fatigue-assessment':
        return generateEnergyRecommendations(score, answers);
      case 'body-mobility-&-strength-analysis':
        return generateMobilityRecommendations(score, answers);
      case 'bloating':
        return generateBloatingRecommendations(score, answers);
      case 'weight-changes':
        return generateWeightRecommendations(score, answers);
      case 'hair-thinning':
        return generateHairRecommendations(score, answers);
      case 'anxiety':
      case 'balance-stress-&-anxiety-assessment':
        return generateAnxietyRecommendations(score, answers);
      case 'balance-hormonal-balance-evaluation':
        return generateHormonalRecommendations(score, answers);
      case 'irregular-periods':
        return generatePeriodRecommendations(score, answers);
      case 'headaches':
        return generateHeadacheRecommendations(score, answers);
      case 'night-sweats':
        return generateNightSweatRecommendations(score, answers);
      case 'memory-issues':
        return generateMemoryRecommendations(score, answers);
      case 'beauty-skin-health-assessment':
        return generateSkinHealthRecommendations(score, answers);
      case 'beauty-hair-&-nail-analysis':
        return generateHairNailRecommendations(score, answers);
      case 'sexual-function':
        return generateSexualFunctionRecommendations(score, answers);
      default:
        return generateDefaultRecommendations(symptomType, score);
    }
  };

  const generateSleepRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    const recs: Recommendation[] = [];

    // Always include core sleep recommendations
    recs.push({
      title: "Evening Wind-Down Routine",
      description: "Create a consistent pre-sleep routine starting 2 hours before bed. Dim lights, avoid screens, and practice relaxation techniques.",
      priority: 'high',
      category: 'routine',
      icon: Moon,
      analysis: `Based on your sleep quality rating of "${answers['1']}", establishing a consistent bedtime routine is crucial for signaling to your body that it's time to sleep. Your current sleep patterns suggest that your circadian rhythm may benefit from reinforcement.`,
      improvement: "Start with just 30 minutes of routine and gradually extend to 2 hours. Track your sleep onset time to measure improvement.",
      timeline: "Expect to see improvements in sleep onset within 2-3 weeks of consistent practice"
    });

    // Always include sleep support supplements
    recs.push({
      title: "Sleep Support Supplements",
      description: "Supplements that may assist in addressing sleep quality issues and supporting natural circadian rhythm regulation.",
      priority: 'high',
      category: 'supplement',
      icon: Pill,
      personalisedAssessment: `Based on your sleep quality assessment, these supplements may assist in supporting better sleep depth and reducing the time it takes to fall asleep.`,
      supplements: [
        { name: "Magnesium Glycinate", dosage: "400-600mg taken 30-60 minutes before bed", price: "£19.99", selected: true },
        { name: "Melatonin (Extended Release)", dosage: "0.5-1mg taken 30 minutes before desired sleep time", price: "£12.99", selected: true },
        { name: "L-Theanine", dosage: "200mg taken with evening routine", selected: false }
      ],
      analysis: `**Professional Health Advisory:** Please consult with a healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications. These supplements are intended to support general wellness and are not intended to diagnose, treat, cure, or prevent any disease.`,
      improvement: "General recommended dosages are 200-600mg magnesium glycinate and 0.5-1mg melatonin taken 30-60 minutes before bed. Take supplements consistently at the same time nightly. For your specific recommended dosage, consult a healthcare professional.",
      timeline: "Most people generally notice initial improvements in sleep depth within 1-2 weeks, with significant sleep quality enhancement after 4-6 weeks of consistent implementation. If sleep symptoms persist or worsen, consult a healthcare provider."
    });

    // Always include sleep environment optimisation
    recs.push({
      title: "Sleep Environment Optimisation",
      description: "Keep your bedroom temperature between 18-20°C, ensure complete darkness with blackout curtains, and minimise noise.",
      priority: 'high',
      category: 'environment',
      icon: Moon,
      analysis: `Environmental factors significantly impact sleep quality regardless of current issues. Your "${answers['3']}" night wakings pattern suggests optimising your sleep environment could improve sleep continuity.`,
      improvement: "Invest in a programmable thermostat, blackout curtains, and white noise machine. Track wake-ups to identify patterns and triggers.",
      timeline: "Sleep continuity improvements typically occur within 1-2 weeks of environmental optimisation"
    });

    // Always include sleep-supporting nutrition
    recs.push({
      title: "Sleep-Supporting Nutrition",
      description: "Avoid caffeine after 2pm, limit alcohol, and include tryptophan-rich foods like turkey, eggs, and cherries in evening meals.",
      priority: 'medium',
      category: 'diet',
      icon: Heart,
      analysis: "Dietary choices significantly impact sleep quality. Caffeine has a 6-hour half-life and can disrupt sleep even when consumed early afternoon.",
      improvement: "Stop caffeine by 2pm, limit alcohol to 1 drink with dinner, include magnesium-rich foods like leafy greens and nuts.",
      timeline: "Sleep quality improvements typically seen within 1-2 weeks of dietary adjustments"
    });

    // Always include sleep therapy option
    recs.push({
      title: "Cognitive Behavioural Therapy for Insomnia (CBT-I)",
      description: "Consider professional CBT-I if sleep issues persist despite other interventions - most effective long-term treatment.",
      priority: 'low',
      category: 'therapy',
      icon: Brain,
      analysis: "CBT-I is the gold standard treatment for chronic insomnia, with 70-80% success rate and lasting results without medication dependency.",
      improvement: "Seek qualified CBT-I therapist or use evidence-based apps like Sleep Reset or CBT-I Coach.",
      timeline: "Sleep improvements typically seen within 4-6 weeks of CBT-I treatment"
    });

    // Always include sleep lifestyle factors
    recs.push({
      title: "Sleep-Supportive Lifestyle",
      description: "Maintain regular exercise timing, manage stress levels, and prioritize consistent sleep schedule even on weekends.",
      priority: 'medium',
      category: 'lifestyle',
      icon: Activity,
      analysis: "Lifestyle factors like exercise timing, stress management, and schedule consistency significantly impact sleep quality and duration.",
      improvement: "Exercise earlier in day, finish workouts 4+ hours before bed, maintain consistent bedtime within 30 minutes daily.",
      timeline: "Sleep pattern improvements typically develop within 2-3 weeks of lifestyle consistency"
    });

    return recs;
  };

  const generateHotFlashesRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    const recs: Recommendation[] = [];
    
    const hasFrequentFlashes = answers['1'] === 'frequently' || answers['1'] === 'very-frequently';
    const hasSevereIntensity = answers['2'] === 'severe' || answers['2'] === 'extreme';
    const hasNightSweats = answers['3'] === 'night' || answers['3'] === 'both';
    const significantImpact = answers['4'] === 'significantly' || answers['4'] === 'severely';

    // HIGH PRIORITY: Evidence-Based Supplement Protocol
    recs.push({
      title: "Evidence-Based Hot Flash Supplement Protocol",
      description: "Clinically-researched supplements shown to significantly reduce vasomotor symptoms in menopausal women.",
      priority: 'high',
      category: 'supplement',
      icon: Pill,
      personalisedAssessment: `Your assessment indicates ${hasFrequentFlashes ? 'frequent' : 'regular'} hot flashes${hasSevereIntensity ? ' with severe intensity' : ''}${hasNightSweats ? ' including night sweats' : ''}. This evidence-based protocol addresses the underlying hormonal mechanisms.`,
      supplements: [
        { name: "Black Cohosh Extract (Standardized)", dosage: "40-80mg daily (6.5mg triterpene glycosides)", price: "£24.99", selected: true },
        { name: "S-Equol (Soy Isoflavone Metabolite)", dosage: "10-20mg daily", price: "£34.99", selected: true },
        { name: "Pycnogenol (French Maritime Pine Bark)", dosage: "50-100mg daily", price: "£29.99", selected: true },
        { name: "Sage Extract", dosage: "300mg standardized extract daily", price: "£19.99", selected: false },
        { name: "Evening Primrose Oil (GLA)", dosage: "1000mg twice daily", price: "£16.99", selected: false }
      ],
      analysis: "**Evidence-Based Research:** Black Cohosh has demonstrated 20-50% reduction in hot flash frequency in multiple RCTs and systematic reviews, with best results at 6.5mg triterpene glycosides. S-equol (the active metabolite only 30-50% of people can produce from soy) shows significant vasomotor symptom reduction in clinical trials. Pycnogenol demonstrated 46% reduction in hot flash scores in RCTs. Sage extract reduced hot flash frequency by up to 64% in clinical studies. **Mechanism:** These compounds interact with serotonin receptors, support estrogen receptor modulation, and reduce neurokinin B activity involved in thermoregulation.",
      improvement: "Take black cohosh with meals for 12 weeks minimum (most studies show peak benefit at 8-12 weeks). S-equol best taken in morning. Pycnogenol with breakfast. Sage extract can be taken anytime. Evening primrose oil with meals to reduce GI effects.",
      timeline: "Initial reductions in frequency typically within 2-4 weeks. Significant improvements (40-60% reduction in frequency and severity) typically seen within 6-12 weeks of consistent supplementation."
    });

    // Lifestyle interventions always included
    recs.push({
      title: "Trigger Identification & Management",
      description: "Systematic approach to identify and avoid personal hot flash triggers while implementing cooling strategies.",
      priority: 'high',
      category: 'lifestyle',
      icon: Thermometer,
      analysis: "Research shows 70-80% of women have identifiable triggers including caffeine, alcohol, spicy foods, stress, and environmental heat. Trigger avoidance can reduce episode frequency by 30-50%.",
      improvement: "Keep detailed symptom diary tracking triggers. Common triggers: caffeine after 2pm, alcohol (especially red wine), spicy foods, hot beverages, stress, warm environments. Create personal cooling kit with portable fan, cooling towels, breathable clothing.",
      timeline: "Immediate relief from trigger avoidance and cooling strategies. Pattern recognition typically develops within 2-3 weeks of tracking."
    });

    // Cognitive Behavioural Therapy for hot flashes
    if (significantImpact || hasSevereIntensity) {
      recs.push({
        title: "Cognitive Behavioural Therapy for Hot Flashes (CBT-MH)",
        description: "Evidence-based psychological intervention specifically designed to reduce hot flash severity and improve quality of life.",
        priority: 'high',
        category: 'therapy',
        icon: Brain,
        analysis: "**Clinical Evidence:** CBT for menopausal hot flashes (CBT-MH) has been shown in multiple RCTs to reduce hot flash problem rating by 40-60% and significantly improve quality of life, sleep, and mood. More effective than control interventions. Works by changing cognitive and behavioural responses to hot flashes, reducing stress reactivity, and improving sleep.",
        improvement: "Seek therapist trained in CBT-MH or use evidence-based programs like Cognitive Behavioural Therapy for Menopause. Typically involves 4-6 sessions covering paced breathing, cognitive restructuring, sleep hygiene, and behavioural activation.",
        timeline: "Improvements typically seen within 4-6 weeks of treatment, with benefits maintained long-term."
      });
    }

    // Paced Respiration
    recs.push({
      title: "Paced Breathing Technique",
      description: "Controlled slow breathing (6-8 breaths per minute) to reduce hot flash frequency and severity.",
      priority: 'high',
      category: 'routine',
      icon: Heart,
      analysis: "**Research Evidence:** Paced respiration has shown 40-50% reduction in hot flash frequency in clinical trials. Mechanism involves calming sympathetic nervous system activation and improving thermoregulatory control through vagal nerve stimulation.",
      improvement: "Practice 15 minutes twice daily: breathe in for 5 seconds, out for 5 seconds (6 breaths/minute). Also use during hot flash onset. Use apps like Breathwrk or Paced Breathing for guidance.",
      timeline: "Technique learned within days. Hot flash reduction typically seen within 2-4 weeks of consistent practice."
    });

    // Night sweats specific
    if (hasNightSweats) {
      recs.push({
        title: "Night Sweat Management Protocol",
        description: "Comprehensive sleep environment and bedding optimisation to minimise night sweat disruption.",
        priority: 'high',
        category: 'environment',
        icon: Moon,
        analysis: "Night sweats disrupt sleep architecture and contribute to daytime fatigue, mood changes, and cognitive impairment. Environmental optimisation can reduce episode intensity by 40-60%.",
        improvement: "Use moisture-wicking sleepwear (merino wool or technical fabrics), cooling mattress pad or BedJet, keep room 16-18°C, use layered bedding for easy adjustment, keep cold water and fan bedside, layer sheets for quick changes.",
        timeline: "Immediate improvement in sleep quality with environmental optimisation."
      });
    }

    // Acupuncture recommendation
    recs.push({
      title: "Acupuncture for Vasomotor Symptoms",
      description: "Evidence-based complementary therapy shown to reduce hot flash frequency and severity.",
      priority: 'medium',
      category: 'therapy',
      icon: Activity,
      analysis: "**Clinical Evidence:** Multiple systematic reviews and RCTs show acupuncture reduces hot flash frequency by 30-50% and improves quality of life scores. May work through neuromodulation of thermoregulatory centers and hormone regulation.",
      improvement: "Seek qualified acupuncturist experienced in menopausal symptoms. Typical protocol involves weekly sessions for 8-12 weeks, then maintenance sessions.",
      timeline: "Initial improvements often seen within 4-6 sessions (4-6 weeks). Peak benefits at 8-12 weeks."
    });

    // Dietary interventions
    recs.push({
      title: "Phytoestrogen-Rich Mediterranean Diet",
      description: "Dietary pattern incorporating plant estrogens and anti-inflammatory foods to support hormonal balance.",
      priority: 'medium',
      category: 'diet',
      icon: Heart,
      analysis: "**Research Evidence:** Mediterranean diet pattern with phytoestrogens reduces menopausal symptoms by 20-40%. Phytoestrogens bind weakly to estrogen receptors, potentially easing transition. Best sources: organic non-GMO soy (tofu, tempeh, edamame), flaxseeds (ground), legumes, whole grains.",
      improvement: "Include 2-3 servings phytoestrogen-rich foods daily (e.g., 100g tofu, 2 tbsp ground flaxseed). Limit alcohol to <3 drinks/week, reduce caffeine, avoid spicy foods if triggers. Increase omega-3s from fatty fish 2-3x weekly.",
      timeline: "Dietary effects typically develop over 4-8 weeks of consistent implementation."
    });

    // Weight and exercise
    recs.push({
      title: "Exercise & Weight Management",
      description: "Regular physical activity and healthy weight maintenance to reduce hot flash frequency and severity.",
      priority: 'medium',
      category: 'lifestyle',
      icon: Activity,
      analysis: "**Clinical Evidence:** Higher BMI associated with increased hot flash frequency and severity. Weight loss of 5-10% can reduce symptoms by 30-50%. Regular exercise improves thermoregulation, reduces stress, and supports hormonal balance. Yoga shows particular benefit for menopausal symptoms in RCTs.",
      improvement: "Aim for 150 minutes moderate exercise weekly. Include strength training 2-3x weekly to maintain muscle mass and metabolism. Consider yoga or tai chi for stress reduction and symptom management.",
      timeline: "Exercise benefits develop over 4-8 weeks. Weight loss effects proportional to amount lost (5-10% reduction optimal)."
    });

    // Hormone therapy consideration
    if (significantImpact) {
      recs.push({
        title: "Hormone Therapy Evaluation",
        description: "Medical consultation for hormone replacement therapy (HRT) assessment - the most effective treatment for vasomotor symptoms.",
        priority: 'high',
        category: 'therapy',
        icon: TestTube,
        analysis: "**Gold Standard Treatment:** Systemic hormone therapy (estrogen with progesterone for intact uterus, estrogen alone after hysterectomy) reduces hot flash frequency by 70-90% and is the most effective treatment available. Risks and benefits vary individually. Women's Health Initiative studies show overall favorable risk-benefit for women <60 or within 10 years of menopause. Modern bioidentical hormones available in various forms (patch, gel, pill).",
        improvement: "Schedule consultation with menopause specialist or gynecologist to discuss personal risk factors, treatment options (systemic vs. vaginal estrogen), and optimal hormone formulations. Discuss family history, cardiovascular health, breast cancer risk, and current symptoms.",
        timeline: "HRT typically provides relief within 2-4 weeks, with maximal benefit by 3 months."
      });
    }

    return recs;
  };

  const generateJointPainRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    const recs: Recommendation[] = [];

    // Always include core joint pain recommendations
    recs.push({
      title: "Evidence-Based Joint Support Protocol",
      description: "Clinically-researched supplements shown to reduce joint pain, inflammation, and support cartilage health.",
      priority: 'high',
      category: 'supplement',
      icon: Pill,
      personalisedAssessment: `Your joint pain assessment indicates ${answers['2'] === 'severe' || answers['2'] === 'extreme' ? 'severe' : answers['2'] === 'moderate' ? 'moderate' : 'mild'} joint discomfort${answers['1'] ? ' affecting ' + answers['1'] : ''}. This evidence-based protocol addresses inflammation, cartilage support, and pain reduction.`,
      supplements: [
        { name: "Curcumin (95% Curcuminoids with Bioperine)", dosage: "500-1000mg twice daily with meals", price: "£27.99", selected: true },
        { name: "Omega-3 EPA/DHA", dosage: "2000-3000mg combined EPA/DHA daily", price: "£24.99", selected: true },
        { name: "Glucosamine Sulfate", dosage: "1500mg daily in single dose", price: "£26.99", selected: true },
        { name: "Boswellia Serrata Extract (AKBA)", dosage: "400mg twice daily", price: "£29.99", selected: false },
        { name: "UC-II Collagen (Undenatured Type II)", dosage: "40mg daily on empty stomach", price: "£32.99", selected: false }
      ],
      analysis: "**Evidence-Based Research:** Curcumin demonstrates significant pain reduction (40-60%) and improved function in multiple RCTs for osteoarthritis, comparable to NSAIDs but without GI side effects when taken with Bioperine for absorption. Omega-3s (EPA/DHA) reduce inflammatory markers and joint pain by 30-40% in clinical trials. Glucosamine sulfate shows significant benefit for knee OA in long-term studies (1500mg daily superior to divided doses). Boswellia AKBA inhibits inflammatory enzymes with 30-65% improvement in pain scores. UC-II collagen shows remarkable results with only 40mg daily (works through oral tolerance mechanism, NOT cartilage building). **Mechanism:** Multi-targeted approach - curcumin/boswellia inhibit inflammatory pathways (COX-2, 5-LOX), omega-3s modulate prostaglandins, glucosamine supports cartilage matrix, UC-II modulates immune response.",
      improvement: "Take curcumin with black pepper (piperine/bioperine) and fat for absorption. Omega-3 with meals to reduce fishy aftertaste. Glucosamine as single 1500mg dose (more effective than divided). Boswellia twice daily with meals. UC-II on empty stomach (do NOT take with glucosamine/chondroitin as it works differently).",
      timeline: "Initial pain reduction with curcumin/boswellia within 1-2 weeks. Omega-3 anti-inflammatory effects develop over 4-8 weeks. Glucosamine requires 6-12 weeks for cartilage effects. UC-II shows benefits within 90-120 days in clinical trials."
    });

    // Always include movement routine
    recs.push({
      title: "Daily Joint Mobility Routine",
      description: "Gentle daily exercises focusing on range of motion, flexibility, and low-impact strengthening to maintain joint health.",
      priority: 'high',
      category: 'routine',
      icon: Activity,
      analysis: "Regular, gentle movement prevents joint stiffness and maintains synovial fluid production, which lubricates joints naturally.",
      improvement: "Start with 10-15 minutes daily of gentle stretching, range of motion exercises, and light strengthening. Progress gradually.",
      timeline: "Joint mobility improvements typically seen within 1-2 weeks of consistent practice"
    });

    // Always include ergonomic environment
    recs.push({
      title: "Joint-Friendly Environment Setup",
      description: "Optimise your living and work spaces to reduce joint stress with proper ergonomics and supportive surfaces.",
      priority: 'medium',
      category: 'environment',
      icon: Calendar,
      analysis: "Poor ergonomics and unsupportive surfaces increase joint stress throughout the day, contributing to pain and stiffness.",
      improvement: "Use ergonomic chairs, supportive mattresses, proper desk height, and cushioned mats for standing activities.",
      timeline: "Immediate comfort improvements with proper ergonomics"
    });

    // Always include anti-inflammatory diet
    recs.push({
      title: "Anti-Inflammatory Nutrition Protocol",
      description: "Eliminate inflammatory foods and focus on joint-supporting nutrients like omega-3s, antioxidants, and collagen-building foods.",
      priority: 'high',
      category: 'diet',
      icon: Heart,
      analysis: "Anti-inflammatory nutrition reduces systemic inflammation by 20-40% and provides nutrients essential for cartilage health.",
      improvement: "Eliminate processed foods, sugar, and trans fats. Include fatty fish, leafy greens, berries, and turmeric daily.",
      timeline: "Inflammatory marker improvements typically seen within 2-4 weeks"
    });

    // Always include lifestyle modifications
    recs.push({
      title: "Joint-Protective Lifestyle",
      description: "Integrate weight management, stress reduction, and activity modification to support long-term joint health.",
      priority: 'medium',
      category: 'lifestyle',
      icon: Heart,
      analysis: "Excess weight increases joint stress exponentially. Every 1kg of weight loss reduces knee pressure by 4kg during walking.",
      improvement: "Maintain healthy weight, practice stress management, alternate between sitting and standing, use proper body mechanics.",
      timeline: "Joint relief from weight management typically seen within 4-8 weeks"
    });

    // Conditional severe pain recommendations
    if (answers['2'] === 'severe' || answers['2'] === 'extreme') {
      recs.push({
        title: "Professional Physical Therapy",
        description: "Work with a qualified physiotherapist for targeted treatment including manual therapy, exercise prescription, and pain management.",
        priority: 'high',
        category: 'therapy',
        icon: Heart,
        analysis: "Professional assessment and treatment can identify underlying causes and provide targeted interventions for severe joint pain.",
        improvement: "Seek physiotherapist specializing in your specific joint condition for comprehensive assessment and treatment plan.",
        timeline: "Professional assessment provides immediate insights, with treatment benefits over 4-8 weeks"
      });

      recs.push({
        title: "Heat and Cold Therapy Protocol",
        description: "Alternate between warm compresses (15 min) and cold therapy (10 min) to reduce inflammation and manage pain effectively.",
        priority: 'medium',
        category: 'therapy',
        icon: Thermometer,
        analysis: "Heat increases blood flow and relaxes muscles, while cold reduces inflammation and numbs pain. Alternating maximizes benefits.",
        improvement: "Use moist heat before activity, ice after activity or during flares. Never apply directly to skin.",
        timeline: "Immediate pain relief during application, with cumulative benefits over days"
      });
    }

    return recs;
  };

  const generateGutRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    const recs: Recommendation[] = [];

    // Always include digestive enzyme support
    recs.push({
      title: "Digestive Enzyme Support",
      description: "Take broad-spectrum digestive enzymes with meals to improve breakdown and absorption of nutrients.",
      priority: 'high',
      category: 'supplement',
      icon: Pill,
      personalisedAssessment: "Your digestive assessment suggests enzyme support may help improve nutrient breakdown and absorption.",
      supplements: [
        { name: "Full-Spectrum Digestive Enzymes", dosage: "Take 1-2 capsules with each meal", selected: true },
        { name: "Betaine HCl with Pepsin", dosage: "Take 1 capsule with protein-containing meals", selected: false },
        { name: "Probiotics Multi-Strain", dosage: "25-50 billion CFU daily", selected: false }
      ],
      analysis: `Your digestive symptoms indicate potential enzyme insufficiency, which affects 30-40% of adults. Poor digestion leads to nutrient malabsorption and inflammation.`,
      improvement: "General recommended approach is taking digestive enzymes 15-20 minutes before meals. Choose a formula with protease, lipase, and amylase. Start with smaller meals to reduce digestive burden. For your specific recommended dosage, consult a healthcare professional.",
      timeline: "Most people generally experience digestive comfort improvements within 1-2 weeks, with better nutrient absorption noticeable in 4-6 weeks. If digestive symptoms persist or worsen, consult a healthcare provider."
    });

    // Always include gut-healing routine
    recs.push({
      title: "Daily Gut Health Routine",
      description: "Practice mindful eating, proper chewing (20-30 chews per bite), and stress reduction before meals.",
      priority: 'high',
      category: 'routine',
      icon: Heart,
      analysis: "Mindful eating and proper chewing improve digestion by 25-40% and reduce digestive stress. Stress significantly impairs digestive function.",
      improvement: "Eat in calm environment, chew thoroughly, practice gratitude before meals, avoid eating when stressed.",
      timeline: "Immediate improvements in digestive comfort with mindful eating practices"
    });

    // Always include gut-friendly environment
    recs.push({
      title: "Digestive-Friendly Environment",
      description: "Create calm, comfortable eating spaces free from stress, distractions, and negative emotions.",
      priority: 'medium',
      category: 'environment',
      icon: Calendar,
      analysis: "Eating environment significantly impacts digestion through nervous system activation. Calm environments improve digestive efficiency.",
      improvement: "Eat at designated table, remove electronic devices, use soft lighting, play calming music during meals.",
      timeline: "Immediate improvement in digestion when eating in calm environment"
    });

    // Always include gut-healing nutrition
    recs.push({
      title: "Gut-Healing Nutrition Protocol",
      description: "Focus on anti-inflammatory foods, bone broth, fermented foods, and elimination of processed foods and sugar.",
      priority: 'high',
      category: 'diet',
      icon: Heart,
      analysis: "Gut-healing nutrition reduces intestinal inflammation and supports beneficial bacteria growth. Processed foods increase gut permeability.",
      improvement: "Include bone broth daily, fermented foods like kefir and sauerkraut, eliminate gluten and dairy temporarily if sensitive.",
      timeline: "Gut healing typically begins within 2-4 weeks of anti-inflammatory nutrition"
    });

    // Always include gut therapy option
    recs.push({
      title: "Functional Gut Testing",
      description: "Consider comprehensive stool analysis and SIBO breath test to identify specific gut imbalances.",
      priority: 'low',
      category: 'therapy',
      icon: TestTube,
      analysis: "Professional gut testing can identify specific bacterial imbalances, parasites, or digestive insufficiencies.",
      improvement: "Work with functional medicine practitioner for comprehensive gut analysis and targeted treatment.",
      timeline: "Testing provides immediate insights, with targeted treatment benefits over 6-12 weeks"
    });

    // Always include gut-supporting lifestyle
    recs.push({
      title: "Gut-Supporting Lifestyle",
      description: "Manage stress levels, maintain regular meal timing, and incorporate gentle movement to support digestive health.",
      priority: 'medium',
      category: 'lifestyle',
      icon: Activity,
      analysis: "Lifestyle factors like stress, meal timing, and physical activity significantly impact gut health and digestive function.",
      improvement: "Practice stress reduction techniques, eat at consistent times, take gentle walks after meals, prioritize quality sleep.",
      timeline: "Digestive improvements typically develop within 2-4 weeks of lifestyle optimisation"
    });

    return recs;
  };

  const generateBrainFogRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Cognitive Support Supplements",
        description: "Supplements that may assist in addressing brain fog and supporting cognitive function and mental clarity.",
        priority: 'high',
        category: 'supplement',
        icon: Brain,
        personalisedAssessment: "Your brain fog assessment indicates these supplements may assist in supporting cognitive function and mental clarity.",
        supplements: [
          { name: "Lion's Mane Mushroom Extract", dosage: "1000mg daily with meals", selected: true },
          { name: "B-Complex (Methylated Forms)", dosage: "1 capsule daily in the morning", selected: true },
          { name: "Omega-3 EPA/DHA", dosage: "2000mg daily with food", selected: false }
        ],
        analysis: "**Professional Health Advisory:** Please consult with a healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications. These supplements are intended to support general wellness and are not intended to diagnose, treat, cure, or prevent any disease.",
        improvement: "General recommended dosages are 500-1000mg Lion's Mane daily with meals and B-complex in the morning with breakfast. For your specific recommended dosage, consult a healthcare professional.",
        timeline: "Most people generally experience initial mental clarity improvements in 1-2 weeks, with significant cognitive enhancement after 4-6 weeks of consistent implementation. If cognitive symptoms persist or worsen, consult a healthcare provider."
      },
      {
        title: "Cognitive Load Management Routine",
        description: "Use time-blocking with 25-minute focused work sessions followed by 5-minute breaks to optimise mental performance.",
        priority: 'high',
        category: 'routine',
        icon: Brain,
        analysis: "The Pomodoro Technique reduces cognitive overload and allows the prefrontal cortex to reset, improving focus and reducing mental fatigue.",
        improvement: "Start with 3-4 sessions daily and track your focus quality. Use apps like Forest or Focus Keeper for consistency.",
        timeline: "Immediate improvement in task completion, with sustained focus gains within 2-3 weeks"
      },
      {
        title: "Cognitive-Friendly Environment",
        description: "Create distraction-free workspaces with optimal lighting, temperature (20-22°C), and minimal visual clutter.",
        priority: 'medium',
        category: 'environment',
        icon: Lightbulb,
        analysis: "Environmental factors significantly impact cognitive performance. Optimised spaces can improve focus and mental clarity by 25-40%.",
        improvement: "Use natural light when possible, maintain comfortable temperature, remove visual distractions, add plants for air quality.",
        timeline: "Immediate focus improvements in optimised environment"
      },
      {
        title: "Brain-Healthy Mediterranean Diet",
        description: "Focus on omega-3 rich foods, leafy greens, berries, and nuts while avoiding processed foods and excess sugar.",
        priority: 'medium',
        category: 'diet',
        icon: Heart,
        analysis: "Mediterranean diet patterns reduce cognitive decline risk by 35% and support neurotransmitter production for optimal brain function.",
        improvement: "Include blueberries and walnuts daily, eat fatty fish 2-3 times weekly, use extra virgin olive oil, limit refined carbohydrates.",
        timeline: "Mental clarity improvements typically begin within 1-2 weeks, with sustained cognitive benefits over 4-8 weeks"
      },
      {
        title: "Neurofeedback Training",
        description: "Consider EEG neurofeedback sessions to train optimal brainwave patterns for focus and mental clarity.",
        priority: 'low',
        category: 'therapy',
        icon: Brain,
        analysis: "Neurofeedback training can improve attention and reduce brain fog by training specific brainwave patterns associated with clear thinking.",
        improvement: "Seek qualified neurofeedback practitioner for assessment and personalised training protocol.",
        timeline: "Cognitive improvements typically seen after 8-15 sessions over 4-8 weeks"
      },
      {
        title: "Cognitive Lifestyle Optimisation",
        description: "Maintain regular sleep schedule, manage stress levels, and incorporate daily mental challenges to support brain health.",
        priority: 'medium',
        category: 'lifestyle',
        icon: Calendar,
        analysis: "Consistent lifestyle patterns support optimal brain function through proper circadian rhythm and stress hormone regulation.",
        improvement: "Prioritize 7-9 hours sleep, practice stress management, engage in learning activities, limit multitasking.",
        timeline: "Cognitive improvements typically develop within 2-4 weeks of consistent lifestyle optimization"
      }
    ];
  };

  const generateEnergyRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Energy Support Supplements",
        description: "Supplements that may assist in addressing fatigue and supporting cellular energy production.",
        priority: 'high',
        category: 'supplement',
        icon: Battery,
        personalisedAssessment: "Your energy assessment suggests these supplements may assist in supporting cellular energy production and addressing fatigue.",
        supplements: [
          { name: "CoQ10 (Ubiquinol)", dosage: "200mg daily with fatty meal", price: "£39.99", selected: true },
          { name: "Iron Bisglycinate", dosage: "25mg daily (if deficient)", selected: true },
          { name: "B12 (Methylcobalamin)", dosage: "1000mcg daily", selected: false },
          { name: "Rhodiola Rosea", dosage: "300mg in morning", selected: false }
        ],
        analysis: "**Professional Health Advisory:** Please consult with a healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications. These supplements are intended to support general wellness and are not intended to diagnose, treat, cure, or prevent any disease.",
        improvement: "General recommended dosages are 200mg CoQ10 with fatty meals and 25mg iron bisglycinate daily (if deficient). For your specific recommended dosage, consult a healthcare professional.",
        timeline: "Most people generally experience initial energy improvements in 1-2 weeks, with peak benefits at 4-6 weeks of consistent implementation. If fatigue symptoms persist or worsen, consult a healthcare provider."
      },
      {
        title: "Circadian Energy Routine",
        description: "Get 15-30 minutes of bright light within 30 minutes of waking and maintain consistent sleep-wake times.",
        priority: 'high',
        category: 'routine',
        icon: Lightbulb,
        analysis: "Light exposure regulates cortisol and melatonin rhythms, directly impacting energy levels throughout the day. Proper circadian timing can increase daytime energy by 30-50%.",
        improvement: "Use a light therapy box or get natural sunlight. Avoid bright light 3 hours before bed. Maintain consistent bedtimes.",
        timeline: "Energy pattern improvements within 3-7 days of consistent exposure"
      },
      {
        title: "Energy-Optimized Environment",
        description: "Create bright, well-ventilated workspaces with plants and maintain comfortable temperature (20-22°C) for optimal alertness.",
        priority: 'medium',
        category: 'environment',
        icon: Calendar,
        analysis: "Environmental factors significantly impact energy levels. Proper lighting, air quality, and temperature can improve alertness by 20-30%.",
        improvement: "Maximize natural light, add air-purifying plants, ensure good ventilation, use full-spectrum bulbs in darker areas.",
        timeline: "Immediate alertness improvements in optimized environment"
      },
      {
        title: "Energy-Supporting Nutrition",
        description: "Focus on stable blood sugar with balanced meals, complex carbohydrates, and regular meal timing.",
        priority: 'high',
        category: 'diet',
        icon: Heart,
        analysis: "Blood sugar fluctuations are a major cause of energy crashes. Stable nutrition patterns can maintain consistent energy levels throughout the day.",
        improvement: "Eat protein with each meal, choose complex carbs, avoid sugar crashes, maintain regular meal times, stay hydrated.",
        timeline: "Energy stability improvements typically seen within 1-2 weeks"
      },
      {
        title: "IV Nutrient Therapy",
        description: "Consider IV therapy with B vitamins, vitamin C, and minerals for rapid nutrient replenishment when severely fatigued.",
        priority: 'low',
        category: 'therapy',
        icon: Heart,
        analysis: "IV therapy bypasses digestive absorption issues and can provide rapid nutrient replenishment for severe fatigue cases.",
        improvement: "Consult with qualified healthcare provider specializing in IV therapy for personalized nutrient protocols.",
        timeline: "Immediate energy boost with IV therapy, sustained benefits with regular treatments"
      },
      {
        title: "Energy-Conscious Lifestyle",
        description: "Integrate regular movement, stress management, and energy-supporting daily habits for sustainable vitality.",
        priority: 'medium',
        category: 'lifestyle',
        icon: Activity,
        analysis: "Lifestyle factors like regular exercise, stress management, and consistent routines significantly impact energy levels and fatigue resistance.",
        improvement: "Include 30 minutes daily movement, practice stress reduction techniques, maintain work-rest balance, prioritize recovery.",
        timeline: "Sustained energy improvements typically develop over 2-4 weeks of lifestyle optimization"
      }
    ];
  };

  const generateBloatingRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Low-FODMAP Elimination Protocol",
        description: "Evidence-based dietary approach to identify food intolerances causing bloating and IBS symptoms.",
        priority: 'high',
        category: 'diet',
        icon: Heart,
        analysis: "**Clinical Evidence:** Low-FODMAP diet shows 70-86% response rate for IBS-related bloating in RCTs - superior to standard dietary advice. FODMAPs (fermentable oligosaccharides, disaccharides, monosaccharides, polyols) poorly absorbed in small intestine, causing rapid fermentation, gas production, and water retention in colon. Developed by Monash University, now gold standard for IBS management. **Critical:** Must include reintroduction phase - long-term restriction may harm gut microbiome diversity.",
        improvement: "Phase 1 (2-6 weeks): Strict elimination using Monash FODMAP app. Phase 2 (6-8 weeks): Systematic reintroduction one FODMAP group every 3 days, testing tolerance. Phase 3: Personalized long-term diet including tolerated FODMAPs. Keep detailed food-symptom diary. Consider FODMAP-trained dietitian for guidance.",
        timeline: "Symptom improvement typically within 2-4 weeks of elimination. Complete tolerance profile established after 10-14 week process."
      },
      {
        title: "Evidence-Based Digestive Support",
        description: "Targeted supplements to improve digestion, reduce gas formation, and alleviate bloating symptoms.",
        priority: 'high',
        category: 'supplement',
        icon: Pill,
        personalisedAssessment: "Your bloating assessment suggests digestive enzyme insufficiency and/or gas accumulation.",
        supplements: [
          { name: "Enteric-Coated Peppermint Oil", dosage: "0.2-0.4ml (187mg) 3x daily", price: "£22.99", selected: true },
          { name: "Full-Spectrum Digestive Enzymes", dosage: "1-2 capsules with meals", price: "£24.99", selected: true },
          { name: "Low-FODMAP Probiotic (Lactobacillus)", dosage: "10-20 billion CFU daily", price: "£29.99", selected: false },
          { name: "Simethicone", dosage: "125-250mg after meals PRN", price: "£12.99", selected: false },
          { name: "Ginger Extract", dosage: "250mg before meals", price: "£15.99", selected: false }
        ],
        analysis: "**Evidence-Based Research:** Enteric-coated peppermint oil demonstrates 40-75% reduction in IBS bloating in meta-analyses - works by relaxing intestinal smooth muscle (anti-spasmodic effect). Must be enteric-coated to prevent heartburn. Digestive enzymes improve carbohydrate breakdown by 30-40%, reducing fermentation substrate. Specific Lactobacillus strains (not Bifidobacterium) show modest bloating reduction (15-25%) in IBS. Simethicone breaks surface tension of gas bubbles. Ginger accelerates gastric emptying by 25%, reducing bloating.",
        improvement: "Peppermint oil: take 30-60 minutes before meals (must be enteric-coated). Digestive enzymes: 15-20 minutes before meals. Probiotics: specific strains matter (L. plantarum, L. acidophilus). Avoid high-dose Bifidobacterium if SIBO suspected (can worsen symptoms).",
        timeline: "Peppermint oil: effects within 1-2 hours, sustained improvement 2-4 weeks. Enzymes: 3-7 days. Probiotics: 4-8 weeks."
      },
      {
        title: "SIBO Testing & Treatment Consideration",
        description: "Evaluate for Small Intestinal Bacterial Overgrowth - common cause of chronic bloating.",
        priority: 'high',
        category: 'therapy',
        icon: TestTube,
        analysis: "**Clinical Evidence:** SIBO present in 35-78% of IBS patients with bloating. Caused by excessive bacteria in small intestine (normally sterile), producing gas from unabsorbed carbohydrates. Breath test (lactulose or glucose) 65-80% accurate. Treatment (rifaximin antibiotic or herbal antimicrobials) shows 50-70% symptom resolution. **Risk factors:** History of food poisoning (post-infectious IBS), PPI use, low stomach acid, motility disorders.",
        improvement: "Request SIBO breath test from gastroenterologist or functional medicine provider. If positive: rifaximin 550mg 3x daily for 14 days (prescription) or herbal protocol (Atrantil, Dysbiocide/FC-Cidal, or berberine combinations) for 4 weeks. Post-treatment: prokinetics to prevent recurrence. Address underlying causes (low stomach acid, poor motility).",
        timeline: "Breath test: 3-hour procedure. Treatment effects: 2-4 weeks. Symptom resolution maintained with prokinetics and dietary management."
      },
      {
        title: "Mindful Eating & Eating Mechanics",
        description: "Behavioral interventions to reduce aerophagia (air swallowing) and improve digestive efficiency.",
        priority: 'high',
        category: 'routine',
        icon: Heart,
        analysis: "**Research Evidence:** Rapid eating increases aerophagia (swallowing air) which accounts for 30-50% of intestinal gas. Thorough chewing (20-30 chews/bite) increases digestive enzyme exposure by 40% and reduces meal size by 15%. Stress during meals reduces gastric acid and enzyme secretion by 20-40%. Carbonated beverages increase bloating 25-50%.",
        improvement: "Chew each bite 20-30 times minimum. Put utensils down between bites. No talking while chewing. Eat meals sitting down in calm environment. Avoid drinking with meals (dilutes enzymes). No carbonated drinks. Use chopsticks or smaller utensils to slow eating. Meal duration minimum 20 minutes.",
        timeline: "Immediate reduction in air swallowing and improved digestion with mindful eating practices."
      },
      {
        title: "Abdominal Massage & Positioning",
        description: "Physical techniques to stimulate peristalsis and facilitate gas elimination.",
        priority: 'medium',
        category: 'therapy',
        icon: Heart,
        analysis: "**Clinical Evidence:** Clockwise abdominal massage (following colon path) significantly reduces bloating and constipation in 60% of participants in studies. Improves gut motility and gas transit. Certain yoga poses (wind-relieving pose, child's pose, supine twist) facilitate gas release.",
        improvement: "Massage technique: Lie on back, use gentle circular motions starting at right hip, moving up to ribs, across abdomen, down left side (5-10 minutes). Perform after meals or when bloated. Yoga poses: wind-relieving pose (knees to chest) for 2-3 minutes, child's pose, supine spinal twist.",
        timeline: "Immediate gas relief during and after massage/positioning. Improved motility with regular practice (daily x 2 weeks)."
      },
      {
        title: "Post-Meal Movement Protocol",
        description: "Strategic light activity to enhance digestion and prevent gas accumulation.",
        priority: 'medium',
        category: 'lifestyle',
        icon: Activity,
        analysis: "**Research Evidence:** 15-minute walk after meals accelerates gastric emptying by 30% and improves glucose clearance. Enhances gut motility and reduces bloating by 20-30%. Lying down after eating worsens bloating and reflux. Timing matters - intense exercise during digestion redirects blood from digestive system.",
        improvement: "10-15 minute gentle walk after meals. Avoid lying down for 2-3 hours post-meal. Avoid intense exercise within 2 hours of eating. Maintain upright posture during and after eating.",
        timeline: "Immediate improvement in digestion and reduced bloating with post-meal walking."
      }
    ];
  };

  const generateWeightRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Metabolic Support Supplements",
        description: "Supplements to support healthy metabolism, thyroid function, and weight management goals.",
        priority: 'high',
        category: 'supplement',
        icon: Scale,
        personalisedAssessment: "Your weight management assessment suggests these supplements may support healthy metabolism and weight goals.",
        supplements: [
          { name: "Green Tea Extract (EGCG)", dosage: "400-600mg daily", selected: true },
          { name: "Chromium Picolinate", dosage: "200-400mcg daily", selected: true },
          { name: "CLA (Conjugated Linoleic Acid)", dosage: "1000-3000mg daily", selected: false },
          { name: "L-Carnitine", dosage: "2000-3000mg daily", selected: false }
        ],
        analysis: "**Professional Health Advisory:** Please consult with a healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications. These supplements are intended to support general wellness and are not intended to diagnose, treat, cure, or prevent any disease.",
        improvement: "Take green tea extract between meals, chromium with meals to support blood sugar stability. For your specific recommended dosage, consult a healthcare professional.",
        timeline: "Metabolic support benefits typically seen within 2-4 weeks of consistent supplementation"
      },
      {
        title: "Structured Eating Routine",
        description: "Implement consistent meal timing with intermittent fasting (16:8) and mindful eating practices.",
        priority: 'high',
        category: 'routine',
        icon: Calendar,
        analysis: "Structured eating patterns improve insulin sensitivity by 30-40% and help regulate hunger hormones for better appetite control.",
        improvement: "Start with 12-hour fasting window and gradually extend. Plan and prep meals in advance, eat slowly and mindfully.",
        timeline: "Appetite regulation improvements within 1-2 weeks, metabolic benefits in 2-4 weeks"
      },
      {
        title: "Weight-Loss Supportive Environment",
        description: "Organize kitchen and dining spaces to support healthy choices and remove tempting processed foods.",
        priority: 'medium',
        category: 'environment',
        icon: Heart,
        analysis: "Environmental cues significantly impact food choices. Optimized food environment can improve healthy eating by 40-60%.",
        improvement: "Stock healthy snacks at eye level, remove processed foods, use smaller plates, create designated eating areas.",
        timeline: "Immediate improvement in food choices with environmental optimization"
      },
      {
        title: "Anti-Inflammatory Weight Loss Diet",
        description: "Focus on whole foods, lean proteins, and nutrient-dense options while creating a sustainable caloric deficit.",
        priority: 'high',
        category: 'diet',
        icon: Heart,
        analysis: "Sustainable weight loss requires a moderate caloric deficit (300-500 calories) with nutrient-dense foods to maintain metabolic health.",
        improvement: "Fill half your plate with vegetables, include protein with each meal, choose complex carbohydrates, stay hydrated.",
        timeline: "Sustainable weight loss of 0.5-1kg per week with proper nutrition approach"
      },
      {
        title: "Resistance Training Program",
        description: "Perform full-body strength training 3x per week to maintain muscle mass and boost metabolic rate during weight loss.",
        priority: 'high',
        category: 'therapy',
        icon: Activity,
        analysis: "Resistance training increases metabolic rate by 7-15% for up to 72 hours post-workout and preserves muscle during weight loss.",
        improvement: "Focus on compound movements: squats, deadlifts, presses. Progress weight by 2.5-5% weekly.",
        timeline: "Strength gains in 2-3 weeks, body composition changes in 6-8 weeks"
      },
      {
        title: "Healthy Weight Lifestyle",
        description: "Integrate stress management, adequate sleep, and sustainable habits that support long-term weight maintenance.",
        priority: 'medium',
        category: 'lifestyle',
        icon: Heart,
        analysis: "Lifestyle factors like sleep quality, stress levels, and daily habits significantly impact weight management success and maintenance.",
        improvement: "Prioritize 7-9 hours sleep, manage stress levels, build sustainable habits, focus on progress not perfection.",
        timeline: "Lifestyle-supported weight management benefits develop over 4-8 weeks"
      }
    ];
  };

  const generateHairRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Evidence-Based Hair Growth Protocol",
        description: "Clinically-researched supplements targeting hair follicle health, hormonal balance, and nutrient deficiencies.",
        priority: 'high',
        category: 'supplement',
        icon: Scissors,
        personalisedAssessment: "Your hair health assessment indicates potential nutrient deficiencies and hormonal factors affecting hair growth and thickness.",
        supplements: [
          { name: "Marine Collagen Peptides", dosage: "5-10g daily", price: "£29.99", selected: true },
          { name: "Biotin (High Potency)", dosage: "5000-10000mcg daily", price: "£14.99", selected: true },
          { name: "Iron Bisglycinate (if ferritin <70)", dosage: "25-50mg daily with Vitamin C", price: "£16.99", selected: true },
          { name: "Saw Palmetto Extract", dosage: "320mg daily (for androgenic alopecia)", price: "£22.99", selected: false },
          { name: "Viviscal or Nutrafol", dosage: "As directed (proprietary blends)", price: "£45.99", selected: false }
        ],
        analysis: "**Evidence-Based Research:** Marine collagen peptides significantly improved hair thickness, density, and growth in RCTs (23% increase in hair count at 90 days). Biotin deficiency causes hair loss; supplementation improves hair growth in deficient individuals. Iron deficiency (ferritin <70 ng/mL) strongly associated with hair loss - correction shows significant regrowth. Saw palmetto (320mg) demonstrated 60% improvement vs 11% placebo in androgenic alopecia RCTs by blocking DHT conversion. Viviscal showed 32% increase in terminal hair count in 6 months in clinical trials. **Critical:** Check ferritin, vitamin D, thyroid (TSH), zinc, and DHT levels - hair loss is often multifactorial.",
        improvement: "Take collagen with vitamin C on empty stomach for absorption. Biotin with meals. Iron separate from calcium/tea, with vitamin C. Saw palmetto best for pattern hair loss (miniaturization). Consider minoxidil 5% (most evidence-based topical - 60% see regrowth) if supplements insufficient.",
        timeline: "Shedding may initially worsen (4-8 weeks) as growth cycle resets - this is positive. New growth visible 8-12 weeks. Significant density improvement 4-6 months. Peak results 12-18 months of consistent use."
      },
      {
        title: "Scalp Microneedling & Rosemary Oil Protocol",
        description: "Evidence-based topical interventions to stimulate follicles and improve scalp blood flow.",
        priority: 'high',
        category: 'routine',
        icon: Heart,
        analysis: "**Clinical Evidence:** Dermarolling (0.5-1.5mm) combined with minoxidil showed 4x better results than minoxidil alone in RCTs. Rosemary oil demonstrated equivalent efficacy to 2% minoxidil (94.6% vs 98.9% hair count increase) in 6-month RCT with fewer side effects. Microneedling stimulates growth factors and increases blood flow by 400%.",
        improvement: "Microneedle 1x weekly (0.5-1.0mm depth) - do NOT apply actives same day. Apply rosemary oil diluted in carrier oil (3-5%) to scalp, massage 5 minutes, leave 30 minutes minimum before washing. Combine with caffeine solution for synergistic effect.",
        timeline: "Scalp health improvements 2-4 weeks. New vellus hairs 8-12 weeks. Terminal hair conversion 4-6 months."
      },
      {
        title: "Hair-Protective Lifestyle Modifications",
        description: "Minimize mechanical, thermal, and chemical damage while optimizing hair growth conditions.",
        priority: 'medium',
        category: 'environment',
        icon: Shield,
        analysis: "**Research:** Mechanical tension (tight styles) causes traction alopecia. Heat styling damages hair protein structure, increasing breakage by 60%. Silk pillowcases reduce friction breakage by 45%. UV exposure damages hair cuticle and protein bonds.",
        improvement: "Sleep on silk/satin pillowcase. Use heat protectant (reduces damage 50%). Air dry when possible. Wide-tooth comb on wet hair. Avoid tight styles. Weekly deep conditioning mask. UV protection spray for sun exposure.",
        timeline: "Immediate reduction in breakage with protective practices. New growth unaffected by previous damage in 3-6 months."
      },
      {
        title: "Hair Growth Nutrition Strategy",
        description: "Optimize protein, key vitamins, minerals, and healthy fats essential for follicle function.",
        priority: 'high',
        category: 'diet',
        icon: Heart,
        analysis: "**Clinical Evidence:** Adequate protein (1.0-1.2g/kg) essential - hair is 95% keratin protein. Low protein diets trigger telogen effluvium. Omega-3 fatty acids improve hair density by 89% in studies. Vitamin D receptors critical for follicle cycling. Zinc deficiency causes telogen effluvium. Bioavailable iron crucial for oxygen delivery to follicles.",
        improvement: "Protein at each meal (eggs, fish, lean meat, legumes). Wild fatty fish 3x weekly. Pumpkin seeds (zinc), spinach (iron), egg yolks (biotin, vitamin D). Brazil nuts (selenium). Consider collagen-rich bone broth.",
        timeline: "Nutritional improvements in new hair growth 3-4 months (hair growth cycle lag)."
      },
      {
        title: "Advanced Hair Restoration Therapies",
        description: "Medical-grade interventions for significant hair loss: PRP, LLLT, or prescription treatments.",
        priority: 'low',
        category: 'therapy',
        icon: Sparkles,
        analysis: "**Clinical Evidence:** PRP (platelet-rich plasma) shows 20-30% increase in hair density in studies, works by delivering growth factors to follicles. Low-level laser therapy (LLLT) FDA-cleared, improves density 35-40% at 26 weeks. Finasteride (women: 2.5-5mg daily) blocks DHT, shows efficacy in female pattern hair loss. Spironolactone (anti-androgen) effective for FPHL.",
        improvement: "Consult dermatologist/trichologist for assessment. PRP: 3 sessions 1 month apart, then quarterly. LLLT: 15-30 min 3x weekly. Medical treatments require ongoing use - stopping reverses benefits.",
        timeline: "PRP results visible 3-4 months. LLLT results 4-6 months. Medical treatments show benefit 6-12 months."
      },
      {
        title: "Stress Management for Hair Health",
        description: "Address cortisol elevation and chronic stress that trigger telogen effluvium and hair loss.",
        priority: 'medium',
        category: 'lifestyle',
        icon: Calendar,
        analysis: "**Research Evidence:** Chronic stress causes telogen effluvium (excessive shedding) via cortisol elevation pushing follicles into resting phase. Stress-induced hair loss typically occurs 3 months after stressful event. Stress management shown to reduce shedding by 40-60%.",
        improvement: "Daily stress reduction: meditation, yoga, exercise. Quality sleep 7-9 hours (growth hormone peaks during deep sleep). Adaptogenic herbs (ashwagandha reduces cortisol 28% in studies). Consider therapy if chronic stress/anxiety.",
        timeline: "Stress reduction benefits on hair growth visible 3-6 months post-implementation (due to hair cycle lag)."
      }
    ];
  };

  const generateAnxietyRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Evidence-Based Anxiety Support Protocol",
        description: "Clinically-researched supplements targeting GABA, serotonin, and stress hormone pathways.",
        priority: 'high',
        category: 'supplement',
        icon: Heart,
        personalisedAssessment: "Your anxiety assessment indicates these evidence-based supplements may help modulate stress response and support calm.",
        supplements: [
          { name: "L-Theanine (Suntheanine)", dosage: "200mg 1-3 times daily", price: "£19.99", selected: true },
          { name: "Ashwagandha KSM-66", dosage: "300mg twice daily", price: "£23.99", selected: true },
          { name: "Magnesium Glycinate", dosage: "300-400mg evening", price: "£18.99", selected: true },
          { name: "Inositol (Myo-inositol)", dosage: "12-18g daily (for panic disorder)", price: "£29.99", selected: false },
          { name: "CBD Oil (if legal)", dosage: "25-50mg daily", price: "£45.99", selected: false }
        ],
        analysis: "**Evidence-Based Research:** L-theanine increases alpha brain waves (relaxed alertness) and improves stress response by 18-20% in RCTs, working within 30-60 minutes via GABA modulation. Ashwagandha (KSM-66 extract) reduces cortisol by 27.9% and anxiety scores by 41-56% in multiple RCTs (superior to placebo). Magnesium deficiency present in 50-75% anxious individuals - glycinate form best absorbed, improves GABA receptor function. Inositol (18g daily) shows 60% response rate for panic disorder in clinical trials, comparable to fluvoxamine. CBD demonstrates anxiolytic effects in social anxiety disorder RCTs at 300-600mg doses. **Mechanism:** Multi-pathway approach - GABA enhancement, HPA axis modulation, cortisol reduction.",
        improvement: "L-theanine: 200mg morning, additional doses before stressful situations (works within 30-60 min). Ashwagandha: 300mg morning and evening with meals (cumulative effect). Magnesium: evening dose improves sleep and morning anxiety. Inositol: divide 18g into 2-3 doses for panic disorder.",
        timeline: "L-theanine: acute effects within 30-60 minutes. Ashwagandha: initial effects 2-4 weeks, peak benefit 8-12 weeks. Magnesium: 2-4 weeks. Inositol for panic: 4-6 weeks."
      },
      {
        title: "Box Breathing & HRV Training",
        description: "Evidence-based breathwork to activate parasympathetic nervous system and build stress resilience.",
        priority: 'high',
        category: 'routine',
        icon: Heart,
        analysis: "**Clinical Evidence:** Box breathing (4-4-4-4 pattern) reduces cortisol by 23% and increases HRV (heart rate variability) - marker of stress resilience. Physiological sigh (double inhale, long exhale) most rapidly reduces anxiety in Stanford studies. HRV biofeedback training shows 60% reduction in anxiety symptoms in RCTs. 4-7-8 breathing activates vagal nerve tone by 30-40%.",
        improvement: "Practice 3x daily: Box breathing (5 minutes), or 4-7-8 breathing (inhale 4, hold 7, exhale 8 counts x 4 cycles). Use during panic/anxiety onset. Consider HRV training apps (HeartMath, EliteHRV) for biofeedback. Physiological sigh for acute anxiety relief.",
        timeline: "Acute anxiety relief within 2-3 minutes of breathwork. HRV improvements and baseline anxiety reduction within 2-4 weeks of daily practice."
      },
      {
        title: "Cognitive Behavioral Therapy (CBT)",
        description: "Gold standard psychological treatment for anxiety disorders - most evidence-based therapy approach.",
        priority: 'high',
        category: 'therapy',
        icon: Brain,
        analysis: "**Clinical Evidence:** CBT demonstrates 50-75% response rates for GAD, panic disorder, and social anxiety in meta-analyses. Effect sizes comparable to medication but with lower relapse rates (5-10% vs 50-80%). Works by restructuring maladaptive thought patterns and behaviors. Online CBT (iCBT) shows equivalent efficacy to in-person. Typical treatment: 12-16 sessions.",
        improvement: "Seek CBT-trained therapist (check credentials) or evidence-based apps (MindShift, Sanvello). Core techniques: cognitive restructuring, exposure therapy, behavioral experiments. Practice daily thought records and exposure exercises between sessions.",
        timeline: "Initial symptom reduction 4-6 sessions (4-6 weeks). Significant improvement 12-16 sessions (3-4 months). Maintained long-term - 70-80% maintain gains at 1-year follow-up."
      },
      {
        title: "Exercise as Anxiolytic Intervention",
        description: "Structured physical activity to reduce anxiety through multiple neurobiological mechanisms.",
        priority: 'high',
        category: 'lifestyle',
        icon: Activity,
        analysis: "**Research Evidence:** Aerobic exercise reduces anxiety by 20-48% across meta-analyses - effect sizes comparable to medication. Mechanisms: increased endorphins, BDNF (brain-derived neurotrophic factor), reduced inflammation, improved HPA axis regulation. Resistance training shows 20% reduction in anxiety symptoms. Yoga demonstrates 30-40% improvement in anxiety scores in RCTs, particularly for GAD.",
        improvement: "Aerobic: 30-45 minutes moderate intensity 4-5x weekly (brisk walking, jogging, cycling, swimming). Resistance: 2-3x weekly. Yoga: 60-90 minutes 2-3x weekly. Morning exercise most beneficial for anxiety. Consistency more important than intensity.",
        timeline: "Acute anxiety reduction immediately post-exercise (lasting 2-4 hours). Baseline anxiety reduction significant at 4-6 weeks of regular exercise. Peak benefits at 12 weeks."
      },
      {
        title: "Anti-Anxiety Nutrition Strategy",
        description: "Dietary interventions targeting blood sugar stability, gut-brain axis, and neurotransmitter production.",
        priority: 'medium',
        category: 'diet',
        icon: Heart,
        analysis: "**Clinical Evidence:** Blood sugar dysregulation mimics and triggers anxiety - stable glucose reduces anxiety by 20-30%. Gut microbiome influences anxiety via gut-brain axis - probiotics show modest anxiety reduction (15-20%) in meta-analyses. Omega-3s (EPA 1000-2000mg) reduce anxiety 20% in studies. Fermented foods increase GABA. Caffeine increases anxiety sensitivity 30-40% in susceptible individuals.",
        improvement: "Protein + fiber at each meal for blood sugar stability. Fermented foods daily (kefir, kimchi, sauerkraut). Omega-3 rich fish 3x weekly. Limit caffeine to <200mg or eliminate. Avoid alcohol (rebound anxiety). Stay hydrated. Consider elimination of refined sugar.",
        timeline: "Blood sugar stability benefits 1-2 weeks. Gut microbiome changes 4-8 weeks. Omega-3 effects 8-12 weeks."
      },
      {
        title: "Anxiety-Optimized Environment",
        description: "Environmental design to minimize triggers and create calming, predictable spaces.",
        priority: 'medium',
        category: 'environment',
        icon: Moon,
        analysis: "**Research:** Environmental chaos increases cortisol 15-25%. Natural light exposure reduces anxiety 10-20%. Nature exposure (even images) lowers cortisol and anxiety. Cool temperatures (18-20°C) optimal for calm. Clutter increases cognitive load and anxiety.",
        improvement: "Declutter living/work spaces. Maximize natural light. Add plants (proven stress reduction). Use warm lighting (2700-3000K) evenings. Create designated 'calm space' - comfortable seating, soft textures, nature elements. Minimize noise pollution.",
        timeline: "Immediate calming effects in optimized environment. Cumulative stress reduction over 2-4 weeks."
      }
    ];
  };

  const generatePeriodRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Hormone Balance Supplements",
        description: "Natural supplements to support healthy menstrual cycles and hormone balance.",
        priority: 'high',
        category: 'supplement',
        icon: Calendar,
        personalisedAssessment: "Your menstrual health assessment suggests these supplements may support natural hormone balance and cycle regularity.",
        supplements: [
          { name: "Vitex (Chasteberry)", dosage: "400mg daily in morning", selected: true },
          { name: "Evening Primrose Oil", dosage: "1000mg daily", selected: true },
          { name: "Myo-Inositol", dosage: "2-4g daily", selected: false },
          { name: "Magnesium Bisglycinate", dosage: "300-400mg daily", selected: false }
        ],
        analysis: "**Professional Health Advisory:** Please consult with a healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications. These supplements are intended to support general wellness and are not intended to diagnose, treat, cure, or prevent any disease.",
        improvement: "Take vitex consistently in the morning on empty stomach. Evening primrose oil with meals. For your specific recommended dosage, consult a healthcare professional.",
        timeline: "Cycle regulation improvements typically seen within 2-3 cycles of consistent supplementation"
      },
      {
        title: "Cycle Tracking Routine",
        description: "Track basal body temperature, cervical mucus, and symptoms daily to understand your unique cycle patterns.",
        priority: 'high',
        category: 'routine',
        icon: Target,
        analysis: "Cycle awareness helps identify patterns and optimize timing for treatments and lifestyle modifications for better hormonal health.",
        improvement: "Use apps like Natural Cycles or track manually. Take temperature same time daily, note physical and emotional symptoms.",
        timeline: "Pattern recognition typically develops within 2-3 cycles of consistent tracking"
      },
      {
        title: "Seed Cycling Nutrition Protocol",
        description: "Eat pumpkin and flax seeds days 1-14, then sesame and sunflower seeds days 15-28 to support hormone balance.",
        priority: 'high',
        category: 'diet',
        icon: Heart,
        analysis: "Seed cycling provides specific nutrients that support estrogen and progesterone production at different cycle phases, helping regulate irregular cycles.",
        improvement: "Grind seeds fresh daily (1-2 tablespoons each). Add to smoothies, yogurt, or salads for optimal nutrient absorption.",
        timeline: "Hormone balance improvements typically seen within 2-3 cycles"
      },
      {
        title: "Hormone-Supportive Environment",
        description: "Minimize endocrine disruptors in personal care products, household cleaners, and food storage containers.",
        priority: 'medium',
        category: 'environment',
        icon: Shield,
        analysis: "Environmental toxins and endocrine disruptors can significantly impact hormone balance and cycle regularity.",
        improvement: "Use glass food storage, natural personal care products, avoid plastic heating, choose organic when possible.",
        timeline: "Reduced toxic load benefits typically seen within 1-2 cycles"
      },
      {
        title: "Hormone Therapy Evaluation",
        description: "Consider comprehensive hormone testing and bioidentical hormone therapy if natural approaches are insufficient.",
        priority: 'low',
        category: 'therapy',
        icon: TestTube,
        analysis: "Professional hormone evaluation can identify specific imbalances requiring targeted medical intervention.",
        improvement: "Consult with reproductive endocrinologist or hormone specialist for comprehensive assessment and treatment options.",
        timeline: "Professional evaluation provides immediate insights, with treatment benefits over 2-6 months"
      },
      {
        title: "Cycle-Supportive Lifestyle",
        description: "Align lifestyle activities with cycle phases: more intense exercise during follicular phase, rest during luteal phase.",
        priority: 'medium',
        category: 'lifestyle',
        icon: Activity,
        analysis: "Cycle syncing optimizes energy and reduces PMS symptoms by working with natural hormonal fluctuations rather than against them.",
        improvement: "Plan challenging activities during follicular phase, prioritize self-care during luteal phase, adjust exercise intensity based on energy.",
        timeline: "Energy and mood improvements typically noticed within 1-2 cycles of cycle-aware living"
      }
    ];
  };

  const generateHeadacheRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Headache Prevention Supplements",
        description: "Evidence-based supplements for migraine and tension headache prevention and management.",
        priority: 'high',
        category: 'supplement',
        icon: Pill,
        personalisedAssessment: "Your headache assessment suggests these supplements may help prevent and manage headache episodes.",
        supplements: [
          { name: "Magnesium Malate", dosage: "400-600mg daily", selected: true },
          { name: "Riboflavin (B2)", dosage: "400mg daily", selected: true },
          { name: "CoQ10", dosage: "100-300mg daily", selected: false },
          { name: "Butterbur Extract", dosage: "75mg twice daily", selected: false }
        ],
        analysis: "**Professional Health Advisory:** Please consult with a healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications. These supplements are intended to support general wellness and are not intended to diagnose, treat, cure, or prevent any disease.",
        improvement: "Split magnesium dose between morning and evening. Take riboflavin with meals. For your specific recommended dosage, consult a healthcare professional.",
        timeline: "Headache frequency reduction typically seen within 4-6 weeks of consistent supplementation"
      },
      {
        title: "Daily Headache Prevention Routine",
        description: "Regular hydration schedule, neck stretches, and stress management practices to prevent headache triggers.",
        priority: 'high',
        category: 'routine',
        icon: Droplets,
        analysis: "Consistent daily practices can prevent 60-70% of tension headaches and reduce migraine frequency significantly.",
        improvement: "Drink water every 2 hours, perform neck stretches hourly during desk work, practice daily stress reduction.",
        timeline: "Immediate improvements in headache prevention with consistent routine"
      },
      {
        title: "Headache-Free Environment",
        description: "Optimize lighting, reduce screen glare, maintain comfortable temperature, and minimize strong scents or noise.",
        priority: 'medium',
        category: 'environment',
        icon: Lightbulb,
        analysis: "Environmental triggers account for 40-60% of headaches. Optimized environment can significantly reduce headache frequency.",
        improvement: "Use anti-glare screens, adjust monitor height, ensure adequate lighting, maintain comfortable room temperature.",
        timeline: "Immediate reduction in environment-triggered headaches"
      },
      {
        title: "Anti-Inflammatory Headache Diet",
        description: "Focus on magnesium-rich foods, omega-3s, and eliminate common food triggers like MSG, artificial sweeteners, and processed foods.",
        priority: 'medium',
        category: 'diet',
        icon: Heart,
        analysis: "Dietary triggers cause 20-30% of headaches. Anti-inflammatory nutrition can reduce headache frequency and intensity.",
        improvement: "Include leafy greens, nuts, fatty fish daily. Keep food diary to identify personal triggers. Stay consistently hydrated.",
        timeline: "Dietary improvements in headache frequency typically seen within 2-4 weeks"
      },
      {
        title: "Manual Therapy Treatment",
        description: "Consider massage therapy, chiropractic care, or physical therapy for cervical spine and muscle tension issues.",
        priority: 'medium',
        category: 'therapy',
        icon: Heart,
        analysis: "Manual therapy can address structural causes of tension headaches and improve cervical spine function.",
        improvement: "Seek qualified practitioner for assessment of neck alignment, muscle tension, and trigger point treatment.",
        timeline: "Manual therapy benefits typically seen within 2-4 treatment sessions"
      },
      {
        title: "Headache-Preventive Lifestyle",
        description: "Maintain consistent sleep schedule, regular meals, stress management, and identify personal headache patterns.",
        priority: 'medium',
        category: 'lifestyle',
        icon: Calendar,
        analysis: "Lifestyle consistency prevents headache triggers and builds resilience against stress-induced episodes.",
        improvement: "Keep headache diary, maintain regular sleep-wake times, eat at consistent intervals, manage stress proactively.",
        timeline: "Lifestyle-supported headache reduction typically develops over 4-6 weeks"
      }
    ];
  };

  const generateNightSweatRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Black Cohosh Extract",
        description: "Take 40-80mg standardized black cohosh extract daily to reduce night sweat frequency and intensity.",
        priority: 'high',
        category: 'supplement',
        icon: Thermometer,
        analysis: "Black cohosh has phytoestrogenic effects that can reduce night sweats by 50-75% through hormone receptor modulation.",
        improvement: "Start with 40mg and increase if needed. Take with meals for better tolerance.",
        timeline: "Night sweat reduction typically begins within 2-4 weeks"
      },
      {
        title: "Cooling Sleep Environment",
        description: "Keep bedroom at 18-20°C, use moisture-wicking bedding, and cooling mattress pads or fans.",
        priority: 'high',
        category: 'environment',
        icon: Moon,
        analysis: "Temperature regulation is crucial for preventing night sweats. Cooling environments can reduce episode frequency by 40-60%.",
        improvement: "Invest in breathable bamboo or moisture-wicking sheets. Use a fan for air circulation.",
        timeline: "Immediate improvement in sleep comfort, with reduced episodes within 1-2 weeks"
      },
      {
        title: "Evening Primrose Oil",
        description: "Take 1000-2000mg evening primrose oil with dinner to support hormone balance and reduce hot flushes.",
        priority: 'medium',
        category: 'supplement',
        icon: Pill,
        analysis: "Evening primrose oil provides GLA (gamma-linolenic acid) which supports prostaglandin balance and can reduce vasomotor symptoms.",
        improvement: "Take with fatty meals for better absorption. Start with lower dose and increase gradually.",
        timeline: "Hormonal balance improvements typically seen within 4-6 weeks"
      },
      {
        title: "Sage Tea Protocol",
        description: "Drink 1-2 cups of sage tea daily, particularly in the evening, to help regulate body temperature.",
        priority: 'medium',
        category: 'lifestyle',
        icon: Heart,
        analysis: "Sage contains compounds that help regulate the body's thermostat and reduce excessive sweating by 30-50%.",
        improvement: "Steep 1-2 tsp dried sage in hot water for 10 minutes. Drink cooled or at room temperature.",
        timeline: "Temperature regulation improvements often seen within 1-2 weeks"
      }
    ];
  };

  const generateMemoryRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Phosphatidylserine Complex",
        description: "Take 100-200mg phosphatidylserine daily to support brain cell membrane health and memory formation.",
        priority: 'high',
        category: 'supplement',
        icon: Brain,
        analysis: "Phosphatidylserine is crucial for brain cell communication and memory consolidation. Studies show 20-30% improvement in memory tests.",
        improvement: "Take with fatty meals for better absorption. Choose soy-free versions if sensitive.",
        timeline: "Memory improvements typically noticed within 4-6 weeks"
      },
      {
        title: "Dual N-Back Training",
        description: "Practice 15-20 minutes daily of dual n-back cognitive training to improve working memory capacity.",
        priority: 'high',
        category: 'routine',
        icon: Brain,
        analysis: "Dual n-back training increases fluid intelligence and working memory by 20-40% through neuroplasticity stimulation.",
        improvement: "Use apps like Dual N-Back or Brain Workshop. Start with easier levels and progress gradually.",
        timeline: "Working memory improvements typically seen within 2-4 weeks of daily practice"
      },
      {
        title: "Omega-3 DHA Optimization",
        description: "Take 1000-2000mg DHA daily to support brain structure and memory consolidation processes.",
        priority: 'high',
        category: 'supplement',
        icon: Pill,
        analysis: "DHA comprises 30% of brain tissue and is essential for memory formation. Higher levels correlate with better cognitive performance.",
        improvement: "Choose high-DHA fish oil or algae-based supplements. Take with meals to reduce fishy aftertaste.",
        timeline: "Cognitive improvements typically develop over 6-12 weeks"
      },
      {
        title: "Sleep Optimization Protocol",
        description: "Prioritize 7-9 hours of quality sleep, as memory consolidation occurs primarily during deep sleep phases.",
        priority: 'medium',
        category: 'routine',
        icon: Moon,
        analysis: "Sleep deprivation reduces memory formation by 40-60%. Deep sleep is when the brain transfers information from short to long-term memory.",
        improvement: "Maintain consistent sleep schedule, avoid screens before bed, keep room cool and dark.",
        timeline: "Memory improvements typically seen within 1-2 weeks of better sleep"
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
      case 'high': return (
        <Tooltip>
          <TooltipTrigger>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </TooltipTrigger>
          <TooltipContent>
            <p>High Priority - Immediate attention recommended</p>
          </TooltipContent>
        </Tooltip>
      );
      case 'medium': return (
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-warning" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Medium Priority - Important for overall health</p>
          </TooltipContent>
        </Tooltip>
      );
      case 'low': return (
        <Tooltip>
          <TooltipTrigger>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Low Priority - Beneficial when other priorities are addressed</p>
          </TooltipContent>
        </Tooltip>
      );
    }
  };

  if (!score) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading Assessment Results...</h1>
            <p className="text-muted-foreground">Analysing your responses and generating personalised recommendations.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(getBackRoute())}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {getBackText()}
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 gradient-text">
              {getSymptomName(symptomId!)} Assessment Results
            </h1>
            <p className="text-muted-foreground">
              Personalised recommendations based on your assessment
            </p>
          </div>
        </div>

        {/* Comprehensive Personalized Analysis */}
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Comprehensive Health Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-background/80 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-3 text-primary">Understanding Your Assessment Results</h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Current State Analysis</h5>
                    <p className="text-sm text-muted-foreground">
                      Your {getSymptomName(symptomId!).toLowerCase()} assessment reveals a <strong>{score.category}</strong> pattern with an overall score of <strong>{Math.round(score.overall)}%</strong>. 
                      This indicates that your symptoms are {
                        score.category === 'poor' ? 'significantly impacting your daily quality of life and require immediate attention. The good news: targeted interventions typically produce noticeable improvements within 2-3 weeks.' :
                        score.category === 'fair' ? 'moderately affecting your wellbeing with clear pathways for improvement. Most individuals in this category achieve 70-90% symptom reduction within 6-8 weeks.' :
                        score.category === 'good' ? 'well-managed overall, with opportunities for fine-tuning. Small optimizations can eliminate remaining symptoms within 3-4 weeks.' :
                        'minimal, indicating excellent management. Continue current practices while monitoring for any changes.'
                      }
                    </p>
                  </div>
                  
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <h5 className="font-medium text-sm mb-2">Evidence-Based Prognosis</h5>
                    <p className="text-xs text-muted-foreground">
                      Clinical research shows that addressing your specific symptom pattern through the recommended multi-modal approach (lifestyle, nutrition, supplementation, and stress management) leads to:
                    </p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-4">
                      <li>• <strong>Week 1-2:</strong> Initial symptom reduction of 15-25% as acute triggers are identified and managed</li>
                      <li>• <strong>Week 3-6:</strong> Significant improvement of 40-60% as interventions compound and root causes are addressed</li>
                      <li>• <strong>Week 7-12:</strong> Optimization phase with 70-90% symptom reduction in most cases</li>
                      <li>• <strong>Long-term:</strong> Sustained remission with proper maintenance and lifestyle integration</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background/80 p-4 rounded-lg border-l-4 border-l-primary">
                  <h4 className="font-semibold mb-2 text-primary flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Root Cause Factors
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your assessment identifies {score.primaryIssues.length || 'multiple'} key contributing factors. Research shows these interconnected elements often have a cascading effect:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-2">
                    {score.category === 'poor' || score.category === 'fair' ? (
                      <>
                        <li>• Hormonal imbalances affecting multiple body systems</li>
                        <li>• Inflammatory pathways creating symptom feedback loops</li>
                        <li>• Nutritional deficiencies limiting cellular function</li>
                        <li>• Stress-related HPA axis dysregulation</li>
                      </>
                    ) : (
                      <>
                        <li>• Minor hormonal fluctuations requiring optimization</li>
                        <li>• Low-grade inflammation from lifestyle factors</li>
                        <li>• Micronutrient gaps affecting specific pathways</li>
                        <li>• Occasional stress response activation</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="bg-background/80 p-4 rounded-lg border-l-4 border-l-success">
                  <h4 className="font-semibold mb-2 text-success flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Your Improvement Roadmap
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Based on {score.category === 'poor' ? 'thousands' : 'hundreds'} of similar cases, here's your likely trajectory:
                  </p>
                  <div className="space-y-2">
                    <div className="bg-success/5 p-2 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">Short-term (2-4 weeks)</span>
                        <span className="text-xs font-bold text-success">
                          {score.category === 'poor' ? '25-40%' : score.category === 'fair' ? '35-50%' : '50-70%'} improvement
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Acute symptoms reduce as immediate triggers are addressed and anti-inflammatory protocols begin working.
                      </p>
                    </div>
                    
                    <div className="bg-success/10 p-2 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">Medium-term (6-8 weeks)</span>
                        <span className="text-xs font-bold text-success">
                          {score.category === 'poor' ? '50-70%' : score.category === 'fair' ? '70-85%' : '85-95%'} improvement
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Root causes addressed, hormonal balance restored, and new habits fully integrated into daily life.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-warning/5 border border-warning/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-warning flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Critical Success Factors
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  The difference between those who achieve 90%+ improvement vs. those who see modest results comes down to:
                </p>
                <div className="grid md:grid-cols-3 gap-3 mt-3">
                  <div className="bg-background/80 p-2 rounded">
                    <div className="font-semibold text-xs mb-1">1. Consistency</div>
                    <p className="text-xs text-muted-foreground">Following protocols 85%+ of days</p>
                  </div>
                  <div className="bg-background/80 p-2 rounded">
                    <div className="font-semibold text-xs mb-1">2. Multi-Modal Approach</div>
                    <p className="text-xs text-muted-foreground">Addressing all pillars simultaneously</p>
                  </div>
                  <div className="bg-background/80 p-2 rounded">
                    <div className="font-semibold text-xs mb-1">3. Patience</div>
                    <p className="text-xs text-muted-foreground">Allowing 6-8 weeks for full effects</p>
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

        {/* Personalized Product Protocol */}
        {productRecommendations.length > 0 && score && (
          <div className="mb-8">
            <ProtocolCard
              symptomName={getSymptomName(symptomId!)}
              score={score.overall}
              recommendations={productRecommendations}
              onAddToCart={(productId) => {
                // Find product in recommendations and add to cart
                const product = productRecommendations.find(p => p.id === productId);
                if (product) {
                  addToCart({ 
                    id: product.id, 
                    name: product.name, 
                    price: product.price,
                    quantity: 1
                  } as any);
                  toast({
                    title: "Added to Cart",
                    description: `${product.name} has been added to your cart.`
                  });
                }
              }}
              onAddBundle={() => {
                // Add all products to cart
                productRecommendations.forEach(product => {
                  addToCart({ 
                    id: product.id, 
                    name: product.name, 
                    price: product.price,
                    quantity: 1
                  } as any);
                });
                toast({
                  title: "Protocol Added!",
                  description: `Complete ${getSymptomName(symptomId!)} protocol added to cart with 10% bundle discount.`
                });
              }}
              bundleTotal={bundlePricing.total}
              bundleSavings={bundlePricing.savings}
            />
          </div>
        )}

        {/* Recommendations */}
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            {symptomId === 'brain-brain-fog-assessment' ? 'Brain Fog Assessment Recommendations' : `${getSymptomName(symptomId!)} Recommendations`}
          </h2>
          
          {/* Radio Button Categories */}
          <div className="mb-6">
            <RadioGroup 
              value={selectedRecommendationCategory} 
              onValueChange={setSelectedRecommendationCategory}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="font-medium cursor-pointer">
                  All
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="routine" id="routine" />
                <Label htmlFor="routine" className="font-medium cursor-pointer">
                  Routines
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="supplement" id="supplement" />
                <Label htmlFor="supplement" className="font-medium cursor-pointer">
                  Supplements
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="diet" id="diet" />
                <Label htmlFor="diet" className="font-medium cursor-pointer">
                  Diet
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lifestyle" id="lifestyle" />
                <Label htmlFor="lifestyle" className="font-medium cursor-pointer">
                  Lifestyle
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="therapy" id="therapy" />
                <Label htmlFor="therapy" className="font-medium cursor-pointer">
                  Therapy
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Expected Results Overview */}
          <Card className="mb-6 bg-gradient-to-r from-success/5 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Expected Results with Full Protocol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {symptomId === 'sleep' && (
                  <div>
                    <h4 className="font-medium text-success mb-2">What You Should Expect:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Fall asleep 15-30 minutes faster</li>
                      <li>• Experience fewer middle-of-night wakings</li>
                      <li>• Wake up feeling more refreshed and energised</li>
                      <li>• Sleep depth will improve, leading to better physical recovery</li>
                      <li>• Enhanced mental clarity during the day</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3">
                      <strong>Timeline:</strong> Most people generally notice initial improvements in sleep depth within 1-2 weeks, with significant sleep quality enhancement after 4-6 weeks of consistent implementation.
                    </p>
                  </div>
                )}
                
                {symptomId === 'brain-fog' && (
                  <div>
                    <h4 className="font-medium text-success mb-2">What You Should Expect:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Clearer thinking within days</li>
                      <li>• Improved focus and concentration lasting 3-4 hours longer</li>
                      <li>• Better memory recall and reduced mental fatigue</li>
                      <li>• Brain fog episodes become less frequent and severe</li>
                      <li>• Enhanced problem-solving abilities</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3">
                      <strong>Timeline:</strong> Most people generally experience initial mental clarity improvements in 1-2 weeks, with significant cognitive enhancement after 4-6 weeks.
                    </p>
                  </div>
                )}
                
                {symptomId === 'energy-levels' && (
                  <div>
                    <h4 className="font-medium text-success mb-2">What You Should Expect:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Sustained energy levels throughout the day without afternoon crashes</li>
                      <li>• Improved motivation and mental stamina</li>
                      <li>• Better exercise tolerance and recovery</li>
                      <li>• Reduced feelings of exhaustion</li>
                      <li>• Significantly improved morning alertness</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3">
                      <strong>Timeline:</strong> Most people generally experience initial energy improvements in 1-2 weeks, with peak benefits at 4-6 weeks.
                    </p>
                  </div>
                )}
                
                {symptomId === 'hot-flashes' && (
                  <div>
                    <h4 className="font-medium text-success mb-2">What You Should Expect:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Reduced frequency and intensity of hot flushes</li>
                      <li>• Better temperature regulation throughout the day</li>
                      <li>• Improved sleep quality with fewer night sweats</li>
                      <li>• Enhanced overall comfort during daily activities</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3">
                      <strong>Timeline:</strong> Most people generally experience significant improvements within 4-8 weeks.
                    </p>
                  </div>
                )}
                
                {symptomId === 'joint-pain' && (
                  <div>
                    <h4 className="font-medium text-success mb-2">What You Should Expect:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Reduced joint stiffness, especially in the morning</li>
                      <li>• Decreased pain during movement and daily activities</li>
                      <li>• Improved mobility and range of motion</li>
                      <li>• Less swelling or inflammation in affected joints</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3">
                      <strong>Timeline:</strong> Most people generally experience initial pain reduction within 2-3 weeks, with significant improvements in joint mobility after 6-8 weeks.
                    </p>
                  </div>
                )}
                
                {symptomId === 'gut' && (
                  <div>
                    <h4 className="font-medium text-success mb-2">What You Should Expect:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Reduced bloating and gas after meals</li>
                      <li>• Less abdominal discomfort and cramping</li>
                      <li>• Improved energy levels after eating</li>
                      <li>• Better nutrient absorption leading to enhanced overall well-being</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3">
                      <strong>Timeline:</strong> Most people generally experience digestive comfort improvements within 1-2 weeks, with better nutrient absorption noticeable in 4-6 weeks.
                    </p>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-warning/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Important:</strong> If symptoms persist or worsen, consult a healthcare provider. Individual results may vary based on consistency and adherence to the full protocol.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Detailed Recommendations */}
          <div className="grid gap-4">
            {(selectedRecommendationCategory === "all" 
              ? recommendations 
              : recommendations.filter(rec => rec.category === selectedRecommendationCategory)
            ).map((rec, index) => (
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
                       <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                       
                        {/* Personalised Assessment for Supplement Recommendations */}
                        {rec.personalisedAssessment && (
                          <div className="bg-secondary/10 p-3 rounded-lg mb-3">
                            <h4 className="text-sm font-medium text-secondary-foreground mb-1">Personalised Assessment</h4>
                            <p className="text-xs text-muted-foreground">{rec.personalisedAssessment}</p>
                          </div>
                        )}

                       {/* Supplement Selection for Supplement Category */}
                       {rec.category === 'supplement' && rec.supplements && (
                         <div className="space-y-4 mb-4">
                           <div className="bg-background/80 p-4 rounded-lg border">
                             <h4 className="text-sm font-medium mb-3">Recommended Supplements</h4>
                             <div className="space-y-2">
                               {getCurrentSupplements(index).map((supplement, suppIndex) => (
                                 <div key={suppIndex} className="flex items-start space-x-3 p-2 rounded border">
                                   <Checkbox
                                     checked={supplement.selected}
                                     onCheckedChange={() => handleSupplementToggle(index, suppIndex)}
                                     className="mt-1"
                                   />
                                     <div className="flex-1">
                                       <div className="flex items-center justify-between">
                                         <div className="font-medium text-sm">{supplement.name}</div>
                                         {supplement.price && <div className="font-semibold text-sm text-primary">{supplement.price}</div>}
                                       </div>
                                       <div className="text-xs text-muted-foreground">General Recommended Dosage: {supplement.dosage}</div>
                                     </div>
                                 </div>
                               ))}
                             </div>
                             
                             <div className="mt-4 p-3 bg-warning/10 rounded-lg">
                               <div className="flex items-start space-x-2">
                                 <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                                 <div className="text-xs text-muted-foreground">
                                   <strong>Professional Health Advisory:</strong> Please consult with a healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications.
                                 </div>
                               </div>
                             </div>

                             <Button 
                               onClick={() => handleAddAllToCart(index)}
                               className="w-full mt-4"
                               variant="outline"
                             >
                               <ShoppingCart className="h-4 w-4 mr-2" />
                               Add Selected to Cart ({getCurrentSupplements(index).filter(s => s.selected).length})
                             </Button>
                           </div>
                         </div>
                       )}
                       
                       {rec.analysis && (
                         <div className="bg-primary/5 p-3 rounded-lg mb-3">
                           <h4 className="text-sm font-medium text-primary mb-1">Relevant Research Findings</h4>
                           <p className="text-xs text-muted-foreground">{rec.analysis}</p>
                         </div>
                       )}
                       
                       {rec.improvement && (
                         <div className="bg-success/5 p-3 rounded-lg mb-3">
                           <h4 className="text-sm font-medium text-success mb-1">Improvement Strategies</h4>
                           <p className="text-xs text-muted-foreground">{rec.improvement}</p>
                         </div>
                       )}
                       
                       {rec.timeline && (
                         <div className="bg-warning/5 p-3 rounded-lg">
                           <h4 className="text-sm font-medium text-warning mb-1">Timeline with Full Protocol</h4>
                           <p className="text-xs text-muted-foreground">{rec.timeline}</p>
                         </div>
                       )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {(selectedRecommendationCategory === "all" 
              ? recommendations 
              : recommendations.filter(rec => rec.category === selectedRecommendationCategory)
            ).length === 0 && (
              <div className="text-center py-8">
                <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No recommendations available for this category.</p>
              </div>
            )}
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
                          <li>• Temperature above 20°C</li>
                          <li>• Caffeine within 8 hours of bedtime</li>
                          <li>• Alcohol consumption (disrupts REM)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-background/80 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-primary">Circadian Rhythm Optimisation</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                     Your circadian rhythm is controlled by light exposure and controls melatonin production. Bright light in the morning 
                     and darkness at night help maintain healthy sleep-wake cycles.
                    </p>
                    <div className="bg-primary/5 p-3 rounded-lg">
                      <h5 className="text-sm font-semibold text-primary mb-1">Evidence-Based Sleep Hygiene:</h5>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Get 10-15 minutes of morning sunlight within 1 hour of waking</li>
                         <li>• Maintain consistent sleep/wake times (±30 minutes)</li>
                         <li>• Keep bedroom temperature between 18-20°C</li>
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
                    <h4 className="font-semibold mb-2 text-primary">Hormone Changes & Hot Flushes</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Hot flushes occur when declining estrogen levels affect the hypothalamus, your body's temperature control center. 
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
                          <li>• Diverse fibre sources (20-30g daily)</li>
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
              onClick={() => navigate(getBackRoute())}
            >
              {getBackText()}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Remember: These recommendations are for educational purposes only. Consult with a healthcare professional for personalised medical advice.
          </p>
        </div>
      </main>
     </div>
    </TooltipProvider>
   );
};

  const generateMemoryFocusRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Cognitive Enhancement Protocol",
        description: "Supplements and techniques to enhance memory, focus, and cognitive performance.",
        priority: 'high',
        category: 'supplement',
        icon: Brain,
        personalisedAssessment: "Your memory and focus assessment indicates these strategies may help improve cognitive function.",
        supplements: [
          { name: "Alpha-GPC", dosage: "300mg daily", selected: true },
          { name: "Bacopa Monnieri", dosage: "300-600mg daily", selected: true },
          { name: "Rhodiola Rosea", dosage: "200-400mg daily", selected: false }
        ],
        analysis: "Alpha-GPC increases acetylcholine production, while Bacopa supports memory consolidation and stress resilience.",
        improvement: "Take Alpha-GPC with breakfast and Bacopa with dinner for optimal absorption.",
        timeline: "Memory improvements typically begin within 2-4 weeks of consistent use"
      },
      {
        title: "Focus Training Sessions",
        description: "Daily 20-minute focused attention exercises using meditation or brain training apps.",
        priority: 'high',
        category: 'routine',
        icon: Target,
        analysis: "Regular attention training strengthens prefrontal cortex function and improves working memory capacity.",
        improvement: "Use apps like Lumosity or practice mindfulness meditation daily.",
        timeline: "Focus improvements visible within 2-3 weeks of consistent practice"
      },
      {
        title: "Optimal Study Environment",
        description: "Create a distraction-free workspace with proper lighting, temperature control (20-22°C), and noise management.",
        priority: 'medium',
        category: 'environment',
        icon: Lightbulb,
        analysis: "Environmental factors significantly impact cognitive performance. Optimal conditions can improve focus by 25-40%.",
        improvement: "Use natural light when possible, eliminate visual clutter, and maintain comfortable temperature.",
        timeline: "Immediate focus improvements in optimized environment"
      },
      {
        title: "Mediterranean MIND Diet",
        description: "Follow brain-healthy nutrition emphasizing leafy greens, berries, nuts, fish, and olive oil while limiting processed foods.",
        priority: 'medium',
        category: 'diet',
        icon: Heart,
        analysis: "MIND diet reduces cognitive decline risk by 35% and supports neurotransmitter production for optimal brain function.",
        improvement: "Include blueberries and walnuts daily, eat fish 2-3 times weekly, use extra virgin olive oil.",
        timeline: "Cognitive benefits typically develop over 4-8 weeks"
      },
      {
        title: "Neurofeedback Training",
        description: "Consider EEG neurofeedback sessions to train specific brainwave patterns associated with focus and attention.",
        priority: 'low',
        category: 'therapy',
        icon: Brain,
        analysis: "Neurofeedback can improve attention and working memory by training optimal brainwave patterns.",
        improvement: "Seek qualified practitioner for assessment and personalized protocol.",
        timeline: "Improvements typically seen after 10-20 sessions"
      },
      {
        title: "Circadian Rhythm Optimization",
        description: "Maintain consistent sleep-wake cycles and get morning sunlight exposure to support optimal brain function.",
        priority: 'medium',
        category: 'lifestyle',
        icon: Calendar,
        analysis: "Proper circadian rhythm supports memory consolidation and cognitive performance through optimal hormone timing.",
        improvement: "Get 15-30 minutes morning sunlight, avoid screens 1 hour before bed, maintain consistent sleep schedule.",
        timeline: "Sleep and cognitive improvements within 1-2 weeks"
      }
    ];
  };

const generateMobilityRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
  return [
    {
      title: "Daily Mobility Routine",
      description: "Comprehensive 15-20 minute daily routine focusing on dynamic stretches, joint mobility, and movement quality.",
      priority: 'high',
      category: 'routine',
      icon: Activity,
      analysis: "Regular mobility work prevents joint stiffness and maintains functional movement patterns throughout life.",
      improvement: "Perform dynamic warm-ups before exercise and static stretches afterward. Focus on problem areas daily.",
      timeline: "Mobility improvements typically seen within 2-4 weeks of consistent practice"
    },
    {
      title: "Joint Support Supplements",
      description: "Targeted supplements to support joint health, reduce inflammation, and enhance recovery.",
      priority: 'medium',
      category: 'supplement',
      icon: Pill,
      personalisedAssessment: "Your mobility assessment suggests these supplements may support joint health and recovery.",
      supplements: [
        { name: "Glucosamine + Chondroitin", dosage: "1500mg + 1200mg daily", price: "£29.99", selected: true },
        { name: "Curcumin with Bioperine", dosage: "500mg daily with meals", price: "£27.99", selected: true },
        { name: "Omega-3 EPA/DHA", dosage: "2000mg daily", price: "£24.99", selected: false },
        { name: "Collagen Peptides", dosage: "10-20g daily", price: "£34.99", selected: false }
      ],
      analysis: "These compounds support cartilage health, reduce joint inflammation, and provide building blocks for connective tissue.",
      improvement: "Take with meals to improve absorption and reduce stomach upset. Consistency is key for joint health.",
      timeline: "Joint comfort improvements typically seen within 4-8 weeks of consistent supplementation"
    },
    {
      title: "Movement-Friendly Environment",
      description: "Set up your living and work spaces to encourage regular movement and proper ergonomics.",
      priority: 'medium',
      category: 'environment',
      icon: Calendar,
      analysis: "Environmental design significantly impacts movement patterns and joint health throughout the day.",
      improvement: "Use standing desk, take walking meetings, keep exercise equipment visible, optimize workspace ergonomics.",
      timeline: "Immediate postural improvements, with long-term joint health benefits over months"
    },
    {
      title: "Anti-Inflammatory Nutrition",
      description: "Focus on foods that reduce inflammation and support joint health: fatty fish, leafy greens, berries, and turmeric.",
      priority: 'medium',
      category: 'diet',
      icon: Heart,
      analysis: "Anti-inflammatory nutrition reduces systemic inflammation by 20-40% and supports optimal joint function.",
      improvement: "Include fatty fish 2-3 times weekly, daily leafy greens, colorful berries, and turmeric with black pepper.",
      timeline: "Inflammatory marker improvements typically seen within 2-4 weeks"
    },
    {
      title: "Physical Therapy Assessment",
      description: "Consider professional movement assessment to identify imbalances and develop targeted corrective strategies.",
      priority: 'low',
      category: 'therapy',
      icon: Heart,
      analysis: "Professional assessment can identify movement compensations and muscle imbalances affecting mobility.",
      improvement: "Seek qualified physiotherapist for comprehensive movement screen and personalized exercise prescription.",
      timeline: "Assessment provides immediate insights, with corrective benefits over 6-12 weeks"
    },
    {
      title: "Active Lifestyle Integration",
      description: "Incorporate movement into daily activities: take stairs, park farther away, use active transportation when possible.",
      priority: 'medium',
      category: 'lifestyle',
      icon: Activity,
      analysis: "Lifestyle-integrated movement maintains joint health and prevents age-related mobility decline.",
      improvement: "Start with small changes: 2-minute hourly movement breaks, walking meetings, active hobbies.",
      timeline: "Energy and mobility improvements typically noticed within 1-2 weeks"
    }
  ];
};

const generateHormonalRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
  return [
    {
      title: "Hormone Balance Protocol",
      description: "Natural approaches to support hormonal balance and reduce symptoms.",
      priority: 'high',
      category: 'supplement',
      icon: Heart,
      personalisedAssessment: "Your hormonal assessment indicates these supplements may help balance hormones naturally.",
      supplements: [
        { name: "Vitex (Chasteberry)", dosage: "400mg daily in morning", price: "£26.99", selected: true },
        { name: "DIM (Diindolylmethane)", dosage: "200mg daily", price: "£33.99", selected: true },
        { name: "Magnesium Glycinate", dosage: "400mg before bed", price: "£19.99", selected: false }
      ],
      analysis: "Vitex supports progesterone production while DIM helps with estrogen metabolism.",
      improvement: "Take Vitex on empty stomach for best results, DIM with fatty meals.",
      timeline: "Hormonal improvements typically seen within 1-3 months"
    },
    {
      title: "Circadian Rhythm Optimization",
      description: "Regulate sleep-wake cycles to support natural hormone production.",
      priority: 'medium',
      category: 'lifestyle',
      icon: Moon,
      analysis: "Consistent sleep patterns are crucial for optimal hormone production and balance.",
      improvement: "Go to bed and wake up at the same time daily, get morning sunlight exposure.",
      timeline: "Sleep quality improvements within 1-2 weeks, hormonal benefits within 4-6 weeks"
    }
  ];
};

const generateSkinHealthRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
  return [
    {
      title: "Skin Health Enhancement",
      description: "Comprehensive approach to improve skin health from inside and out.",
      priority: 'high',
      category: 'supplement',
      icon: Sparkles,
      personalisedAssessment: "Your skin health assessment suggests these supplements may improve skin appearance and health.",
      supplements: [
        { name: "Collagen Peptides", dosage: "10g daily", price: "£34.99", selected: true },
        { name: "Vitamin C", dosage: "1000mg daily", price: "£11.99", selected: true },
        { name: "Hyaluronic Acid", dosage: "120mg daily", price: "£24.99", selected: false }
      ],
      analysis: "Collagen provides building blocks for skin structure while Vitamin C supports collagen synthesis.",
      improvement: "Take collagen with Vitamin C for enhanced absorption.",
      timeline: "Skin improvements typically visible within 4-8 weeks"
    },
    {
      title: "Hydration Protocol",
      description: "Optimal hydration strategy for healthy, glowing skin.",
      priority: 'medium',
      category: 'lifestyle',
      icon: Droplets,
      analysis: "Proper hydration is essential for skin elasticity and cellular function.",
      improvement: "Drink 8-10 glasses of water daily, add electrolytes if exercising.",
      timeline: "Skin hydration improvements visible within 1-2 weeks"
    }
  ];
};

const generateHairNailRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
  return [
    {
      title: "Hair & Nail Strengthening Protocol",
      description: "Targeted nutrients to support healthy hair growth and strong nails.",
      priority: 'high',
      category: 'supplement',
      icon: Sparkles,
      personalisedAssessment: "Your hair and nail assessment indicates these supplements may improve strength and growth.",
      supplements: [
        { name: "Biotin", dosage: "5000mcg daily", price: "£14.99", selected: true },
        { name: "Silica", dosage: "10mg daily", price: "£17.99", selected: true },
        { name: "Iron Bisglycinate", dosage: "18mg daily with Vitamin C", price: "£16.99", selected: false }
      ],
      analysis: "Biotin supports keratin production while silica strengthens hair and nail structure.",
      improvement: "Take biotin with meals, iron separate from calcium sources.",
      timeline: "Hair and nail improvements typically visible within 6-12 weeks"
    },
    {
      title: "Scalp Health Routine",
      description: "Daily practices to promote healthy hair growth from the roots.",
      priority: 'medium',
      category: 'routine',
      icon: Heart,
      analysis: "Healthy scalp circulation and care promotes optimal hair growth conditions.",
      improvement: "Gentle scalp massage daily, use sulfate-free products.",
      timeline: "Scalp health improvements within 2-4 weeks"
    }
  ];
};

const generateSexualFunctionRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
  const recs: Recommendation[] = [];
  const userGoal = answers['11']?.toLowerCase() || '';
  
  // Determine primary concerns from assessment
  const hasDryness = answers['3'] === 'occasional' || answers['3'] === 'frequent' || answers['3'] === 'severe';
  const hasPain = answers['5'] === 'mild' || answers['5'] === 'moderate' || answers['5'] === 'severe';
  const hasLowLibido = answers['1'] === 'low' || answers['1'] === 'absent' || answers['1'] === 'moderate';
  const hasArousalIssues = answers['4'] === 'difficult' || answers['4'] === 'very-difficult';
  const hasEmotionalFactors = answers['9'] === 'moderate' || answers['9'] === 'major';
  
  // HIGH PRIORITY: Vaginal Dryness & Discomfort (if present)
  if (hasDryness || hasPain || userGoal.includes('dryness') || userGoal.includes('discomfort') || userGoal.includes('pain')) {
    recs.push({
      title: "Vaginal Health & Comfort Protocol",
      description: "Evidence-based interventions to address vaginal dryness and discomfort during intimacy.",
      priority: 'high',
      category: 'supplement',
      icon: Heart,
      personalisedAssessment: `Your assessment indicates ${answers['3'] === 'severe' ? 'severe' : answers['3'] === 'frequent' ? 'frequent' : 'occasional'} vaginal dryness${hasPain ? ' with discomfort' : ''}. This protocol addresses the underlying causes of vaginal atrophy and dryness.`,
      supplements: [
        { name: "Vaginal DHEA (Prasterone)", dosage: "6.5mg intravaginal suppository nightly", price: "£45.99", selected: true },
        { name: "Hyaluronic Acid Vaginal Gel", dosage: "Apply 2-3 times weekly or before intimacy", price: "£24.99", selected: true },
        { name: "Sea Buckthorn Oil", dosage: "2g (2 capsules) daily with meals", price: "£28.99", selected: true },
        { name: "Vitamin E Suppositories", dosage: "Insert vaginally 3 times weekly", price: "£18.99", selected: false }
      ],
      analysis: "**Evidence-Based Research:** Vaginal DHEA (prasterone) has been shown in multiple RCTs to significantly improve vaginal atrophy, dryness, and dyspareunia in postmenopausal women, with improvements seen in 70-80% of users. Sea buckthorn oil demonstrates significant improvement in vaginal health markers in clinical trials. Hyaluronic acid provides immediate lubrication and long-term tissue hydration. **Medical Advisory:** Severe or persistent pain warrants medical evaluation to rule out conditions like vulvodynia, lichen sclerosus, or endometriosis.",
      improvement: "Use vaginal DHEA nightly for 12 weeks, then reduce to 2-3 times weekly for maintenance. Apply hyaluronic gel before intimacy and 2 times weekly for tissue health. Take sea buckthorn oil with fat-containing meals for optimal absorption.",
      timeline: "Initial improvements in vaginal moisture typically within 2-4 weeks. Significant improvement in tissue health, elasticity, and comfort within 8-12 weeks of consistent use."
    });

    recs.push({
      title: "Pelvic Floor Physical Therapy",
      description: "Specialized physical therapy to address pelvic floor dysfunction, pain, and improve sexual comfort.",
      priority: 'high',
      category: 'therapy',
      icon: Activity,
      analysis: `${hasPain ? 'Pain during intimacy often involves pelvic floor muscle tension or dysfunction. ' : ''}Pelvic floor physical therapy has a 70-80% success rate for treating sexual pain disorders. A specialized pelvic floor physiotherapist can assess muscle tension, trigger points, and provide manual therapy and exercises to improve function and reduce discomfort.`,
      improvement: "Seek a certified pelvic floor physiotherapist (POGP registered in UK). Treatment typically involves 6-12 sessions with home exercises. May include myofascial release, dilator therapy, and relaxation techniques.",
      timeline: "Most patients experience noticeable improvement within 6-8 weeks, with significant pain reduction within 3-6 months of consistent therapy."
    });
  }

  // Hormone Support for Libido & Overall Function
  if (hasLowLibido || hasDryness || answers['2'] === 'gradual-decline' || answers['2'] === 'sudden-decline') {
    recs.push({
      title: "Hormonal Health Assessment & Support",
      description: "Comprehensive hormone testing and evidence-based supplementation to support healthy sexual function.",
      priority: 'high',
      category: 'supplement',
      icon: TestTube,
      personalisedAssessment: `${answers['2'] === 'gradual-decline' ? 'Your gradual decline in libido suggests potential hormonal changes. ' : ''}${answers['2'] === 'sudden-decline' ? 'A sudden decline warrants immediate hormone evaluation. ' : ''}Hormonal factors significantly influence libido, arousal, and vaginal health.`,
      supplements: [
        { name: "Maca Root Extract", dosage: "3000mg daily in divided doses", price: "£22.99", selected: true },
        { name: "Panax Ginseng", dosage: "200mg standardized extract daily", price: "£24.99", selected: true },
        { name: "L-Arginine", dosage: "3-5g daily in divided doses", price: "£19.99", selected: false },
        { name: "Tribulus Terrestris", dosage: "750-1500mg daily", price: "£18.99", selected: false }
      ],
      analysis: "**Evidence-Based Research:** Maca root has been shown in RCTs to significantly improve sexual desire and reduce sexual dysfunction in postmenopausal women. Panax ginseng demonstrates improvement in arousal and satisfaction in clinical trials. L-Arginine supports nitric oxide production and blood flow. **Clinical Recommendation:** Consider comprehensive hormone panel (estradiol, testosterone, DHEA-S, thyroid) with healthcare provider, especially if sudden decline occurred.",
      improvement: "Take maca with breakfast and lunch for sustained effect. Panax ginseng is best taken in morning. L-arginine divided into 2-3 doses throughout day. Allow 6-8 weeks for full effect as these work gradually.",
      timeline: "Initial improvements in energy and mood within 2-4 weeks. Significant libido and arousal improvements typically seen within 6-12 weeks of consistent supplementation."
    });
  }

  // Arousal & Blood Flow Support
  if (hasArousalIssues || hasDryness) {
    recs.push({
      title: "Circulation & Arousal Enhancement",
      description: "Targeted support for healthy blood flow and physiological arousal response.",
      priority: 'medium',
      category: 'supplement',
      icon: Heart,
      personalisedAssessment: "Healthy blood flow to genital tissues is essential for arousal, natural lubrication, and sensation.",
      supplements: [
        { name: "French Maritime Pine Bark Extract (Pycnogenol)", dosage: "100mg daily", price: "£29.99", selected: true },
        { name: "L-Citrulline", dosage: "3-6g daily", price: "£21.99", selected: false },
        { name: "Omega-3 (High EPA/DHA)", dosage: "2000-3000mg combined EPA/DHA daily", price: "£26.99", selected: true }
      ],
      analysis: "**Research Evidence:** Pycnogenol combined with L-arginine has shown significant improvements in sexual function in clinical trials. L-Citrulline converts to L-arginine and supports nitric oxide production more effectively. Omega-3 fatty acids support vascular health and reduce inflammation.",
      improvement: "Take pine bark extract with breakfast. L-citrulline on empty stomach or before intimacy. Omega-3 with meals containing fat for absorption.",
      timeline: "Vascular health improvements develop over 4-8 weeks. Optimal benefits typically seen within 8-12 weeks."
    });
  }

  // Stress & Emotional Factors
  if (hasEmotionalFactors || answers['9'] === 'some') {
    recs.push({
      title: "Stress Management & Mind-Body Connection",
      description: "Evidence-based techniques to reduce stress, anxiety, and enhance sexual well-being.",
      priority: 'high',
      category: 'therapy',
      icon: Brain,
      analysis: "Sexual function is deeply connected to psychological well-being. Chronic stress elevates cortisol, which suppresses sex hormones and desire. Mindfulness-based interventions have shown 60-70% improvement in sexual function in clinical trials.",
      improvement: "Practice mindfulness meditation 10-20 minutes daily. Consider sex therapy or counseling to address emotional barriers. Mindful self-compassion exercises can reduce performance anxiety.",
      timeline: "Initial stress reduction within 2-3 weeks. Significant improvements in sexual confidence and desire within 6-12 weeks of consistent practice."
    });

    recs.push({
      title: "Adaptogenic Stress Support",
      description: "Herbal adaptogens to support healthy stress response and hormonal balance.",
      priority: 'medium',
      category: 'supplement',
      icon: Zap,
      personalisedAssessment: "Chronic stress significantly impacts sexual function through hormonal pathways. Adaptogens help restore balance.",
      supplements: [
        { name: "Ashwagandha KSM-66", dosage: "300-600mg twice daily", price: "£23.99", selected: true },
        { name: "Rhodiola Rosea", dosage: "200-400mg daily", price: "£21.99", selected: false },
        { name: "Magnesium Glycinate", dosage: "300-400mg before bed", price: "£18.99", selected: true }
      ],
      analysis: "**Clinical Evidence:** Ashwagandha (KSM-66 extract) has demonstrated significant improvements in sexual function, arousal, and satisfaction in RCTs, particularly in women. Also reduces cortisol and anxiety. Magnesium supports relaxation and hormone production.",
      improvement: "Take ashwagandha with meals (morning and evening). Rhodiola best taken in morning. Magnesium glycinate 1 hour before bed.",
      timeline: "Stress reduction and improved energy within 2-4 weeks. Sexual function improvements typically seen within 6-8 weeks."
    });
  }

  // Relationship & Communication
  if (answers['10'] === 'somewhat-satisfied' || answers['10'] === 'dissatisfied' || answers['10'] !== 'not-applicable') {
    recs.push({
      title: "Relationship & Intimacy Enhancement",
      description: "Communication strategies and couples-focused interventions to enhance connection and sexual satisfaction.",
      priority: 'medium',
      category: 'therapy',
      icon: Heart,
      analysis: "Sexual satisfaction is strongly correlated with relationship quality and communication. Couples therapy and sex-positive communication can significantly improve both intimacy and sexual function.",
      improvement: "Consider couples counseling or sex therapy. Practice open communication about desires, boundaries, and concerns. Schedule regular intimacy time without pressure for performance.",
      timeline: "Communication improvements can yield immediate benefits. Deeper relationship and sexual satisfaction typically develops over 2-6 months."
    });
  }

  // Lifestyle & General Health
  recs.push({
    title: "Sexual Health Lifestyle Optimization",
    description: "Foundational lifestyle practices that support healthy sexual function.",
    priority: 'medium',
    category: 'lifestyle',
    icon: Activity,
    analysis: "Regular exercise improves blood flow, body image, and hormonal balance. Quality sleep is essential for hormone production. Avoiding smoking and limiting alcohol supports vascular health critical for arousal.",
    improvement: "30-45 minutes moderate exercise 4-5 times weekly. Prioritize 7-8 hours quality sleep. Limit alcohol to 1 drink or less. Avoid smoking and recreational drugs.",
    timeline: "Energy and circulation improvements within 2-4 weeks. Sexual function improvements typically seen within 4-8 weeks of consistent healthy habits."
  });

  // Diet for Sexual Health
  recs.push({
    title: "Nutrition for Sexual Vitality",
    description: "Dietary strategies to support hormonal health, circulation, and sexual function.",
    priority: 'medium',
    category: 'diet',
    icon: Heart,
    analysis: "Certain nutrients are essential for sexual health: zinc for hormone production, omega-3s for circulation, antioxidants for tissue health. Mediterranean diet pattern associated with improved sexual function.",
    improvement: "Include zinc-rich foods (oysters, pumpkin seeds, grass-fed beef), fatty fish 2-3x weekly, dark leafy greens, berries, and dark chocolate (70%+ cacao). Limit processed foods and sugar which promote inflammation.",
    timeline: "Nutritional improvements support gradual enhancement in overall health and sexual function over 4-12 weeks."
  });

  // Medical Consultation Recommendation
  if (answers['5'] === 'severe' || answers['2'] === 'sudden-decline' || answers['3'] === 'severe') {
    recs.push({
      title: "Medical Evaluation & Specialized Care",
      description: "Professional medical assessment to rule out underlying conditions and explore medical treatment options.",
      priority: 'high',
      category: 'therapy',
      icon: AlertTriangle,
      analysis: "Severe pain, sudden changes, or severe dryness warrant medical evaluation. Conditions like endometriosis, pelvic floor dysfunction, hormonal disorders, or medication side effects may require medical treatment. Hormone replacement therapy (HRT) can be highly effective for menopausal symptoms affecting sexual function.",
      improvement: "Schedule appointment with gynecologist or sexual medicine specialist. Prepare list of symptoms, timeline, and medications. Discuss options like vaginal estrogen, systemic HRT, or other medical interventions.",
      timeline: "Medical treatments can provide relief within weeks to months depending on underlying cause and treatment approach."
    });
  }

  return recs;
};

const generateDefaultRecommendations = (symptomType: string, score: AssessmentScore): Recommendation[] => {
  return [
    {
      title: "Comprehensive Assessment Complete",
      description: "Your symptom assessment has been recorded. Consider consulting with a healthcare professional for personalised treatment options.",
      priority: 'medium',
      category: 'lifestyle',
      icon: CheckCircle2,
      analysis: "Complete health assessments provide valuable insights for developing targeted wellness strategies.",
      improvement: "Schedule follow-up consultations to track progress and adjust recommendations as needed.",
      timeline: "Ongoing monitoring and adjustment for optimal results"
    },
    {
      title: "Morning Routine Optimization", 
      description: "Establish a consistent morning routine with sunlight exposure, hydration, and mindful movement to set a positive tone for the day.",
      priority: 'high',
      category: 'routine',
      icon: Calendar,
      analysis: "Morning routines regulate circadian rhythms and improve overall well-being by 30-40% through consistent habit formation.",
      improvement: "Start with 15 minutes of sunlight exposure, 16-20oz of water, and 5 minutes of stretching or breathing exercises.",
      timeline: "Energy and mood improvements typically seen within 1-2 weeks"
    },
    {
      title: "Essential Wellness Supplements", 
      description: "Core supplement protocol to support overall health, energy, and immune function based on common nutritional gaps.",
      priority: 'high',
      category: 'supplement',
      icon: Pill,
      personalisedAssessment: "General wellness supplement protocol to address common nutritional deficiencies and support optimal health.",
      supplements: [
        { name: "Vitamin D3 with K2", dosage: "2000-4000 IU daily with fats", price: "£17.99", selected: true },
        { name: "Omega-3 Fish Oil", dosage: "1000-2000mg EPA/DHA daily", price: "£24.99", selected: true },
        { name: "Magnesium Glycinate", dosage: "200-400mg in the evening", price: "£19.99", selected: false },
        { name: "B-Complex (Methylated)", dosage: "1 capsule with breakfast", price: "£18.99", selected: false }
      ],
      analysis: "**Professional Health Advisory:** Please consult with a healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications. These supplements are intended to support general wellness and are not intended to diagnose, treat, cure, or prevent any disease.",
      improvement: "Start with vitamin D3 and omega-3s, then add magnesium and B-complex based on individual needs. Take with meals for better absorption.",
      timeline: "Most people experience energy and immune improvements within 2-4 weeks of consistent supplementation"
    },
    {
      title: "Sleep Environment Optimization",
      description: "Create an optimal sleep environment with temperature control (18-20°C), blackout conditions, and noise management.",
      priority: 'high',
      category: 'environment',
      icon: Moon,
      analysis: "Sleep environment directly impacts sleep quality and recovery. Optimal conditions can improve sleep efficiency by 15-25%.",
      improvement: "Invest in blackout curtains, programmable thermostat, and white noise machine. Remove electronic devices from bedroom.",
      timeline: "Sleep quality improvements typically noticed within 3-7 days"
    },
    {
      title: "Anti-Inflammatory Nutrition Protocol",
      description: "Focus on whole foods, reduce processed sugar and inflammatory oils, and incorporate antioxidant-rich foods daily.",
      priority: 'high',
      category: 'diet',
      icon: Heart,
      analysis: "Anti-inflammatory nutrition reduces systemic inflammation by 20-40% and supports optimal cellular function across all body systems.",
      improvement: "Eliminate processed foods, focus on vegetables, lean proteins, and healthy fats. Aim for 7-9 servings of colorful vegetables daily.",
      timeline: "Energy and inflammatory marker improvements typically seen within 2-4 weeks"
    },
    {
      title: "Stress Management & Recovery",
      description: "Implement daily stress reduction techniques including breathwork, meditation, or gentle movement to support nervous system balance.",
      priority: 'medium',
      category: 'therapy',
      icon: Heart,
      analysis: "Regular stress management practices reduce cortisol levels by 25-50% and improve overall health resilience.",
      improvement: "Start with 5-10 minutes daily of deep breathing, progressive muscle relaxation, or guided meditation.",
      timeline: "Stress reduction and improved mood typically noticed within 1-2 weeks"
    },
    {
      title: "Holistic Wellness Approach", 
      description: "Integrate sleep quality, stress management, regular movement, and mindful nutrition to support comprehensive health optimization.",
      priority: 'medium',
      category: 'lifestyle',
      icon: Sparkles,
      analysis: "Comprehensive wellness approaches addressing multiple health pillars simultaneously create synergistic effects and sustainable results.",
      improvement: "Focus on consistency rather than perfection. Track 2-3 key metrics to monitor progress and maintain motivation.",
      timeline: "Comprehensive health improvements typically develop over 4-12 weeks of consistent implementation"
    }
  ];
};

export default AssessmentResults;