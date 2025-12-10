import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEvidenceStore } from "@/stores/evidenceStore";
import { useCart } from "@/hooks/useCart";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/productService";
import EvidenceDrawer from "@/components/EvidenceDrawer";
import { 
  FileStack, 
  FlaskConical, 
  ShoppingCart, 
  Sparkles,
  Dumbbell,
  Brain,
  Heart,
  Moon,
  Users,
  Utensils,
  Info
} from "lucide-react";

interface ProtocolItem {
  id: string;
  name: string;
  description: string | null;
  item_type: string;
  is_active: boolean;
  priority_tier: string | null;
  impact_weight: number | null;
  evidence_level: string | null;
  accessibility: string | null;
  lis_pillar_contribution: string[] | null;
  dosage: string | null;
  frequency: string;
  time_of_day: string[] | null;
  product_id: string | null;
}

const TIER_CONFIG = {
  immediate: { label: "Immediate", color: "bg-destructive/10 text-destructive border-destructive/30", weight: 9 },
  foundation: { label: "Foundation", color: "bg-primary/10 text-primary border-primary/30", weight: 7 },
  optimization: { label: "Optimization", color: "bg-secondary/50 text-secondary-foreground border-secondary", weight: 5 }
};

const EVIDENCE_CONFIG = {
  very_strong: { label: "Very Strong", color: "text-green-600" },
  strong: { label: "Strong", color: "text-emerald-600" },
  moderate: { label: "Moderate", color: "text-amber-600" },
  weak: { label: "Weak", color: "text-muted-foreground" }
};

const PILLAR_ICONS: Record<string, React.ReactNode> = {
  sleep: <Moon className="h-3 w-3" />,
  stress: <Heart className="h-3 w-3" />,
  activity: <Dumbbell className="h-3 w-3" />,
  nutrition: <Utensils className="h-3 w-3" />,
  social: <Users className="h-3 w-3" />,
  cognitive: <Brain className="h-3 w-3" />
};

const PILLAR_SUMMARIES: Record<string, { title: string; summary: string }> = {
  sleep: { title: "Sleep & Recovery", summary: "Research on sleep quality, circadian rhythms, and recovery optimization." },
  stress: { title: "Stress & Mental Wellness", summary: "Evidence-based approaches to stress management and emotional health." },
  activity: { title: "Physical Activity", summary: "Studies on exercise, movement, and physical performance." },
  nutrition: { title: "Nutrition & Diet", summary: "Research on dietary interventions and nutritional strategies." },
  social: { title: "Social Connection", summary: "Evidence on social relationships and community wellbeing." },
  cognitive: { title: "Cognitive Function", summary: "Research on brain health, memory, and mental clarity." }
};

// Infer pillars from item type when not explicitly set
const inferPillarsFromType = (itemType: string, name: string): string[] => {
  const nameLC = name.toLowerCase();
  
  if (itemType === 'supplement') {
    if (nameLC.includes('magnesium') || nameLC.includes('melatonin') || nameLC.includes('glycine')) return ['sleep'];
    if (nameLC.includes('omega') || nameLC.includes('fish oil')) return ['cognitive', 'nutrition'];
    if (nameLC.includes('vitamin d') || nameLC.includes('d3')) return ['activity', 'nutrition'];
    if (nameLC.includes('ashwagandha') || nameLC.includes('rhodiola')) return ['stress'];
    if (nameLC.includes('probiotic') || nameLC.includes('fiber')) return ['nutrition'];
    if (nameLC.includes('creatine') || nameLC.includes('protein')) return ['activity'];
    return ['nutrition'];
  }
  if (itemType === 'exercise') return ['activity'];
  if (itemType === 'habit') {
    if (nameLC.includes('sleep') || nameLC.includes('bed')) return ['sleep'];
    if (nameLC.includes('meditat') || nameLC.includes('breath')) return ['stress'];
    if (nameLC.includes('walk') || nameLC.includes('stretch')) return ['activity'];
    if (nameLC.includes('social') || nameLC.includes('connect')) return ['social'];
    return ['cognitive'];
  }
  if (itemType === 'therapy') {
    if (nameLC.includes('sauna') || nameLC.includes('cold') || nameLC.includes('light')) return ['activity', 'stress'];
    return ['stress'];
  }
  if (itemType === 'diet') return ['nutrition'];
  
  return [];
};

