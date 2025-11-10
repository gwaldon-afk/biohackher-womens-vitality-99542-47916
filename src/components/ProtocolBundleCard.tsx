import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Package, Sparkles, Tag } from "lucide-react";
import { BundleCalculation } from "@/services/protocolBundleService";

interface ProtocolBundleCardProps {
  protocolName: string;
  bundleCalculation: BundleCalculation | null;
  isLoading: boolean;
  onAddToCart: () => void;
}

export const ProtocolBundleCard = ({
  protocolName,
  bundleCalculation,
  isLoading,
  onAddToCart,
}: ProtocolBundleCardProps) => {
  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!bundleCalculation || bundleCalculation.totalItems === 0) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            No Products Available
          </CardTitle>
          <CardDescription>
            Add supplements to your protocol to enable bundle purchasing
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { totalItems, basePrice, discountPercentage, discountAmount, finalPrice, eligibleForDiscount } = bundleCalculation;

  return (
    <Card className="border-primary/40 bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Package className="h-5 w-5 text-primary" />
              Complete Protocol Bundle
            </CardTitle>
            <CardDescription className="mt-1">
              Buy your entire {protocolName} protocol in one click
            </CardDescription>
          </div>
          {eligibleForDiscount && (
            <Badge variant="default" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Save {discountPercentage}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bundle Summary */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{totalItems} items included</span>
          {eligibleForDiscount && (
            <div className="flex items-center gap-2 text-primary">
              <Tag className="h-4 w-4" />
              <span className="font-medium">Bundle Discount Applied</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Base Price</span>
            <span className={eligibleForDiscount ? "line-through text-muted-foreground" : "font-semibold"}>
              ${basePrice.toFixed(2)}
            </span>
          </div>

          {eligibleForDiscount && (
            <>
              <div className="flex items-center justify-between text-sm text-primary">
                <span className="font-medium">Bundle Discount ({discountPercentage}%)</span>
                <span className="font-medium">-${discountAmount.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total Price</span>
                <span className="text-2xl font-bold text-primary">${finalPrice.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button 
          onClick={onAddToCart} 
          className="w-full gap-2 h-12 text-base"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5" />
          Add Complete Protocol to Cart
        </Button>

        {/* Discount Tiers Info */}
        {!eligibleForDiscount && totalItems < 3 && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">💡 Bundle Discount Tiers:</p>
            <ul className="space-y-0.5 ml-2">
              <li>• 3-5 items: Save 10%</li>
              <li>• 6-9 items: Save 15%</li>
              <li>• 10+ items: Save 20%</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
