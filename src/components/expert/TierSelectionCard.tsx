import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TIER_CONFIG, ExpertTier } from "@/types/experts";
import { Check, Crown, Star, Zap } from "lucide-react";

interface TierSelectionCardProps {
  currentTier: ExpertTier;
  onSelectTier: (tier: ExpertTier) => void;
  disabled?: boolean;
}

export const TierSelectionCard = ({ currentTier, onSelectTier, disabled }: TierSelectionCardProps) => {
  const tiers: ExpertTier[] = ['free', 'premium', 'elite'];

  const getTierIcon = (tier: ExpertTier) => {
    switch (tier) {
      case 'free': return Star;
      case 'premium': return Crown;
      case 'elite': return Zap;
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {tiers.map((tier) => {
        const config = TIER_CONFIG[tier];
        const Icon = getTierIcon(tier);
        const isCurrent = tier === currentTier;

        return (
          <Card 
            key={tier} 
            className={`relative ${tier === 'premium' ? 'border-primary shadow-lg' : ''} ${isCurrent ? 'ring-2 ring-primary' : ''}`}
          >
            {tier === 'premium' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">Most Popular</Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{config.name}</CardTitle>
              <div className="text-4xl font-bold mt-2">
                {config.fee === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  <>
                    <span className="text-primary">${config.fee}</span>
                    <span className="text-lg font-normal text-muted-foreground">/year</span>
                  </>
                )}
              </div>
              <CardDescription className="mt-2">
                {config.referralRate}% commission on referrals
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {config.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Badge variant="default" className="w-full justify-center py-2">
                  Current Plan
                </Badge>
              ) : (
                <Button
                  onClick={() => onSelectTier(tier)}
                  disabled={disabled}
                  variant={tier === 'premium' ? 'default' : 'outline'}
                  className="w-full"
                >
                  {tier === 'free' ? 'Start Free' : 'Upgrade'}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};