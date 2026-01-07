import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HormoneCompassDomainCard } from '@/components/hormone-compass/HormoneCompassDomainCard';
import { HormoneAgeDisplay } from '@/components/hormone-compass/HormoneAgeDisplay';
import { AssessmentAIAnalysisCard } from '@/components/AssessmentAIAnalysisCard';
import { ProtocolSelectionDialog } from '@/components/ProtocolSelectionDialog';
import { CreateGoalFromAssessmentDialog } from '@/components/goals/CreateGoalFromAssessmentDialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/useAuth';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { useLocale } from '@/hooks/useLocale';
import { useProtocols } from '@/hooks/useProtocols';
import { Product, searchProductsBySymptoms, formatProductPrice, getProductPrice, getProducts } from '@/services/productService';
import { autoMatchProtocolItemToProduct } from '@/services/protocolProductLinkingService';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart, Calendar, ChevronDown, Sparkles, CheckCircle2, Target, AlertCircle, Home, Lightbulb } from 'lucide-react';
import { MethodologyDisclaimer } from '@/components/assessment/MethodologyDisclaimer';
import { toast } from 'sonner';
import { differenceInYears } from 'date-fns';
import { HORMONE_COMPASS_ASSESSMENT } from '@/data/hormoneCompassAssessment';
import { 
  calculateDomainScores, 
  generateHormoneProtocol, 
  generateSymptomPatternAnalysis,
  ProtocolItem
} from '@/utils/hormoneCompassProtocolGenerator';
import { useState, useEffect, useMemo } from 'react';
import { InlineProtocolPreview } from '@/components/assessment/InlineProtocolPreview';
import { useProtocolRecommendations } from '@/hooks/useProtocolRecommendations';

// Health level key mapping for translations
const HEALTH_LEVEL_KEYS: Record<string, {
  translationKey: string;
  targetSymptoms: string[];
  color: string;
}> = {
  'feeling-great': {
    translationKey: 'feelingGreat',
    targetSymptoms: ['maintenance', 'optimization', 'prevention'],
    color: 'text-green-600'
  },
  'doing-well': {
    translationKey: 'doingWell',
    targetSymptoms: ['sleep-quality', 'stress-management', 'energy-optimization'],
    color: 'text-blue-600'
  },
  'having-challenges': {
    translationKey: 'havingChallenges',
    targetSymptoms: ['cycle-regulation', 'mood-swings', 'sleep-disruption', 'energy-crashes'],
    color: 'text-yellow-600'
  },
  'really-struggling': {
    translationKey: 'reallyStruggling',
    targetSymptoms: ['severe-symptoms', 'hot-flashes', 'mood-disorders', 'cognitive-issues'],
    color: 'text-orange-600'
  },
  'need-support': {
    translationKey: 'needSupport',
    targetSymptoms: ['severe-disruption', 'multiple-symptoms', 'quality-of-life'],
    color: 'text-red-600'
  }
};

