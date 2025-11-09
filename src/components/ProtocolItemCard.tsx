import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pill, Dumbbell, Heart, Utensils, Activity, ExternalLink, Edit, Trash2, Info, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useLocale } from "@/hooks/useLocale";
import { useQuery } from "@tanstack/react-query";
import { getProducts, Product } from "@/services/productService";
import { SupplementProductCard } from "@/components/SupplementProductCard";
import { useEvidenceStore } from "@/stores/evidenceStore";
import { toast } from "sonner";

interface ProtocolItem {
  id: string;
  item_type: 'supplement' | 'therapy' | 'habit' | 'exercise' | 'diet';
  name: string;
  description: string | null;
  dosage: string | null;
  frequency: string;
  time_of_day: string[] | null;
  notes: string | null;
  product_link: string | null;
  is_active: boolean;
}

interface ProtocolItemCardProps {
  item: ProtocolItem;
  completed?: boolean;
  onToggleComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const typeIcons = {
  supplement: Pill,
  therapy: Heart,
  habit: Activity,
  exercise: Dumbbell,
  diet: Utensils
};

const typeColors = {
  supplement: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  therapy: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  habit: 'bg-green-500/10 text-green-500 border-green-500/20',
  exercise: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  diet: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
};

export const ProtocolItemCard = ({
  item,
  completed = false,
  onToggleComplete,
  onEdit,
  onDelete,
  showActions = false
}: ProtocolItemCardProps) => {
  const Icon = typeIcons[item.item_type];
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

  const handleAddToCart = (product: Product) => {
    const currency = getCurrentLocale().currency;
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
    <Card className={`transition-all ${completed ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {onToggleComplete && (
            <Checkbox
              checked={completed}
              onCheckedChange={onToggleComplete}
              className="mt-1"
            />
          )}
          
          <div className={`p-2 rounded-lg ${typeColors[item.item_type]}`}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className={`font-semibold ${completed ? 'line-through' : ''}`}>
                  {item.name}
                </h4>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                )}
              </div>
              
              {showActions && (
                <div className="flex gap-1">
                  {onEdit && (
                    <Button variant="ghost" size="sm" onClick={onEdit}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="ghost" size="sm" onClick={onDelete}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {item.dosage && (
                <Badge variant="outline" className="text-xs">
                  {item.dosage}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {item.frequency.replace('_', ' ')}
              </Badge>
              {item.time_of_day && item.time_of_day.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {item.time_of_day.join(', ')}
                </Badge>
              )}
            </div>

            {item.notes && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                {item.notes}
              </p>
            )}

            {item.product_link && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 mt-2"
                onClick={() => window.open(item.product_link!, '_blank')}
              >
                View Product <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            )}

            {item.item_type === 'supplement' && (
              <div className="flex gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleViewEvidence}
                >
                  <Info className="h-3 w-3 mr-1" />
                  Evidence
                </Button>
                {matchedProduct && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleAddToCart(matchedProduct)}
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Add to Cart
                  </Button>
                )}
              </div>
            )}

            {matchedProduct && (
              <div className="mt-3 pt-3 border-t">
                <SupplementProductCard
                  supplementText={item.name}
                  matchedProduct={matchedProduct}
                  onAddToCart={() => handleAddToCart(matchedProduct)}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
