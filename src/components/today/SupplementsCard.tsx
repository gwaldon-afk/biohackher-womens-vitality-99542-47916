import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pill, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DailyAction } from "@/hooks/useDailyPlan";
import { useQuery } from "@tanstack/react-query";
import { getProducts, Product } from "@/services/productService";
import { SupplementProductCard } from "@/components/SupplementProductCard";
import { useCart } from "@/hooks/useCart";
import { useLocale } from "@/hooks/useLocale";
import { formatProductPrice } from "@/services/productService";
import { toast } from "sonner";

interface SupplementsCardProps {
  supplements: DailyAction[];
  onToggle: (actionId: string) => void;
}

export const SupplementsCard = ({ supplements, onToggle }: SupplementsCardProps) => {
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { getCurrentLocale } = useLocale();
  const currentLocale = getCurrentLocale();
  
  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  // Match supplements to products
  const matchProduct = (supplementName: string): Product | undefined => {
    return products.find(product => 
      product.name.toLowerCase().includes(supplementName.toLowerCase()) ||
      supplementName.toLowerCase().includes(product.name.toLowerCase())
    );
  };

  const handleAddToCart = (product: Product, supplementAction: DailyAction) => {
    const currency = currentLocale.currency;
    
    const price = currency === 'USD' ? product.price_usd :
                  currency === 'AUD' ? product.price_aud :
                  currency === 'CAD' ? product.price_cad :
                  product.price_gbp;

    addToCart({
      id: product.id,
      name: product.name,
      price: price || 0,
      image: product.image_url || '/placeholder.svg',
      brand: product.brand || '',
      dosage: product.usage_instructions || '',
      quantity: 1
    });
    
    toast.success(`${product.name} added to cart`);
    onToggle(supplementAction.id); // Mark as taken
  };

  // Group supplements by time of day
  const groupedSupplements = supplements.reduce((acc, supp) => {
    const timeSlots = supp.timeOfDay || ['morning'];
    timeSlots.forEach(time => {
      if (!acc[time]) acc[time] = [];
      acc[time].push(supp);
    });
    return acc;
  }, {} as Record<string, DailyAction[]>);

  if (supplements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pill className="w-5 h-5" />
            Supplements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">No supplements in your protocol</p>
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => navigate('/shop')}
          >
            <ShoppingCart className="w-4 h-4" />
            Shop Supplements
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Pill className="w-5 h-5" />
          Supplements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedSupplements).map(([time, items]) => (
          <div key={time} className="space-y-3">
            <p className="text-sm font-medium capitalize text-muted-foreground">{time}</p>
            <div className="space-y-3">
              {items.map(supplement => {
                const matchedProduct = matchProduct(supplement.title);
                
                return (
                  <div key={supplement.id} className="space-y-2">
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                      <Checkbox
                        checked={supplement.completed}
                        onCheckedChange={() => onToggle(supplement.id)}
                      />
                      <div className="flex-1">
                        <span className={supplement.completed ? "line-through text-muted-foreground text-sm" : "text-sm font-medium"}>
                          {supplement.title}
                        </span>
                        {supplement.description && (
                          <p className="text-xs text-muted-foreground mt-1">{supplement.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {matchedProduct && (
                      <div className="ml-8">
                        <SupplementProductCard
                          supplementText={supplement.title}
                          matchedProduct={matchedProduct}
                          onAddToCart={() => handleAddToCart(matchedProduct, supplement)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          className="w-full gap-2 mt-4"
          onClick={() => navigate('/shop')}
        >
          <ShoppingCart className="w-4 h-4" />
          Shop Supplements
        </Button>
      </CardContent>
    </Card>
  );
};
