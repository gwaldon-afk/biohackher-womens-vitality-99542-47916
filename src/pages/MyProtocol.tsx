import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { Package, ShoppingCart, CheckCircle2, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { matchProductsToAssessment, calculateBundlePrice } from "@/utils/productMatcher";
import { useAdherence } from "@/hooks/useAdherence";
import { ProtocolItemCard } from "@/components/ProtocolItemCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtocolBuilderDialog } from "@/components/ProtocolBuilderDialog";
import { AdherenceCalendar } from "@/components/AdherenceCalendar";
import { useAssessments, useProtocols, useProtocolItems, useDeleteProtocol, useUpdateProtocol } from "@/queries";
import { ProtocolSkeleton } from "@/components/skeletons/ProtocolSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Protocol } from "@/types/protocols";

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

  // Use React Query hooks
  const { data: protocols = [], isLoading: loadingProtocols } = useProtocols(user?.id);
  const deleteProtocolMutation = useDeleteProtocol();
  const updateProtocolMutation = useUpdateProtocol();
  const { data: assessments = [], isLoading: loadingAssessments } = useAssessments(user?.id);
  
  const activeProtocols = protocols.filter(p => p.is_active);
  
  // Get protocol items for active protocols
  const activeProtocolIds = activeProtocols.map(p => p.id);
  const { data: allProtocolItems = [], isLoading: loadingItems } = useProtocolItems(
    activeProtocolIds.length > 0 ? activeProtocolIds[0] : undefined
  );

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

  if (uniqueAssessments.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Protocol Yet</h2>
              <p className="text-muted-foreground mb-6">
                Complete your first symptom assessment to receive personalized supplement recommendations.
              </p>
              <Button onClick={() => navigate('/pillars')}>
                Take Your First Assessment
              </Button>
            </CardContent>
          </Card>
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
          <h1 className="text-4xl font-bold mb-2">
            Protocol <span className="text-primary">Manager</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Your complete wellness protocol: supplements, nutrition, exercise, therapies & daily habits
          </p>
        </div>

        <Tabs defaultValue={new URLSearchParams(window.location.search).get('tab') || "today"} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="by-type">By Type</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="builder">Builder</TabsTrigger>
          </TabsList>

          {/* Today's Protocol Tab */}
          <TabsContent value="today" className="space-y-6">
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
                    <CardTitle>Today's Complete Protocol</CardTitle>
                    <CardDescription>
                      Your daily wellness routine - supplements, nutrition, exercise, therapies & habits
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
                        {/* Organize by item type */}
                        {['supplement', 'diet', 'exercise', 'therapy', 'habit'].map((type) => {
                          const itemsOfType = allProtocolItems.filter(
                            item => item.is_active && item.item_type === type
                          );
                          
                          if (itemsOfType.length === 0) return null;
                          
                          const typeLabels: Record<string, { label: string; icon: any }> = {
                            supplement: { label: '💊 Supplements', icon: Package },
                            diet: { label: '🥗 Nutrition', icon: Package },
                            exercise: { label: '🏃 Exercise', icon: Package },
                            therapy: { label: '✨ Therapies', icon: Package },
                            habit: { label: '🌟 Habits', icon: Package }
                          };
                          
                          return (
                            <div key={type} className="space-y-2">
                              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                {typeLabels[type]?.label || type}
                              </h3>
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

          {/* By Type Tab - Organized view */}
          <TabsContent value="by-type" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Protocol by Category</CardTitle>
                <CardDescription>
                  View all your wellness interventions organized by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="supplements" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="supplements">Supplements</TabsTrigger>
                    <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                    <TabsTrigger value="exercise">Exercise</TabsTrigger>
                    <TabsTrigger value="therapies">Therapies</TabsTrigger>
                    <TabsTrigger value="habits">Habits</TabsTrigger>
                  </TabsList>

                  {['supplement', 'diet', 'exercise', 'therapy', 'habit'].map((type, idx) => {
                    const typeValues = ['supplements', 'nutrition', 'exercise', 'therapies', 'habits'];
                    const itemsOfType = allProtocolItems.filter(
                      item => item.is_active && item.item_type === type
                    );

                    return (
                      <TabsContent key={type} value={typeValues[idx]} className="space-y-3 mt-4">
                        {itemsOfType.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            No {typeValues[idx]} in your protocol yet. Use the Builder tab to add some.
                          </p>
                        ) : (
                          itemsOfType.map((item) => (
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
                          ))
                        )}
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <AdherenceCalendar />
          </TabsContent>

          {/* Builder Tab */}
          <TabsContent value="builder" className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle>Protocol Builder</CardTitle>
                <CardDescription>
                  Create your personalized wellness protocol with templates or build from scratch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProtocolBuilderDialog />
                <p className="text-sm text-muted-foreground mt-4">
                  Build protocols that include: Supplements, Nutrition plans, Exercise routines, Therapies (red light, cold plunge, sauna), and Daily habits
                </p>
              </CardContent>
            </Card>

          {/* Supplement Recommendations */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle>Supplement Recommendations</CardTitle>
            <CardDescription>Based on your symptom assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-2xl font-bold text-primary">{protocolCompletion}%</span>
              </div>
              <Progress value={protocolCompletion} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {uniqueRecommendations.length} supplements recommended across {uniqueAssessments.length} health area{uniqueAssessments.length > 1 ? 's' : ''}
              </p>
            </div>
          </CardContent>
            </Card>

        {/* Supplements Recommended for Your Symptoms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Supplements in Your 30-Day Stack</CardTitle>
            <CardDescription>
              Based on your completed symptom assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {uniqueAssessments.map((assessment) => {
                const products = matchProductsToAssessment(assessment.symptom_type, assessment.overall_score);
                if (products.length === 0) return null;

                return (
                  <div key={assessment.id} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <h3 className="font-semibold text-sm">{getSymptomName(assessment.symptom_type)}</h3>
                      <Badge variant="outline" className="text-xs ml-auto">
                        Score: {assessment.overall_score}/100
                      </Badge>
                    </div>
                    {products.map((product) => (
                      <div 
                        key={product.id}
                        className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{product.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {product.tier}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{product.dosage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 30-Day Supplement Stack */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Your 30-Day Supplement Stack</CardTitle>
            </div>
            <CardDescription>
              Complete personalized stack based on your symptom profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* What's Included */}
              <div className="p-6 bg-background/60 rounded-lg border border-primary/10">
                <h3 className="font-semibold mb-4 text-lg">What's Included in Your Stack:</h3>
                <div className="space-y-2 mb-4">
                  {uniqueRecommendations.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.dosage} • 30-day supply</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{product.tier}</Badge>
                    </div>
                  ))}
                </div>
                
                {/* Pricing */}
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">30-Day Supply Subtotal</span>
                    <span className="font-semibold">${bundlePricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-success">Bundle Discount (10%)</span>
                    <span className="font-semibold text-success">-${bundlePricing.savings.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-border my-4"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">30-Day Stack Total</span>
                    <span className="text-3xl font-bold text-primary">${bundlePricing.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Based on {uniqueAssessments.length} symptom assessment{uniqueAssessments.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Stack Benefits */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">30-Day Supply</p>
                    <p className="text-xs text-muted-foreground">Complete month's worth</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Personalized</p>
                    <p className="text-xs text-muted-foreground">Based on your profile</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Save 10%</p>
                    <p className="text-xs text-muted-foreground">Bundle discount</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleAddAllToCart}
              >
                <Package className="h-5 w-5 mr-2" />
                Purchase 30-Day Stack - ${bundlePricing.total.toFixed(2)}
              </Button>

              {/* Subscription Option */}
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <p className="text-sm font-medium mb-1">Subscribe & Save 15%</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Automatically receive your personalized stack monthly
                </p>
                <div className="text-2xl font-bold text-primary mb-3">
                  ${(bundlePricing.total * 0.85).toFixed(2)}/month
                </div>
                <Button variant="outline" size="sm">
                  Start Monthly Subscription
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Cancel anytime • Stack updates as you complete more assessments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Optimize Your Protocol</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/pillars')}
                >
                  Take More Assessments to Expand Your Protocol
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/shop')}
                >
                  Browse All Supplements in Shop
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Protocols Tab */}
          <TabsContent value="protocols" className="space-y-6">
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
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">
                                  Started {new Date(protocol.start_date).toLocaleDateString()}
                                </Badge>
                                {protocol.created_from_pillar && (
                                  <Badge variant="secondary">
                                    {protocol.created_from_pillar}
                                  </Badge>
                                )}
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
      </div>
    </ErrorBoundary>
  );
};

export default MyProtocol;
