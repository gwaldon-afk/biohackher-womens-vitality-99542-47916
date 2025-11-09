import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Utensils, Dumbbell, Sparkles, Heart, ShoppingCart, Info } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useLocale } from "@/hooks/useLocale";
import { useQuery } from "@tanstack/react-query";
import { getProducts, Product } from "@/services/productService";
import { useEvidenceStore } from "@/stores/evidenceStore";
import { toast } from "sonner";

interface ProtocolItem {
  id: string;
  name: string;
  details?: string;
  item_type: string;
  time_of_day?: string[];
  is_active: boolean;
}

interface ProtocolItemRowProps {
  item: ProtocolItem;
  completed?: boolean;
  onToggle?: (id: string) => void;
  showBuyButton?: boolean;
}

const getItemIcon = (itemType: string) => {
  const iconMap: Record<string, any> = {
    supplement: Package,
    diet: Utensils,
    exercise: Dumbbell,
    therapy: Sparkles,
    habit: Heart,
  };
  return iconMap[itemType] || Heart;
};

export const ProtocolItemRow = ({ item, completed, onToggle, showBuyButton }: ProtocolItemRowProps) => {
  const Icon = getItemIcon(item.item_type);
  const { addToCart } = useCart();
  const { getCurrentLocale } = useLocale();
  const { openEvidence } = useEvidenceStore();

  // Fetch products for matching
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    enabled: item.item_type === 'supplement'
  });

  // Extract core keywords from supplement/product names
  const extractKeywords = (name: string): string[] => {
    // Remove dosages and parentheses content
    let cleaned = name.replace(/\([^)]*\)/g, '').trim();
    // Remove common prefixes
    cleaned = cleaned.replace(/^(ultra-pure|pure|high-potency|premium|advanced|complex)\s+/gi, '');
    // Split on + and common separators, filter short words
    return cleaned.split(/[\s+/]+/).filter(word => word.length > 2);
  };

  // Match supplement to product using keyword matching
  const matchProduct = (supplementName: string): Product | undefined => {
    const suppKeywords = extractKeywords(supplementName);
    
    return products.find(product => {
      const prodKeywords = extractKeywords(product.name);
      
      // Check if at least 1 major keyword matches
      return suppKeywords.some(suppKey =>
        prodKeywords.some(prodKey =>
          suppKey.toLowerCase().includes(prodKey.toLowerCase()) ||
          prodKey.toLowerCase().includes(suppKey.toLowerCase())
        )
      );
    });
  };

  const matchedProduct = item.item_type === 'supplement' ? matchProduct(item.name) : undefined;

  const handleBuyNow = () => {
    if (matchedProduct) {
      const currency = getCurrentLocale().currency;
      const price = currency === 'USD' ? matchedProduct.price_usd :
                    currency === 'AUD' ? matchedProduct.price_aud :
                    currency === 'CAD' ? matchedProduct.price_cad :
                    matchedProduct.price_gbp;

      addToCart({
        id: matchedProduct.id,
        name: matchedProduct.name,
        price: price || 0,
        image: matchedProduct.image_url || '/placeholder.svg',
        brand: matchedProduct.brand || '',
        dosage: matchedProduct.usage_instructions || '',
        quantity: 1
      });
      
      toast.success(`${matchedProduct.name} added to cart`);
    }
  };

  const handleViewEvidence = () => {
    openEvidence(
      item.name,
      `Research Evidence for ${item.name}`,
      `Scientific research supporting ${item.name} for health optimization.`,
      { category: item.item_type }
    );
  };
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      {onToggle && (
        <Checkbox
          checked={completed}
          onCheckedChange={() => onToggle(item.id)}
        />
      )}
      <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{item.name}</p>
        {item.details && (
          <p className="text-sm text-muted-foreground truncate">{item.details}</p>
        )}
      </div>
      {item.time_of_day && item.time_of_day.length > 0 && (
        <Badge variant="outline" className="flex-shrink-0 text-xs">
          {item.time_of_day[0]}
        </Badge>
      )}
      {item.item_type === 'supplement' && showBuyButton && (
        <>
          <Button size="sm" variant="ghost" className="flex-shrink-0 h-8 px-2" onClick={handleViewEvidence}>
            <Info className="w-4 h-4" />
          </Button>
          {matchedProduct && (
            <Button size="sm" variant="outline" className="flex-shrink-0 h-8 px-2" onClick={handleBuyNow}>
              <ShoppingCart className="w-4 h-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};