export default function HormoneCompassResults() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { profile } = useHealthProfile();
  const { isMetric, getCurrentLocale } = useLocale();
  const { addProtocolFromLibrary, protocols, fetchProtocolItems } = useProtocols();
  const [productMatches, setProductMatches] = useState<Record<string, Product | null>>({});
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
  const [currentRecommendationId, setCurrentRecommendationId] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [existingProtocolItems, setExistingProtocolItems] = useState<Set<string>>(new Set());
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  const assessmentId = searchParams.get('assessmentId');
  const stateData = location.state as { 
    stage?: string; 
    confidence?: number; 
    answers?: Record<string, number>;
    hormoneAge?: number;
    chronologicalAge?: number;
    ageOffset?: number;
    severityScore?: number;
  } || {};
  
  // Calculate user age from health profile
  const userAge = profile?.date_of_birth 
    ? differenceInYears(new Date(), new Date(profile.date_of_birth))
    : null;

  // Fetch assessment from database if we have an ID
  const { data: assessmentData, isLoading } = useQuery({
    queryKey: ['hormone-compass-assessment', assessmentId],
    queryFn: async () => {
      if (!assessmentId) return null;
      
      const { data, error } = await supabase
        .from('hormone_compass_stages')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!assessmentId
  });

  // Extract Hormone Age data from database or state
  const hormoneAge = (assessmentData as any)?.hormone_age ?? stateData.hormoneAge;
  const chronologicalAge = (assessmentData as any)?.chronological_age ?? stateData.chronologicalAge ?? userAge;
  const ageOffset = (assessmentData as any)?.age_offset ?? stateData.ageOffset;
  const hasHormoneAge = hormoneAge !== null && hormoneAge !== undefined && chronologicalAge !== null;

  const healthLevel = assessmentData?.stage || stateData.stage;
  const confidence = assessmentData?.confidence_score || stateData.confidence;

  // Fetch products based on health level symptoms - ALWAYS call this hook
  const { data: recommendedProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['health-level-products', healthLevel],
    queryFn: () => {
      if (!healthLevel) return [];
      const levelKeys = HEALTH_LEVEL_KEYS[healthLevel as keyof typeof HEALTH_LEVEL_KEYS];
      return searchProductsBySymptoms(levelKeys?.targetSymptoms || []);
    },
    enabled: !!healthLevel,
  });

  // Calculate domain scores and protocols - MUST be called before conditional returns
  const assessmentAnswers = (stateData as any)?.answers || (assessmentData?.hormone_indicators as any)?.domainScores || {};
  const domainScores = calculateDomainScores(assessmentAnswers);
  const protocol = generateHormoneProtocol(assessmentAnswers, domainScores);
  const symptomInsights = generateSymptomPatternAnalysis(assessmentAnswers, domainScores, userAge || undefined);
  
  // Fetch matching products for protocol items using name-based fuzzy matching
  useEffect(() => {
    const matchProducts = async () => {
      // Include ALL protocol items (immediate, foundation, optimization)
      const allItems = [
        ...protocol.immediate,
        ...protocol.foundation,
        ...protocol.optimization
      ];
      
      // Fetch all products once
      const products = await getProducts();
      
      const matches: Record<string, Product | null> = {};
      
      // Use name-based matching for each item
      for (const item of allItems) {
        try {
          const matchedProduct = autoMatchProtocolItemToProduct(
            item.name,
            'supplement', // treat all protocol items as supplements for matching
            products
          );
          matches[item.name] = matchedProduct;
        } catch (error) {
          console.error(`Error matching product for ${item.name}:`, error);
          matches[item.name] = null;
        }
      }
      
      setProductMatches(matches);
    };
    
    if (protocol) {
      matchProducts();
    }
  }, [protocol]);
  
  // Fetch existing protocol items to prevent duplicates
  useEffect(() => {
    const loadExistingItems = async () => {
      if (!user) return;
      
      const activeProtocol = protocols.find(p => p.is_active);
      if (activeProtocol) {
        const items = await fetchProtocolItems(activeProtocol.id);
        const itemNames = new Set(
          items.map(item => item.name.toLowerCase().trim())
        );
        setExistingProtocolItems(itemNames);
      }
    };
    
    loadExistingItems();
  }, [user, protocols, fetchProtocolItems]);
  
  // Helper function to localize protocol text
  const getLocalizedProtocolText = (text: string): string => {
    if (text === 'LOCALIZED:HYDRATION') {
      return isMetric 
        ? 'Drink 30-35ml per kg of body weight daily'
        : 'Drink half your body weight (lbs) in ounces of water daily';
    }
    return text;
  };
  
  // Parse protocol item description to extract frequency and timing
  const parseProtocolDetails = (description: string): {
    frequency: 'daily' | 'twice_daily' | 'three_times_daily';
    timeOfDay: string[];
  } => {
    const desc = description.toLowerCase();
    
    // Detect frequency
    let frequency: 'daily' | 'twice_daily' | 'three_times_daily' = 'daily';
    if (desc.includes('2x') || desc.includes('twice') || desc.includes('2-3x')) {
      frequency = 'twice_daily';
    } else if (desc.includes('3x') || desc.includes('three times')) {
      frequency = 'three_times_daily';
    }
    
    // Detect timing
    const timeOfDay: string[] = [];
    if (desc.includes('morning') || desc.includes('breakfast')) {
      timeOfDay.push('morning');
    }
    if (desc.includes('evening') || desc.includes('before bed') || desc.includes('bedtime')) {
      timeOfDay.push('evening');
    }
    if (desc.includes('with meals') && frequency === 'twice_daily') {
      timeOfDay.push('morning', 'evening');
    }
    
    // Fallback if no timing detected
    if (timeOfDay.length === 0) {
      timeOfDay.push('morning');
    }
    
    return { frequency, timeOfDay };
  };
  
  const handleInlineAddToProtocol = async (
    item: ProtocolItem,
    matchedProduct: Product | null
  ) => {
    if (!user) {
      toast.error(t('hormoneResults.pleaseSignIn', 'Please sign in to add items to your protocol'));
      navigate('/auth');
      return;
    }

    // Check if already exists in database
    const normalizedName = item.name.toLowerCase().trim();
    if (existingProtocolItems.has(normalizedName)) {
      toast.info(t('hormoneResults.alreadyInProtocolToast', { name: item.name, defaultValue: `${item.name} is already in your protocol` }));
      return;
    }

    try {
      // Parse description for frequency and timing
      const { frequency, timeOfDay } = parseProtocolDetails(item.description);
      
      // Determine item type
      const itemType: 'supplement' | 'habit' | 'therapy' = 
        matchedProduct ? 'supplement' : 'habit';

      await addProtocolFromLibrary('Hormone Compass', [{
        item_type: itemType,
        name: item.name,
        description: item.description,
        dosage: matchedProduct?.usage_instructions || item.description.split('\n')[0],
        frequency: frequency,
        time_of_day: timeOfDay,
        notes: `Added from Hormone Compass - ${item.relevance || ''}`,
      }]);

      // Track as added and update existing items set
      setAddedItems(prev => new Set(prev).add(item.name));
      setExistingProtocolItems(prev => new Set(prev).add(normalizedName));
      
      toast.success(t('hormoneResults.addedToProtocolToast', { name: item.name, defaultValue: `${item.name} added to your protocol` }));
    } catch (error) {
      console.error('Error adding to protocol:', error);
      toast.error(t('hormoneResults.failedToAdd', 'Failed to add item to protocol'));
    }
  };
  
  // Helper function to render protocol item with optional cart button
  const renderProtocolItem = (item: ProtocolItem, index: number, backgroundColor: string) => {
    const matchedProduct = productMatches[item.name];
    const locale = getCurrentLocale();
    
    return (
      <div key={index} className={`${backgroundColor} rounded-lg p-4`}>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
            <p className="text-sm text-muted-foreground mb-2">
              {getLocalizedProtocolText(item.description)}
            </p>
            <p className="text-xs italic text-muted-foreground">{item.relevance}</p>
            
            {/* Product match with Add to Cart button */}
            {matchedProduct && (
              <div className="mt-3 p-3 bg-background/80 rounded border border-border/50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{matchedProduct.name}</p>
                    <p className="text-xs text-muted-foreground">{matchedProduct.brand}</p>
                    <p className="text-sm font-bold text-primary mt-1">
                      {formatProductPrice(matchedProduct, locale.currency)}
                    </p>
                  </div>
                </div>
                
                {/* Buttons row */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const price = getProductPrice(matchedProduct, locale.currency) || 0;
                      addToCart({
                        id: matchedProduct.id,
                        name: matchedProduct.name,
                        price: price,
                        image: matchedProduct.image_url || '/placeholder.svg',
                        brand: matchedProduct.brand || 'Unknown',
                        dosage: matchedProduct.usage_instructions || 'As directed',
                      });
                      toast.success(`${matchedProduct.name} added to cart`);
                    }}
                    className="flex-1"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    {t('hormoneResults.addToCart')}
                  </Button>
                  
                  {user && (
                    <Button
                      size="sm"
                      variant={
                        existingProtocolItems.has(item.name.toLowerCase().trim()) || addedItems.has(item.name)
                          ? "secondary"
                          : "default"
                      }
                      disabled={
                        existingProtocolItems.has(item.name.toLowerCase().trim()) || addedItems.has(item.name)
                      }
                      onClick={() => handleInlineAddToProtocol(item, matchedProduct)}
                      className="flex-1"
                    >
                      {existingProtocolItems.has(item.name.toLowerCase().trim()) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          {t('hormoneResults.inProtocol')}
                        </>
                      ) : addedItems.has(item.name) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          {t('hormoneResults.addedToProtocol')}
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-1" />
                          {t('hormoneResults.addToProtocol')}
                        </>
                      )}
                    </Button>
                  )}
                  
                  {!user && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate('/auth')}
                      className="flex-1"
                    >
                      {t('hormoneResults.signInToAdd')}
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* No product match - show compact Add to Protocol button */}
            {!matchedProduct && user && (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant={
                    existingProtocolItems.has(item.name.toLowerCase().trim()) || addedItems.has(item.name)
                      ? "secondary"
                      : "default"
                  }
                  disabled={
                    existingProtocolItems.has(item.name.toLowerCase().trim()) || addedItems.has(item.name)
                  }
                  onClick={() => handleInlineAddToProtocol(item, matchedProduct)}
                >
                  {existingProtocolItems.has(item.name.toLowerCase().trim()) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      {t('hormoneResults.alreadyInProtocol')}
                    </>
                  ) : addedItems.has(item.name) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      {t('hormoneResults.addedToProtocol')}
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-1" />
                      {t('hormoneResults.addToMyProtocol')}
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {/* Guest CTA for no product match */}
            {!matchedProduct && !user && (
              <button
                onClick={() => navigate('/auth')}
                className="mt-2 text-xs text-primary hover:underline"
              >
                {t('hormoneResults.signInToAddProtocol', 'Sign in to add to protocol →')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Helper function to generate preview insights for collapsed domains
  const getDomainPreviewInsight = (domainName: string, score: number): string => {
    const domainKeyMap: Record<string, string> = {
      'Cycle & Period Patterns': 'cyclePeriodPatterns',
      'Sleep & Thermoregulation': 'sleepThermoregulation',
      'Mood & Focus': 'moodFocus',
      'Energy & Weight': 'energyWeight',
      'Libido & Sexual Health': 'libidoSexualHealth',
      'Skin, Hair & Nails': 'skinHairNails'
    };

    const scoreBand = score >= 4.5 ? 'thriving' :
                      score >= 3.5 ? 'good' :
                      score >= 2.5 ? 'challenges' :
                      score >= 1.5 ? 'struggling' : 'critical';

    const domainKey = domainKeyMap[domainName];
    if (domainKey) {
      return t(`hormoneResults.domainInsights.${domainKey}.${scoreBand}`);
    }
    return t('hormoneResults.domainInsights.default');
  };
  
  // Find lowest scoring domain for auto-expand - MUST be called before conditional returns
  const lowestDomain = Object.entries(domainScores)
    .sort(([, a], [, b]) => a - b)[0];
  
  const [openDomains, setOpenDomains] = useState<string[]>(
    lowestDomain ? [lowestDomain[0]] : []
  );

  // Now check conditions AFTER all hooks are called
  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <Card className="p-8">
          <p>{t('hormoneResults.loading')}</p>
        </Card>
      </div>
    );
  }

  if (!healthLevel) {
    navigate('/hormone-compass/assessment');
    return null;
  }

  const levelKeys = HEALTH_LEVEL_KEYS[healthLevel as keyof typeof HEALTH_LEVEL_KEYS];
  
  // Guard against invalid health level
  if (!levelKeys) {
    console.error('Invalid health level:', healthLevel);
    navigate('/hormone-compass/assessment');
    return null;
  }

  // Get translated level info
  const levelInfo = {
    title: t(`hormoneResults.healthLevels.${levelKeys.translationKey}.title`),
    description: t(`hormoneResults.healthLevels.${levelKeys.translationKey}.description`),
    spectrumContext: t(`hormoneResults.healthLevels.${levelKeys.translationKey}.spectrumContext`),
    color: levelKeys.color
  };
  
  // Generate age-based contextual insight
  const getLifeStageContext = () => {
    if (!userAge) return null;
    
    const hasChallenges = healthLevel === 'having-challenges' || healthLevel === 'really-struggling';
    
    if (userAge >= 25 && userAge <= 35) {
      return hasChallenges 
        ? t('hormoneResults.lifeStageContexts.age25to35Challenges')
        : t('hormoneResults.lifeStageContexts.age25to35Normal');
    } else if (userAge >= 36 && userAge <= 44) {
      return hasChallenges
        ? t('hormoneResults.lifeStageContexts.age36to44Challenges')
        : t('hormoneResults.lifeStageContexts.age36to44Normal');
    } else if (userAge >= 45 && userAge <= 55) {
      return hasChallenges
        ? t('hormoneResults.lifeStageContexts.age45to55Challenges')
        : t('hormoneResults.lifeStageContexts.age45to55Normal');
    } else if (userAge >= 56) {
      return hasChallenges
        ? t('hormoneResults.lifeStageContexts.age56PlusChallenges')
        : t('hormoneResults.lifeStageContexts.age56PlusNormal');
    }
    return null;
  };
  
  const lifeStageContext = getLifeStageContext();

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price_gbp || 0,
      image: product.image_url || '/placeholder.svg',
      brand: product.brand || 'Unknown',
      dosage: product.usage_instructions || 'As directed',
    });
    toast.success(t('hormoneResults.addedToCartToast', { name: product.name, defaultValue: `${product.name} added to cart` }));
  };

  const handleAddToPlan = async () => {
    if (!user) {
      toast.error(t('hormoneResults.pleaseSignInSave', 'Please sign in to add to your plan'));
      navigate('/auth');
      return;
    }

    try {
      toast.success(t('hormoneResults.hormoneProfileSaved', 'Hormone health profile saved!'));
      navigate('/my-protocol');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('hormoneResults.failedToUpdateProfile', 'Failed to update profile'));
    }
  };

  const handleAddToProtocol = async () => {
    if (!user) {
      toast.error(t('hormoneResults.pleaseSignInSave', 'Please sign in to save your protocol'));
      navigate('/auth');
      return;
    }

    if (!assessmentId) {
      toast.error(t('hormoneResults.assessmentIdNotFound', 'Assessment ID not found'));
      return;
    }

    try {
      // Save as recommendation first
      const { data: recommendation, error } = await supabase
        .from('protocol_recommendations')
        .insert({
          user_id: user.id,
          source_assessment_id: assessmentId,
          source_type: 'hormone_compass',
          protocol_data: protocol as any,
          status: 'pending'
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error saving recommendation:', error);
        toast.error(t('hormoneResults.failedToSaveRecommendation', 'Failed to save recommendation'));
        return;
      }

      // Store recommendation ID and open dialog
      setCurrentRecommendationId(recommendation.id);
      setProtocolDialogOpen(true);
    } catch (error) {
      console.error('Error saving protocol:', error);
      toast.error(t('hormoneResults.failedToSaveProtocol', 'Failed to save protocol'));
    }
  };

  const handleProtocolSelection = async (selectedItems: ProtocolItem[], cartItems: Product[]) => {
    if (!user || !currentRecommendationId) return;

    try {
      // 1. Create protocol in protocols table
      const { data: newProtocol, error: protocolError } = await supabase
        .from('protocols')
        .insert({
          user_id: user.id,
          name: `Hormone Health Protocol - ${new Date().toLocaleDateString()}`,
          description: `Generated from Hormone Compass assessment`,
          source_recommendation_id: currentRecommendationId,
          source_type: 'hormone_compass',
          is_active: true,
          start_date: new Date().toISOString()
        })
        .select()
        .single();

      if (protocolError) throw protocolError;

      // 2. Map category to item_type
      const mapCategoryToItemType = (category: string): 'habit' | 'supplement' | 'diet' | 'exercise' | 'therapy' => {
        const mapping: Record<string, 'habit' | 'supplement' | 'diet' | 'exercise' | 'therapy'> = {
          'immediate': 'habit',
          'foundation': 'supplement',
          'optimization': 'supplement'
        };
        return mapping[category] || 'habit';
      };

      // 3. Create protocol_items for selected items
      const itemsToInsert = selectedItems.map(item => ({
        protocol_id: newProtocol.id,
        name: item.name,
        description: item.description,
        item_type: mapCategoryToItemType(item.category),
        frequency: 'daily' as const,
        is_active: true,
        product_id: null // Will be linked if product match exists
      }));

      const { error: itemsError } = await supabase
        .from('protocol_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 4. Update recommendation status
      const allItemsSelected = selectedItems.length === (protocol.immediate.length + protocol.foundation.length + protocol.optimization.length);
      
      await supabase
        .from('protocol_recommendations')
        .update({ 
          status: allItemsSelected ? 'accepted' : 'partially_accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', currentRecommendationId);

      // Success handled by dialog component
    } catch (error) {
      console.error('Error saving protocol selection:', error);
      throw error;
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Top Navigation - Return Home Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(user ? '/today' : '/')}
          className="gap-2"
        >
          <Home className="w-4 h-4" />
          {user ? t('hormoneResults.returnToToday') : t('hormoneResults.backToHome')}
        </Button>
      </div>

      {/* Results Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('hormoneResults.pageTitle')}</h1>
        <p className="text-muted-foreground">
          {t('hormoneResults.pageSubtitle')}
        </p>
      </div>

      {/* Hormone Age Display - Primary Result */}
      {hasHormoneAge && (
        <HormoneAgeDisplay
          hormoneAge={hormoneAge}
          chronologicalAge={chronologicalAge}
          ageOffset={ageOffset || 0}
        />
      )}

      {/* Methodology Disclaimer */}
      <MethodologyDisclaimer assessmentType="hormone" />

      {/* Overall Health Level Summary */}
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-2 border-primary/30 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <h2 className={`text-3xl font-bold ${levelInfo.color}`}>
                {t('hormoneResults.yourHealthLevel', { level: levelInfo.title })}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-3 bg-muted/30 rounded-lg p-3">
              {levelInfo.spectrumContext}
            </p>
          </div>
          
          {lifeStageContext && (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/5 border-2 border-primary/20 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  <span className="font-semibold">{t('hormoneResults.lifeStageTitle', { age: userAge })} </span>
                  {lifeStageContext}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Symptom Pattern Analysis */}
      {symptomInsights.length > 0 && (
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-background">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t('hormoneResults.symptomAnalysisTitle')}
          </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {symptomInsights.map((insight, index) => (
              <div key={index} className="flex gap-3 bg-muted/30 rounded-lg p-5">
                <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-base leading-relaxed">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Domain-by-Domain Breakdown */}
      <Card className="border-2 border-primary/30 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-background">
          <CardTitle>{t('hormoneResults.domainAnalysisTitle')}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {levelInfo.description}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('hormoneResults.domainAnalysisSubtitle')}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {HORMONE_COMPASS_ASSESSMENT.domains.map((domain) => {
            const score = domainScores[domain.id] || 0;
            const isOpen = openDomains.includes(domain.id);
            
            return (
              <Collapsible
                key={domain.id}
                open={isOpen}
                onOpenChange={(open) => {
                  setOpenDomains(prev => 
                    open 
                      ? [...prev, domain.id]
                      : prev.filter(id => id !== domain.id)
                  );
                }}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{domain.icon}</span>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{domain.name}</h3>
                          <span className="text-xs text-muted-foreground">
                            {score.toFixed(1)}/5.0
                          </span>
                        </div>
                        {!isOpen && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {getDomainPreviewInsight(domain.name, score)}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-3">
                    <HormoneCompassDomainCard
                      domainName={domain.name}
                      domainIcon={domain.icon}
                      domainScore={score}
                      userAge={userAge || undefined}
                      hideHeader={true}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </CardContent>
      </Card>

      {/* Clinical Disclaimer */}
      <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-amber-900 dark:text-amber-100">{t('hormoneResults.disclaimerTitle')}</p>
              <p className="text-sm text-amber-800 dark:text-amber-200/90">
                {t('hormoneResults.disclaimerParagraph1')}
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200/90">
                {t('hormoneResults.disclaimerParagraph2')}
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200/90">
                {t('hormoneResults.disclaimerParagraph3')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inline Protocol Preview - For Logged In Users */}
      {user && protocol && (
        <InlineProtocolPreview
          protocolData={{
            immediate: protocol.immediate.map(item => ({
              ...item,
              category: 'immediate' as const
            })),
            foundation: protocol.foundation.map(item => ({
              ...item,
              category: 'foundation' as const
            })),
            optimization: protocol.optimization.map(item => ({
              ...item,
              category: 'optimization' as const
            }))
          }}
          sourceType="hormone_compass"
          sourceAssessmentId={assessmentId || 'hormone-compass'}
        />
      )}

      {/* Personalized Protocol Preview - Detailed View */}
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-2 border-primary/30 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-background">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {t('hormoneResults.protocolTitle')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('hormoneResults.protocolSubtitle')}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xs text-muted-foreground bg-primary/5 p-3 rounded border border-primary/10">
            <strong>Note:</strong> This protocol is generated based on your assessment responses and represents 
            general wellness recommendations. It is not personalized medical advice. Consult your healthcare 
            provider before starting any new supplement regimen, especially if you have existing health conditions 
            or take medications.
          </p>
          {/* Immediate Actions */}
          {protocol.immediate.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="destructive">{t('hormoneResults.doToday')}</Badge>
                <h3 className="font-semibold">{t('hormoneResults.immediateActions')}</h3>
              </div>
              <div className="space-y-2">
                {protocol.immediate.map((item, index) => 
                  renderProtocolItem(item, index, 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50')
                )}
              </div>
            </div>
          )}

          {/* Foundation Protocol */}
          {protocol.foundation.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{t('hormoneResults.thisWeek')}</Badge>
                <h3 className="font-semibold">{t('hormoneResults.foundationProtocol')}</h3>
              </div>
              <div className="space-y-2">
                {protocol.foundation.map((item, index) => 
                  renderProtocolItem(item, index, 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50')
                )}
              </div>
            </div>
          )}

          {/* Optimization Layer */}
          {protocol.optimization.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{t('hormoneResults.next30Days')}</Badge>
                <h3 className="font-semibold">{t('hormoneResults.optimisationLayer')}</h3>
              </div>
              <div className="space-y-2">
                {protocol.optimization.map((item, index) => 
                  renderProtocolItem(item, index, 'bg-muted/30 border')
                )}
              </div>
            </div>
          )}

          {user ? (
            <div className="space-y-3">
              <Button onClick={handleAddToProtocol} className="w-full" size="lg">
                <Target className="w-5 h-5 mr-2" />
                {t('hormoneResults.addAllToProtocol')}
              </Button>
              <Button 
                onClick={() => setGoalDialogOpen(true)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Target className="w-5 h-5 mr-2" />
                {t('hormoneResults.createGoal')}
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate('/auth')} className="w-full" size="lg">
              {t('hormoneResults.createFreeAccountSave')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Guest Registration CTA */}
      {!user && (
        <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-primary/30">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Sparkles className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-xl font-bold">{t('hormoneResults.guestCtaTitle')}</h3>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('hormoneResults.saveProtocol')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('hormoneResults.dailyTracking')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('hormoneResults.monthlyReassessments')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('hormoneResults.aiInsights')}</span>
                </div>
              </div>
              <Button onClick={() => navigate('/auth')} size="lg" className="w-full">
                {t('hormoneResults.createFreeAccount')}
              </Button>
              <p className="text-xs text-muted-foreground">
                {t('hormoneResults.freeTrial')}
              </p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-2">
                {t('hormoneResults.guestDisclaimer')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Card */}
      {user && (
        <AssessmentAIAnalysisCard
          assessmentType="hormone-compass"
          assessmentId={assessmentId || 'hormone-compass'}
          score={confidence || 75}
          scoreCategory={healthLevel}
          answers={{}}
          metadata={{ 
            healthLevel,
            userAge,
            answers: assessmentAnswers
          }}
          autoGenerate={false}
          renderButton={(onClick, isLoading) => (
            <Button onClick={onClick} disabled={isLoading} variant="outline" size="sm" className="w-full">
              {isLoading ? t('hormoneResults.generating') : t('hormoneResults.aiDeepDive')}
            </Button>
          )}
        />
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>{t('hormoneResults.whatsNext')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-between"
            onClick={() => navigate('/hormone-compass/tracker')}
          >
            <span>{t('hormoneResults.startTracking')}</span>
            <Calendar className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-between"
            onClick={() => navigate('/today')}
          >
            <span>{t('hormoneResults.viewTodayPlan')}</span>
            <Target className="w-4 h-4" />
          </Button>
          <Button 
            variant="default"
            className="w-full gap-2"
            onClick={() => navigate(user ? '/today' : '/')}
          >
            <Home className="w-4 h-4" />
            {user ? t('hormoneResults.returnToToday') : t('hormoneResults.backToHome')}
          </Button>
        </CardContent>
      </Card>

      {/* Protocol Selection Dialog */}
      <ProtocolSelectionDialog
        open={protocolDialogOpen}
        onOpenChange={setProtocolDialogOpen}
        protocol={protocol}
        onSave={handleProtocolSelection}
        onCancel={() => {
          setProtocolDialogOpen(false);
          toast.info(t('hormoneResults.reviewProtocolAnytime'));
        }}
      />
      
      {/* Create Goal from Assessment Dialog */}
      <CreateGoalFromAssessmentDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        assessmentType="hormone_compass"
        assessmentData={{
          healthLevel: levelInfo.title,
          lowestDomains: Object.entries(domainScores)
            .map(([name, score]) => ({ name, score }))
            .sort((a, b) => a.score - b.score)
            .slice(0, 2),
        }}
      />
    </div>
  );
}
