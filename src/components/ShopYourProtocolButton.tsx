import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface ShopYourProtocolButtonProps {
  assessmentType: 'lis' | 'hormone_compass' | 'longevity_nutrition';
  itemCount?: number;
  variant?: 'button' | 'card';
}

/**
 * CTA component that navigates to Shop with pre-filtered view showing
 * products matching the user's assessment recommendations
 * Includes bundle discount messaging to drive conversion
 */
const ShopYourProtocolButton = ({ 
  assessmentType,
  itemCount = 0,
  variant = 'card'
}: ShopYourProtocolButtonProps) => {
  const navigate = useNavigate();

  const handleShopProtocol = () => {
    // Navigate to shop with assessment filter
    navigate(`/shop?from=${assessmentType}&bundle=true`);
  };

  if (variant === 'button') {
    return (
      <Button
        onClick={handleShopProtocol}
        className="gap-2 w-full"
        size="lg"
      >
        <ShoppingCart className="h-5 w-5" />
        Shop Your Protocol
        {itemCount > 0 && (
          <Badge variant="secondary" className="ml-2">
            {itemCount} items
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              Shop Your Personalized Protocol
              <Sparkles className="h-4 w-4 text-primary" />
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              We've curated products specifically matched to your assessment results. 
              {itemCount > 2 && " Add 3+ items to unlock bundle savings!"}
            </p>
            <Button
              onClick={handleShopProtocol}
              className="gap-2 w-full"
            >
              <ShoppingCart className="h-4 w-4" />
              Browse Recommended Products
              {itemCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-white/20">
                  {itemCount} matches
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopYourProtocolButton;
