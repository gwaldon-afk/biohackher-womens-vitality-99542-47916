import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Activity, Brain, Heart, Sparkles, Mail, ShoppingCart, Target, CheckCircle2 } from "lucide-react";
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
import { MetabolicAgeDisplay } from "@/components/nutrition/MetabolicAgeDisplay";
import { ProtocolSelectionDialog } from "@/components/ProtocolSelectionDialog";
import { useProtocolRecommendations } from "@/hooks/useProtocolRecommendations";
import { InlineProtocolPreview } from "@/components/assessment/InlineProtocolPreview";
import { fetchExistingItemsMap, filterDuplicateItems, normalizeItemName } from "@/utils/protocolDuplicateCheck";
import { upsertProtocolItemSourcesFromRecommendation } from "@/services/protocolItemSources";

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
  const { t } = useTranslation();
  return (
    <Card className="p-4 border border-border/50 hover:border-primary/30 transition-colors">
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-foreground">{item.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
          <p className="text-xs text-primary mt-2 italic">{t('nutritionResults.why')} {item.relevance}</p>
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
                {t('nutritionResults.addToCart')}
              </Button>
              {!isGuest && (
                <Button
                  size="sm"
                  variant={isAdded ? "outline" : "secondary"}
                  onClick={() => !isAdded && onAddToProtocol(item)}
                  disabled={isAdded}
                >
                  {isAdded ? t('nutritionResults.inProtocol') : t('nutritionResults.addToProtocol')}
                </Button>
              )}
              {isGuest && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAddToProtocol(item)}
                  className="text-xs"
                >
                  {t('nutritionResults.signInToAdd')}
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
                  {isAdded ? t('nutritionResults.inProtocol') : t('nutritionResults.addToProtocol')}
                </Button>
              )}
              {isGuest && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAddToProtocol(item)}
                  className="text-xs"
                >
                  {t('nutritionResults.signInToAdd')}
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
  const { t } = useTranslation();
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
  
  // Protocol selection dialog state
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
  const [currentRecommendationId, setCurrentRecommendationId] = useState<string | null>(null);
  const { refetch: refetchRecommendations } = useProtocolRecommendations();

  // Fetch assessment and products
  useEffect(() => {
    const fetchAssessment = async () => {
      const id = searchParams.get("id");
      if (!id) {
        navigate("/longevity-nutrition");
        return;
      }

      // Authenticated users can load directly; guests must use session-bound RPC.
      const { data, error } = user
        ? await supabase
            .from("longevity_nutrition_assessments")
            .select("*")
            .eq("id", id)
            .single()
        : await supabase.rpc("get_guest_nutrition_assessment", {
            p_id: id,
            p_session_id: localStorage.getItem("nutrition_guest_session"),
          });

      if (error || !data) {
        navigate("/longevity-nutrition");
        return;
      }

      setAssessment(data);
      setLoading(false);
    };

    fetchAssessment();
  }, [searchParams, navigate, user]);

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

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-6 space-y-4">
          <div className="text-lg font-semibold">
            {t('nutritionResults.missing.title', 'We couldn’t load your results')}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('nutritionResults.missing.description', 'Please restart the assessment to generate results.')}
          </p>
          <Button onClick={() => navigate('/longevity-nutrition')}>
            {t('nutritionResults.missing.restart', 'Restart Assessment')}
          </Button>
        </Card>
      </div>
    );
  }

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
      title: t('nutritionResults.addedToCart'),
      description: t('nutritionResults.addedToCartDescription', { name: product.name }),
    });
  };

  // Handler for adding to protocol
  const handleAddToProtocol = async (item: ProtocolItem) => {
    if (!user) {
      toast({
        title: t('nutritionResults.signInRequired'),
        description: t('nutritionResults.signInRequiredDescription'),
        variant: "destructive"
      });
      return;
    }

    // Check if already added
    const normalizedName = item.name.toLowerCase().trim();
    if (addedToProtocol.has(normalizedName)) {
      toast({
        title: t('nutritionResults.alreadyInProtocol'),
        description: t('nutritionResults.alreadyInProtocolDescription', { name: item.name }),
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
        title: t('nutritionResults.addedToProtocol'),
        description: t('nutritionResults.addedToProtocolDescription', { name: item.name }),
      });
    } catch (error) {
      console.error('Error adding to protocol:', error);
      toast({
        title: t('nutritionResults.error'),
        description: t('nutritionResults.failedToAdd'),
        variant: "destructive"
      });
    }
  };

  // Handler to open protocol selection dialog (saves recommendation first)
  const handleReviewFullProtocol = async () => {
    if (!user) {
      toast({
        title: t('nutritionResults.signInRequired'),
        description: t('nutritionResults.signInRequiredReview'),
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!assessment?.id) {
      toast({
        title: t('nutritionResults.error'),
        description: t('nutritionResults.assessmentIdNotFound'),
        variant: "destructive"
      });
      return;
    }

    try {
      // Save as recommendation first
      const { data: recommendation, error } = await supabase
        .from('protocol_recommendations')
        .insert({
          user_id: user.id,
          source_assessment_id: assessment.id,
          source_type: 'nutrition',
          protocol_data: nutritionProtocol as any,
          status: 'pending'
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error saving recommendation:', error);
        toast({
          title: t('nutritionResults.error'),
          description: t('nutritionResults.failedToSaveRecommendation'),
          variant: "destructive"
        });
        return;
      }

      // Store recommendation ID and open dialog
      setCurrentRecommendationId(recommendation.id);
      setProtocolDialogOpen(true);
    } catch (error) {
      console.error('Error saving protocol:', error);
      toast({
        title: t('nutritionResults.error'),
        description: t('nutritionResults.failedToSave'),
        variant: "destructive"
      });
    }
  };

  // Handler for protocol selection from dialog
  const handleProtocolSelection = async (selectedItems: ProtocolItem[], cartItems: Product[]) => {
    if (!user || !currentRecommendationId) return;

    try {
      // Get or create active protocol
      let { data: protocols } = await supabase
        .from('protocols')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      let protocolId: string;

      if (!protocols || protocols.length === 0) {
        // Create new protocol
        const { data: newProtocol, error: protocolError } = await supabase
          .from('protocols')
          .insert({
            user_id: user.id,
            name: `Longevity Nutrition Protocol - ${new Date().toLocaleDateString()}`,
            description: 'Generated from Longevity Nutrition assessment',
            source_recommendation_id: currentRecommendationId,
            source_type: 'nutrition',
            is_active: true,
            start_date: new Date().toISOString()
          })
          .select('id')
          .single();

        if (protocolError) throw protocolError;
        protocolId = newProtocol.id;
      } else {
        protocolId = protocols[0].id;
      }

      // Prepare items with item_type for duplicate checking
      const itemsWithType = selectedItems.map(item => ({
        ...item,
        item_type: 'supplement' as const
      }));

      const existingItemsMap = await fetchExistingItemsMap(user.id);
      const { uniqueItems, duplicateItems } = await filterDuplicateItems(user.id, itemsWithType);

      if (uniqueItems.length === 0) {
        const duplicateIds = duplicateItems
          .map((item) => {
            const key = `${normalizeItemName(item.name)}|${item.item_type}`;
            return existingItemsMap.get(key);
          })
          .filter((id): id is string => !!id);

        if (duplicateIds.length > 0) {
          await upsertProtocolItemSourcesFromRecommendation({
            userId: user.id,
            recommendationId: currentRecommendationId,
            protocolItemIds: duplicateIds,
          });
        }

        toast({
          title: t('protocol.allDuplicates'),
          description: t('protocol.allDuplicatesDesc'),
        });
        setProtocolDialogOpen(false);
        return;
      }

      // Map unique items to protocol_items format
      const protocolItems = uniqueItems.map(item => ({
        protocol_id: protocolId,
        name: item.name,
        description: item.description || '',
        dosage: (item as any).dosage || null,
        frequency: (item as any).frequency || 'daily',
        time_of_day: (item as any).time_of_day ? [(item as any).time_of_day] : ['morning'],
        item_type: 'supplement' as const,
        is_active: true,
        priority_tier: (item as any).priority_tier || 'foundation',
        product_id: productMatches[item.name]?.id || null,
        notes: item.relevance || null
      }));

      // Insert protocol items
      const { data: insertedItems, error: itemsError } = await supabase
        .from('protocol_items')
        .insert(protocolItems)
        .select('id');

      if (itemsError) throw itemsError;

      const insertedIds = insertedItems?.map((item) => item.id) || [];
      await upsertProtocolItemSourcesFromRecommendation({
        userId: user.id,
        recommendationId: currentRecommendationId,
        protocolItemIds: insertedIds,
      });

      if (duplicateItems.length > 0) {
        const duplicateIds = duplicateItems
          .map((item) => {
            const key = `${normalizeItemName(item.name)}|${item.item_type}`;
            return existingItemsMap.get(key);
          })
          .filter((id): id is string => !!id);

        if (duplicateIds.length > 0) {
          await upsertProtocolItemSourcesFromRecommendation({
            userId: user.id,
            recommendationId: currentRecommendationId,
            protocolItemIds: duplicateIds,
          });
        }
      }

      // Update recommendation status
      const allSelected = selectedItems.length === (
        nutritionProtocol.immediate.length + 
        nutritionProtocol.foundation.length + 
        nutritionProtocol.optimization.length
      );

      await supabase
        .from('protocol_recommendations')
        .update({
          status: allSelected ? 'accepted' : 'partially_accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', currentRecommendationId);

      await refetchRecommendations();

      const toastDesc = duplicateItems.length > 0 
        ? t('protocol.addedWithDuplicates', { added: uniqueItems.length, skipped: duplicateItems.length })
        : t('protocol.addedDesc', { count: uniqueItems.length });

      toast({
        title: t('protocol.added'),
        description: toastDesc,
      });

      setProtocolDialogOpen(false);
      navigate('/my-protocol');
    } catch (error) {
      console.error('Error saving protocol selection:', error);
      toast({
        title: t('nutritionResults.error'),
        description: t('nutritionResults.failedToSaveSelection'),
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
            {user ? t('nutritionResults.returnToToday') : t('nutritionResults.backToHome')}
          </Button>
        </div>

        {/* Overall Score Card */}
        <Card className="p-8 text-center border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
          <h1 className="text-4xl font-bold mb-4">{t('nutritionResults.pageTitle')}</h1>
          <div className="text-6xl font-bold text-primary mb-2">{scoreResult.score}</div>
          <div className="text-2xl font-semibold mb-4">{scoreResult.category}</div>
          <p className="text-muted-foreground max-w-2xl mx-auto">{scoreResult.description}</p>
        </Card>

        {/* Metabolic Age Display - only show if we have the data */}
        {assessment.metabolic_age && assessment.chronological_age && (
          <MetabolicAgeDisplay
            metabolicAge={assessment.metabolic_age}
            chronologicalAge={assessment.chronological_age}
            ageOffset={assessment.metabolic_age_offset || 0}
          />
        )}

        {/* Methodology Disclaimer */}
        <MethodologyDisclaimer assessmentType="nutrition" />

        {/* Pillar Breakdown Visual */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-background border-primary/20">
          <h2 className="text-xl font-bold mb-6">{t('nutritionResults.pillarBreakdownTitle')}</h2>
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
            <h2 className="text-2xl font-bold mb-2">{t('nutritionResults.detailedAnalysisTitle')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('nutritionResults.detailedAnalysisSubtitle')}
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
              {t('nutritionResults.eatingPersonalityTitle')} {eatingPersonality.title}
            </h2>
            <p className="text-muted-foreground mb-4">{eatingPersonality.description}</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-orange-600">{t('nutritionResults.commonChallenges')}</h3>
                <ul className="space-y-1">
                  {eatingPersonality.challenges.map((challenge, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-orange-300">
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-green-600">{t('nutritionResults.personalisedRecommendations')}</h3>
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

        {/* Inline Protocol Preview - For Logged In Users */}
        {user && nutritionProtocol && (
          <InlineProtocolPreview
            protocolData={{
              immediate: nutritionProtocol.immediate.map(item => ({
                ...item,
                category: 'immediate' as const
              })),
              foundation: nutritionProtocol.foundation.map(item => ({
                ...item,
                category: 'foundation' as const
              })),
              optimization: nutritionProtocol.optimization.map(item => ({
                ...item,
                category: 'optimization' as const
              }))
            }}
            sourceType="nutrition"
            sourceAssessmentId={searchParams.get("id") || ''}
            onProtocolSaved={() => refetchRecommendations()}
          />
        )}

        {/* Protocol Recommendations Section - For Guests and detailed view */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-2 border-primary/20 rounded-lg p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{t('nutritionResults.protocolTitle')}</h2>
                <p className="text-muted-foreground">
                  {t('nutritionResults.protocolSubtitle')}
                </p>
              </div>
              {user && (
                <Button 
                  onClick={handleReviewFullProtocol}
                  size="lg"
                  className="gap-2"
                >
                  <Target className="w-4 h-4" />
                  {t('nutritionResults.reviewFullProtocol')}
                </Button>
              )}
            </div>
          </div>

          {/* Immediate Actions */}
          {nutritionProtocol.immediate.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-red-500 rounded-full" />
                <h3 className="text-xl font-bold">{t('nutritionResults.startNow')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t('nutritionResults.criticalGaps')}</p>
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
                <h3 className="text-xl font-bold">{t('nutritionResults.foundation')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t('nutritionResults.coreLongevity')}</p>
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
                <h3 className="text-xl font-bold">{t('nutritionResults.optimisation')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t('nutritionResults.advancedSupport')}</p>
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
              <h2 className="text-2xl font-bold">{t('nutritionResults.guestCtaTitle')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('nutritionResults.guestCtaSubtitle')}
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto my-6">
                <div className="text-center">
                  <div className="font-semibold">{t('nutritionResults.saveProtocolToDashboard')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{t('nutritionResults.purchaseSupplements')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{t('nutritionResults.dailyNutritionTracking')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{t('nutritionResults.monthlyReassessments')}</div>
                </div>
              </div>
              <Button size="lg" onClick={() => {
                const sessionId = assessment?.session_id || localStorage.getItem('nutrition_guest_session');
                navigate(sessionId ? `/auth?session=${sessionId}&source=nutrition` : "/auth");
              }} className="text-lg px-8">
                {t('nutritionResults.createFreeAccount')}
              </Button>
              <p className="text-xs text-muted-foreground">{t('nutritionResults.freeTrial')}</p>
            </div>
          </Card>
        )}

        {/* Bottom Return Button */}
        <div className="flex justify-center gap-4">
          <Button onClick={() => window.history.length > 1 ? navigate(-1) : navigate(user ? "/today" : "/")} size="lg">
            {t('common.goBack')}
          </Button>
        </div>
      </div>
      
      {/* Protocol Selection Dialog */}
      <ProtocolSelectionDialog
        open={protocolDialogOpen}
        onOpenChange={setProtocolDialogOpen}
        protocol={nutritionProtocol}
        onSave={handleProtocolSelection}
        onCancel={() => setProtocolDialogOpen(false)}
      />
    </div>
  );
}
