import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { Package, ShoppingCart, CheckCircle2, AlertCircle, Pencil, Trash2, BookOpen, Clock } from "lucide-react";
import beautyPillar from "@/assets/beauty-pillar.png";
import brainPillar from "@/assets/brain-pillar.png";
import bodyPillar from "@/assets/body-pillar.png";
import balancePillar from "@/assets/balance-pillar.png";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { matchProductsToAssessment, calculateBundlePrice } from "@/utils/productMatcher";
import { useAdherence } from "@/hooks/useAdherence";
import { ProtocolItemCard } from "@/components/ProtocolItemCard";
import MealPlanProtocolCard from "@/components/MealPlanProtocolCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtocolBuilderDialog } from "@/components/ProtocolBuilderDialog";
import { AdherenceCalendar } from "@/components/AdherenceCalendar";
import { useAssessments, useProtocols, useMultipleProtocolItems, useDeleteProtocol, useUpdateProtocol } from "@/queries";
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
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AssessmentData {
  id: string;
  symptom_type: string;
  overall_score: number;
  completed_at: string;
}

const MyProtocol = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { adherence, toggleAdherence } = useAdherence();
  const { addToCart } = useCart();
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);

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
  
  const activeProtocols = protocols.filter(p => p.is_active);
  const activeProtocol = activeProtocols[0]; // Get first active protocol
  
  // Get protocol items for ALL active protocols
  const activeProtocolIds = activeProtocols.map(p => p.id);
  
  // Fetch items for all active protocols in a single query
  const { data: allProtocolItems = [], isLoading: loadingItems } = useMultipleProtocolItems(activeProtocolIds);

  // Fetch bundle calculation for active protocol
  const { data: bundleCalculation, isLoading: bundleLoading } = useProtocolBundle(activeProtocol?.id);

  // Get unique assessments by symptom type (most recent for each)
  const uniqueAssessments = assessments?.reduce((acc: AssessmentData[], current) => {
    if (!acc.find(item => item.symptom_type === current.symptom_type)) {
      acc.push(current);
    }
    return acc;
  }, []) || [];

  const isLoading = loadingProtocols || loadingAssessments || loadingItems;

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

      // 3. Create protocol_items for selected items
      const itemsToInsert = selectedItems.map(item => ({
        protocol_id: newProtocol.id,
        name: item.name,
        description: item.description,
        item_type: mapCategoryToItemType(item.category),
        frequency: 'daily' as const,
        is_active: true,
        product_id: null
      }));

      const { error: itemsError } = await supabase
        .from('protocol_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <ProtocolSkeleton />
        </main>
      </div>
    );
  }


  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Protocol <span className="text-primary">Manager</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Your complete wellness protocol: supplements, nutrition, exercise, therapies & daily habits
              </p>
            </div>
            <Button 
              onClick={() => navigate('/protocol-library')}
              variant="outline"
              className="hidden md:flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Browse Templates
            </Button>
          </div>
        </div>

        <Tabs defaultValue={new URLSearchParams(window.location.search).get('tab') || "active"} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="active">Active Protocol</TabsTrigger>
            <TabsTrigger value="recommended" className="relative">
              Recommended
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>

          {/* Active Protocol Tab - Merged Today + By Type */}
          <TabsContent value="active" className="space-y-6">
            {/* Protocol Bundle Card */}
            {activeProtocols.length > 0 && allProtocolItems.length > 0 && (
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
                  <h2 className="text-2xl font-bold mb-2">No Active Protocol</h2>
                  <p className="text-muted-foreground mb-6">
                    Build your complete wellness protocol including supplements, nutrition, exercise, therapies, and daily habits.
                  </p>
                  <Button onClick={() => navigate('/pillars')}>
                    Start with an Assessment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Your Active Protocol</CardTitle>
                    <CardDescription>
                      Complete your daily protocol to optimize health outcomes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadingItems ? (
                      <p className="text-muted-foreground">Loading protocol items...</p>
                    ) : allProtocolItems.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No items in your protocol yet.</p>
                        <p className="text-sm text-muted-foreground">
                          Use the Builder tab to add supplements, nutrition plans, exercises, and wellness practices.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Meal Plans - Display at top if present */}
                        {allProtocolItems.some(item => item.item_type === 'diet' && item.meal_template_id) && (
                          <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                              🍽️ Your Meal Plan
                            </h3>
                            {allProtocolItems
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
                          const itemsOfType = allProtocolItems.filter(
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
                <CardTitle>Recommended Protocols</CardTitle>
                <CardDescription>
                  Review and add assessment-generated protocols to your plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRecommendations ? (
                  <p className="text-muted-foreground">Loading recommendations...</p>
                ) : recommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No New Recommendations</h3>
                    <p className="text-muted-foreground mb-6">
                      Complete an assessment to get personalized protocol suggestions
                    </p>
                    <Button onClick={() => navigate('/pillars')}>
                      Take an Assessment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((recommendation) => {
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
                                Review & Add to Plan
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
                                Dismiss
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
      </div>
    </ErrorBoundary>
  );
};

export default MyProtocol;