export function MasterProtocolSheet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { openEvidence } = useEvidenceStore();
  const { addToCart } = useCart();
  const [protocolItems, setProtocolItems] = useState<ProtocolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Filters
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("priority");

  useEffect(() => {
    if (user) {
      fetchProtocolItems();
    }
  }, [user]);

  const fetchProtocolItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch all protocol items for user's protocols
      const { data: protocols, error: protocolError } = await supabase
        .from('protocols')
        .select('id')
        .eq('user_id', user.id);

      if (protocolError) throw protocolError;

      if (!protocols || protocols.length === 0) {
        setProtocolItems([]);
        setLoading(false);
        return;
      }

      const protocolIds = protocols.map(p => p.id);
      
      const { data: items, error: itemsError } = await supabase
        .from('protocol_items')
        .select('*')
        .in('protocol_id', protocolIds);

      if (itemsError) throw itemsError;

      setProtocolItems(items || []);
    } catch (error) {
      console.error('Error fetching protocol items:', error);
      toast({
        title: "Error loading protocols",
        description: "Could not load your protocol items.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleItemActive = async (itemId: string, currentActive: boolean) => {
    setUpdating(itemId);
    try {
      const { error } = await supabase
        .from('protocol_items')
        .update({ is_active: !currentActive })
        .eq('id', itemId);

      if (error) throw error;

      setProtocolItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, is_active: !currentActive } : item
        )
      );

      toast({
        title: !currentActive ? "Added to Plan" : "Removed from Plan",
        description: `Protocol item ${!currentActive ? 'activated' : 'deactivated'}.`
      });
    } catch (error) {
      console.error('Error updating protocol item:', error);
      toast({
        title: "Error",
        description: "Could not update protocol item.",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const updateItemTier = async (itemId: string, tier: string) => {
    const weight = TIER_CONFIG[tier as keyof typeof TIER_CONFIG]?.weight || 5;
    
    try {
      const { error } = await supabase
        .from('protocol_items')
        .update({ priority_tier: tier, impact_weight: weight })
        .eq('id', itemId);

      if (error) throw error;

      setProtocolItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, priority_tier: tier, impact_weight: weight } : item
        )
      );
    } catch (error) {
      console.error('Error updating tier:', error);
    }
  };

  // Filter and sort items
  const filteredItems = protocolItems
    .filter(item => tierFilter === "all" || item.priority_tier === tierFilter)
    .filter(item => typeFilter === "all" || item.item_type === typeFilter)
    .sort((a, b) => {
      if (sortBy === "priority") {
        const tierOrder = { immediate: 0, foundation: 1, optimization: 2 };
        const aTier = tierOrder[a.priority_tier as keyof typeof tierOrder] ?? 1;
        const bTier = tierOrder[b.priority_tier as keyof typeof tierOrder] ?? 1;
        return aTier - bTier;
      }
      if (sortBy === "weight") {
        return (b.impact_weight || 5) - (a.impact_weight || 5);
      }
      if (sortBy === "evidence") {
        const evidenceOrder = { very_strong: 0, strong: 1, moderate: 2, weak: 3 };
        const aEvidence = evidenceOrder[a.evidence_level as keyof typeof evidenceOrder] ?? 2;
        const bEvidence = evidenceOrder[b.evidence_level as keyof typeof evidenceOrder] ?? 2;
        return aEvidence - bEvidence;
      }
      return 0;
    });

  const activeCount = protocolItems.filter(item => item.is_active).length;
  const totalWeight = protocolItems
    .filter(item => item.is_active)
    .reduce((sum, item) => sum + (item.impact_weight || 5), 0);
  
  const projectedImpact = Math.min(Math.round(totalWeight / 10), 15);

  const itemTypes = [...new Set(protocolItems.map(item => item.item_type))];

  // Fetch products for cart matching
  const { data: products = [] } = useQuery({
    queryKey: ['products-for-protocol'],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 10
  });

  // Create a map for product matching by name
  const productMap = useMemo(() => {
    const map = new Map<string, typeof products[0]>();
    products.forEach(p => {
      map.set(p.name.toLowerCase(), p);
    });
    return map;
  }, [products]);

  const findProductForItem = (itemName: string) => {
    const nameLower = itemName.toLowerCase();
    // Direct match
    if (productMap.has(nameLower)) return productMap.get(nameLower);
    // Partial match
    for (const [key, product] of productMap) {
      if (nameLower.includes(key) || key.includes(nameLower)) return product;
    }
    return null;
  };

  const openEvidenceForPillar = (pillar: string) => {
    const pillarInfo = PILLAR_SUMMARIES[pillar.toLowerCase()] || { 
      title: pillar, 
      summary: `Evidence for ${pillar} interventions.` 
    };
    openEvidence(pillar.toLowerCase(), pillarInfo.title, pillarInfo.summary);
  };

  const handleAddToCart = (item: ProtocolItem) => {
    const product = findProductForItem(item.name);
    if (product) {
      addToCart(product);
      toast({
        title: "Added to cart",
        description: `${product.name} added to your cart.`
      });
    } else {
      toast({
        title: "Product not found",
        description: "This item is not available for purchase.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with summary */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-2 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileStack className="h-5 w-5 text-primary" />
              Master Protocol Selection
            </CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Selected:</span>
                <Badge variant="secondary">{activeCount} items</Badge>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">LIS Impact:</span>
                <Badge className="bg-primary/20 text-primary">+{projectedImpact} pts</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select which protocols to include in your 90-day plan. Higher priority items have greater impact on your Longevity Score.
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="immediate">Immediate</SelectItem>
            <SelectItem value="foundation">Foundation</SelectItem>
            <SelectItem value="optimization">Optimization</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {itemTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority Tier</SelectItem>
            <SelectItem value="weight">Impact Weight</SelectItem>
            <SelectItem value="evidence">Evidence Level</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Protocol Items List */}
      {filteredItems.length === 0 ? (
        <Card className="p-8 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Protocol Items Yet</h3>
          <p className="text-muted-foreground mb-4">
            Complete assessments to receive personalized protocol recommendations.
          </p>
          <Button onClick={() => window.location.href = '/longevity-nutrition'}>
            Take an Assessment
          </Button>
        </Card>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const tier = item.priority_tier || 'foundation';
              const tierConfig = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.foundation;
              const evidenceConfig = EVIDENCE_CONFIG[item.evidence_level as keyof typeof EVIDENCE_CONFIG] || EVIDENCE_CONFIG.moderate;
              
              return (
                <Card 
                  key={item.id} 
                  className={`transition-all ${item.is_active ? 'border-primary/40 bg-primary/5' : 'border-border/50 opacity-75'}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Selection checkbox */}
                      <div className="pt-1">
                        <Checkbox
                          checked={item.is_active}
                          disabled={updating === item.id}
                          onCheckedChange={() => toggleItemActive(item.id, item.is_active)}
                        />
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-medium">{item.name}</h4>
                          
                          {/* Tier badge */}
                          <Badge variant="outline" className={`text-xs ${tierConfig.color}`}>
                            {tierConfig.label}
                          </Badge>

                          {/* Item type */}
                          <Badge variant="secondary" className="text-xs">
                            {item.item_type}
                          </Badge>

                          {/* Accessibility indicator */}
                          {item.accessibility === 'requires_equipment' && (
                            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                              Requires Equipment
                            </Badge>
                          )}
                          {item.accessibility === 'requires_purchase' && (
                            <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                              Purchase Required
                            </Badge>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        {item.dosage && (
                          <p className="text-xs text-muted-foreground mb-2">
                            Dosage: {item.dosage}
                          </p>
                        )}

                        {/* LIS Pillar contributions - use inferred if not set */}
                        {(() => {
                          const pillars = (item.lis_pillar_contribution && item.lis_pillar_contribution.length > 0)
                            ? item.lis_pillar_contribution
                            : inferPillarsFromType(item.item_type, item.name);
                          
                          return pillars.length > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">Pillars:</span>
                              <div className="flex gap-1 flex-wrap">
                                {pillars.map(pillar => (
                                  <Badge 
                                    key={pillar} 
                                    variant="outline" 
                                    className="text-xs gap-1 cursor-pointer hover:bg-primary/10"
                                    onClick={() => openEvidenceForPillar(pillar)}
                                  >
                                    {PILLAR_ICONS[pillar.toLowerCase()] || null}
                                    {pillar}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Evidence and weight */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <FlaskConical className="h-3 w-3" />
                            <span className={evidenceConfig.color}>{evidenceConfig.label} Evidence</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Impact:</span>
                            <span className="font-medium">{item.impact_weight || 5}/10</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {/* Tier selector */}
                        <Select 
                          value={item.priority_tier || 'foundation'} 
                          onValueChange={(value) => updateItemTier(item.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="foundation">Foundation</SelectItem>
                            <SelectItem value="optimization">Optimization</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* View Evidence button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            const pillars = (item.lis_pillar_contribution && item.lis_pillar_contribution.length > 0)
                              ? item.lis_pillar_contribution
                              : inferPillarsFromType(item.item_type, item.name);
                            const pillar = pillars[0] || 'nutrition';
                            openEvidenceForPillar(pillar);
                          }}
                        >
                          <Info className="h-3 w-3 mr-1" />
                          Evidence
                        </Button>

                        {/* Add to Cart for supplements */}
                        {(item.item_type === 'supplement' || item.product_id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleAddToCart(item)}
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Tier Legend */}
      <Card className="p-4 bg-muted/30">
        <h4 className="text-sm font-medium mb-3">Priority Tier Guide</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Badge variant="outline" className={TIER_CONFIG.immediate.color}>Immediate</Badge>
            <div>
              <p className="font-medium">Weight: 9/10</p>
              <p className="text-xs text-muted-foreground">High-impact actions for weeks 1-4</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline" className={TIER_CONFIG.foundation.color}>Foundation</Badge>
            <div>
              <p className="font-medium">Weight: 7/10</p>
              <p className="text-xs text-muted-foreground">Core protocols for weeks 5-8</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline" className={TIER_CONFIG.optimization.color}>Optimization</Badge>
            <div>
              <p className="font-medium">Weight: 5/10</p>
              <p className="text-xs text-muted-foreground">Enhancement protocols for weeks 9-12</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Evidence Drawer - uses global store */}
      <EvidenceDrawer />
    </div>
  );
}
