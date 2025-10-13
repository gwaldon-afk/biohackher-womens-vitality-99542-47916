import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import ResearchCitation from "@/components/ResearchCitation";
import LongevityFoodInsights from "@/components/LongevityFoodInsights";
import FoodDatabaseSearch from "@/components/FoodDatabaseSearch";
import FoodPreferencesSidebar from "@/components/FoodPreferencesSidebar";
import { leucineRichFoods, fodmapFoods } from "@/data/nutritionData";

interface FoodScienceTabProps {
  isLowFODMAP: boolean;
  setIsLowFODMAP: (value: boolean) => void;
  hasIBS: boolean;
  setHasIBS: (value: boolean) => void;
}

const getLeucineScoreColor = (score: string) => {
  switch (score) {
    case "Excellent": return "text-green-600 bg-green-50 border-green-200";
    case "Good": return "text-blue-600 bg-blue-50 border-blue-200";
    case "Fair": return "text-orange-600 bg-orange-50 border-orange-200";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const FoodScienceTab = ({ isLowFODMAP, setIsLowFODMAP, hasIBS, setHasIBS }: FoodScienceTabProps) => {
  return (
    <div className="space-y-6">
      <FoodPreferencesSidebar />
      
      <Tabs defaultValue="longevity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="longevity">Longevity Foods</TabsTrigger>
          <TabsTrigger value="leucine">Leucine Content</TabsTrigger>
          <TabsTrigger value="fodmap">FODMAP Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="longevity" className="mt-6">
          <div className="space-y-6">
            <FoodDatabaseSearch />
            <LongevityFoodInsights />
          </div>
        </TabsContent>

        <TabsContent value="leucine" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Leucine-Rich Foods
                <ScienceBackedIcon className="h-5 w-5" showTooltip={false} />
                <ResearchCitation
                  title="The Role of Leucine in Weight Loss Diet and Glucose Homeostasis"
                  journal="Frontiers in Pharmacology"
                  year={2016}
                  url="https://pubmed.ncbi.nlm.nih.gov/27242532/"
                  doi="10.3389/fphar.2016.00144"
                  studyType="Review"
                />
              </CardTitle>
              <CardDescription>
                Leucine is a key amino acid that triggers muscle protein synthesis. Aim for 2.5-3g per meal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {leucineRichFoods.map((food, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{food.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {food.protein}g protein • {food.leucine}g leucine
                      </p>
                    </div>
                    <Badge className={getLeucineScoreColor(food.score)}>
                      {food.score}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
                <p className="text-sm text-blue-800 mb-3">
                  To maximize muscle protein synthesis, consume leucine-rich foods within 2 hours after resistance training. 
                  Combining different protein sources can help you reach the optimal leucine threshold.
                </p>
                <div className="border-t border-blue-300 pt-2">
                  <ResearchCitation
                    title="Nutrient Timing Revisited: Is There a Post-Exercise Anabolic Window?"
                    journal="Journal of the International Society of Sports Nutrition"
                    year={2013}
                    url="https://pubmed.ncbi.nlm.nih.gov/23360586/"
                    doi="10.1186/1550-2783-10-5"
                    studyType="Review"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fodmap" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">FODMAP Guide</h2>
                  <ScienceBackedIcon className="h-5 w-5" showTooltip={false} />
                  <ResearchCitation
                    title="A Diet Low in FODMAPs Reduces Symptoms of Irritable Bowel Syndrome"
                    journal="Gastroenterology"
                    year={2014}
                    url="https://pubmed.ncbi.nlm.nih.gov/24076059/"
                    doi="10.1053/j.gastro.2013.09.046"
                    studyType="RCT"
                  />
                </div>
                <p className="text-muted-foreground">
                  Foods to include and avoid for digestive comfort
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="fodmap-toggle"
                  checked={isLowFODMAP}
                  onCheckedChange={setIsLowFODMAP}
                />
                <Label htmlFor="fodmap-toggle">Follow Low-FODMAP diet</Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ibs-toggle"
                checked={hasIBS}
                onCheckedChange={setHasIBS}
              />
              <Label htmlFor="ibs-toggle">I have IBS or digestive sensitivities</Label>
            </div>

            {hasIBS && (
              <Card className="mb-6 border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <p className="text-orange-800 font-medium">
                      IBS Management: Consider working with a registered dietitian for personalised FODMAP guidance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700">✓ Low FODMAP Foods</CardTitle>
                  <CardDescription>Generally well-tolerated foods</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {fodmapFoods.low.map((food, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">{food}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700">⚠️ High FODMAP Foods</CardTitle>
                  <CardDescription>Limit or avoid during elimination phase</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {fodmapFoods.high.map((food, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-sm">{food}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FoodScienceTab;
