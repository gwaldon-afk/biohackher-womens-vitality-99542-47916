import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { longevityFoodInsights, longevityEatingPrinciples } from "@/data/longevityFoodResearch";
import { BookOpen, Dna, TrendingUp, Info } from "lucide-react";

const LongevityFoodInsights = () => {
  const getEvidenceBadgeColor = (level: string) => {
    switch (level) {
      case "Strong":
        return "bg-green-100 text-green-800 border-green-300";
      case "Moderate":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Emerging":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
        <div className="flex items-start gap-4">
          <Dna className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Longevity Nutrition Science</h2>
            <p className="text-muted-foreground">
              Research-backed insights on foods that activate longevity pathways, reduce biological aging, 
              and extend healthspan. All insights are supported by peer-reviewed studies.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="foods" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="foods">Longevity Foods</TabsTrigger>
          <TabsTrigger value="principles">Eating Principles</TabsTrigger>
        </TabsList>

        <TabsContent value="foods" className="space-y-4 mt-4">
          <Accordion type="single" collapsible className="w-full">
            {longevityFoodInsights.map((insight, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-3xl">{insight.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{insight.category}</span>
                        <Badge className={getEvidenceBadgeColor(insight.evidenceLevel)}>
                          {insight.evidenceLevel} Evidence
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {insight.foods.slice(0, 3).join(", ")}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {/* Foods & Key Compounds */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <span className="text-lg">🥗</span>
                          Foods in This Category
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {insight.foods.map((food, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {food}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <span className="text-lg">🧬</span>
                          Key Compounds
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {insight.keyCompounds.map((compound, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {compound}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Longevity Mechanisms */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Longevity Mechanisms
                      </h4>
                      <ul className="space-y-1">
                        {insight.longevityMechanisms.map((mechanism, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-1">•</span>
                            <span>{mechanism}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Research Evidence */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Research Evidence
                      </h4>
                      <div className="space-y-3">
                        {insight.researchEvidence.map((evidence, i) => (
                          <Card key={i} className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h5 className="font-semibold text-sm">{evidence.study}</h5>
                                  <Badge variant="outline" className="text-xs flex-shrink-0">
                                    {evidence.year}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  <strong>Finding:</strong> {evidence.finding}
                                </p>
                                {evidence.sampleSize && (
                                  <p className="text-xs text-muted-foreground">
                                    <strong>Sample:</strong> {evidence.sampleSize}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground italic">
                                  {evidence.citation}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Practical Application */}
                    <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <span className="text-lg">📊</span>
                          Recommended Intake
                        </h4>
                        <p className="text-sm bg-primary/10 p-3 rounded-lg font-medium">
                          {insight.recommendedIntake}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <span className="text-lg">💡</span>
                          Practical Tips
                        </h4>
                        <ul className="space-y-1">
                          {insight.practicalTips.map((tip, i) => (
                            <li key={i} className="text-xs flex items-start gap-2">
                              <span className="text-primary">→</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="principles" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Longevity Eating Principles
              </CardTitle>
              <CardDescription>
                Evidence-based eating patterns that activate longevity pathways beyond individual foods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {longevityEatingPrinciples.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{item.principle}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm font-semibold">Mechanism:</span>
                      <p className="text-sm text-muted-foreground mt-1">{item.mechanism}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">Evidence:</span>
                      <p className="text-sm text-muted-foreground mt-1">{item.evidence}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Combining It All Together</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                The most powerful longevity nutrition strategy combines:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span><strong>High phytonutrient density</strong> from colorful plants (30+ species/week)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span><strong>Omega-3 dominance</strong> from fatty fish 3-4x/week</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span><strong>Time-restricted eating</strong> (8-12 hour window)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span><strong>Moderate protein cycling</strong> to balance mTOR and autophagy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">5.</span>
                  <span><strong>Daily fermented foods</strong> for gut health</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground italic pt-2 border-t">
                Note: Individual responses vary. Consult healthcare providers before major dietary changes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LongevityFoodInsights;
