import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, ShoppingCart, CheckCircle2, AlertCircle, Pencil, Trash2, BookOpen, Clock, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import beautyPillar from "@/assets/beauty-pillar.png";
import brainPillar from "@/assets/brain-pillar.png";
import bodyPillar from "@/assets/body-pillar.png";
import balancePillar from "@/assets/balance-pillar.png";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { matchProductsToAssessment, calculateBundlePrice } from "@/utils/productMatcher";
import { useAdherence } from "@/hooks/useAdherence";
import { ProtocolItemCard } from "@/components/ProtocolItemCard";
import MealPlanProtocolCard from "@/components/MealPlanProtocolCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtocolBuilderDialog } from "@/components/ProtocolBuilderDialog";
import { AdherenceCalendar } from "@/components/AdherenceCalendar";
import {
  useAssessments,
  useProtocols,
  useMultipleProtocolItems,
  useProtocolItemSourceIds,
  useDeleteProtocol,
  useUpdateProtocol
} from "@/queries";
import { ProtocolSkeleton } from "@/components/skeletons/ProtocolSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Protocol } from "@/types/protocols";
import EvidenceDrawer from "@/components/EvidenceDrawer";
import { ProtocolBundleCard } from "@/components/ProtocolBundleCard";
import { useProtocolBundle } from "@/hooks/useProtocolBundle";
import { useCart } from "@/hooks/useCart";
import { createProtocolBundle } from "@/services/protocolBundleService";
import { useProtocolRecommendations } from "@/hooks/useProtocolRecommendations";
import { ProtocolSelectionDialog } from "@/components/ProtocolSelectionDialog";
import { useState, useMemo } from "react";
import { fetchExistingItemsMap, filterDuplicateItems, normalizeItemName } from "@/utils/protocolDuplicateCheck";
import { upsertProtocolItemSources, upsertProtocolItemSourcesFromRecommendation } from "@/services/protocolItemSources";
import {
  consolidateProtocolRecommendations,
  getProtocolItemKey,
  ProtocolRecommendationRecord,
} from "@/lib/longitudinal/protocolConsolidation";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { navigateBack } from "@/utils/navigationUtils";

interface AssessmentData {
  id: string;
  symptom_type: string;
  overall_score: number;
  completed_at: string;
}

