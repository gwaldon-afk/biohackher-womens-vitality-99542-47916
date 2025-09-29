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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
        .single();

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
      "gut": "Gut Health",
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

    // Always include sleep environment optimization
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
      title: "Cognitive Behavioral Therapy for Insomnia (CBT-I)",
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
        title: "Hormonal Balance Support Supplements",
        description: "Supplements that may assist in addressing hot flash episodes and supporting natural hormonal balance.",
        priority: 'high',
        category: 'supplement',
        icon: Pill,
        personalisedAssessment: `Your severe hot flash intensity assessment suggests these supplements may assist in supporting natural hormonal balance.`,
        supplements: [
          { name: "Black Cohosh Extract", dosage: "40-80mg daily with meals", selected: true },
          { name: "Evening Primrose Oil", dosage: "1000mg twice daily", selected: true },
          { name: "Red Clover Isoflavones", dosage: "80mg daily", selected: false }
        ],
        analysis: "**Professional Health Advisory:** Please consult with a healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications. These supplements are intended to support general wellness and are not intended to diagnose, treat, cure, or prevent any disease.",
        improvement: "General recommended dosages are 40-80mg black cohosh daily with meals and 1000mg evening primrose oil twice daily. Create a cooling kit with portable fan, cooling towels, and breathable clothing for episode relief. For your specific recommended dosage, consult a healthcare professional.",
        timeline: "Most people generally experience significant improvements within 4-8 weeks of consistent implementation. If hot flash symptoms persist or worsen, consult a healthcare provider."
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
        description: "Use moisture-wicking sleepwear, cooling mattress pads, and keep room temperature cool (18-20°C).",
        priority: 'high',
        category: 'environment',
        icon: Moon
      });
    }

    return recs;
  };

  const generateJointPainRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    const recs: Recommendation[] = [];

    // Always include core joint pain recommendations
    recs.push({
      title: "Joint Support Supplements",
      description: "Supplements that may assist in addressing joint discomfort and supporting long-term joint health and mobility.",
      priority: 'high',
      category: 'supplement',
      icon: Pill,
      personalisedAssessment: "Your joint pain assessment indicates these supplements may assist in supporting natural joint comfort and mobility.",
      supplements: [
        { name: "Curcumin with Bioperine", dosage: "500-1000mg daily with meals", price: "£27.99", selected: true },
        { name: "Omega-3 Fish Oil", dosage: "2-3g daily with food", price: "£24.99", selected: true },
        { name: "Glucosamine Sulfate", dosage: "1500mg daily", price: "£26.99", selected: false },
        { name: "Boswellia Extract", dosage: "400mg twice daily", price: "£29.99", selected: false }
      ],
      analysis: "**Professional Health Advisory:** Please consult with a healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications. These supplements are intended to support general wellness and are not intended to diagnose, treat, cure, or prevent any disease.",
      improvement: "General recommended dosages are 500-1000mg curcumin with black pepper (bioperine) and 2-3g omega-3 fish oil daily with meals. Choose high-quality fish oil with EPA:DHA ratio of 2:1. For your specific recommended dosage, consult a healthcare professional.",
      timeline: "Most people generally experience initial pain reduction within 2-3 weeks, with significant improvements in joint mobility after 6-8 weeks of consistent implementation. If joint pain symptoms persist or worsen, consult a healthcare provider."
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
      description: "Optimize your living and work spaces to reduce joint stress with proper ergonomics and supportive surfaces.",
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
      timeline: "Digestive improvements typically develop within 2-4 weeks of lifestyle optimization"
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
        analysis: "Environmental factors significantly impact cognitive performance. Optimized spaces can improve focus and mental clarity by 25-40%.",
        improvement: "Use natural light when possible, maintain comfortable temperature, remove visual distractions, add plants for air quality.",
        timeline: "Immediate focus improvements in optimized environment"
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
        improvement: "Seek qualified neurofeedback practitioner for assessment and personalized training protocol.",
        timeline: "Cognitive improvements typically seen after 8-15 sessions over 4-8 weeks"
      },
      {
        title: "Cognitive Lifestyle Optimization",
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
        title: "FODMAP Elimination Protocol",
        description: "Follow a low-FODMAP diet for 2-4 weeks, then systematically reintroduce foods to identify triggers.",
        priority: 'high',
        category: 'diet',
        icon: Heart,
        analysis: "FODMAPs are poorly absorbed carbohydrates that ferment in the gut, causing bloating in sensitive individuals. 70-80% of people see significant improvement.",
        improvement: "General recommended approach is using the Monash FODMAP app for guidance and keeping a detailed food and symptom diary. Start with strict elimination for 2-4 weeks, then systematically reintroduce one FODMAP group every 3 days. For your specific recommended approach, consult a healthcare professional.",
        timeline: "Most people generally see bloating reduction within 1-2 weeks of elimination. If bloating symptoms persist or worsen, consult a healthcare provider."
      },
      {
        title: "Digestive Support Supplements",
        description: "Targeted supplements to improve digestion and reduce gas formation that leads to bloating.",
        priority: 'high',
        category: 'supplement',
        icon: Pill,
        personalisedAssessment: "Your bloating assessment suggests these supplements may help improve digestion and reduce symptoms.",
        supplements: [
          { name: "Digestive Enzymes Complex", dosage: "1-2 capsules before each meal", selected: true },
          { name: "Simethicone", dosage: "40-80mg after meals as needed", selected: true },
          { name: "Peppermint Oil Capsules", dosage: "0.2ml enteric-coated, 3x daily", selected: false },
          { name: "Probiotics Multi-Strain", dosage: "25-50 billion CFU daily", selected: false }
        ],
        analysis: "Digestive enzymes break down foods more efficiently, while simethicone helps break up gas bubbles. Peppermint oil relaxes intestinal muscles.",
        improvement: "Take digestive enzymes 15-20 minutes before meals. Use simethicone after meals when bloating occurs.",
        timeline: "Most people notice digestive improvements within 3-7 days of consistent use"
      },
      {
        title: "Mindful Eating Routine",
        description: "Practice slow, conscious eating with proper chewing, portion control, and stress-free meal environments.",
        priority: 'high',
        category: 'routine',
        icon: Heart,
        analysis: "Eating too quickly impairs digestion and increases air swallowing, leading to bloating. Mindful eating improves digestive efficiency.",
        improvement: "Chew each bite 20-30 times, put fork down between bites, eat without distractions, stop when 80% full.",
        timeline: "Immediate improvements in meal comfort, with long-term digestive benefits in 1-2 weeks"
      },
      {
        title: "Stress-Free Dining Environment",
        description: "Create calm, relaxed eating spaces free from screens, work, and stressful conversations.",
        priority: 'medium',
        category: 'environment',
        icon: Moon,
        analysis: "Stress significantly impairs digestion by reducing stomach acid and enzyme production. Calm environment activates parasympathetic nervous system.",
        improvement: "Eat at designated table, remove electronic devices, use soft lighting, play calming music.",
        timeline: "Immediate improvement in digestion when eating in calm environment"
      },
      {
        title: "Abdominal Massage Therapy",
        description: "Gentle clockwise abdominal massage to stimulate digestion and help move trapped gas through the intestines.",
        priority: 'medium',
        category: 'therapy',
        icon: Heart,
        analysis: "Abdominal massage stimulates peristalsis and helps move gas through the digestive tract, reducing bloating by 30-50%.",
        improvement: "Massage in clockwise circular motions for 5-10 minutes after meals or when bloated.",
        timeline: "Immediate gas relief during massage, with improved digestion over 1-2 weeks"
      },
      {
        title: "Active Digestion Lifestyle",
        description: "Incorporate gentle movement after meals and maintain regular meal timing to support optimal digestive function.",
        priority: 'medium',
        category: 'lifestyle',
        icon: Activity,
        analysis: "Light post-meal activity aids digestion and gas movement. Regular meal timing helps train digestive rhythms.",
        improvement: "Take 10-15 minute gentle walks after meals, eat at consistent times daily, avoid lying down immediately after eating.",
        timeline: "Digestive rhythm improvements typically develop within 1-2 weeks"
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
        title: "Hair Growth Support Supplements",
        description: "Targeted supplements to support hair follicle health, growth, and thickness from within.",
        priority: 'high',
        category: 'supplement',
        icon: Scissors,
        personalisedAssessment: "Your hair assessment suggests these supplements may support healthy hair growth and strength.",
        supplements: [
          { name: "Biotin", dosage: "2500-5000mcg daily", selected: true },
          { name: "Iron Bisglycinate", dosage: "25mg daily (if deficient)", selected: true },
          { name: "Collagen Peptides", dosage: "10-15g daily", selected: false },
          { name: "Saw Palmetto", dosage: "320mg daily", selected: false }
        ],
        analysis: "**Professional Health Advisory:** Please consult with a healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications. These supplements are intended to support general wellness and are not intended to diagnose, treat, cure, or prevent any disease.",
        improvement: "Take biotin with meals, iron on empty stomach with vitamin C. Test ferritin levels to guide iron supplementation. For your specific recommended dosage, consult a healthcare professional.",
        timeline: "Hair strength improvements typically seen in 6-8 weeks, with thickness and growth changes in 3-4 months"
      },
      {
        title: "Daily Scalp Care Routine",
        description: "Massage scalp with rosemary oil and perform gentle scalp exercises to stimulate blood flow and hair growth.",
        priority: 'high',
        category: 'routine',
        icon: Heart,
        analysis: "Scalp massage increases blood circulation by 30-40% and has been shown to be as effective as 2% minoxidil for hair regrowth.",
        improvement: "Mix 2-3 drops rosemary oil with carrier oil. Massage in circular motions for 5 minutes daily, leave for 30 minutes before washing.",
        timeline: "Improved scalp health within 2-4 weeks, new hair growth typically visible after 3-4 months of consistent use"
      },
      {
        title: "Hair-Healthy Environment",
        description: "Optimize hair care environment with proper tools, gentle products, and protective styling techniques.",
        priority: 'medium',
        category: 'environment',
        icon: Shield,
        analysis: "Environmental factors like heat styling, harsh chemicals, and mechanical damage significantly impact hair health and growth.",
        improvement: "Use silk pillowcases, wide-tooth combs, heat protectants, sulfate-free shampoos, and minimize heat styling.",
        timeline: "Reduced hair breakage immediately with gentle care practices"
      },
      {
        title: "Hair-Nourishing Nutrition",
        description: "Focus on protein-rich foods, iron sources, and hair-supporting nutrients for optimal follicle function.",
        priority: 'high',
        category: 'diet',
        icon: Heart,
        analysis: "Hair follicles require adequate protein, iron, and specific nutrients for healthy growth. Nutritional deficiencies directly impact hair quality.",
        improvement: "Include lean proteins at each meal, iron-rich foods like spinach and lean meat, zinc from pumpkin seeds, omega-3s from fish.",
        timeline: "Nutritional improvements in hair health typically seen within 2-3 months"
      },
      {
        title: "Scalp Rejuvenation Therapy",
        description: "Consider professional treatments like microneedling, LED therapy, or PRP for advanced hair restoration.",
        priority: 'low',
        category: 'therapy',
        icon: Sparkles,
        analysis: "Professional scalp therapies can stimulate dormant hair follicles and improve growth factors for enhanced hair regeneration.",
        improvement: "Consult with dermatologist or trichologist for assessment and appropriate treatment recommendations.",
        timeline: "Professional treatments typically show results after 3-6 months of consistent sessions"
      },
      {
        title: "Hair-Supportive Lifestyle",
        description: "Manage stress levels, ensure adequate sleep, and avoid habits that damage hair health.",
        priority: 'medium',
        category: 'lifestyle',
        icon: Calendar,
        analysis: "Stress hormones and poor sleep significantly impact hair growth cycles. Lifestyle optimization supports healthy hair growth patterns.",
        improvement: "Practice stress management techniques, maintain 7-9 hours sleep, avoid tight hairstyles, gentle hair handling.",
        timeline: "Stress reduction benefits on hair health typically seen within 2-3 months"
      }
    ];
  };

  const generateAnxietyRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "GABA Support Protocol",
        description: "Natural supplements to support calming neurotransmitter function and reduce anxiety symptoms.",
        priority: 'high',
        category: 'supplement',
        icon: Heart,
        personalisedAssessment: "Your anxiety assessment indicates these supplements may help support natural calm and stress resilience.",
        supplements: [
          { name: "L-Theanine", dosage: "200mg 1-2 times daily", selected: true },
          { name: "Magnesium Glycinate", dosage: "400mg before bed", selected: true },
          { name: "GABA Complex", dosage: "500-750mg as needed", selected: false },
          { name: "Ashwagandha KSM-66", dosage: "300-600mg daily", selected: false }
        ],
        analysis: "L-theanine increases alpha brain waves and GABA activity, reducing anxiety by 40-60% within 30-60 minutes. Magnesium is essential for GABA receptor function.",
        improvement: "General recommended approach is taking L-theanine 1-2 hours before stressful situations and magnesium glycinate before bed. For your specific recommended dosage, consult a healthcare professional.",
        timeline: "Most people generally experience immediate calming effects with L-theanine, with sustained improvements in 2-4 weeks. If anxiety symptoms persist or worsen, consult a healthcare provider."
      },
      {
        title: "Daily Anxiety Management Routine",
        description: "Structured daily practices including breathwork, mindfulness, and progressive muscle relaxation.",
        priority: 'high',
        category: 'routine',
        icon: Heart,
        analysis: "Consistent anxiety management practices retrain the nervous system and build long-term resilience to stress triggers.",
        improvement: "Start with 5-10 minutes daily: box breathing (4-4-4-4 pattern), body scan meditation, or progressive muscle relaxation.",
        timeline: "Immediate anxiety relief during practice, with cumulative stress resilience building over 2-3 weeks"
      },
      {
        title: "Calming Environment Design",
        description: "Create peaceful spaces with soft lighting, comfortable temperature (20-22°C), and nature elements.",
        priority: 'medium',
        category: 'environment',
        icon: Moon,
        analysis: "Environmental factors significantly impact anxiety levels. Calming spaces can reduce cortisol by 15-25%.",
        improvement: "Use warm lighting, add plants, minimize clutter, create designated relaxation spaces with comfortable seating.",
        timeline: "Immediate calming effects in optimized environment"
      },
      {
        title: "Anti-Anxiety Nutrition Protocol",
        description: "Focus on blood sugar stability with regular meals, omega-3 rich foods, and magnesium-rich vegetables.",
        priority: 'medium',
        category: 'diet',
        icon: Heart,
        analysis: "Blood sugar fluctuations trigger anxiety symptoms. Stable nutrition reduces anxiety episodes by 20-30%.",
        improvement: "Eat protein with each meal, include leafy greens daily, consume omega-3 fish 2-3 times weekly, limit caffeine and sugar.",
        timeline: "Blood sugar stability and mood improvements typically seen within 1-2 weeks"
      },
      {
        title: "Cognitive Behavioral Therapy",
        description: "Professional therapy to identify and reframe anxiety-triggering thought patterns.",
        priority: 'medium',
        category: 'therapy',
        icon: Brain,
        analysis: "CBT is highly effective for anxiety, with 60-80% of people seeing significant improvement in 8-12 sessions.",
        improvement: "Seek qualified CBT therapist, practice thought challenging techniques, use anxiety tracking apps.",
        timeline: "Initial coping improvements within 2-4 sessions, with significant anxiety reduction in 8-12 weeks"
      },
      {
        title: "Stress-Resilient Lifestyle",
        description: "Integrate regular exercise, consistent sleep schedule, and social connections to build anxiety resilience.",
        priority: 'medium',
        category: 'lifestyle',
        icon: Activity,
        analysis: "Lifestyle factors significantly impact anxiety resilience. Regular exercise reduces anxiety by 20-30% through endorphin release.",
        improvement: "Aim for 150 minutes moderate exercise weekly, maintain 7-9 hour sleep schedule, prioritize social connections.",
        timeline: "Exercise benefits immediate, with cumulative anxiety reduction over 4-6 weeks"
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
        description: "Take 1000-2000mg evening primrose oil with dinner to support hormone balance and reduce hot flashes.",
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

        {/* Personalised Analysis Summary */}
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Personalised Health Analysis
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
                      <li>• Reduced frequency and intensity of hot flashes</li>
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