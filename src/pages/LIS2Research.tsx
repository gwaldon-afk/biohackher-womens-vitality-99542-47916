import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen, TrendingUp } from "lucide-react";

export default function LIS2Research() {
  const lis2Studies = [
    {
      title: "PsychoAge and SubjAge deep aging clocks for psychological and subjective age estimation",
      journal: "GeroScience",
      year: 2020,
      doi: "10.1007/s11357-020-00248-5",
      pillar: "Stress",
      weight: "30%",
      keyFinding: "Subjective age delta of +5 years associated with HR≈2.11 for all-cause mortality - strongest predictor identified",
      url: "https://link.springer.com/article/10.1007/s11357-020-00248-5"
    },
    {
      title: "Low social engagement and risk of death in older adults",
      journal: "Aging and Disease",
      year: 2024,
      doi: "10.14336/AD.2024.0012",
      pillar: "Social Connections",
      weight: "25%",
      keyFinding: "Low social engagement associated with HR≈1.72 for mortality - major protective factor",
      url: "https://www.aginganddisease.org/EN/10.14336/AD.2024.0012"
    },
    {
      title: "Daily step count and all-cause mortality: a meta-analysis of 15 international cohorts",
      journal: "The Lancet Public Health",
      year: 2022,
      doi: "10.1016/S2468-2667(21)00302-9",
      pillar: "Physical Activity",
      weight: "15%",
      keyFinding: "Age-stratified optimal steps: 8,000 for ≥60 years, 10,000 for <60 years with saturation effects",
      url: "https://www.thelancet.com/journals/lanpub/article/PIIS2468-2667(21)00302-9/fulltext"
    },
    {
      title: "Association of daily step count and step intensity with all-cause mortality",
      journal: "JAMA Internal Medicine",
      year: 2022,
      doi: "10.1001/jamainternmed.2021.7353",
      pillar: "Physical Activity",
      weight: "15%",
      keyFinding: "10-minute minimum effective dose associated with 7% reduction in annual deaths",
      url: "https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2785784"
    },
    {
      title: "Epigenetic age acceleration independently associated with comorbidities",
      journal: "PLoS ONE",
      year: 2023,
      doi: "10.1371/journal.pone.0292593",
      pillar: "Nutrition (Penalties)",
      weight: "10%",
      keyFinding: "Smoking and obesity strongly linked to epigenetic age acceleration (GrimAA HR≈1.10)",
      url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0292593"
    },
    {
      title: "Lifestyles and their relative contribution to biological aging across multiple-organ systems",
      journal: "eLife",
      year: 2024,
      doi: "10.7554/eLife.85279",
      pillar: "Overall Model",
      weight: "N/A",
      keyFinding: "Healthy Lifestyle Index conversion constant (β=−0.11) for biological age impact",
      url: "https://elifesciences.org/articles/85279"
    },
    {
      title: "The Autonomic Balance Index as biofeedback metric for mindful breathing meditation",
      journal: "Frontiers in Human Neuroscience",
      year: 2021,
      doi: "10.3389/fnhum.2021.681345",
      pillar: "Cognitive",
      weight: "10%",
      keyFinding: "HRV individualization with 30-day baseline critical for meditation effectiveness validation",
      url: "https://www.frontiersin.org/articles/10.3389/fnhum.2021.681345/full"
    },
    {
      title: "An information-theoretic approach to biological age quantification",
      journal: "Aging",
      year: 2024,
      doi: "10.18632/aging.205479",
      pillar: "Projection Model",
      weight: "N/A",
      keyFinding: "Gompertz proportional hazards model validated for longevity projection",
      url: "https://www.aging-us.com/article/205479/text"
    }
  ];

  const weights = [
    { pillar: "Stress (Subjective Age)", weight: "30%", color: "bg-red-500" },
    { pillar: "Social Connections", weight: "25%", color: "bg-blue-500" },
    { pillar: "Sleep Quality", weight: "20%", color: "bg-purple-500" },
    { pillar: "Physical Activity", weight: "15%", color: "bg-green-500" },
    { pillar: "Nutrition", weight: "10%", color: "bg-orange-500" },
    { pillar: "Cognitive Engagement", weight: "10%", color: "bg-yellow-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">LIS 2.0 Research Foundation</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              The Longevity Impact Score 2.0 is built on validated mortality prediction research, 
              prioritizing psychosocial factors with the strongest hazard ratios.
            </p>
          </div>

          {/* Pillar Weights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                LIS 2.0 Pillar Weightings
              </CardTitle>
              <CardDescription>
                Based on relative mortality hazard ratios from meta-analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weights.map((item) => (
                  <div key={item.pillar} className="flex items-center gap-4">
                    <div className={`w-20 h-8 ${item.color} rounded flex items-center justify-center text-white font-semibold text-sm`}>
                      {item.weight}
                    </div>
                    <span className="font-medium">{item.pillar}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Note: LIS 1.0 used equal 15-25% distribution. LIS 2.0 prioritizes factors 
                with demonstrated mortality prediction power (HR &gt; 2.0).
              </p>
            </CardContent>
          </Card>

          {/* Research Studies */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Core Research Studies</h2>
            {lis2Studies.map((study, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight mb-2">
                        {study.title}
                      </CardTitle>
                      <CardDescription>
                        {study.journal} ({study.year})
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary">{study.pillar}</Badge>
                      {study.weight !== "N/A" && (
                        <Badge variant="outline">{study.weight}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground font-medium">
                    {study.keyFinding}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>DOI: {study.doi}</span>
                    <a
                      href={study.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      View Study <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Methodology */}
          <Card>
            <CardHeader>
              <CardTitle>Key Methodology Changes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. 100% Self-Reported Data</h3>
                <p className="text-sm text-muted-foreground">
                  No clinical tests or wearables required. Research shows subjective age and 
                  social engagement are stronger mortality predictors than many objective biomarkers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. Age-Stratified Activity Goals</h3>
                <p className="text-sm text-muted-foreground">
                  Optimal daily steps: 8,000 for ages ≥60, 10,000 for &lt;60, based on 
                  meta-analysis of 15 international cohorts.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. Metabolic Health Penalties</h3>
                <p className="text-sm text-muted-foreground">
                  Smoking and obesity penalties based on epigenetic age acceleration research, 
                  applied to nutrition pillar before weighting.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4. Gompertz Projection Model</h3>
                <p className="text-sm text-muted-foreground">
                  Validated proportional hazards model for 5/10/15/20-year biological age projections 
                  using sustained 30-day average ΔBA_LIS.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
