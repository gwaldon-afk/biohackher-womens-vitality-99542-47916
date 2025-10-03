import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EvidenceBadge from "@/components/EvidenceBadge";
import { ShoppingCart, Package } from "lucide-react";

interface ProductRecommendation {
  id: string;
  name: string;
  price: number;
  tier: 'Gold' | 'Silver' | 'Bronze';
  evidenceLevel: 'Gold' | 'Silver' | 'Bronze' | 'Emerging';
  dosage: string;
}

interface ProtocolCardProps {
  symptomName: string;
  score: number;
  recommendations: ProductRecommendation[];
  onAddToCart: (productId: string) => void;
  onAddBundle: () => void;
  bundleTotal: number;
  bundleSavings: number;
}

const ProtocolCard = ({
  symptomName,
  score,
  recommendations,
  onAddToCart,
  onAddBundle,
  bundleTotal,
  bundleSavings
}: ProtocolCardProps) => {
  const goldTier = recommendations.filter(r => r.tier === 'Gold');
  const silverTier = recommendations.filter(r => r.tier === 'Silver');
  const bronzeTier = recommendations.filter(r => r.tier === 'Bronze');

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">Your Personalised Protocol</CardTitle>
        </div>
        <CardDescription className="text-base">
          Based on your {symptomName} score of {score}/100, these evidence-based supplements 
          are recommended to support your wellness journey.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gold Tier */}
        {goldTier.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="evidence-gold">🥇 Gold Tier</Badge>
              <span className="text-sm text-muted-foreground">Highest Evidence Support</span>
            </div>
            {goldTier.map((product) => (
              <div 
                key={product.id}
                className="flex items-center justify-between p-4 bg-background/80 rounded-lg border border-primary/10"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{product.name}</h4>
                    <EvidenceBadge level={product.evidenceLevel} className="text-xs" />
                  </div>
                  <p className="text-sm text-muted-foreground">{product.dosage}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary">${product.price}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onAddToCart(product.id)}
                    className="border-primary/20"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Silver Tier */}
        {silverTier.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="evidence-silver">🥈 Silver Tier</Badge>
              <span className="text-sm text-muted-foreground">Strong Supporting Evidence</span>
            </div>
            {silverTier.map((product) => (
              <div 
                key={product.id}
                className="flex items-center justify-between p-4 bg-background/80 rounded-lg border border-muted"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{product.name}</h4>
                    <EvidenceBadge level={product.evidenceLevel} className="text-xs" />
                  </div>
                  <p className="text-sm text-muted-foreground">{product.dosage}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary">${product.price}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onAddToCart(product.id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bronze Tier */}
        {bronzeTier.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="evidence-bronze">🥉 Bronze Tier</Badge>
              <span className="text-sm text-muted-foreground">Emerging Evidence</span>
            </div>
            {bronzeTier.map((product) => (
              <div 
                key={product.id}
                className="flex items-center justify-between p-4 bg-background/80 rounded-lg border border-muted"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{product.name}</h4>
                    <EvidenceBadge level={product.evidenceLevel} className="text-xs" />
                  </div>
                  <p className="text-sm text-muted-foreground">{product.dosage}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary">${product.price}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onAddToCart(product.id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bundle CTA */}
        {recommendations.length > 0 && (
          <div className="pt-6 border-t border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Complete Protocol Bundle</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">${bundleTotal.toFixed(2)}</span>
                  {bundleSavings > 0 && (
                    <Badge variant="outline" className="text-success border-success">
                      Save ${bundleSavings.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>
              <Button 
                size="lg"
                onClick={onAddBundle}
                className="bg-primary hover:bg-primary/90"
              >
                <Package className="h-5 w-5 mr-2" />
                Add Complete Protocol
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              💡 Bundle includes all recommended supplements with 10% discount
            </p>
          </div>
        )}

        {/* Why These Recommendations */}
        <div className="p-4 bg-background/60 rounded-lg border border-primary/10">
          <h4 className="font-semibold mb-2 text-sm">Why These Recommendations?</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Each supplement is selected based on peer-reviewed research demonstrating efficacy for {symptomName.toLowerCase()}. 
            Gold tier recommendations have the strongest evidence from multiple randomized controlled trials and meta-analyses. 
            All products are reviewed by our advisory board for safety and quality.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProtocolCard;