const MyProtocol = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { adherence, toggleAdherence } = useAdherence();
  const { addToCart } = useCart();
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
  const [consolidatedDialogOpen, setConsolidatedDialogOpen] = useState(false);
  
  // URL-based source filtering
  const sourceFilter = searchParams.get('source');
  const assessmentSourceType = searchParams.get('assessment_type');
  const assessmentSourceId = searchParams.get('assessment_id');
  const hasAssessmentFilter = !!assessmentSourceType && !!assessmentSourceId;
  
  // Recommended tab filters and sorting
  const [recommendedSourceFilter, setRecommendedSourceFilter] = useState<string>('all');
  const [recommendedSortBy, setRecommendedSortBy] = useState<string>('date-desc');
  
  // History tab filters and sorting
  const [historySourceFilter, setHistorySourceFilter] = useState<string>('all');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('all');
  const [historySortBy, setHistorySortBy] = useState<string>('date-desc');

  // Use React Query hooks
  const { data: protocols = [], isLoading: loadingProtocols } = useProtocols(user?.id);
  const deleteProtocolMutation = useDeleteProtocol();
  const updateProtocolMutation = useUpdateProtocol();
  const { data: assessments = [], isLoading: loadingAssessments } = useAssessments(user?.id);
  
  // Fetch protocol recommendations
  const { 
    recommendations, 
    isLoading: loadingRecommendations,
    dismissRecommendation,
    pendingCount 
  } = useProtocolRecommendations({ status: 'pending' });

  const consolidatedProtocol = useMemo(
    () =>
      consolidateProtocolRecommendations(
        (recommendations || []) as ProtocolRecommendationRecord[]
      ),
    [recommendations]
  );

  const consolidatedSourcesByKey = useMemo(() => {
    const sourcesMap = new Map<string, typeof consolidatedProtocol.immediate[number]["sources"]>();
    const allItems = [
      ...consolidatedProtocol.immediate,
      ...consolidatedProtocol.foundation,
      ...consolidatedProtocol.optimization,
    ];
    allItems.forEach((item) => {
      const key = getProtocolItemKey(item.name, item.item_type);
      sourcesMap.set(key, item.sources);
    });
    return sourcesMap;
  }, [consolidatedProtocol]);
  
  // Filter and sort recommended protocols
  const filteredRecommendations = useMemo(() => {
    if (!recommendations) return [];
    
    let filtered = [...recommendations];
    
    // Apply source type filter
    if (recommendedSourceFilter !== 'all') {
      filtered = filtered.filter(rec => rec.source_type === recommendedSourceFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (recommendedSortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'priority':
          // Priority: immediate items count as highest priority
          {
            const aPriority = a.protocol_data.immediate?.length || 0;
            const bPriority = b.protocol_data.immediate?.length || 0;
            return bPriority - aPriority;
          }
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [recommendations, recommendedSourceFilter, recommendedSortBy]);
  
  // Fetch historical recommendations (dismissed and partially accepted)
  const {
    recommendations: historicalRecommendations,
    isLoading: loadingHistorical
  } = useProtocolRecommendations({ status: ['dismissed', 'partially_accepted'] });
  
  // Filter and sort historical recommendations
  const filteredHistoricalRecommendations = useMemo(() => {
    if (!historicalRecommendations) return [];
    
    let filtered = [...historicalRecommendations];
    
    // Apply source type filter
    if (historySourceFilter !== 'all') {
      filtered = filtered.filter(rec => rec.source_type === historySourceFilter);
    }
    
    // Apply status filter
    if (historyStatusFilter !== 'all') {
      filtered = filtered.filter(rec => rec.status === historyStatusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (historySortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [historicalRecommendations, historySourceFilter, historyStatusFilter, historySortBy]);
  
  // Filter active protocols by source if URL param is present
  const allActiveProtocols = protocols.filter(p => p.is_active);
  const activeProtocols = sourceFilter 
    ? allActiveProtocols.filter(p => p.source_type === sourceFilter)
    : allActiveProtocols;
  const activeProtocol = activeProtocols[0]; // Get first active protocol
  
  // Get protocol items for ALL active protocols
  const activeProtocolIds = activeProtocols.map(p => p.id);
  
  // Fetch items for all active protocols in a single query
  const { data: allProtocolItems = [], isLoading: loadingItems } = useMultipleProtocolItems(activeProtocolIds);
  const { data: scopedItemIds = [], isLoading: loadingSourceItems } = useProtocolItemSourceIds(
    assessmentSourceType,
    assessmentSourceId
  );

  const filteredProtocolItems = hasAssessmentFilter
    ? allProtocolItems.filter((item) => scopedItemIds.includes(item.id))
    : allProtocolItems;
  const displayProtocolItems = hasAssessmentFilter ? filteredProtocolItems : allProtocolItems;

  // Fetch bundle calculation for active protocol
  const { data: bundleCalculation, isLoading: bundleLoading } = useProtocolBundle(activeProtocol?.id);

  // Get unique assessments by symptom type (most recent for each)
  const uniqueAssessments = assessments?.reduce((acc: AssessmentData[], current) => {
    if (!acc.find(item => item.symptom_type === current.symptom_type)) {
      acc.push(current);
    }
    return acc;
  }, []) || [];

  const isLoading = loadingProtocols || loadingAssessments || loadingItems || (hasAssessmentFilter && loadingSourceItems);

  // Get all product recommendations across all assessments
  const allRecommendations = uniqueAssessments.flatMap(assessment => {
    const products = matchProductsToAssessment(assessment.symptom_type, assessment.overall_score);
    return products.map(product => ({
      ...product,
      symptomType: assessment.symptom_type,
      assessmentId: assessment.id
    }));
  });

  // Remove duplicates based on product id
  const uniqueRecommendations = Array.from(
    new Map(allRecommendations.map(item => [item.id, item])).values()
  );

  const bundlePricing = calculateBundlePrice(uniqueRecommendations);
  const protocolCompletion = uniqueAssessments.length > 0 
    ? Math.round((uniqueRecommendations.length / (uniqueAssessments.length * 3)) * 100)
    : 0;

  const handleDeleteProtocol = async (id: string) => {
    try {
      await deleteProtocolMutation.mutateAsync(id);
      toast({
        title: "Protocol Deleted",
        description: "Your protocol has been removed."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete protocol."
      });
    }
  };

  const handleUpdateProtocol = async (id: string, updates: Partial<Protocol>) => {
    try {
      await updateProtocolMutation.mutateAsync({ id, updates });
      toast({
        title: "Protocol Updated",
        description: "Your changes have been saved."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update protocol."
      });
    }
  };

  // Map item types to brand pillars
  const getPillarForItemType = (itemType: string) => {
    const pillarMap: Record<string, { name: string; logo: string; color: string }> = {
      'supplement': { name: 'Body', logo: bodyPillar, color: 'text-orange-500' },
      'diet': { name: 'Beauty', logo: beautyPillar, color: 'text-pink-500' },
      'exercise': { name: 'Body', logo: bodyPillar, color: 'text-orange-500' },
      'therapy': { name: 'Balance', logo: balancePillar, color: 'text-red-500' },
      'habit': { name: 'Brain', logo: brainPillar, color: 'text-purple-500' }
    };
    return pillarMap[itemType] || { name: 'Body', logo: bodyPillar, color: 'text-orange-500' };
  };

  const getSymptomName = (symptomId: string) => {
    const nameMap: Record<string, string> = {
      "hot-flashes": "Hot Flushes",
      "sleep": "Sleep",
      "joint-pain": "Joint Pain",
      "brain-fog": "Brain Fog",
      "gut": "Gut Health",
      "anxiety": "Anxiety",
      "balance-hormonal-balance-evaluation": "Hormonal Balance",
      "brain-brain-fog-assessment": "Brain Fog",
      "body-energy-&-fatigue-assessment": "Energy & Fatigue"
    };
    return nameMap[symptomId] || symptomId;
  };

  const handleAddToCart = (productId: string) => {
    const product = uniqueRecommendations.find(p => p.id === productId);
    if (product) {
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`
      });
    }
  };

  const handleAddAllToCart = () => {
    toast({
      title: "Protocol Added!",
      description: `Complete protocol with ${uniqueRecommendations.length} supplements added to cart.`
    });
  };

  // Handle adding complete protocol bundle to cart
  const handleAddBundleToCart = async () => {
    if (!bundleCalculation || !activeProtocol || !user) return;

    try {
      // Create bundle record in database
      await createProtocolBundle(
        user.id,
        activeProtocol.id,
        activeProtocol.name,
        bundleCalculation
      );

      // Add each item to cart
      bundleCalculation.items.forEach((item) => {
        addToCart({
          id: item.product_id || item.protocol_item_id,
          name: item.name,
          price: item.price,
          image: "/placeholder.svg",
          brand: "Protocol",
          dosage: item.dosage || "",
          quantity: 1,
        });
      });

      toast({
        title: "Bundle added to cart!",
        description: `Added ${bundleCalculation.totalItems} items from your ${activeProtocol.name} protocol. ${bundleCalculation.eligibleForDiscount ? `Saved $${bundleCalculation.discountAmount.toFixed(2)}!` : ''}`,
      });
    } catch (error) {
      console.error("Error adding bundle to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add bundle to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle protocol selection from recommendation
  const handleProtocolSelection = async (selectedItems: any[], cartItems: any[]) => {
    if (!user || !selectedRecommendation) return;

    try {
      // 1. Create protocol in protocols table
      const { data: newProtocol, error: protocolError } = await supabase
        .from('protocols')
        .insert({
          user_id: user.id,
          name: `Protocol - ${new Date().toLocaleDateString()}`,
          description: `Generated from ${selectedRecommendation.source_type} assessment`,
          source_recommendation_id: selectedRecommendation.id,
          source_type: selectedRecommendation.source_type,
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

      const itemsWithType = selectedItems.map(item => ({
        ...item,
        item_type: mapCategoryToItemType(item.category),
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
            recommendationId: selectedRecommendation.id,
            protocolItemIds: duplicateIds,
          });
        }

        toast({
          title: t('protocol.allDuplicates'),
          description: t('protocol.allDuplicatesDesc'),
        });
        setProtocolDialogOpen(false);
        setSelectedRecommendation(null);
        return;
      }

      // 3. Create protocol_items for selected items
      const itemsToInsert = uniqueItems.map(item => ({
        protocol_id: newProtocol.id,
        name: item.name,
        description: item.description,
        item_type: item.item_type,
        frequency: 'daily' as const,
        is_active: true,
        product_id: null
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('protocol_items')
        .insert(itemsToInsert)
        .select('id');

      if (itemsError) throw itemsError;

      const insertedIds = insertedItems?.map((item) => item.id) || [];
      await upsertProtocolItemSourcesFromRecommendation({
        userId: user.id,
        recommendationId: selectedRecommendation.id,
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
            recommendationId: selectedRecommendation.id,
            protocolItemIds: duplicateIds,
          });
        }
      }

      // 4. Update recommendation status
      const allItemsSelected = selectedItems.length === (
        (selectedRecommendation.protocol_data.immediate?.length || 0) +
        (selectedRecommendation.protocol_data.foundation?.length || 0) +
        (selectedRecommendation.protocol_data.optimization?.length || 0)
      );
      
      await supabase
        .from('protocol_recommendations')
        .update({ 
          status: allItemsSelected ? 'accepted' : 'partially_accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', selectedRecommendation.id);

      // Success - dialog handles toast and navigation
    } catch (error) {
      console.error('Error saving protocol selection:', error);
      throw error;
    }
  };

  const handleConsolidatedSelection = async (selectedItems: any[], cartItems: any[]) => {
    if (!user) return;

    try {
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
            name: `Consolidated Protocol - ${new Date().toLocaleDateString()}`,
            description: 'Consolidated from multiple assessments',
            source_type: 'custom',
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

      const itemsWithType = selectedItems.map(item => ({
        ...item,
        item_type: item.item_type || 'supplement'
      }));

      const existingItemsMap = await fetchExistingItemsMap(user.id);
      const { uniqueItems, duplicateItems } = await filterDuplicateItems(user.id, itemsWithType);

      const applySources = async (itemId: string, itemKey: string) => {
        const sources = consolidatedSourcesByKey.get(itemKey) || [];
        if (sources.length === 0) return;
        await Promise.all(
          sources.map((source) =>
            upsertProtocolItemSources({
              userId: user.id,
              protocolItemIds: [itemId],
              source,
            })
          )
        );
      };

      if (uniqueItems.length === 0) {
        const duplicateIds = duplicateItems
          .map((item) => {
            const key = getProtocolItemKey(item.name, item.item_type || 'supplement');
            return { key, id: existingItemsMap.get(key) };
          })
          .filter((entry): entry is { key: string; id: string } => !!entry.id);

        await Promise.all(duplicateIds.map((entry) => applySources(entry.id, entry.key)));

        toast({
          title: t('protocol.allDuplicates'),
          description: t('protocol.allDuplicatesDesc'),
        });
        setConsolidatedDialogOpen(false);
        return;
      }

      const protocolItems = uniqueItems.map(item => ({
        protocol_id: protocolId,
        name: item.name,
        description: item.description,
        item_type: item.item_type,
        frequency: 'daily' as const,
        is_active: true,
        product_id: null
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('protocol_items')
        .insert(protocolItems)
        .select('id, name, item_type');

      if (itemsError) throw itemsError;

      await Promise.all(
        (insertedItems || []).map((item) => {
          const key = getProtocolItemKey(item.name, item.item_type);
          return applySources(item.id, key);
        })
      );

      if (duplicateItems.length > 0) {
        const duplicateIds = duplicateItems
          .map((item) => {
            const key = getProtocolItemKey(item.name, item.item_type || 'supplement');
            return { key, id: existingItemsMap.get(key) };
          })
          .filter((entry): entry is { key: string; id: string } => !!entry.id);

        await Promise.all(duplicateIds.map((entry) => applySources(entry.id, entry.key)));
      }

      toast({
        title: t('protocol.added'),
        description: t('protocol.addedDesc', { count: uniqueItems.length }),
      });

      setConsolidatedDialogOpen(false);
      navigate('/my-protocol');
    } catch (error: any) {
      console.error('Error saving consolidated protocol:', error);
      toast({
        title: t('protocol.saveFailed'),
        description: error?.message || t('protocol.saveFailed'),
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-12">
          <ProtocolSkeleton />
        </main>
      </div>
    );
  }


  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {t('myProtocol.pageTitle')} <span className="text-primary">{t('myProtocol.pageTitleHighlight')}</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('myProtocol.pageSubtitle')}
              </p>
            </div>
            <Button 
              onClick={() => navigate('/protocol-library')}
              variant="outline"
              className="hidden md:flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              {t('myProtocol.browseTemplates')}
            </Button>
          </div>
        </div>

        <Tabs defaultValue={new URLSearchParams(window.location.search).get('tab') || "active"} className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="active">{t('myProtocol.tabs.active')}</TabsTrigger>
            <TabsTrigger value="recommended" className="relative">
              {t('myProtocol.tabs.recommended')}
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">{t('myProtocol.tabs.history')}</TabsTrigger>
            <TabsTrigger value="calendar">{t('myProtocol.tabs.calendar')}</TabsTrigger>
            <TabsTrigger value="library">{t('myProtocol.tabs.library')}</TabsTrigger>
          </TabsList>

          {/* Active Protocol Tab - Merged Today + By Type */}
          <TabsContent value="active" className="space-y-6">
            {/* Source Filter Indicator */}
            {sourceFilter && (
              <Alert className="border-primary/30 bg-primary/5">
                <AlertDescription className="flex items-center justify-between">
                  <span>{t('myProtocol.filteredBy', { source: sourceFilter })}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/my-protocol?tab=active')}
                  >
                    {t('myProtocol.showAll')}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {hasAssessmentFilter && (
              <Alert className="border-primary/30 bg-primary/5">
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Filtered by assessment {assessmentSourceType}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/my-protocol?tab=active')}
                  >
                    {t('myProtocol.showAll')}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Protocol Bundle Card */}
            {activeProtocols.length > 0 && displayProtocolItems.length > 0 && (
              <ProtocolBundleCard
                protocolName={activeProtocol?.name || "My Protocol"}
                bundleCalculation={bundleCalculation || null}
                isLoading={bundleLoading}
                onAddToCart={handleAddBundleToCart}
              />
            )}

            {activeProtocols.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">{t('myProtocol.emptyState.title')}</h2>
                  <p className="text-muted-foreground mb-6">
                    {t('myProtocol.emptyState.description')}
                  </p>
                  <Button onClick={() => navigate('/pillars')}>
                    {t('myProtocol.emptyState.cta')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('myProtocol.activeProtocol.title')}</CardTitle>
                    <CardDescription>
                      {t('myProtocol.activeProtocol.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadingItems || (hasAssessmentFilter && loadingSourceItems) ? (
                      <p className="text-muted-foreground">{t('myProtocol.activeProtocol.loading')}</p>
                    ) : displayProtocolItems.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">{t('myProtocol.activeProtocol.noItems')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('myProtocol.activeProtocol.noItemsHint')}
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Meal Plans - Display at top if present */}
                        {displayProtocolItems.some(item => item.item_type === 'diet' && item.meal_template_id) && (
                          <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                              🍽️ Your Meal Plan
                            </h3>
                            {displayProtocolItems
                              .filter(item => item.item_type === 'diet' && item.meal_template_id)
                              .map(item => (
                                <MealPlanProtocolCard 
                                  key={item.id}
                                  mealTemplateId={item.meal_template_id!}
                                  proteinTarget={120}
                                  currentProtein={0}
                                />
                              ))
                            }
                          </div>
                        )}

                        {/* Organize by item type with Brand Pillar logos */}
                        {['supplement', 'diet', 'exercise', 'therapy', 'habit'].map((type) => {
                          const itemsOfType = displayProtocolItems.filter(
                            item => item.is_active && item.item_type === type && !(type === 'diet' && item.meal_template_id)
                          );
                          
                          if (itemsOfType.length === 0) return null;
                          
                          const pillar = getPillarForItemType(type);
                          
                          const typeLabels: Record<string, string> = {
                            supplement: 'Supplements',
                            diet: 'Nutrition',
                            exercise: 'Exercise',
                            therapy: 'Therapies',
                            habit: 'Habits'
                          };
                          
                          return (
                            <div key={type} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <img 
                                  src={pillar.logo} 
                                  alt={pillar.name}
                                  className="h-8 w-8 object-contain"
                                />
                                <h3 className="font-semibold text-sm uppercase tracking-wide">
                                  {typeLabels[type] || type}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {pillar.name} Pillar
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                {itemsOfType.map((item) => (
                                  <ProtocolItemCard
                                    key={item.id}
                                    item={item}
                                    completed={adherence[item.id]?.completed || false}
                                    onToggleComplete={() => toggleAdherence(item.id)}
                                    showActions
                                    onDelete={async () => {
                                      toast({
                                        title: "Item Removed",
                                        description: "Protocol item has been deleted."
                                      });
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Recommended Protocols Tab */}
          <TabsContent value="recommended" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>{t('myProtocol.recommended.title')}</CardTitle>
                    <CardDescription>
                      {t('myProtocol.recommended.description')}
                    </CardDescription>
                  </div>
                  
                  {/* Filter and Sort Controls */}
                  {recommendations && recommendations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Select value={recommendedSourceFilter} onValueChange={setRecommendedSourceFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={t('myProtocol.filters.filterBySource')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('myProtocol.sources.all')}</SelectItem>
                          <SelectItem value="lis">{t('myProtocol.sources.lis')}</SelectItem>
                          <SelectItem value="hormone_compass">{t('myProtocol.sources.hormoneCompass')}</SelectItem>
                          <SelectItem value="symptom">{t('myProtocol.sources.symptom')}</SelectItem>
                          <SelectItem value="goal">{t('myProtocol.sources.goal')}</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={recommendedSortBy} onValueChange={setRecommendedSortBy}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={t('myProtocol.filters.sortBy')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date-desc">{t('myProtocol.sorting.newestFirst')}</SelectItem>
                          <SelectItem value="date-asc">{t('myProtocol.sorting.oldestFirst')}</SelectItem>
                          <SelectItem value="priority">{t('myProtocol.sorting.byPriority')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
              {!loadingRecommendations && recommendations.length > 1 && (
                <Card className="border-dashed border-primary/40 mb-6">
                  <CardHeader>
                    <CardTitle>Consolidated Recommendations</CardTitle>
                    <CardDescription>
                      Combine overlapping items across assessments into one set.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      Review a single, deduplicated protocol set.
                    </div>
                    <Button onClick={() => setConsolidatedDialogOpen(true)}>
                      Review consolidated
                    </Button>
                  </CardContent>
                </Card>
              )}

                {loadingRecommendations ? (
                  <p className="text-muted-foreground">{t('myProtocol.recommended.loading')}</p>
                ) : recommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{t('myProtocol.recommended.noNew')}</h3>
                    <p className="text-muted-foreground mb-6">
                      {t('myProtocol.recommended.noNewDescription')}
                    </p>
                    <Button onClick={() => navigate('/pillars')}>
                      {t('myProtocol.recommended.takeAssessment')}
                    </Button>
                  </div>
                ) : filteredRecommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{t('myProtocol.recommended.noMatching')}</h3>
                    <p className="text-muted-foreground">
                      {t('myProtocol.recommended.noMatchingDescription')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRecommendations.map((recommendation) => {
                      const protocol = recommendation.protocol_data;
                      const totalItems = (protocol.immediate?.length || 0) + 
                                       (protocol.foundation?.length || 0) + 
                                       (protocol.optimization?.length || 0);
                      
                      const sourceLabels: Record<string, string> = {
                        'hormone_compass': 'Hormone Compass Assessment',
                        'lis': 'LIS Assessment',
                        'symptom': 'Symptom Assessment',
                        'goal': 'Goal Assessment'
                      };

                      return (
                        <Card key={recommendation.id} className="border-primary/20">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary">
                                    {sourceLabels[recommendation.source_type]}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(recommendation.created_at).toLocaleDateString()}
                                  </Badge>
                                </div>
                                <CardTitle className="text-lg">
                                  Personalized Protocol Recommendation
                                </CardTitle>
                                <CardDescription>
                                  {totalItems} actions across immediate, foundation, and optimization layers
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Preview of recommendations */}
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              {protocol.immediate && protocol.immediate.length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="destructive" className="text-xs">Immediate</Badge>
                                    <span className="text-muted-foreground">
                                      {protocol.immediate.length} actions
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {protocol.immediate[0]?.name}
                                    {protocol.immediate.length > 1 && ` +${protocol.immediate.length - 1} more`}
                                  </p>
                                </div>
                              )}
                              
                              {protocol.foundation && protocol.foundation.length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">Foundation</Badge>
                                    <span className="text-muted-foreground">
                                      {protocol.foundation.length} actions
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {protocol.foundation[0]?.name}
                                    {protocol.foundation.length > 1 && ` +${protocol.foundation.length - 1} more`}
                                  </p>
                                </div>
                              )}
                              
                              {protocol.optimization && protocol.optimization.length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">Optimization</Badge>
                                    <span className="text-muted-foreground">
                                      {protocol.optimization.length} actions
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {protocol.optimization[0]?.name}
                                    {protocol.optimization.length > 1 && ` +${protocol.optimization.length - 1} more`}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => {
                                  setSelectedRecommendation(recommendation);
                                  setProtocolDialogOpen(true);
                                }}
                                className="flex-1"
                              >
                                {t('myProtocol.recommended.reviewAndAdd')}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  dismissRecommendation({ 
                                    recommendationId: recommendation.id,
                                    reason: 'User dismissed from My Protocol page'
                                  });
                                }}
                              >
                                {t('myProtocol.recommended.dismiss')}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>{t('myProtocol.history.title')}</CardTitle>
                    <CardDescription>
                      {t('myProtocol.history.description')}
                    </CardDescription>
                  </div>
                  
                  {/* Filter and Sort Controls */}
                  {historicalRecommendations && historicalRecommendations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Select value={historySourceFilter} onValueChange={setHistorySourceFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={t('myProtocol.filters.filterBySource')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('myProtocol.sources.all')}</SelectItem>
                          <SelectItem value="lis">{t('myProtocol.sources.lis')}</SelectItem>
                          <SelectItem value="hormone_compass">{t('myProtocol.sources.hormoneCompass')}</SelectItem>
                          <SelectItem value="symptom">{t('myProtocol.sources.symptom')}</SelectItem>
                          <SelectItem value="goal">{t('myProtocol.sources.goal')}</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={historyStatusFilter} onValueChange={setHistoryStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={t('myProtocol.filters.filterByStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('myProtocol.filters.allStatuses')}</SelectItem>
                          <SelectItem value="dismissed">{t('myProtocol.filters.dismissed')}</SelectItem>
                          <SelectItem value="partially_accepted">{t('myProtocol.filters.partiallyAccepted')}</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={historySortBy} onValueChange={setHistorySortBy}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={t('myProtocol.filters.sortBy')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date-desc">{t('myProtocol.sorting.newestFirst')}</SelectItem>
                          <SelectItem value="date-asc">{t('myProtocol.sorting.oldestFirst')}</SelectItem>
                          <SelectItem value="status">{t('myProtocol.sorting.byStatus')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingHistorical ? (
                  <p className="text-muted-foreground">{t('myProtocol.history.loading')}</p>
                ) : !historicalRecommendations || historicalRecommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{t('myProtocol.history.empty')}</h3>
                    <p className="text-muted-foreground">
                      {t('myProtocol.history.emptyDescription')}
                    </p>
                  </div>
                ) : filteredHistoricalRecommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{t('myProtocol.recommended.noMatching')}</h3>
                    <p className="text-muted-foreground">
                      {t('myProtocol.recommended.noMatchingDescription')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredHistoricalRecommendations.map((recommendation: any) => {
                      const protocol = recommendation.protocol_data;
                      const sourceNames: Record<string, string> = {
                        'hormone_compass': 'Hormone Compass',
                        'lis': 'Longevity Impact Score',
                        'symptom': 'Symptom Assessment',
                        'goal': 'Goal Setting'
                      };

                      const totalItems = 
                        (protocol.immediate?.length || 0) + 
                        (protocol.foundation?.length || 0) + 
                        (protocol.optimization?.length || 0);

                      return (
                        <Card key={recommendation.id} className="border-2 border-muted">
                          <CardContent className="pt-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-lg">
                                    {sourceNames[recommendation.source_type] || recommendation.source_type}
                                  </h3>
                                  <Badge 
                                    variant={recommendation.status === 'dismissed' ? 'secondary' : 'outline'}
                                    className="text-xs"
                                  >
                                    {recommendation.status === 'dismissed' ? 'Dismissed' : 'Partially Accepted'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(recommendation.created_at).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-muted-foreground">{totalItems}</p>
                                <p className="text-xs text-muted-foreground">Total Items</p>
                              </div>
                            </div>

                            {/* Protocol Preview */}
                            <div className="space-y-3 mb-4">
                              {protocol.immediate && protocol.immediate.length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="destructive" className="text-xs">Immediate</Badge>
                                    <span className="text-muted-foreground text-sm">
                                      {protocol.immediate.length} actions
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {protocol.immediate[0]?.name}
                                    {protocol.immediate.length > 1 && ` +${protocol.immediate.length - 1} more`}
                                  </p>
                                </div>
                              )}
                              
                              {protocol.foundation && protocol.foundation.length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">Foundation</Badge>
                                    <span className="text-muted-foreground text-sm">
                                      {protocol.foundation.length} actions
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {protocol.foundation[0]?.name}
                                    {protocol.foundation.length > 1 && ` +${protocol.foundation.length - 1} more`}
                                  </p>
                                </div>
                              )}
                              
                              {protocol.optimization && protocol.optimization.length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">Optimization</Badge>
                                    <span className="text-muted-foreground text-sm">
                                      {protocol.optimization.length} actions
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {protocol.optimization[0]?.name}
                                    {protocol.optimization.length > 1 && ` +${protocol.optimization.length - 1} more`}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Dismissal/Partial Acceptance Info */}
                            {recommendation.dismissed_at && recommendation.notes && (
                              <div className="p-3 bg-muted/50 rounded-lg mb-4">
                                <p className="text-xs text-muted-foreground">
                                  <strong>Note:</strong> {recommendation.notes}
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => {
                                  setSelectedRecommendation(recommendation);
                                  setProtocolDialogOpen(true);
                                }}
                                variant="outline"
                                className="flex-1"
                              >
                                Review Again
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <AdherenceCalendar />
          </TabsContent>

          {/* Library Tab - Custom Protocols */}
          <TabsContent value="library" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Custom Protocols</CardTitle>
                    <CardDescription>
                      Manage your personalized wellness protocols
                    </CardDescription>
                  </div>
                  <ProtocolBuilderDialog onProtocolCreated={() => {
                    // Query will automatically refetch on invalidation
                  }} />
                </div>
              </CardHeader>
              <CardContent>
                {activeProtocols.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active protocols. Create your first one!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeProtocols.map(protocol => (
                      <Card key={protocol.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{protocol.name}</CardTitle>
                              {protocol.description && (
                                <CardDescription>{protocol.description}</CardDescription>
                              )}
                              <div className="flex gap-2 mt-2 items-center">
                                <Badge variant="outline">
                                  Started {new Date(protocol.start_date).toLocaleDateString()}
                                </Badge>
                                {protocol.created_from_pillar && (() => {
                                  const pillarLogos: Record<string, string> = {
                                    'Body': bodyPillar,
                                    'Balance': balancePillar,
                                    'Brain': brainPillar,
                                    'Beauty': beautyPillar
                                  };
                                  const logo = pillarLogos[protocol.created_from_pillar];
                                  return (
                                    <div className="flex items-center gap-1">
                                      {logo && (
                                        <img 
                                          src={logo} 
                                          alt={protocol.created_from_pillar}
                                          className="h-5 w-5 object-contain"
                                        />
                                      )}
                                      <Badge variant="secondary">
                                        {protocol.created_from_pillar} Pillar
                                      </Badge>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                await handleUpdateProtocol(protocol.id, { is_active: false });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </main>
        <EvidenceDrawer />
        
        {/* Protocol Selection Dialog */}
        {selectedRecommendation && (
          <ProtocolSelectionDialog
            open={protocolDialogOpen}
            onOpenChange={setProtocolDialogOpen}
            protocol={selectedRecommendation.protocol_data}
            onSave={handleProtocolSelection}
            onCancel={() => {
              setProtocolDialogOpen(false);
              setSelectedRecommendation(null);
            }}
          />
        )}

        {consolidatedDialogOpen && (
          <ProtocolSelectionDialog
            open={consolidatedDialogOpen}
            onOpenChange={setConsolidatedDialogOpen}
            protocol={consolidatedProtocol}
            onSave={handleConsolidatedSelection}
            onCancel={() => setConsolidatedDialogOpen(false)}
          />
        )}
        
        {/* Bottom Return Button */}
        <div className="flex justify-center gap-4 mt-8 pb-8">
          <Button 
            onClick={() => navigate(-1)} 
            size="lg"
          >
            {t('common.return')}
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default MyProtocol;
