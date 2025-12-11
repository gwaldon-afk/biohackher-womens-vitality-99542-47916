import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { getLifeStageByAge, getDecadeLabel } from '@/data/lifeStageNutritionData';

interface ProductData {
  id: string;
  name: string;
  price_gbp: number | null;
  price_aud: number | null;
  image_url: string | null;
  evidence_level: string | null;
  brand: string | null;
}

export function LifeStageShopRecommendations() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [userAge, setUserAge] = useState<number | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAgeAndProducts = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      // Get user age
      const { data: profileData } = await supabase
        .from('user_health_profile')
        .select('date_of_birth')
        .eq('user_id', user.id)
        .single();
      
      if (profileData?.date_of_birth) {
        const dob = new Date(profileData.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        setUserAge(age);
        
        // Get recommended supplements for this life stage
        const lifeStage = getLifeStageByAge(age);
        const supplementNames = lifeStage.recommendedSupplements;
        
        // Search for matching products
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, price_gbp, price_aud, image_url, evidence_level, brand')
          .eq('is_active', true)
          .limit(6);
        
        if (productsData) {
          // Filter products that match recommended supplements
          const matchedProducts = productsData.filter(product => {
            const productNameLower = product.name.toLowerCase();
            return supplementNames.some(supplement => 
              productNameLower.includes(supplement.toLowerCase().split(' ')[0])
            );
          });
          
          // If not enough matches, include top products
          if (matchedProducts.length < 4) {
            const additionalProducts = productsData
              .filter(p => !matchedProducts.find(mp => mp.id === p.id))
              .slice(0, 4 - matchedProducts.length);
            setProducts([...matchedProducts, ...additionalProducts]);
          } else {
            setProducts(matchedProducts.slice(0, 4));
          }
        }
      }
      
      setIsLoading(false);
    };
    
    fetchUserAgeAndProducts();
  }, [user?.id]);

  const handleAddToCart = (product: ProductData) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price_aud || product.price_gbp || 0,
      image: product.image_url || '',
      brand: product.brand || '',
      dosage: '',
    });
  };

  const formatPrice = (product: ProductData): string => {
    const price = product.price_aud || product.price_gbp;
    if (!price) return 'Price not available';
    return `$${price.toFixed(2)} AUD`;
  };

  if (isLoading || !userAge || products.length === 0) {
    return null;
  }

  const currentDecade = getDecadeLabel(userAge);
  const lifeStage = getLifeStageByAge(userAge);

  return (
    <Card className="border-2 border-[#F8C5AC]/50 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Recommended for Your {currentDecade}
        </CardTitle>
        <CardDescription>
          Evidence-based supplements aligned with your life stage needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Supplement Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {lifeStage.recommendedSupplements.map((supplement, idx) => (
            <Badge key={idx} variant="secondary" className="bg-[#F8C5AC]/20">
              {supplement}
            </Badge>
          ))}
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors"
            >
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(product)}
                </p>
                {product.evidence_level && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {product.evidence_level}
                  </Badge>
                )}
              </div>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => handleAddToCart(product)}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => navigate('/shop')}
        >
          View All Supplements
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
