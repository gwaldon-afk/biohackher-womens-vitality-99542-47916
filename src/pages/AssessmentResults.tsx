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
import { ArrowLeft, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle, Info, Moon, Lightbulb, Pill, Heart, Thermometer, Bone, Brain, Battery, Scale, Scissors, Shield, Calendar, Zap, ChevronDown, ShoppingCart, Droplets } from "lucide-react";
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
  personalizedAssessment?: string;
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
      const calculatedScore = calculateScore(symptomId, answers);
      const personalizedRecommendations = generateRecommendations(symptomId, calculatedScore, answers);
      
      setScore(calculatedScore);
      setRecommendations(personalizedRecommendations);
      
      // Initialize supplement selections
      const initialSelections: Record<number, SupplementInfo[]> = {};
      personalizedRecommendations.forEach((rec, index) => {
        if (rec.category === 'supplement' && rec.supplements) {
          initialSelections[index] = [...rec.supplements];
        }
      });
      setSupplementSelections(initialSelections);
      
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
        return generateBrainFogRecommendations(score, answers);
      case 'energy-levels':
        return generateEnergyRecommendations(score, answers);
      case 'bloating':
        return generateBloatingRecommendations(score, answers);
      case 'weight-changes':
        return generateWeightRecommendations(score, answers);
      case 'hair-thinning':
        return generateHairRecommendations(score, answers);
      case 'anxiety':
        return generateAnxietyRecommendations(score, answers);
      case 'irregular-periods':
        return generatePeriodRecommendations(score, answers);
      case 'headaches':
        return generateHeadacheRecommendations(score, answers);
      case 'night-sweats':
        return generateNightSweatRecommendations(score, answers);
      case 'memory-issues':
        return generateMemoryRecommendations(score, answers);
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

    // Always include magnesium supplement (most people benefit)
    recs.push({
      title: "Sleep Support Supplements",
      description: "Supplements that may assist in addressing sleep quality issues and supporting natural circadian rhythm regulation.",
      priority: 'high',
      category: 'supplement',
      icon: Pill,
      personalizedAssessment: `Based on your sleep quality assessment, these supplements may assist in supporting better sleep depth and reducing the time it takes to fall asleep.`,
      supplements: [
        { name: "Magnesium Glycinate", dosage: "400-600mg taken 30-60 minutes before bed", selected: true },
        { name: "Melatonin (Extended Release)", dosage: "0.5-1mg taken 30 minutes before desired sleep time", selected: true },
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

    // Add conditional recommendations for specific issues
    if (answers['2'] === 'slow' || answers['2'] === 'very-slow') {
      recs.push({
        title: "Blue Light Management",
        description: "Use blue light blocking glasses 2 hours before bed and ensure all screens are off 1 hour before sleep.",
        priority: 'medium',
        category: 'environment',
        icon: Lightbulb,
        analysis: "Blue light exposure suppresses melatonin production by up to 85%, directly impacting your ability to fall asleep quickly.",
        improvement: "Install blue light filtering apps on devices, use amber glasses after sunset, and create a dark sleep environment.",
        timeline: "Melatonin production improvements can be seen within 3-5 days of consistent blue light management"
      });
    } else {
      // For normal/quick sleepers, focus on sleep maintenance
      recs.push({
        title: "Sleep Consistency Protocol",
        description: "Maintain the same bedtime and wake time within 30 minutes, even on weekends, to strengthen your circadian rhythm.",
        priority: 'medium',
        category: 'routine',
        icon: Calendar,
        analysis: "Consistent sleep timing reinforces your natural circadian rhythm and can improve overall sleep quality by 20-30%.",
        improvement: "Set phone reminders for bedtime and wake time. Track your energy levels to find your optimal sleep schedule.",
        timeline: "Circadian rhythm improvements typically develop within 2-3 weeks of consistent timing"
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
        title: "Hormonal Balance Support Supplements",
        description: "Supplements that may assist in addressing hot flash episodes and supporting natural hormonal balance.",
        priority: 'high',
        category: 'supplement',
        icon: Pill,
        personalizedAssessment: `Your severe hot flash intensity assessment suggests these supplements may assist in supporting natural hormonal balance.`,
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

    recs.push({
      title: "Joint Support Supplements",
      description: "Supplements that may assist in addressing joint discomfort and supporting long-term joint health and mobility.",
      priority: 'high',
      category: 'supplement',
      icon: Pill,
      personalizedAssessment: "Your joint pain assessment indicates these supplements may assist in supporting natural joint comfort and mobility.",
      supplements: [
        { name: "Curcumin with Bioperine", dosage: "500-1000mg daily with meals", selected: true },
        { name: "Omega-3 Fish Oil", dosage: "2-3g daily with food", selected: true },
        { name: "Glucosamine Sulfate", dosage: "1500mg daily", selected: false },
        { name: "Boswellia Extract", dosage: "400mg twice daily", selected: false }
      ],
      analysis: "**Professional Health Advisory:** Please consult with a healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications. These supplements are intended to support general wellness and are not intended to diagnose, treat, cure, or prevent any disease.",
      improvement: "General recommended dosages are 500-1000mg curcumin with black pepper (bioperine) and 2-3g omega-3 fish oil daily with meals. Choose high-quality fish oil with EPA:DHA ratio of 2:1. Apply heat therapy for 15 minutes followed by cold therapy for 10 minutes. For your specific recommended dosage, consult a healthcare professional.",
      timeline: "Most people generally experience initial pain reduction within 2-3 weeks, with significant improvements in joint mobility after 6-8 weeks of consistent implementation. If joint pain symptoms persist or worsen, consult a healthcare provider."
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
      improvement: "General recommended approach is taking digestive enzymes 15-20 minutes before meals. Choose a formula with protease, lipase, and amylase. Start with smaller meals to reduce digestive burden. For your specific recommended dosage, consult a healthcare professional.",
      timeline: "Most people generally experience digestive comfort improvements within 1-2 weeks, with better nutrient absorption noticeable in 4-6 weeks. If digestive symptoms persist or worsen, consult a healthcare provider."
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
        title: "Fibre and Hydration Protocol",
        description: "Increase soluble fibre gradually, drink 8-10 glasses of water daily, and consider magnesium oxide 400-600mg at bedtime.",
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

  const generateBrainFogRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Cognitive Support Supplements",
        description: "Supplements that may assist in addressing brain fog and supporting cognitive function and mental clarity.",
        priority: 'high',
        category: 'supplement',
        icon: Brain,
        personalizedAssessment: "Your brain fog assessment indicates these supplements may assist in supporting cognitive function and mental clarity.",
        supplements: [
          { name: "Lion's Mane Mushroom Extract", dosage: "1000mg daily with meals", selected: true },
          { name: "B-Complex (Methylated Forms)", dosage: "1 capsule daily in the morning", selected: true },
          { name: "Omega-3 EPA/DHA", dosage: "2000mg daily with food", selected: false }
        ],
        analysis: "**Professional Health Advisory:** Please consult with a healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications. These supplements are intended to support general wellness and are not intended to diagnose, treat, cure, or prevent any disease.",
        improvement: "General recommended dosages are 500-1000mg Lion's Mane daily with meals and B-complex in the morning with breakfast. Implement time-blocking techniques using apps like Forest or Focus Keeper for consistency. For your specific recommended dosage, consult a healthcare professional.",
        timeline: "Most people generally experience initial mental clarity improvements in 1-2 weeks, with significant cognitive enhancement after 4-6 weeks of consistent implementation. If cognitive symptoms persist or worsen, consult a healthcare provider."
      },
      {
        title: "Cognitive Load Management",
        description: "Use time-blocking with 25-minute focused work sessions followed by 5-minute breaks to optimise mental performance.",
        priority: 'high',
        category: 'routine',
        icon: Brain,
        analysis: "The Pomodoro Technique reduces cognitive overload and allows the prefrontal cortex to reset, improving focus and reducing mental fatigue.",
        improvement: "Start with 3-4 sessions daily and track your focus quality. Use apps like Forest or Focus Keeper for consistency.",
        timeline: "Immediate improvement in task completion, with sustained focus gains within 2-3 weeks"
      },
      {
        title: "B-Complex with Methylated Forms",
        description: "Take a high-quality B-complex with methylated B12 (1000mcg) and folate (400mcg) to support brain energy metabolism.",
        priority: 'medium',
        category: 'supplement',
        icon: Pill,
        analysis: "B vitamins are essential for neurotransmitter synthesis and mitochondrial function in brain cells. Methylated forms bypass genetic variations affecting absorption.",
        improvement: "Take in the morning with breakfast. Look for forms containing methylcobalamin and 5-MTHF.",
        timeline: "Energy and clarity improvements within 2-4 weeks of consistent use"
      },
      {
        title: "Intermittent Fasting 16:8",
        description: "Practice a 16-hour fasting window to stimulate BDNF production and enhance neuroplasticity.",
        priority: 'medium',
        category: 'diet',
        icon: Heart,
        analysis: "Intermittent fasting increases BDNF by 200-400%, promoting new neural connections and improving cognitive function.",
        improvement: "Start with 12-hour fasts and gradually extend to 16 hours. Maintain consistent eating windows.",
        timeline: "Mental clarity improvements typically begin within 1-2 weeks"
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
        personalizedAssessment: "Your energy assessment suggests these supplements may assist in supporting cellular energy production and addressing fatigue.",
        supplements: [
          { name: "CoQ10 (Ubiquinol)", dosage: "200mg daily with fatty meal", selected: true },
          { name: "Iron Bisglycinate", dosage: "25mg daily (if deficient)", selected: true },
          { name: "B12 (Methylcobalamin)", dosage: "1000mcg daily", selected: false },
          { name: "Rhodiola Rosea", dosage: "300mg in morning", selected: false }
        ],
        analysis: "**Professional Health Advisory:** Please consult with a healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications. These supplements are intended to support general wellness and are not intended to diagnose, treat, cure, or prevent any disease.",
        improvement: "General recommended dosages are 200mg CoQ10 with fatty meals and 25mg iron bisglycinate daily (if deficient). Combine with 15-30 minutes of 10,000 lux light exposure in the morning. For your specific recommended dosage, consult a healthcare professional.",
        timeline: "Most people generally experience initial energy improvements in 1-2 weeks, with peak benefits at 4-6 weeks of consistent implementation. If fatigue symptoms persist or worsen, consult a healthcare provider."
      },
      {
        title: "Circadian Light Therapy",
        description: "Get 15-30 minutes of bright light (10,000 lux) within 30 minutes of waking to optimise circadian rhythm.",
        priority: 'high',
        category: 'routine',
        icon: Lightbulb,
        analysis: "Light exposure regulates cortisol and melatonin rhythms, directly impacting energy levels throughout the day. Proper circadian timing can increase daytime energy by 30-50%.",
        improvement: "Use a light therapy box or get natural sunlight. Avoid bright light 3 hours before bed.",
        timeline: "Energy pattern improvements within 3-7 days of consistent exposure"
      },
      {
        title: "Iron and Ferritin Optimization",
        description: "Test ferritin levels and aim for 50-70 ng/mL. Supplement with iron bisglycinate if deficient.",
        priority: 'high',
        category: 'supplement',
        icon: Heart,
        analysis: "Low iron is the #1 cause of fatigue in women. Even borderline low ferritin (below 50) can cause significant energy issues.",
        improvement: "Take iron with vitamin C, away from calcium and coffee. Monitor levels every 3 months.",
        timeline: "Energy improvements typically seen 4-6 weeks after iron levels normalize"
      },
      {
        title: "Adaptogenic Protocol",
        description: "Use Rhodiola (300mg) in morning and Ashwagandha (600mg) in evening to support adrenal function.",
        priority: 'medium',
        category: 'supplement',
        icon: Shield,
        analysis: "Adaptogens help regulate cortisol patterns and improve stress resilience, leading to more stable energy levels throughout the day.",
        improvement: "Cycle adaptogens: 6 weeks on, 1 week off. Start with one at a time to assess tolerance.",
        timeline: "Stress resilience improvements in 1-2 weeks, with sustained energy gains in 3-4 weeks"
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
        title: "Digestive Bitters Protocol",
        description: "Take digestive bitters (gentian root, dandelion) 15 minutes before each meal to stimulate digestive enzymes.",
        priority: 'high',
        category: 'supplement',
        icon: Pill,
        analysis: "Bitter compounds stimulate vagus nerve activation and increase digestive enzyme production by 25-40%, improving food breakdown and reducing gas formation.",
        improvement: "General recommended dosages are 1-2 drops of digestive bitters in water, taken 15 minutes before each meal. Try Swedish bitters or blends containing gentian root, dandelion, and artichoke leaf. For your specific recommended dosage, consult a healthcare professional.",
        timeline: "Most people generally notice digestive improvements within 3-7 days. If digestive symptoms persist or worsen, consult a healthcare provider."
      },
      {
        title: "Diaphragmatic Breathing Practice",
        description: "Practice deep belly breathing for 5 minutes before meals to activate the parasympathetic nervous system.",
        priority: 'medium',
        category: 'routine',
        icon: Heart,
        analysis: "Proper breathing activates the 'rest and digest' mode, optimizing stomach acid and enzyme production for better digestion.",
        improvement: "Place one hand on chest, one on belly. Focus on expanding the belly while keeping chest still.",
        timeline: "Immediate improvements in meal comfort, with long-term digestive benefits in 2-3 weeks"
      },
      {
        title: "Probiotic Rotation",
        description: "Use different probiotic strains monthly: Lactobacillus, Bifidobacterium, and Saccharomyces boulardii.",
        priority: 'medium',
        category: 'supplement',
        icon: Pill,
        analysis: "Different probiotic strains target various aspects of gut health. Rotation prevents tolerance and maintains microbial diversity.",
        improvement: "Start with 25-50 billion CFU and increase gradually. Take away from hot foods and antibiotics.",
        timeline: "Gut flora improvements typically develop over 4-8 weeks"
      }
    ];
  };

  const generateWeightRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Intermittent Fasting 16:8",
        description: "Implement a 16-hour fasting window with an 8-hour eating period to optimise hormone balance and metabolism.",
        priority: 'high',
        category: 'diet',
        icon: Scale,
        analysis: "IF improves insulin sensitivity by 30-40% and increases growth hormone production, promoting fat metabolism while preserving muscle mass.",
        improvement: "Start with 12 hours and gradually extend. Eat your first meal at noon and last meal by 8 PM.",
        timeline: "Metabolic improvements in 1-2 weeks, with visible changes in 4-6 weeks"
      },
      {
        title: "Resistance Training Protocol",
        description: "Perform full-body strength training 3x per week to maintain muscle mass and boost metabolic rate.",
        priority: 'high',
        category: 'therapy',
        icon: Heart,
        analysis: "Resistance training increases metabolic rate by 7-15% for up to 72 hours post-workout and preserves muscle during weight loss.",
        improvement: "Focus on compound movements: squats, deadlifts, presses. Progress weight by 2.5-5% weekly.",
        timeline: "Strength gains in 2-3 weeks, body composition changes in 6-8 weeks"
      },
      {
        title: "Protein Timing Optimization",
        description: "Consume 25-30g protein within 30 minutes of waking and after workouts to support muscle synthesis.",
        priority: 'high',
        category: 'diet',
        icon: Pill,
        analysis: "Strategic protein timing maximizes muscle protein synthesis and thermogenesis, increasing calorie burn by 8-15%.",
        improvement: "Aim for 1.2-1.6g protein per kg body weight daily, distributed evenly across meals.",
        timeline: "Improved satiety and energy stability within 1-2 weeks"
      },
      {
        title: "Thyroid Support Protocol",
        description: "Ensure adequate iodine, selenium, and zinc intake. Consider thyroid testing if weight loss stalls.",
        priority: 'medium',
        category: 'supplement',
        icon: Shield,
        analysis: "Thyroid function directly affects metabolic rate. Micronutrient deficiencies can reduce thyroid hormone production by 10-20%.",
        improvement: "Include seaweed, Brazil nuts, and oysters in diet. Test TSH, T3, T4, and reverse T3.",
        timeline: "Thyroid optimization effects seen in 6-12 weeks"
      }
    ];
  };

  const generateHairRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Scalp Massage with Rosemary Oil",
        description: "Massage scalp with diluted rosemary oil (2-3 drops in carrier oil) for 5 minutes daily to stimulate circulation.",
        priority: 'high',
        category: 'routine',
        icon: Scissors,
        analysis: "Rosemary oil increases scalp circulation by 30-40% and has been shown to be as effective as 2% minoxidil for hair regrowth.",
        improvement: "Mix with jojoba or coconut oil. Massage in circular motions and leave for 30 minutes before washing.",
        timeline: "New hair growth typically visible after 3-4 months of consistent use"
      },
      {
        title: "Iron and Ferritin Optimization",
        description: "Target ferritin levels of 70-100 ng/mL for optimal hair growth. Supplement with iron bisglycinate if needed.",
        priority: 'high',
        category: 'supplement',
        icon: Heart,
        analysis: "Ferritin below 70 ng/mL is associated with hair thinning in women. Optimal iron stores are essential for hair follicle health.",
        improvement: "Take iron with vitamin C, away from calcium. Monitor levels every 3 months to avoid excess.",
        timeline: "Hair growth improvements typically seen 3-6 months after ferritin optimization"
      },
      {
        title: "Collagen Peptides",
        description: "Take 10-15g hydrolyzed collagen peptides daily to provide amino acids for hair structure and growth.",
        priority: 'medium',
        category: 'supplement',
        icon: Pill,
        analysis: "Collagen provides glycine, proline, and hydroxyproline - key amino acids for hair keratin production and follicle health.",
        improvement: "Take on empty stomach or with vitamin C. Choose grass-fed, marine, or bovine sources.",
        timeline: "Hair strength improvements in 6-8 weeks, thickness gains in 3-4 months"
      },
      {
        title: "DHT-Blocking Protocol",
        description: "Use saw palmetto (320mg) and pumpkin seed oil to help block DHT, a hormone that causes hair follicle miniaturization.",
        priority: 'medium',
        category: 'supplement',
        icon: Shield,
        analysis: "DHT causes 95% of pattern hair loss. Natural DHT blockers can reduce levels by 20-30% without hormonal side effects.",
        improvement: "Take saw palmetto with meals. Combine with topical pumpkin seed oil applications.",
        timeline: "DHT reduction effects on hair loss visible after 3-6 months"
      }
    ];
  };

  const generateAnxietyRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "GABA Support Protocol",
        description: "Take L-theanine (200mg) and magnesium glycinate (400mg) to support calming neurotransmitter function.",
        priority: 'high',
        category: 'supplement',
        icon: Heart,
        analysis: "L-theanine increases alpha brain waves and GABA activity, reducing anxiety by 40-60% within 30-60 minutes. Magnesium is essential for GABA receptor function.",
        improvement: "General recommended approach is taking L-theanine 1-2 hours before stressful situations and magnesium glycinate before bed. Practice box breathing: inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Use progressive muscle relaxation from toes to head. For your specific recommended dosage, consult a healthcare professional.",
        timeline: "Most people generally experience immediate calming effects with L-theanine, with sustained improvements in 2-4 weeks. If anxiety symptoms persist or worsen, consult a healthcare provider."
      },
      {
        title: "Box Breathing Technique",
        description: "Practice 4-4-4-4 breathing (inhale 4, hold 4, exhale 4, hold 4) for 5-10 minutes, 3 times daily.",
        priority: 'high',
        category: 'routine',
        icon: Heart,
        analysis: "Box breathing activates the parasympathetic nervous system, reducing cortisol by 25-40% and lowering heart rate variability.",
        improvement: "Use apps like Breathe or practice during daily transitions. Start with 2-minute sessions.",
        timeline: "Immediate anxiety relief, with cumulative stress resilience building over 2-3 weeks"
      },
      {
        title: "Cold Exposure Adaptation",
        description: "Take 1-2 minute cold showers to build stress resilience and improve autonomic nervous system balance.",
        priority: 'medium',
        category: 'therapy',
        icon: Thermometer,
        analysis: "Controlled cold stress increases norepinephrine and improves stress tolerance by 20-30%. It also boosts mood-regulating neurotransmitters.",
        improvement: "Start with 30-second cold finishes and gradually extend. Focus on controlled breathing during exposure.",
        timeline: "Stress resilience improvements typically seen within 2-3 weeks"
      },
      {
        title: "Ashwagandha KSM-66",
        description: "Take 600mg of standardized ashwagandha extract daily to reduce cortisol and anxiety symptoms.",
        priority: 'medium',
        category: 'supplement',
        icon: Shield,
        analysis: "KSM-66 ashwagandha reduces cortisol levels by 25-30% and anxiety scores by 40-50% in clinical studies.",
        improvement: "Take with meals to improve absorption. Cycle 6 weeks on, 1 week off.",
        timeline: "Anxiety reduction typically begins within 1-2 weeks, with peak benefits at 4-6 weeks"
      }
    ];
  };

  const generatePeriodRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Seed Cycling Protocol",
        description: "Eat pumpkin and flax seeds days 1-14, then sesame and sunflower seeds days 15-28 to support hormone balance.",
        priority: 'high',
        category: 'diet',
        icon: Calendar,
        analysis: "Seed cycling provides specific nutrients that support estrogen and progesterone production at different cycle phases, helping regulate irregular cycles.",
        improvement: "Grind seeds fresh daily (1-2 tablespoons each). Add to smoothies, yogurt, or salads.",
        timeline: "Cycle regulation improvements typically seen within 2-3 cycles"
      },
      {
        title: "Vitex (Chasteberry)",
        description: "Take 400mg standardized vitex extract in the morning to support progesterone production and cycle regularity.",
        priority: 'high',
        category: 'supplement',
        icon: Calendar,
        analysis: "Vitex acts on the pituitary gland to increase LH production, leading to better progesterone levels and more regular cycles.",
        improvement: "Take consistently for at least 3 cycles to see effects. Best taken on empty stomach in morning.",
        timeline: "Cycle improvements typically begin within 2-3 months of consistent use"
      },
      {
        title: "Stress Reduction Protocol",
        description: "Practice daily meditation and keep cortisol levels low, as chronic stress disrupts reproductive hormones.",
        priority: 'high',
        category: 'routine',
        icon: Heart,
        analysis: "Elevated cortisol suppresses GnRH, LH, and FSH, leading to irregular cycles. Stress management can restore normal cycles in 60-80% of cases.",
        improvement: "Aim for 10-20 minutes daily meditation. Include yoga, nature walks, or other stress-reducing activities.",
        timeline: "Hormonal improvements typically seen within 1-2 cycles of consistent stress management"
      },
      {
        title: "Inositol Supplementation",
        description: "Take 2-4g myo-inositol daily to improve insulin sensitivity and support healthy ovulation patterns.",
        priority: 'medium',
        category: 'supplement',
        icon: Pill,
        analysis: "Inositol improves insulin sensitivity and reduces androgen levels, particularly beneficial for PCOS-related irregular cycles.",
        improvement: "Start with 2g daily and increase to 4g if needed. Take with meals to reduce GI upset.",
        timeline: "Ovulation improvements typically seen within 2-3 cycles"
      }
    ];
  };

  const generateHeadacheRecommendations = (score: AssessmentScore, answers: Record<string, string>): Recommendation[] => {
    return [
      {
        title: "Magnesium Malate",
        description: "Take 400-600mg magnesium malate daily for migraine prevention and tension headache relief.",
        priority: 'high',
        category: 'supplement',
        icon: Pill,
        analysis: "Magnesium deficiency is present in 50% of migraine sufferers. Supplementation can reduce headache frequency by 40-50%.",
        improvement: "Split dose between morning and evening. Take with food to prevent GI upset.",
        timeline: "Headache frequency reduction typically seen within 4-6 weeks"
      },
      {
        title: "Hydration Optimization",
        description: "Drink 35ml per kg body weight daily with electrolytes to prevent dehydration-induced headaches.",
        priority: 'high',
        category: 'lifestyle',
        icon: Droplets,
        analysis: "Even mild dehydration (2-3%) can trigger headaches. Proper hydration with electrolytes prevents 60-70% of dehydration headaches.",
        improvement: "Add a pinch of sea salt and lemon to water. Drink consistently throughout the day.",
        timeline: "Immediate improvement in dehydration headaches, with better prevention within 1-2 weeks"
      },
      {
        title: "Neck and Jaw Release",
        description: "Perform daily myofascial release of neck, shoulders, and jaw muscles to reduce tension headaches.",
        priority: 'medium',
        category: 'therapy',
        icon: Heart,
        analysis: "Trigger points in neck and jaw muscles refer pain to the head. Regular release can reduce tension headache frequency by 50-70%.",
        improvement: "Use tennis ball or foam roller for 5-10 minutes daily. Focus on suboccipital and SCM muscles.",
        timeline: "Tension relief within minutes, with long-term headache reduction in 2-4 weeks"
      },
      {
        title: "Riboflavin (B2) Protocol",
        description: "Take 400mg riboflavin daily for migraine prevention, particularly effective for hormonal migraines.",
        priority: 'medium',
        category: 'supplement',
        icon: Pill,
        analysis: "Riboflavin improves mitochondrial function in brain cells. Studies show 50% reduction in migraine frequency after 3 months.",
        improvement: "Take with food to improve absorption. May cause bright yellow urine (harmless).",
        timeline: "Migraine prevention effects typically seen after 2-3 months of consistent use"
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
            <p className="text-muted-foreground">Analyzing your responses and generating personalized recommendations.</p>
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
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            {getSymptomName(symptomId!)} Recommendations
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
                  {getSymptomName(symptomId!)} All
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="routine" id="routine" />
                <Label htmlFor="routine" className="font-medium cursor-pointer">
                  {getSymptomName(symptomId!)} Routines
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="supplement" id="supplement" />
                <Label htmlFor="supplement" className="font-medium cursor-pointer">
                  {getSymptomName(symptomId!)} Supplements
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="diet" id="diet" />
                <Label htmlFor="diet" className="font-medium cursor-pointer">
                  {getSymptomName(symptomId!)} Diet
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lifestyle" id="lifestyle" />
                <Label htmlFor="lifestyle" className="font-medium cursor-pointer">
                  {getSymptomName(symptomId!)} Lifestyle
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="therapy" id="therapy" />
                <Label htmlFor="therapy" className="font-medium cursor-pointer">
                  {getSymptomName(symptomId!)} Therapy
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
                       
                       {/* Personalized Assessment for Supplement Recommendations */}
                       {rec.personalizedAssessment && (
                         <div className="bg-secondary/10 p-3 rounded-lg mb-3">
                           <h4 className="text-sm font-medium text-secondary-foreground mb-1">Personalized Assessment</h4>
                           <p className="text-xs text-muted-foreground">{rec.personalizedAssessment}</p>
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
                                     <div className="font-medium text-sm">{supplement.name}</div>
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
                           <h4 className="text-sm font-medium text-primary mb-1">Professional Health Advisory</h4>
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
    </TooltipProvider>
   );
};

const generateDefaultRecommendations = (symptomType: string, score: AssessmentScore): Recommendation[] => {
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

export default AssessmentResults;