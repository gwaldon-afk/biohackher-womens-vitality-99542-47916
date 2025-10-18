import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Thermometer, Moon, Brain, UtensilsCrossed, FileText, Printer, Bone, Zap, Battery, Wind, Scale, Scissors, Heart, Calendar, Headphones, Droplets, BookOpen, Settings, Plus, History, ArrowLeft, Activity, Sparkles, Smile, Scan } from "lucide-react";
import Navigation from "@/components/Navigation";
import SymptomChoiceDialog from "@/components/SymptomChoiceDialog";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import SymptomTriageEntry from "@/components/SymptomTriageEntry";
import SymptomAssessmentSelection from "@/components/SymptomAssessmentSelection";
import SymptomBrowseAll from "@/components/SymptomBrowseAll";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";

const Symptoms = () => {
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [userSymptoms, setUserSymptoms] = useState<any[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showChoiceDialog, setShowChoiceDialog] = useState(false);
  const [choiceDialogSymptom, setChoiceDialogSymptom] = useState<{id: string, name: string, icon: any} | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<string>("all");
  
  // Triage flow state
  const [triageStep, setTriageStep] = useState<'entry' | 'selection' | 'browse-all' | 'dashboard'>('entry');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check where user came from for proper back navigation
  const referrer = searchParams.get('from') || null;

  // Load user symptoms and determine initial triage step
  useEffect(() => {
    if (user) {
      loadUserSymptoms();
    }
  }, [user]);


  const loadUserSymptoms = async () => {
    try {
      const { data, error } = await supabase
        .from('user_symptoms')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setUserSymptoms(data || []);
    } catch (error) {
      console.error('Error loading user symptoms:', error);
      toast({
        variant: "destructive",
        title: "Error loading symptoms",
        description: "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  const saveUserSymptom = async (symptomId: string, isActive: boolean, severity: string = 'Mild', frequency: string = 'Occasional', notes: string = '') => {
    if (!user) return;

    try {
      const existingSymptom = userSymptoms.find(s => s.symptom_id === symptomId);
      
      if (existingSymptom) {
        const { error } = await supabase
          .from('user_symptoms')
          .update({ 
            is_active: isActive, 
            severity, 
            frequency, 
            notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSymptom.id);

        if (error) throw error;
      } else if (isActive) {
        const { error } = await supabase
          .from('user_symptoms')
          .insert({
            user_id: user.id,
            symptom_id: symptomId,
            is_active: isActive,
            severity,
            frequency,
            notes
          });

        if (error) throw error;
      }

      await loadUserSymptoms();
      toast({
        title: "Symptoms updated",
        description: "Your symptom profile has been saved."
      });
    } catch (error) {
      console.error('Error saving symptom:', error);
      toast({
        variant: "destructive",
        title: "Error saving symptom",
        description: "Please try again."
      });
    }
  };

  const symptoms = [
    {
      id: "hot-flashes",
      name: "Hot Flushes",
      icon: Thermometer,
      severity: "Moderate",
      frequency: "Daily",
      pillars: ["body", "balance"],
      actions: [
        {
          title: "Cold Exposure Therapy",
          description: "Commonly used treatments include brief cold showers or ice baths to help reset temperature regulation",
          evidence: "Gold",
          contraindications: ["Heart conditions", "Pregnancy"]
        },
        {
          title: "Sage Supplementation", 
          description: "Commonly used treatments include standardized sage extract supplements",
          evidence: "Silver",
          contraindications: ["Hormone-sensitive conditions"]
        },
        {
          title: "Cooling Breathwork",
          description: "Commonly used treatments include cooling breath techniques like Sheetali pranayama",
          evidence: "Bronze",
          contraindications: ["Respiratory issues"]
        }
      ]
    },
    {
      id: "sleep",
      name: "Sleep Issues",
      icon: Moon,
      severity: "Mild",
      frequency: "3-4x/week",
      pillars: ["brain", "body", "balance", "beauty"],
      actions: [
        {
          title: "Magnesium Glycinate",
          description: "Commonly used treatments include magnesium glycinate supplements before bed to support deep sleep",
          evidence: "Gold",
          contraindications: ["Kidney disease"]
        },
        {
          title: "Red Light Therapy",
          description: "Commonly used treatments include red light therapy devices used in the evening",
          evidence: "Silver", 
          contraindications: ["Photosensitivity"]
        },
        {
          title: "Sleep Restriction Protocol",
          description: "Commonly used treatments include limiting time in bed to match actual sleep time",
          evidence: "Gold",
          contraindications: ["Severe sleep disorders"]
        }
      ]
    },
    {
      id: "mood",
      name: "Mood Changes",
      icon: Brain,
      severity: "Variable",
      frequency: "Weekly",
      pillars: ["brain", "balance"],
      actions: [
        {
          title: "HRV Breathwork",
          description: "Commonly used treatments include structured breathing patterns like 4-7-8 breathing",
          evidence: "Gold",
          contraindications: ["Panic disorders"]
        },
        {
          title: "Omega-3 Optimisation",
          description: "Commonly used treatments include high-EPA fish oil supplements",
          evidence: "Gold",
          contraindications: ["Blood thinners"]
        },
        {
          title: "Morning Light Exposure",
          description: "Commonly used treatments include natural sunlight exposure in the morning",
          evidence: "Gold",
          contraindications: ["Light sensitivity disorders"]
        }
      ]
    },
    {
      id: "gut",
      name: "Gut Health",
      icon: UtensilsCrossed,
      severity: "Mild",
      frequency: "Occasional",
      pillars: ["brain", "body", "balance", "beauty"],
      actions: [
        {
          title: "Intermittent Fasting",
          description: "16:8 protocol with 12-hour eating window",
          evidence: "Silver",
          contraindications: ["Eating disorders", "Diabetes"]
        },
        {
          title: "Probiotic Rotation",
          description: "Rotate between different probiotic strains monthly",
          evidence: "Silver",
          contraindications: ["Immunocompromised states"]
        },
        {
          title: "Digestive Enzymes",
          description: "Broad-spectrum enzymes with protein-rich meals",
          evidence: "Bronze",
          contraindications: ["Pancreatic conditions"]
        }
      ]
    },
    {
      id: "joint-pain",
      name: "Joint Pain",
      icon: Bone,
      severity: "Moderate",
      frequency: "Daily",
      pillars: ["body"],
      actions: [
        {
          title: "Curcumin Supplementation",
          description: "500mg curcumin with black pepper extract twice daily",
          evidence: "Gold",
          contraindications: ["Blood thinners", "Gallstones", "Pregnancy"]
        },
        {
          title: "Cold-Heat Contrast Therapy",
          description: "Alternate between cold and heat therapy for 15 minutes each",
          evidence: "Silver",
          contraindications: ["Circulation disorders", "Neuropathy"]
        },
        {
          title: "Omega-3 Loading Protocol",
          description: "4g high-EPA fish oil daily for inflammation reduction",
          evidence: "Gold",
          contraindications: ["Blood thinners", "Fish allergies"]
        }
      ]
    },
    {
      id: "brain-fog",
      name: "Brain Fog",
      icon: Zap,
      severity: "Moderate",
      frequency: "4-5x/week",
      pillars: ["brain"],
      actions: [
        {
          title: "Lion's Mane Mushroom",
          description: "1000mg standardized extract daily for cognitive support",
          evidence: "Silver",
          contraindications: ["Mushroom allergies", "Autoimmune conditions"]
        },
        {
          title: "Cognitive Load Balancing",
          description: "Time-blocking with 25-minute focused work sessions",
          evidence: "Bronze",
          contraindications: ["ADHD without proper management"]
        },
        {
          title: "B-Complex Optimization",
          description: "High-potency B-complex with methylated B12 and folate",
          evidence: "Gold",
          contraindications: ["B12 sensitivity", "Kidney disease"]
        }
      ]
    },
    {
      id: "energy-levels",
      name: "Low Energy",
      icon: Battery,
      severity: "High",
      frequency: "Daily",
      pillars: ["body", "balance"],
      actions: [
        {
          title: "Mitochondrial Support Stack",
          description: "CoQ10 200mg + PQQ 20mg + Magnesium daily",
          evidence: "Silver",
          contraindications: ["Blood pressure medications", "Diabetes medications"]
        },
        {
          title: "Circadian Light Therapy",
          description: "10,000 lux light therapy for 30 minutes upon waking",
          evidence: "Gold",
          contraindications: ["Bipolar disorder", "Eye conditions"]
        },
        {
          title: "Adaptogenic Protocol",
          description: "Rhodiola 300mg + Ashwagandha 600mg in morning",
          evidence: "Silver",
          contraindications: ["Autoimmune conditions", "Nightshade allergies"]
        }
      ]
    },
    {
      id: "bloating",
      name: "Bloating",
      icon: Wind,
      severity: "Mild",
      frequency: "After meals",
      pillars: ["body"],
      actions: [
        {
          title: "FODMAP Elimination",
          description: "2-week low-FODMAP protocol followed by systematic reintroduction",
          evidence: "Gold",
          contraindications: ["Eating disorders", "Severe malnutrition"]
        },
        {
          title: "Digestive Bitters Protocol",
          description: "Bitter herbs tincture 15 minutes before each meal",
          evidence: "Bronze",
          contraindications: ["Gallstones", "Acid reflux"]
        },
        {
          title: "Abdominal Breathing Practice",
          description: "Diaphragmatic breathing for 5 minutes before meals",
          evidence: "Silver",
          contraindications: ["Recent abdominal surgery"]
        }
      ]
    },
    {
      id: "weight-changes",
      name: "Weight Changes",
      icon: Scale,
      severity: "Moderate",
      frequency: "Gradual",
      pillars: ["body", "balance"],
      actions: [
        {
          title: "Intermittent Fasting 16:8",
          description: "16-hour fasting window with 8-hour eating period",
          evidence: "Gold",
          contraindications: ["Eating disorders", "Type 1 diabetes", "Pregnancy"]
        },
        {
          title: "Resistance Training Protocol",
          description: "3x/week full-body strength training to preserve muscle mass",
          evidence: "Gold",
          contraindications: ["Recent injuries", "Severe joint problems"]
        },
        {
          title: "Protein Timing Optimization",
          description: "30g protein within 30 minutes of waking and post-workout",
          evidence: "Silver",
          contraindications: ["Kidney disease", "Protein allergies"]
        }
      ]
    },
    {
      id: "hair-thinning",
      name: "Hair Thinning",
      icon: Scissors,
      severity: "Mild",
      frequency: "Progressive",
      pillars: ["beauty"],
      actions: [
        {
          title: "Scalp Massage with Rosemary Oil",
          description: "5-minute scalp massage with diluted rosemary oil daily",
          evidence: "Silver",
          contraindications: ["Scalp conditions", "Essential oil allergies"]
        },
        {
          title: "Collagen Peptides",
          description: "10g hydrolyzed collagen peptides daily",
          evidence: "Bronze",
          contraindications: ["Collagen allergies"]
        },
        {
          title: "Iron and Ferritin Optimization",
          description: "Target ferritin 50-70 ng/mL with gentle iron if needed",
          evidence: "Gold",
          contraindications: ["Hemochromatosis", "Iron overload"]
        }
      ]
    },
    {
      id: "anxiety",
      name: "Anxiety",
      icon: Heart,
      severity: "Variable",
      frequency: "Daily",
      pillars: ["brain", "balance"],
      actions: [
        {
          title: "GABA Support Protocol",
          description: "L-theanine 200mg + magnesium glycinate 400mg",
          evidence: "Silver",
          contraindications: ["Blood pressure medications", "Sedatives"]
        },
        {
          title: "Box Breathing Technique",
          description: "4-4-4-4 breathing pattern for 10 minutes, 3x daily",
          evidence: "Gold",
          contraindications: ["Severe panic disorders", "COPD"]
        },
        {
          title: "Cold Exposure Adaptation",
          description: "1-2 minute cold shower to build stress resilience",
          evidence: "Bronze",
          contraindications: ["Heart conditions", "Raynaud's disease"]
        }
      ]
    },
    {
      id: "irregular-periods",
      name: "Irregular Periods",
      icon: Calendar,
      severity: "High",
      frequency: "Monthly",
      pillars: ["body", "balance"],
      actions: [
        {
          title: "Seed Cycling Protocol",
          description: "Pumpkin/flax seeds days 1-14, sesame/sunflower days 15-28",
          evidence: "Bronze",
          contraindications: ["Seed allergies", "Hormone-sensitive cancers"]
        },
        {
          title: "Vitex (Chasteberry)",
          description: "400mg standardized extract in morning for cycle regulation",
          evidence: "Silver",
          contraindications: ["Pregnancy", "Hormone medications", "IVF"]
        },
        {
          title: "Stress Reduction Protocol",
          description: "Daily meditation + adaptogenic herbs to lower cortisol",
          evidence: "Gold",
          contraindications: ["Autoimmune conditions"]
        }
      ]
    },
    {
      id: "headaches",
      name: "Headaches",
      icon: Headphones,
      severity: "Moderate",
      frequency: "2-3x/week",
      pillars: ["brain"],
      actions: [
        {
          title: "Magnesium Malate",
          description: "400mg twice daily for migraine prevention",
          evidence: "Gold",
          contraindications: ["Kidney disease", "Heart block"]
        },
        {
          title: "Hydration Optimization",
          description: "Add electrolytes to water, drink 35ml/kg body weight daily",
          evidence: "Silver",
          contraindications: ["Heart failure", "Kidney disease"]
        },
        {
          title: "Neck and Jaw Release",
          description: "Daily myofascial release of trigger points",
          evidence: "Bronze",
          contraindications: ["Recent neck injuries", "Cervical instability"]
        }
      ]
    },
    {
      id: "night-sweats",
      name: "Night Sweats",
      icon: Droplets,
      severity: "High",
      frequency: "Nightly",
      pillars: ["body", "balance"],
      actions: [
        {
          title: "Black Cohosh Extract",
          description: "40mg standardized extract twice daily",
          evidence: "Silver",
          contraindications: ["Liver disease", "Hormone-sensitive conditions"]
        },
        {
          title: "Cooling Sleep Environment",
          description: "Room temperature 18-20°C with moisture-wicking bedding",
          evidence: "Bronze",
          contraindications: ["Circulation disorders"]
        },
        {
          title: "Evening Primrose Oil",
          description: "1000mg with evening meal for hormonal balance",
          evidence: "Bronze",
          contraindications: ["Seizure disorders", "Blood thinners"]
        }
      ]
    },
    {
      id: "cognitive-performance",
      name: "Cognitive Performance",
      icon: Brain,
      severity: "Variable",
      frequency: "Ongoing",
      pillars: ["brain"],
      actions: [
        {
          title: "Brain Assessment",
          description: "Complete comprehensive cognitive performance assessment to identify specific areas for optimization",
          evidence: "Gold",
          contraindications: []
        }
      ]
    },
    {
      id: "menopause-brain-health",
      name: "Menopause Brain Health",
      icon: Brain,
      severity: "Variable",
      frequency: "Ongoing",
      pillars: ["brain", "balance"],
      actions: [
        {
          title: "Brain Assessment",
          description: "Complete menopause-specific brain health assessment to address cognitive changes during hormonal transitions",
          evidence: "Gold",
          contraindications: []
        }
      ]
    },
    {
      id: "memory-issues",
      name: "Memory Issues",
      icon: BookOpen,
      severity: "Mild",
      frequency: "Daily",
      pillars: ["brain"],
      actions: [
        {
          title: "Phosphatidylserine",
          description: "100mg phosphatidylserine complex daily",
          evidence: "Silver",
          contraindications: ["Blood thinners", "Soy allergies"]
        },
        {
          title: "Dual N-Back Training",
          description: "15 minutes daily cognitive training app",
          evidence: "Bronze",
          contraindications: ["Severe cognitive impairment"]
        },
        {
          title: "Alpha-GPC Supplementation",
          description: "300mg alpha-GPC on empty stomach",
          evidence: "Silver",
          contraindications: ["Acetylcholine sensitivity", "TMAO concerns"]
        }
      ]
    },
    {
      id: "skin-health",
      name: "Skin Health",
      icon: Scan,
      severity: "Mild",
      frequency: "Ongoing",
      pillars: ["beauty", "body", "balance"],
      actions: [
        {
          title: "Retinoid Protocol",
          description: "Start with 0.025% retinol 2x/week, gradually increase to nightly over 8 weeks",
          evidence: "Gold",
          contraindications: ["Pregnancy", "Breastfeeding", "Rosacea", "Eczema"]
        },
        {
          title: "Vitamin C + Ferulic Acid Serum",
          description: "15-20% L-ascorbic acid with 1% ferulic acid applied in morning",
          evidence: "Gold",
          contraindications: ["Active breakouts", "Very sensitive skin"]
        },
        {
          title: "Collagen Peptides + Vitamin C",
          description: "10g hydrolyzed collagen peptides daily with 500mg vitamin C",
          evidence: "Silver",
          contraindications: ["Collagen allergies", "Kidney disease"]
        },
        {
          title: "Niacinamide 10% Serum",
          description: "Apply 10% niacinamide serum twice daily for pore refinement and barrier support",
          evidence: "Gold",
          contraindications: ["Niacin sensitivity"]
        },
        {
          title: "Hyaluronic Acid Layering",
          description: "Apply multiple molecular weights of HA on damp skin, seal with ceramide moisturizer",
          evidence: "Silver",
          contraindications: ["Very dry climates without occlusive"]
        },
        {
          title: "Red Light Therapy",
          description: "660nm + 850nm wavelengths for 10-15 minutes, 4-5x/week for collagen synthesis",
          evidence: "Silver",
          contraindications: ["Photosensitivity", "Active skin cancer", "Melasma"]
        },
        {
          title: "Broad Spectrum SPF 50+",
          description: "Mineral or chemical sunscreen reapplied every 2 hours during sun exposure",
          evidence: "Gold",
          contraindications: ["Sunscreen allergies"]
        },
        {
          title: "Omega-3 + GLA Supplementation",
          description: "2g EPA/DHA fish oil + 300mg evening primrose oil for skin barrier health",
          evidence: "Silver",
          contraindications: ["Blood thinners", "Seafood allergies"]
        }
      ]
    },
    {
      id: "appearance-concerns",
      name: "Physical Appearance",
      icon: Smile,
      severity: "Variable",
      frequency: "Ongoing",
      pillars: ["beauty", "balance", "brain"],
      actions: [
        {
          title: "Facial Gua Sha Protocol",
          description: "5-10 minute lymphatic drainage massage daily with rose quartz or jade tool",
          evidence: "Bronze",
          contraindications: ["Active acne", "Skin infections", "Recent facial procedures"]
        },
        {
          title: "Microcurrent Facial Device",
          description: "15-minute microcurrent facial 3-5x/week to tone facial muscles and boost collagen",
          evidence: "Silver",
          contraindications: ["Pregnancy", "Pacemaker", "Epilepsy", "Metal implants in face"]
        },
        {
          title: "Face Yoga + Massage",
          description: "10-minute daily facial exercises targeting jawline, eyes, and forehead",
          evidence: "Bronze",
          contraindications: ["TMJ disorders", "Recent Botox or fillers"]
        },
        {
          title: "Peptide Complex Serum",
          description: "Multi-peptide serum (Matrixyl, Argireline) applied twice daily for anti-aging",
          evidence: "Silver",
          contraindications: ["Peptide sensitivity"]
        },
        {
          title: "Ceramide Barrier Repair",
          description: "Ceramide-rich moisturizer with cholesterol and fatty acids for skin barrier",
          evidence: "Gold",
          contraindications: ["Fungal acne"]
        },
        {
          title: "Growth Factor Serum",
          description: "EGF or plant-based growth factor serum for cellular regeneration",
          evidence: "Silver",
          contraindications: ["Active cancer", "History of skin cancer"]
        },
        {
          title: "Caffeine + Peptide Eye Complex",
          description: "Caffeine 5% + peptides for dark circles and puffiness, applied morning and evening",
          evidence: "Silver",
          contraindications: ["Eye irritation", "Contact lens issues"]
        },
        {
          title: "Sleep Optimization for Beauty",
          description: "7-9 hours sleep on silk pillowcase, elevated head position to reduce puffiness",
          evidence: "Gold",
          contraindications: ["Sleep apnea without treatment"]
        },
        {
          title: "Hydration Protocol",
          description: "Drink 35ml water per kg body weight daily, with electrolytes for skin hydration",
          evidence: "Gold",
          contraindications: ["Kidney disease", "Heart failure"]
        }
      ]
    },
    {
      id: "sexual-function",
      name: "Sexual Function",
      icon: Heart,
      severity: "Variable",
      frequency: "Ongoing",
      pillars: ["balance", "body", "brain"],
      actions: [
        {
          title: "Pelvic Floor Strengthening",
          description: "Daily Kegel exercises: 3 sets of 10-15 contractions, hold 5-10 seconds each",
          evidence: "Gold",
          contraindications: ["Pelvic pain disorders", "Active pelvic infection"]
        },
        {
          title: "Vaginal Moisturizer Protocol",
          description: "Hyaluronic acid-based vaginal moisturizer applied 2-3x weekly for tissue hydration",
          evidence: "Gold",
          contraindications: ["Active vaginal infection", "Allergy to ingredients"]
        },
        {
          title: "Maca Root Supplementation",
          description: "1500-3000mg daily of standardized maca root extract to support libido",
          evidence: "Silver",
          contraindications: ["Hormone-sensitive conditions", "Thyroid disorders"]
        },
        {
          title: "L-Arginine Complex",
          description: "3000-5000mg L-arginine daily to support blood flow and arousal",
          evidence: "Silver",
          contraindications: ["Blood pressure medications", "Herpes", "Recent heart attack"]
        },
        {
          title: "Mindfulness-Based Intimacy",
          description: "10-15 minute daily sensate focus exercises to reduce performance anxiety",
          evidence: "Gold",
          contraindications: ["Severe relationship issues requiring therapy"]
        },
        {
          title: "DHEA Vaginal Suppository",
          description: "6.5mg DHEA vaginal suppository nightly for vaginal atrophy and dryness",
          evidence: "Gold",
          contraindications: ["Hormone-sensitive cancers", "Vaginal bleeding"]
        },
        {
          title: "Tribulus Terrestris",
          description: "500-750mg daily of standardized extract to support libido and arousal",
          evidence: "Bronze",
          contraindications: ["Diabetes medications", "Blood pressure issues"]
        },
        {
          title: "Relationship Communication Exercises",
          description: "Weekly structured intimacy conversations using frameworks like Gottman Method",
          evidence: "Gold",
          contraindications: ["Active domestic abuse - seek professional help"]
        },
        {
          title: "Omega-3 + Vitamin E",
          description: "2000mg EPA/DHA fish oil + 400 IU vitamin E daily for tissue health",
          evidence: "Silver",
          contraindications: ["Blood thinners", "Fish allergies"]
        },
        {
          title: "Red Light Therapy (Pelvic)",
          description: "10-15 minute pelvic area red light therapy 3-4x weekly for tissue regeneration",
          evidence: "Bronze",
          contraindications: ["Photosensitivity", "Active infections"]
        }
      ]
    }
  ];

  const currentSymptom = symptoms.find(s => s.id === selectedSymptom);

  // Filter symptoms by pillar
  const filterByPillar = (symptomList: typeof symptoms) => {
    if (selectedPillar === "all") return symptomList;
    return symptomList.filter(symptom => symptom.pillars?.includes(selectedPillar));
  };

  // Split symptoms into assessed and available
  const assessedSymptoms = user ? filterByPillar(symptoms.filter(symptom => {
    const userSymptom = userSymptoms.find(us => us.symptom_id === symptom.id);
    return userSymptom?.is_active === true;
  })) : [];
  
  const availableSymptoms = user ? filterByPillar(symptoms.filter(symptom => {
    const userSymptom = userSymptoms.find(us => us.symptom_id === symptom.id);
    return !userSymptom || userSymptom.is_active !== true;
  })) : filterByPillar(symptoms);

  // Get user symptom data for a specific symptom
  const getUserSymptomData = (symptomId: string) => {
    return userSymptoms.find(us => us.symptom_id === symptomId);
  };

  // Handle symptom assessment navigation
  const handleSymptomSelect = (symptomId: string) => {
    const symptom = symptoms.find(s => s.id === symptomId);
    if (!symptom) return;
    
    // Route brain assessments to specialized brain assessment page
    if (symptomId === "cognitive-performance" || symptomId === "menopause-brain-health") {
      const context = symptomId === "cognitive-performance" ? "performance" : "menopause";
      navigate(`/brain-assessment?context=${context}&pillar=brain`);
      return;
    }
    
    // Check if this is an assessed symptom (from My Symptom Profile)
    const isAssessed = assessedSymptoms.some(s => s.id === symptomId);
    
    if (isAssessed) {
      // Show choice dialog for assessed symptoms
      setChoiceDialogSymptom({
        id: symptomId,
        name: symptom.name,
        icon: symptom.icon
      });
      setShowChoiceDialog(true);
    } else {
      // Direct navigation for new assessments
      setSelectedSymptom(symptomId);
      navigate(`/assessment/${symptomId}`);
    }
  };

  // Check if user has this symptom active
  const isSymptomActive = (symptomId: string) => {
    const userSymptom = getUserSymptomData(symptomId);
    return userSymptom?.is_active || false;
  };

  const getEvidenceBadgeClass = (evidence: string) => {
    switch (evidence) {
      case "Gold": return "evidence-gold";
      case "Silver": return "evidence-silver"; 
      case "Bronze": return "evidence-bronze";
      default: return "evidence-bronze";
    }
  };

  const generateGPChecklist = () => {
    const checklist = `
GP CONSULTATION CHECKLIST - ${currentSymptom?.name.toUpperCase()}

Patient: _________________ Date: _________________

CURRENT SYMPTOMS:
□ ${currentSymptom?.name} - Severity: ${currentSymptom?.severity}, Frequency: ${currentSymptom?.frequency}
□ Duration: _________________ 
□ Triggers identified: _________________
□ Impact on daily life: _________________

CURRENT INTERVENTIONS (Patient is trying):
${currentSymptom?.actions.map(action => `□ ${action.title} - ${action.evidence} evidence level`).join('\n')}

ASSESSMENT NEEDED:
□ Hormone levels (FSH, LH, Estradiol, Testosterone)
□ Thyroid function (TSH, T3, T4)
□ Vitamin D, B12, Iron studies
□ Cardiovascular risk assessment
□ Bone density screening (if appropriate)

DISCUSSION POINTS:
□ HRT suitability and options
□ Evidence-based natural approaches
□ Safety of current interventions
□ Contraindications review
□ Follow-up timeline

NOTES:
_________________________________
_________________________________
_________________________________

Generated by Biohackher - Women's Longevity Coach
    `;
    
    // Create printable version
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head>
          <title>GP Checklist - ${currentSymptom?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1 { color: #2c5f5d; margin-bottom: 20px; }
            .checkbox { margin: 5px 0; }
            .section { margin: 20px 0; }
          </style>
        </head>
        <body>
          <pre>${checklist}</pre>
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        {referrer && (
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/${referrer}`)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {referrer === 'dashboard' ? 'Dashboard' : 'Previous Page'}
            </Button>
          </div>
        )}

        {/* Educational Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800">
            <strong>📚 Educational Information:</strong> This content presents commonly used complementary treatments and approaches. 
            It is for educational purposes only and does not constitute medical advice. 
            Always consult with qualified healthcare professionals for personalized guidance.
          </p>
        </div>

        {/* Conditional Rendering Based on Triage Step */}
        {triageStep === 'entry' && (
          <SymptomTriageEntry
            onThemeSelect={(themeId) => {
              setSelectedTheme(themeId);
              setTriageStep('selection');
            }}
            onBrowseAll={() => setTriageStep('browse-all')}
          />
        )}

        {triageStep === 'selection' && selectedTheme && (
          <SymptomAssessmentSelection
            themeId={selectedTheme}
            symptoms={symptoms}
            userSymptoms={userSymptoms}
            onBack={() => setTriageStep('entry')}
            onBrowseAll={() => setTriageStep('browse-all')}
          />
        )}

        {triageStep === 'browse-all' && (
          <>
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTriageStep('entry')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to themes
              </Button>
            </div>
            <SymptomBrowseAll
              symptoms={symptoms}
              userSymptoms={userSymptoms}
              onSymptomSelect={handleSymptomSelect}
            />
          </>
        )}

        {triageStep === 'dashboard' && (
          <>
            {/* Header with Actions */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold gradient-text">Symptom Assessments</h1>
                  <ScienceBackedIcon className="h-6 w-6" />
                </div>
                <p className="text-lg text-primary font-medium max-w-4xl mx-auto mb-4">
                  Track your symptoms and discover science-backed solutions tailored for your body.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={() => setTriageStep('entry')}
                  variant="default"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Complete More Assessments
                </Button>
                <Button
                  onClick={() => navigate('/assessment-history')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  View History
                </Button>
                {user && (
                  <Button
                    variant={isCustomizing ? "default" : "outline"}
                    onClick={() => setIsCustomizing(!isCustomizing)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    {isCustomizing ? "Done" : "Customize"}
                  </Button>
                )}
              </div>
            </div>

            {/* Customization Panel */}
            {isCustomizing && user && (
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Customize Your Symptoms
                    </CardTitle>
                    <CardDescription>
                      Select the symptoms you're experiencing and adjust their severity and frequency
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {symptoms.map((symptom) => {
                        const userSymptom = getUserSymptomData(symptom.id);
                        const isActive = isSymptomActive(symptom.id);
                        
                        return (
                          <Card key={symptom.id} className={`${isActive ? 'border-primary' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <symptom.icon className="h-4 w-4" />
                                  <span className="font-medium text-sm">{symptom.name}</span>
                                </div>
                                <Switch
                                  checked={isActive}
                                  onCheckedChange={(checked) => 
                                    saveUserSymptom(symptom.id, checked, userSymptom?.severity || 'Mild', userSymptom?.frequency || 'Occasional', userSymptom?.notes || '')
                                  }
                                />
                              </div>
                              
                              {isActive && (
                                <div className="space-y-3">
                                  <div>
                                    <Label className="text-xs">Severity</Label>
                                    <Select 
                                      value={userSymptom?.severity || 'Mild'}
                                      onValueChange={(value) => 
                                        saveUserSymptom(symptom.id, true, value, userSymptom?.frequency || 'Occasional', userSymptom?.notes || '')
                                      }
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Mild">Mild</SelectItem>
                                        <SelectItem value="Moderate">Moderate</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Severe">Severe</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-xs">Frequency</Label>
                                    <Select 
                                      value={userSymptom?.frequency || 'Occasional'}
                                      onValueChange={(value) => 
                                        saveUserSymptom(symptom.id, true, userSymptom?.severity || 'Mild', value, userSymptom?.notes || '')
                                      }
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Rare">Rare</SelectItem>
                                        <SelectItem value="Occasional">Occasional</SelectItem>
                                        <SelectItem value="Weekly">Weekly</SelectItem>
                                        <SelectItem value="Daily">Daily</SelectItem>
                                        <SelectItem value="Multiple times daily">Multiple times daily</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Pillar Filter */}
            <Card className="mb-8 border-2">
              <CardHeader className="text-center">
                <CardTitle>Choose Your Focus Area</CardTitle>
                <CardDescription>
                  Select a pillar to see relevant assessments, or view all available assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    variant={selectedPillar === "all" ? "default" : "outline"}
                    onClick={() => setSelectedPillar("all")}
                    size="lg"
                    className="min-w-[140px]"
                  >
                    <span className="text-base">All Assessments</span>
                  </Button>
                  <Button
                    variant={selectedPillar === "brain" ? "default" : "outline"}
                    onClick={() => setSelectedPillar("brain")}
                    size="lg"
                    className="flex items-center gap-2 min-w-[140px]"
                  >
                    <Brain className="h-5 w-5" />
                    <span className="text-base">Brain</span>
                  </Button>
                  <Button
                    variant={selectedPillar === "body" ? "default" : "outline"}
                    onClick={() => setSelectedPillar("body")}
                    size="lg"
                    className="flex items-center gap-2 min-w-[140px]"
                  >
                    <Activity className="h-5 w-5" />
                    <span className="text-base">Body</span>
                  </Button>
                  <Button
                    variant={selectedPillar === "balance" ? "default" : "outline"}
                    onClick={() => setSelectedPillar("balance")}
                    size="lg"
                    className="flex items-center gap-2 min-w-[140px]"
                  >
                    <Heart className="h-5 w-5" />
                    <span className="text-base">Balance</span>
                  </Button>
                  <Button
                    variant={selectedPillar === "beauty" ? "default" : "outline"}
                    onClick={() => setSelectedPillar("beauty")}
                    size="lg"
                    className="flex items-center gap-2 min-w-[140px]"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span className="text-base">Beauty</span>
                  </Button>
                </div>
                {selectedPillar !== "all" && (
                  <p className="text-sm text-center text-muted-foreground mt-4">
                    Showing {selectedPillar.charAt(0).toUpperCase() + selectedPillar.slice(1)} pillar assessments
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Completed Symptom Assessments */}
            {user && assessedSymptoms.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-6">Completed Symptom Assessments</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {assessedSymptoms.map((symptom) => {
                    const userSymptom = getUserSymptomData(symptom.id);
                    
                    return (
                      <div key={symptom.id} className="flex flex-col items-center">
                        <input
                          type="radio"
                          id={`assessed-${symptom.id}`}
                          name="assessed-symptom"
                          value={symptom.id}
                          className="sr-only"
                        />
                        <label
                          htmlFor={`assessed-${symptom.id}`}
                          className="cursor-pointer flex flex-col items-center p-4 rounded-lg border-2 border-l-4 transition-all hover:scale-105 hover:shadow-md w-full h-full min-h-[160px] border-primary bg-primary/10 hover:bg-primary/20 border-l-primary"
                          onClick={() => handleSymptomSelect(symptom.id)}
                        >
                          <symptom.icon className="h-8 w-8 mb-3 text-primary" />
                          <div className="flex items-center gap-1 mb-2">
                            <span className="text-sm font-medium text-center leading-tight text-foreground">
                              {symptom.name}
                            </span>
                            <ScienceBackedIcon className="h-3 w-3" showTooltip={false} />
                          </div>
                          <Badge variant="default" className="text-xs">
                            View
                          </Badge>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Symptoms Assessment Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6">
                Available Symptom Assessments
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {availableSymptoms.map((symptom) => {
                  return (
                    <div key={symptom.id} className="flex flex-col items-center">
                      <input
                        type="radio"
                        id={symptom.id}
                        name="symptom"
                        value={symptom.id}
                        checked={selectedSymptom === symptom.id}
                        onChange={() => setSelectedSymptom(symptom.id)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={symptom.id}
                        className={`cursor-pointer flex flex-col items-center p-4 rounded-lg border-2 border-l-4 transition-all hover:scale-105 hover:shadow-md w-full h-full min-h-[160px] ${
                          selectedSymptom === symptom.id
                            ? 'border-primary bg-primary/20 shadow-lg border-l-primary'
                            : 'border-primary bg-primary/10 hover:bg-primary/20 border-l-primary/50'
                        }`}
                        onClick={() => handleSymptomSelect(symptom.id)}
                      >
                        <symptom.icon className="h-8 w-8 mb-3 text-primary" />
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-sm font-medium text-center leading-tight text-foreground">
                            {symptom.name}
                          </span>
                          <ScienceBackedIcon className="h-3 w-3" showTooltip={false} />
                        </div>
                        <Badge variant="default" className="text-xs">
                          Assess
                        </Badge>
                      </label>
                    </div>
                  );
                })}
              </div>
              
              {user && availableSymptoms.length === 0 && !isCustomizing && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">All available symptoms have been assessed</p>
                  <Button
                    onClick={() => setIsCustomizing(true)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Manage Symptoms
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Choice Dialog */}
      {choiceDialogSymptom && (
        <SymptomChoiceDialog
          open={showChoiceDialog}
          onOpenChange={setShowChoiceDialog}
          symptomId={choiceDialogSymptom.id}
          symptomName={choiceDialogSymptom.name}
          symptomIcon={choiceDialogSymptom.icon}
        />
      )}
    </div>
  );
};

export default Symptoms;