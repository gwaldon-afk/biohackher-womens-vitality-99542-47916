import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Zap, Sparkles, Scale, Pill, Star, ShieldCheck, AlertTriangle } from "lucide-react";
import Navigation from "@/components/Navigation";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import EvidenceBadge from "@/components/EvidenceBadge";
import ResearchCitation from "@/components/ResearchCitation";

const Supplements = () => {
  const [selectedPillar, setSelectedPillar] = useState("brain");

  const pillars = {
    brain: {
      icon: Brain,
      title: "Brain",
      description: "Cognitive enhancement and mental clarity",
      color: "text-purple-600",
      supplements: [
        {
          name: "Lion's Mane Mushroom",
          dosage: "1000mg daily",
          benefits: ["Cognitive enhancement", "Nerve growth factor", "Memory support"],
          evidence: "Silver",
          contraindications: ["Mushroom allergies", "Autoimmune conditions"],
          timing: "Morning with food",
          research: "https://pubmed.ncbi.nlm.nih.gov/31413233/"
        },
        {
          name: "Phosphatidylserine",
          dosage: "100mg daily",
          benefits: ["Memory improvement", "Focus enhancement", "Stress reduction"],
          evidence: "Gold",
          contraindications: ["Blood thinners", "Soy allergies"],
          timing: "Evening before bed",
          research: "https://pubmed.ncbi.nlm.nih.gov/25933483/"
        },
        {
          name: "Alpha-GPC",
          dosage: "300mg daily",
          benefits: ["Choline support", "Memory formation", "Focus"],
          evidence: "Silver",
          contraindications: ["Acetylcholine sensitivity"],
          timing: "Morning on empty stomach",
          research: "https://pubmed.ncbi.nlm.nih.gov/12637119/"
        },
        {
          name: "Bacopa Monnieri",
          dosage: "300mg daily",
          benefits: ["Memory enhancement", "Anxiety reduction", "Learning support"],
          evidence: "Gold",
          contraindications: ["Thyroid medications", "Sedatives"],
          timing: "With meals",
          research: "https://pubmed.ncbi.nlm.nih.gov/23772955/"
        }
      ]
    },
    body: {
      icon: Zap,
      title: "Body",
      description: "Physical performance and energy optimization",
      color: "text-red-600",
      supplements: [
        {
          name: "CoQ10 Ubiquinol",
          dosage: "200mg daily",
          benefits: ["Mitochondrial support", "Energy production", "Heart health"],
          evidence: "Gold",
          contraindications: ["Blood pressure medications"],
          timing: "With fatty meal",
          research: "https://pubmed.ncbi.nlm.nih.gov/29302906/"
        },
        {
          name: "Curcumin Complex",
          dosage: "500mg twice daily",
          benefits: ["Anti-inflammatory", "Joint support", "Recovery"],
          evidence: "Gold",
          contraindications: ["Blood thinners", "Gallstones"],
          timing: "With meals",
          research: "https://pubmed.ncbi.nlm.nih.gov/32474596/"
        },
        {
          name: "Omega-3 EPA/DHA",
          dosage: "2-3g daily",
          benefits: ["Inflammation reduction", "Heart health", "Brain support"],
          evidence: "Gold",
          contraindications: ["Blood thinners", "Fish allergies"],
          timing: "With meals",
          research: "https://pubmed.ncbi.nlm.nih.gov/31662871/"
        },
        {
          name: "Magnesium Glycinate",
          dosage: "400mg daily",
          benefits: ["Muscle function", "Sleep quality", "Stress reduction"],
          evidence: "Gold",
          contraindications: ["Kidney disease"],
          timing: "Evening before bed",
          research: "https://pubmed.ncbi.nlm.nih.gov/23853635/"
        }
      ]
    },
    beauty: {
      icon: Sparkles,
      title: "Beauty",
      description: "Skin, hair, and aesthetic wellness support",
      color: "text-pink-600",
      supplements: [
        {
          name: "Collagen Peptides",
          dosage: "10g daily",
          benefits: ["Skin elasticity", "Hair strength", "Nail health"],
          evidence: "Silver",
          contraindications: ["Collagen allergies"],
          timing: "Morning on empty stomach"
        },
        {
          name: "Hyaluronic Acid",
          dosage: "100mg daily",
          benefits: ["Skin hydration", "Joint lubrication", "Anti-aging"],
          evidence: "Silver",
          contraindications: ["Autoimmune conditions"],
          timing: "With water before meals"
        },
        {
          name: "Biotin",
          dosage: "2500mcg daily",
          benefits: ["Hair growth", "Nail strength", "Skin health"],
          evidence: "Bronze",
          contraindications: ["Lab test interference"],
          timing: "Morning with food"
        },
        {
          name: "Astaxanthin",
          dosage: "4mg daily",
          benefits: ["Skin protection", "UV defense", "Anti-aging"],
          evidence: "Silver",
          contraindications: ["Carotenoid allergies"],
          timing: "With fatty meal"
        }
      ]
    },
    balance: {
      icon: Scale,
      title: "Balance",
      description: "Hormonal harmony and metabolic wellness",
      color: "text-green-600",
      supplements: [
        {
          name: "Ashwagandha",
          dosage: "600mg daily",
          benefits: ["Stress adaptation", "Cortisol regulation", "Energy balance"],
          evidence: "Gold",
          contraindications: ["Autoimmune conditions", "Nightshade allergies"],
          timing: "Morning or evening",
          research: "https://pubmed.ncbi.nlm.nih.gov/31991619/"
        },
        {
          name: "Vitex (Chasteberry)",
          dosage: "400mg daily",
          benefits: ["Hormone regulation", "Cycle support", "PMS relief"],
          evidence: "Silver",
          contraindications: ["Pregnancy", "Hormone medications"],
          timing: "Morning on empty stomach",
          research: "https://pubmed.ncbi.nlm.nih.gov/23136064/"
        },
        {
          name: "Inositol",
          dosage: "2g daily",
          benefits: ["Insulin sensitivity", "Hormone balance", "Mood support"],
          evidence: "Gold",
          contraindications: ["Bipolar disorder medications"],
          timing: "Divided doses with meals",
          research: "https://pubmed.ncbi.nlm.nih.gov/31788629/"
        },
        {
          name: "Evening Primrose Oil",
          dosage: "1000mg daily",
          benefits: ["Hormone support", "Skin health", "Inflammation"],
          evidence: "Bronze",
          contraindications: ["Seizure disorders", "Blood thinners"],
          timing: "With evening meal"
        }
      ]
    }
  };

  const getEvidenceBadgeClass = (evidence: string) => {
    switch (evidence) {
      case "Gold": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Silver": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Bronze": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const currentPillar = pillars[selectedPillar as keyof typeof pillars];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold gradient-text">Biohacking Supplements</h1>
            <ScienceBackedIcon className="h-6 w-6" />
          </div>
          <p className="text-muted-foreground text-center">
            Evidence-based supplement protocols organised by the four pillars of wellness
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800">
              <strong>📚 Educational Information:</strong> This content presents commonly used supplements and approaches. 
              It is for educational purposes only and does not constitute medical advice. 
              Always consult with qualified healthcare professionals before starting any supplement regimen.
            </p>
          </div>
        </div>

        {/* Pillar Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-center mb-6">Choose Your Pillar</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(pillars).map(([key, pillar]) => (
              <div key={key} className="flex flex-col items-center">
                <input
                  type="radio"
                  id={key}
                  name="pillar"
                  value={key}
                  checked={selectedPillar === key}
                  onChange={() => setSelectedPillar(key)}
                  className="sr-only"
                />
                <label
                  htmlFor={key}
                  className={`cursor-pointer flex flex-col items-center p-6 rounded-lg border-2 border-l-4 transition-all hover:scale-105 hover:shadow-md w-full ${
                    selectedPillar === key
                      ? 'border-primary bg-primary text-primary-foreground shadow-lg border-l-primary'
                      : 'border-gray-200 bg-primary-dark hover:border-primary/50 hover:bg-primary border-l-primary/30'
                  }`}
                >
                  <pillar.icon className={`h-10 w-10 mb-3 ${
                    selectedPillar === key ? 'text-primary-foreground' : pillar.color
                  }`} />
                  <span className={`text-lg font-semibold text-center mb-2 ${
                    selectedPillar === key ? 'text-primary-foreground' : 'text-gray-700'
                  }`}>
                    {pillar.title}
                  </span>
                  <span className={`text-sm text-center leading-tight ${
                    selectedPillar === key ? 'text-primary-foreground/80' : 'text-gray-600'
                  }`}>
                    {pillar.description}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Supplement Details */}
        {currentPillar && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <currentPillar.icon className={`h-8 w-8 ${currentPillar.color}`} />
                <h2 className="text-3xl font-bold">{currentPillar.title} Supplements</h2>
                <ScienceBackedIcon className="h-6 w-6" />
              </div>
              <p className="text-muted-foreground text-lg">{currentPillar.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentPillar.supplements.map((supplement, index) => (
                <Card key={index} className="card-elevated hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5 text-primary" />
                        {supplement.name}
                        <ScienceBackedIcon className="h-4 w-4" showTooltip={false} />
                      </CardTitle>
                      <EvidenceBadge level={supplement.evidence as any} />
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <strong>Dosage:</strong> {supplement.dosage}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="benefits" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="benefits">Benefits</TabsTrigger>
                        <TabsTrigger value="timing">Usage</TabsTrigger>
                        <TabsTrigger value="safety">Safety</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="benefits" className="mt-4">
                        <div className="space-y-3">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                            Primary Benefits:
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {supplement.benefits.map((benefit, i) => (
                              <li key={i} className="text-muted-foreground">{benefit}</li>
                            ))}
                          </ul>
                          {(supplement as any).research && (
                            <div className="mt-4 pt-3 border-t">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Supporting Research:</p>
                              <a 
                                href={(supplement as any).research} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Research link clicked:', e.currentTarget.href);
                                }}
                              >
                                View Clinical Study →
                              </a>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="timing" className="mt-4">
                        <div className="space-y-3">
                          <p className="text-sm font-medium">Optimal Timing:</p>
                          <p className="text-sm bg-muted p-3 rounded-lg">{supplement.timing}</p>
                          <p className="text-xs text-muted-foreground">
                            Timing can affect absorption and effectiveness. Follow these guidelines for best results.
                          </p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="safety" className="mt-4">
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Contraindications:
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {supplement.contraindications.map((contra, i) => (
                              <li key={i} className="text-muted-foreground">{contra}</li>
                            ))}
                          </ul>
                          <p className="text-xs text-muted-foreground mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <strong>Disclaimer:</strong> This is educational information only. Always consult with your healthcare provider before starting any supplement regimen, especially if you have medical conditions or take medications.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Supplements;