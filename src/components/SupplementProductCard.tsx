import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink, CheckCircle2 } from "lucide-react";
import { Product } from "@/services/productService";
import { useLocale } from "@/hooks/useLocale";
import { useState } from "react";

interface SupplementProductCardProps {
  supplementText: string;
  matchedProduct?: Product | null;
  onAddToCart?: (product: Product) => void;
}

export const SupplementProductCard = ({
  supplementText,
  matchedProduct,
  onAddToCart,
}: SupplementProductCardProps) => {
  const { formatCurrency, getCurrentLocale } = useLocale();
  const [marked, setMarked] = useState(false);
  const locale = getCurrentLocale();

  // Get price for user's currency
  const getPrice = (product: Product) => {
    switch (locale.currency) {
      case "USD":
        return product.price_usd;
      case "AUD":
        return product.price_aud;
      case "CAD":
        return product.price_cad;
      default:
        return product.price_gbp;
    }
  };

  if (!matchedProduct) {
    // Show generic supplement card if no product match
    return (
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm">{supplementText}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Generic supplement recommendation
              </p>
            </div>
            <Button
              size="sm"
              variant={marked ? "default" : "outline"}
              onClick={() => setMarked(!marked)}
              className="ml-4"
            >
              {marked ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Taken
                </>
              ) : (
                "Mark Taken"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const price = getPrice(matchedProduct);

  return (
    <Card className="border-primary/20 hover:border-primary/40 transition-colors">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          {matchedProduct.image_url && (
            <div className="flex-shrink-0">
              <img
                src={matchedProduct.image_url}
                alt={matchedProduct.name}
                className="w-16 h-16 object-cover rounded"
              />
            </div>
          )}

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="font-semibold text-sm line-clamp-1">
                  {matchedProduct.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {supplementText}
                </p>
              </div>
              {matchedProduct.evidence_level && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {matchedProduct.evidence_level}
                </Badge>
              )}
            </div>

            {matchedProduct.brand && (
              <p className="text-xs text-muted-foreground mb-2">
                by {matchedProduct.brand}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              <div className="text-lg font-bold text-primary">
                {price ? formatCurrency(price) : "Price N/A"}
              </div>
              
              <div className="flex gap-2 ml-auto">
                {onAddToCart && (
                  <Button
                    size="sm"
                    onClick={() => onAddToCart(matchedProduct)}
                    className="text-xs"
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Add to Cart
                  </Button>
                )}
                
                {matchedProduct.affiliate_link && (
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="text-xs"
                  >
                    <a
                      href={matchedProduct.affiliate_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Buy Now
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
