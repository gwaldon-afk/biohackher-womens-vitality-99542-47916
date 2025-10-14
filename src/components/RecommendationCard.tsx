// Recommendation card component for displaying personalized product/toolkit recommendations
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShoppingCart, Sparkles } from "lucide-react";

interface RecommendationCardProps {
  id: string;
  name: string;
  description: string;
  category?: string;
  relevanceScore?: number;
  image_url?: string;
  affiliate_link?: string;
  onAddToCart?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export function RecommendationCard({
  id,
  name,
  description,
  category,
  relevanceScore,
  image_url,
  affiliate_link,
  onAddToCart,
  onViewDetails
}: RecommendationCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <Badge variant="secondary" className="text-xs">
                Recommended for you
              </Badge>
            </div>
            <CardTitle className="text-lg line-clamp-2">{name}</CardTitle>
            {category && (
              <CardDescription className="mt-1">{category}</CardDescription>
            )}
          </div>
          {image_url && (
            <img 
              src={image_url} 
              alt={name}
              className="w-16 h-16 object-cover rounded"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
          {description}
        </p>
        
        <div className="flex gap-2 mt-4">
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(id)}
              className="flex-1"
            >
              View Details
            </Button>
          )}
          
          {affiliate_link ? (
            <Button
              size="sm"
              onClick={() => window.open(affiliate_link, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Buy Now
            </Button>
          ) : onAddToCart ? (
            <Button 
              size="sm"
              onClick={() => onAddToCart(id)}
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add to Cart
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
