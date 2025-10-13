import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Heart, 
  ThumbsDown, 
  Star, 
  TrendingUp,
  BookOpen,
  Award
} from "lucide-react";
import { longevityFoodDatabase, foodCategories, LongevityFood } from "@/data/longevityFoodDatabase";
import { Badge as EvidenceBadgeBase } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useFoodPreferences } from "@/hooks/useFoodPreferences";

const FoodDatabaseSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [evidenceFilter, setEvidenceFilter] = useState("All");
  const [fodmapFilter, setFodmapFilter] = useState<boolean | null>(null);
  const [leucineFilter, setLeucineFilter] = useState(false);
  
  const { preferences, addLikedFood, addDislikedFood } = useFoodPreferences();

  const filteredFoods = useMemo(() => {
    return longevityFoodDatabase.filter(food => {
      // Search filter
      const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          food.keyBenefits.some(b => b.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          food.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === "All" || food.category === selectedCategory;
      
      // Evidence filter
      const matchesEvidence = evidenceFilter === "All" || food.evidenceLevel === evidenceFilter;
      
      // FODMAP filter
      const matchesFodmap = fodmapFilter === null || food.isFODMAPFriendly === fodmapFilter;
      
      // Leucine filter
      const matchesLeucine = !leucineFilter || (food.leucineContent && food.leucineContent > 1.5);
      
      return matchesSearch && matchesCategory && matchesEvidence && matchesFodmap && matchesLeucine;
    });
  }, [searchQuery, selectedCategory, evidenceFilter, fodmapFilter, leucineFilter]);

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const isLiked = (foodId: string) => preferences.likedFoods.includes(foodId);
  const isDisliked = (foodId: string) => preferences.dislikedFoods.includes(foodId);

  const getEvidenceBadgeColor = (level: string) => {
    switch (level) {
      case "Strong":
        return "evidence-gold";
      case "Moderate":
        return "evidence-silver";
      case "Emerging":
        return "bg-secondary/50 text-secondary-foreground border-secondary";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Search Longevity Foods Database</CardTitle>
          <CardDescription>
            Explore {longevityFoodDatabase.length} research-backed longevity foods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by food name, benefit, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {foodCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={evidenceFilter} onValueChange={setEvidenceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Evidence Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Evidence</SelectItem>
                <SelectItem value="Strong">Strong</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Emerging">Emerging</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={fodmapFilter === true ? "default" : "outline"}
              onClick={() => setFodmapFilter(fodmapFilter === true ? null : true)}
              className="w-full"
            >
              FODMAP Friendly
            </Button>

            <Button
              variant={leucineFilter ? "default" : "outline"}
              onClick={() => setLeucineFilter(!leucineFilter)}
              className="w-full"
            >
              High Leucine
            </Button>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== "All" || evidenceFilter !== "All" || fodmapFilter !== null || leucineFilter) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedCategory !== "All" && (
                <Badge variant="secondary" className="text-xs">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory("All")} className="ml-1">×</button>
                </Badge>
              )}
              {evidenceFilter !== "All" && (
                <Badge variant="secondary" className="text-xs">
                  {evidenceFilter} Evidence
                  <button onClick={() => setEvidenceFilter("All")} className="ml-1">×</button>
                </Badge>
              )}
              {fodmapFilter && (
                <Badge variant="secondary" className="text-xs">
                  FODMAP Friendly
                  <button onClick={() => setFodmapFilter(null)} className="ml-1">×</button>
                </Badge>
              )}
              {leucineFilter && (
                <Badge variant="secondary" className="text-xs">
                  High Leucine
                  <button onClick={() => setLeucineFilter(false)} className="ml-1">×</button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredFoods.length} of {longevityFoodDatabase.length} foods
      </div>

      {/* Food Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoods.map((food) => (
          <Card key={food.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <span className="text-4xl">{food.icon}</span>
                <div className="flex gap-1">
                  {getRatingStars(food.longevityRating)}
                </div>
              </div>
              <CardTitle className="text-lg">{food.name}</CardTitle>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge className={`${getEvidenceBadgeColor(food.evidenceLevel)} text-xs`}>
                  {food.evidenceLevel} Evidence
                </Badge>
                <Badge variant="outline" className="text-xs">{food.category}</Badge>
                {food.isFODMAPFriendly && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30">
                    FODMAP Friendly
                  </Badge>
                )}
                {food.leucineScore && food.leucineScore >= 3 && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30">
                    High Leucine
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Key Benefits */}
              <div>
                <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  Key Benefits
                </h4>
                <ul className="space-y-0.5">
                  {food.keyBenefits.slice(0, 3).map((benefit, i) => (
                    <li key={i} className="text-xs flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Expandable Details */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details" className="border-0">
                  <AccordionTrigger className="text-xs py-2 hover:no-underline text-primary">
                    View full details
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    {/* Mechanisms */}
                    <div>
                      <h4 className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        Longevity Mechanisms
                      </h4>
                      <ul className="space-y-0.5">
                        {food.mechanisms.map((mechanism, i) => (
                          <li key={i} className="text-xs flex items-start gap-1.5">
                            <span className="text-primary mt-0.5">→</span>
                            <span>{mechanism}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Research */}
                    {food.researchCitations.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                          <BookOpen className="h-3 w-3 text-primary" />
                          Research Evidence
                        </h4>
                        {food.researchCitations.map((citation, i) => (
                          <div key={i} className="text-xs bg-muted/50 p-2 rounded space-y-1">
                            <p className="font-semibold">{citation.study}</p>
                            <p className="text-muted-foreground">{citation.finding}</p>
                            <p className="text-xs italic">{citation.citation}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Serving Size */}
                    <div className="bg-primary/10 p-2 rounded">
                      <p className="text-xs"><strong>Serving:</strong> {food.commonServingSize}</p>
                      {food.leucineContent && (
                        <p className="text-xs"><strong>Leucine:</strong> {food.leucineContent}g per 100g</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant={isLiked(food.id) ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => addLikedFood(food.id)}
                >
                  <Heart className={`h-4 w-4 mr-1.5 ${isLiked(food.id) ? 'fill-current' : ''}`} />
                  Prefer
                </Button>
                <Button
                  variant={isDisliked(food.id) ? "destructive" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => addDislikedFood(food.id)}
                >
                  <ThumbsDown className="h-4 w-4 mr-1.5" />
                  Avoid
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFoods.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No foods match your current filters. Try adjusting your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FoodDatabaseSearch;
