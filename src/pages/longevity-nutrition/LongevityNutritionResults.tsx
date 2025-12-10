import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Activity, Brain, Heart, Sparkles, Mail, ShoppingCart } from "lucide-react";
import { getScoreCategory, calculatePillarScores, getEatingPersonalityInsights } from "@/utils/longevityNutritionScoring";
import { NutritionPillarAnalysisCard } from "@/components/NutritionPillarAnalysisCard";
import { Accordion } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { generateNutritionProtocol, ProtocolItem } from "@/utils/nutritionProtocolGenerator";
import { autoMatchProtocolItemToProduct } from "@/services/protocolProductLinkingService";
import { getProducts, Product } from "@/services/productService";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { MethodologyDisclaimer } from "@/components/assessment/MethodologyDisclaimer";

// Protocol Item Card Component
interface ProtocolItemCardProps {
  item: ProtocolItem;
  matchedProduct: Product | null | undefined;
  onAddToCart: (product: Product) => void;
  onAddToProtocol: (item: ProtocolItem) => void;
  isAdded: boolean;
  isGuest: boolean;
}

function ProtocolItemCard({ 
  item, 
  matchedProduct, 
  onAddToCart, 
  onAddToProtocol, 
  isAdded, 
  isGuest 
}: ProtocolItemCardProps) {
  return (
    <Card className="p-4 border border-border/50 hover:border-primary/30 transition-colors">
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-foreground">{item.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
          <p className="text-xs text-primary mt-2 italic">Why: {item.relevance}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {matchedProduct ? (
            <>
              <Button
                size="sm"
                onClick={() => onAddToCart(matchedProduct)}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
              {!isGuest && (
                <Button
                  size="sm"
                  variant={isAdded ? "outline" : "secondary"}
                  onClick={() => !isAdded && onAddToProtocol(item)}
                  disabled={isAdded}
                >
                  {isAdded ? "✓ In Protocol" : "Add to Protocol"}
                </Button>
              )}
              {isGuest && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAddToProtocol(item)}
                  className="text-xs"
                >
                  Sign in to add to protocol
                </Button>
              )}
            </>
          ) : (
            <>
              {!isGuest && (
                <Button
                  size="sm"
                  variant={isAdded ? "outline" : "secondary"}
                  onClick={() => !isAdded && onAddToProtocol(item)}
                  disabled={isAdded}
                >
                  {isAdded ? "✓ In Protocol" : "Add to Protocol"}
                </Button>
              )}
              {isGuest && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAddToProtocol(item)}
                  className="text-xs"
                >
                  Sign in to add to protocol
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function LongevityNutritionResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productMatches, setProductMatches] = useState<Record<string, Product | null>>({});
  const [addedToProtocol, setAddedToProtocol] = useState<Set<string>>(new Set());

  // Fetch assessment and products
  useEffect(() => {
    const fetchAssessment = async () => {
      const id = searchParams.get("id");
      if (!id) {
        navigate("/longevity-nutrition");
        return;
      }

      const { data, error } = await supabase
        .from("longevity_nutrition_assessments")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        navigate("/longevity-nutrition");
        return;
      }

      setAssessment(data);
      setLoading(false);
    };

    fetchAssessment();
  }, [searchParams, navigate]);

  // Fetch products for protocol matching
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getProducts();
        setProducts(allProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Fetch existing protocol items to prevent duplicates
  useEffect(() => {
    const fetchExistingProtocols = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('protocol_items')
          .select('name')
          .eq('is_active', true);

        if (data) {
          const existingNames = new Set(
            data.map(item => item.name.toLowerCase().trim())
          );
          setAddedToProtocol(existingNames);
        }
      } catch (error) {
        console.error('Error fetching existing protocols:', error);
      }
    };
    
    fetchExistingProtocols();
  }, [user]);

  // Generate protocol recommendations (memoized to prevent infinite re-renders)
  const nutritionProtocol = useMemo(() => {
    if (!assessment) return { immediate: [], foundation: [], optimization: [] };
    
    return generateNutritionProtocol({
      protein_score: assessment.protein_score,
      fiber_score: assessment.fiber_score,
      plant_diversity_score: assessment.plant_diversity_score,
      gut_symptom_score: assessment.gut_symptom_score,
      inflammation_score: assessment.inflammation_score,
      hydration_score: assessment.hydration_score,
      craving_pattern: assessment.craving_pattern,
      eating_personality: assessment.eating_personality,
    });
  }, [assessment]);

  // Match protocol items to products
  useEffect(() => {
    if (products.length === 0 || !assessment) return;

    const matches: Record<string, Product | null> = {};
    const allItems = [
      ...nutritionProtocol.immediate,
      ...nutritionProtocol.foundation,
      ...nutritionProtocol.optimization
    ];

    allItems.forEach(item => {
      if (item.productKeywords) {
        const match = autoMatchProtocolItemToProduct(
          item.name,
          'supplement',
          products
        );
        matches[item.name] = match;
      }
    });

    setProductMatches(matches);
  }, [products, nutritionProtocol, assessment]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assessment) return null;

  // Handler for adding to cart
  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price_gbp || 0,
      originalPrice: undefined,
      image: product.image_url || '/placeholder.svg',
      brand: product.brand || 'Biohackher',
      dosage: product.usage_instructions || '',
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Handler for adding to protocol
  const handleAddToProtocol = async (item: ProtocolItem) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Create an account to save items to your protocol.",
        variant: "destructive"
      });
      return;
    }

    // Check if already added
    const normalizedName = item.name.toLowerCase().trim();
    if (addedToProtocol.has(normalizedName)) {
      toast({
        title: "Already in protocol",
        description: `${item.name} is already in your protocol.`,
      });
      return;
    }

    try {
      // Get or create user's active protocol
      let { data: protocols } = await supabase
        .from('protocols')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      let protocolId: string;

      if (!protocols || protocols.length === 0) {
        const { data: newProtocol, error: protocolError } = await supabase
          .from('protocols')
          .insert({
            user_id: user.id,
            name: 'My Longevity Protocol',
            protocol_type: 'personalized',
            is_active: true,
          })
          .select('id')
          .single();

        if (protocolError) throw protocolError;
        protocolId = newProtocol.id;
      } else {
        protocolId = protocols[0].id;
      }

      // Add item to protocol_items
      const { error: itemError } = await supabase
        .from('protocol_items')
        .insert({
          protocol_id: protocolId,
          name: item.name,
          description: item.description,
          item_type: 'supplement',
          frequency: item.frequency || 'daily',
          time_of_day: item.time_of_day ? [item.time_of_day] : ['morning'],
          is_active: true,
          product_id: productMatches[item.name]?.id || null,
        });

      if (itemError) throw itemError;

      // Update local state
      setAddedToProtocol(prev => new Set([...prev, normalizedName]));

      toast({
        title: "Added to protocol",
        description: `${item.name} has been added to your personalized protocol.`,
      });
    } catch (error) {
      console.error('Error adding to protocol:', error);
      toast({
        title: "Error",
        description: "Failed to add item to protocol. Please try again.",
        variant: "destructive"
      });
    }
  };

  const scoreResult = getScoreCategory(assessment.longevity_nutrition_score);
  
  const pillarScores = calculatePillarScores({
    protein_score: assessment.protein_score,
    fiber_score: assessment.fiber_score,
    plant_diversity_score: assessment.plant_diversity_score,
    gut_symptom_score: assessment.gut_symptom_score,
    inflammation_score: assessment.inflammation_score,
    hydration_score: assessment.hydration_score,
    craving_pattern: assessment.craving_pattern,
  });

  const eatingPersonality = assessment.eating_personality 
    ? getEatingPersonalityInsights(assessment.eating_personality)
    : null;

  // Find lowest-scoring pillar to auto-expand
  const lowestPillar = Object.entries(pillarScores).reduce((lowest, [name, data]) => 
    data.percentage < lowest.percentage ? { name, ...data } : lowest
  , { name: '', percentage: 100 });

  const pillarIcons: Record<string, any> = {
    BODY: Activity,
    BRAIN: Brain,
    BALANCE: Heart,
    BEAUTY: Sparkles,
  };

  const pillarColors: Record<string, string> = {
    BODY: '#f97316',
    BRAIN: '#a855f7',
    BALANCE: '#ef4444',
    BEAUTY: '#ec4899',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Top Return Button */}
        <div className="flex justify-start">
          <Button variant="outline" onClick={() => navigate(user ? "/today" : "/")}>
            {user ? "← Return to Today" : "← Back to Home"}
          </Button>
        </div>

        {/* Overall Score Card */}
        <Card className="p-8 text-center border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
          <h1 className="text-4xl font-bold mb-4">Your Longevity Nutrition Score</h1>
          <div className="text-6xl font-bold text-primary mb-2">{scoreResult.score}</div>
          <div className="text-2xl font-semibold mb-4">{scoreResult.category}</div>
          <p className="text-muted-foreground max-w-2xl mx-auto">{scoreResult.description}</p>
        </Card>

        {/* Methodology Disclaimer */}
        <MethodologyDisclaimer assessmentType="nutrition" />

        {/* Pillar Breakdown Visual */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-background border-primary/20">
          <h2 className="text-xl font-bold mb-6">Your Nutrition Pillars Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(pillarScores).map(([pillarName, data]) => {
              const Icon = pillarIcons[pillarName];
              const color = pillarColors[pillarName];
              return (
                <div key={pillarName} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" style={{ color }} />
                      <span className="font-medium">{pillarName}</span>
                    </div>
                    <Badge variant={data.status === 'excellent' ? 'default' : data.status === 'good' ? 'secondary' : 'outline'}>
                      {data.score}/{data.maxScore}
                    </Badge>
                  </div>
                  <Progress value={data.percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Detailed Pillar Analysis */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-2 border-primary/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-2">Detailed Pillar Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Expand each pillar to see personalized recommendations based on your assessment.
            </p>
          </div>
          
          <Accordion type="multiple" className="space-y-4">
            {Object.entries(pillarScores).map(([pillarName, data]) => (
              <NutritionPillarAnalysisCard
                key={pillarName}
                pillarName={pillarName}
                score={data.score}
                maxScore={data.maxScore}
                percentage={data.percentage}
                status={data.status}
                icon={pillarIcons[pillarName]}
                color={pillarColors[pillarName]}
                assessmentData={assessment}
                defaultOpen={pillarName === lowestPillar.name}
              />
            ))}
          </Accordion>
        </div>

        {/* Eating Personality Insights */}
        {eatingPersonality && (
          <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-secondary/10 to-background">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Eating Personality: {eatingPersonality.title}
            </h2>
            <p className="text-muted-foreground mb-4">{eatingPersonality.description}</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-orange-600">Common Challenges</h3>
                <ul className="space-y-1">
                  {eatingPersonality.challenges.map((challenge, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-orange-300">
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-green-600">Personalized Recommendations</h3>
                <ul className="space-y-1">
                  {eatingPersonality.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-green-300">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Protocol Recommendations Section */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-2 border-primary/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-2">Your Personalized Nutrition Protocol</h2>
            <p className="text-muted-foreground">
              Based on your assessment, these evidence-based supplements and actions will support your longevity goals.
            </p>
          </div>

          {/* Immediate Actions */}
          {nutritionProtocol.immediate.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-red-500 rounded-full" />
                <h3 className="text-xl font-bold">Start Now (Week 1)</h3>
              </div>
              <p className="text-sm text-muted-foreground">Critical gaps to address immediately</p>
              <div className="space-y-3">
                {nutritionProtocol.immediate.map((item, idx) => (
                  <ProtocolItemCard
                    key={idx}
                    item={item}
                    matchedProduct={productMatches[item.name]}
                    onAddToCart={handleAddToCart}
                    onAddToProtocol={handleAddToProtocol}
                    isAdded={addedToProtocol.has(item.name.toLowerCase().trim())}
                    isGuest={!user}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Foundation */}
          {nutritionProtocol.foundation.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-orange-500 rounded-full" />
                <h3 className="text-xl font-bold">Foundation (Weeks 1-4)</h3>
              </div>
              <p className="text-sm text-muted-foreground">Core longevity supplements for sustained health</p>
              <div className="space-y-3">
                {nutritionProtocol.foundation.map((item, idx) => (
                  <ProtocolItemCard
                    key={idx}
                    item={item}
                    matchedProduct={productMatches[item.name]}
                    onAddToCart={handleAddToCart}
                    onAddToProtocol={handleAddToProtocol}
                    isAdded={addedToProtocol.has(item.name.toLowerCase().trim())}
                    isGuest={!user}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Optimization */}
          {nutritionProtocol.optimization.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-green-500 rounded-full" />
                <h3 className="text-xl font-bold">Optimization (Months 1-3)</h3>
              </div>
              <p className="text-sm text-muted-foreground">Advanced longevity support</p>
              <div className="space-y-3">
                {nutritionProtocol.optimization.map((item, idx) => (
                  <ProtocolItemCard
                    key={idx}
                    item={item}
                    matchedProduct={productMatches[item.name]}
                    onAddToCart={handleAddToCart}
                    onAddToProtocol={handleAddToProtocol}
                    isAdded={addedToProtocol.has(item.name.toLowerCase().trim())}
                    isGuest={!user}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Guest Registration CTA */}
        {!user && (
          <Card className="p-8 border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/5 to-background shadow-lg">
            <div className="text-center space-y-4">
              <ShoppingCart className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Ready to Start Your Longevity Journey?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Create a free account to save your personalized protocol, purchase recommended supplements, and track your nutrition progress.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto my-6">
                <div className="text-center">
                  <div className="font-semibold">✓ Save Protocol to Dashboard</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">✓ Purchase Supplements</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">✓ Daily Nutrition Tracking</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">✓ Monthly Reassessments</div>
                </div>
              </div>
              <Button size="lg" onClick={() => {
                const sessionId = assessment?.session_id || localStorage.getItem('nutrition_guest_session');
                navigate(sessionId ? `/auth?session=${sessionId}&source=nutrition` : "/auth");
              }} className="text-lg px-8">
                Create Free Account & Start Now
              </Button>
              <p className="text-xs text-muted-foreground">Includes FREE 3-day trial • No credit card required</p>
            </div>
          </Card>
        )}

        {/* Bottom Return Button */}
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate(user ? "/today" : "/")} size="lg">
            {user ? "Return to Today" : "Back to Home"}
          </Button>
        </div>
      </div>
    </div>
  );
}
