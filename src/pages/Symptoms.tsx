import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Thermometer, Moon, Brain, UtensilsCrossed, FileText, Printer, Bone, Zap, Battery, Wind, Scale, Scissors, Heart, Calendar, Headphones, Droplets, BookOpen } from "lucide-react";
import Navigation from "@/components/Navigation";

const Symptoms = () => {
  const [selectedSymptom, setSelectedSymptom] = useState("hot-flashes");

  const symptoms = [
    {
      id: "hot-flashes",
      name: "Hot Flashes",
      icon: Thermometer,
      severity: "Moderate",
      frequency: "Daily",
      actions: [
        {
          title: "Cold Exposure Therapy",
          description: "2-3 minutes cold shower or ice bath to reset temperature regulation",
          evidence: "Gold",
          contraindications: ["Heart conditions", "Pregnancy"]
        },
        {
          title: "Sage Supplementation", 
          description: "300mg standardized sage extract twice daily",
          evidence: "Silver",
          contraindications: ["Hormone-sensitive conditions"]
        },
        {
          title: "Cooling Breathwork",
          description: "Sheetali pranayama - cooling breath technique",
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
      actions: [
        {
          title: "Magnesium Glycinate",
          description: "400mg before bed to support deep sleep",
          evidence: "Gold",
          contraindications: ["Kidney disease"]
        },
        {
          title: "Red Light Therapy",
          description: "10 minutes of 660nm red light 2 hours before bed",
          evidence: "Silver", 
          contraindications: ["Photosensitivity"]
        },
        {
          title: "Sleep Restriction Protocol",
          description: "Limit time in bed to actual sleep time + 30 minutes",
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
      actions: [
        {
          title: "HRV Breathwork",
          description: "4-7-8 breathing pattern for 10 minutes daily",
          evidence: "Gold",
          contraindications: ["Panic disorders"]
        },
        {
          title: "Omega-3 Optimisation",
          description: "2-3g EPA daily from high-quality fish oil",
          evidence: "Gold",
          contraindications: ["Blood thinners"]
        },
        {
          title: "Morning Light Exposure",
          description: "15-30 minutes natural sunlight within 2 hours of waking",
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
      actions: [
        {
          title: "Black Cohosh Extract",
          description: "40mg standardized extract twice daily",
          evidence: "Silver",
          contraindications: ["Liver disease", "Hormone-sensitive conditions"]
        },
        {
          title: "Cooling Sleep Environment",
          description: "Room temperature 65-68°F with moisture-wicking bedding",
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
      id: "memory-issues",
      name: "Memory Issues",
      icon: BookOpen,
      severity: "Mild",
      frequency: "Daily",
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
    }
  ];

  const currentSymptom = symptoms.find(s => s.id === selectedSymptom);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 gradient-text">Symptom Management</h1>
          <p className="text-muted-foreground">
            Evidence-based interventions for common symptoms during hormonal transitions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Symptom Selector */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Your Symptoms</h2>
            {symptoms.map((symptom) => (
              <Card
                key={symptom.id}
                className={`cursor-pointer transition-colors ${
                  selectedSymptom === symptom.id 
                    ? "border-primary bg-primary/5" 
                    : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedSymptom(symptom.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <symptom.icon className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">{symptom.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {symptom.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {symptom.frequency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Recommendations */}
          <div className="lg:col-span-2">
            {currentSymptom && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <currentSymptom.icon className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-semibold">{currentSymptom.name}</h2>
                  </div>
                  <Button
                    variant="outline"
                    onClick={generateGPChecklist}
                    className="flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    GP Checklist
                  </Button>
                </div>

                <div className="space-y-4">
                  {currentSymptom.actions.map((action, index) => (
                    <Card key={index} className="card-elevated">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{action.title}</CardTitle>
                          <Badge 
                            variant="outline" 
                            className={getEvidenceBadgeClass(action.evidence)}
                          >
                            {action.evidence} Evidence
                          </Badge>
                        </div>
                        <CardDescription>{action.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="protocol" className="w-full">
                          <TabsList>
                            <TabsTrigger value="protocol">Protocol</TabsTrigger>
                            <TabsTrigger value="contraindications">Safety</TabsTrigger>
                          </TabsList>
                          <TabsContent value="protocol" className="mt-4">
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                <strong>How to implement:</strong>
                              </p>
                              <p>{action.description}</p>
                              <Button size="sm" className="mt-2">
                                Start Protocol
                              </Button>
                            </div>
                          </TabsContent>
                          <TabsContent value="contraindications" className="mt-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-destructive">
                                ⚠️ Do not use if you have:
                              </p>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {action.contraindications.map((contra, i) => (
                                  <li key={i} className="text-muted-foreground">{contra}</li>
                                ))}
                              </ul>
                              <p className="text-xs text-muted-foreground mt-2">
                                Always consult with your healthcare provider before starting new interventions.
                              </p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Symptoms;