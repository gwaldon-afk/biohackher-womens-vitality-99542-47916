import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Sparkles, ShoppingCart, Star } from "lucide-react";
import { useAssessmentProducts } from "@/hooks/useAssessmentProducts";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const SmartProductRecommendations = () => {
  const { data: products, isLoading } = useAssessmentProducts();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price_gbp || product.price_usd || 0,
      image: product.image_url || "/placeholder.svg",
      brand: product.brand || "Quality Brand",
      dosage: product.usage_instructions || "Follow package directions",
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Recommended For You</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Recommended For You</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Based on your assessment results, these products can help support your health goals
        </p>
      </CardHeader>
      <CardContent>
        <Carousel className="w-full">
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full">
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-md"
                      />
                      {product.evidence_level === 'gold' && (
                        <Badge className="absolute top-2 right-2 bg-yellow-500 text-black">
                          <Star className="h-3 w-3 mr-1" />
                          Gold
                        </Badge>
                      )}
                      {product.target_pillars && product.target_pillars.length > 0 && (
                        <Badge className="absolute top-2 left-2 bg-primary/90">
                          {product.target_pillars[0].toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-lg font-bold">
                        £{(product.price_gbp || 0).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  );
};

export default SmartProductRecommendations;
