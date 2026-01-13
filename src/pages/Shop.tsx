import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, Heart, Brain, ShoppingCart, Star, Search, Sparkles, Zap } from "lucide-react";
import SmartProductRecommendations from "@/components/SmartProductRecommendations";
import { EmptyShopState } from "@/components/shop/EmptyShopState";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/hooks/useLocale";
import { getProductPrice } from "@/services/productService";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/productService";
import type { Product as DbProduct } from "@/services/productService";
import { shopAnalytics } from "@/utils/shopAnalytics";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { useTranslation } from "react-i18next";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  category: string;
  target_pillars: string[] | null;
  image: string;
  benefits: string[];
  dosage: string;
  brand: string;
  inStock: boolean;
  evidence_level: string | null;
}

const Shop = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { getCurrentLocale, formatCurrency } = useLocale();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPillar, setSelectedPillar] = useState("all");
  const [searchParams] = useSearchParams();
  
  const locale = getCurrentLocale();
  const userCurrency = locale.currency;
  
  // Check for query parameters
  const highlightedProductId = searchParams.get('product');
  const fromAssessment = searchParams.get('from');
  const initialSearch = searchParams.get('search') || "";
  
  // Set initial search term from URL
  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);
  
  // Show contextual banner if coming from assessment
  const showAssessmentBanner = fromAssessment && highlightedProductId;

  // Fetch products from database
  const { data: dbProducts, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  // Convert database products to local format with localized pricing
  const products: Product[] = (dbProducts || []).map(dbProduct => ({
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    price: getProductPrice(dbProduct, userCurrency) || 0,
    rating: 4.5,
    category: dbProduct.category,
    target_pillars: dbProduct.target_pillars,
    image: dbProduct.image_url || "/placeholder.svg",
    benefits: Array.isArray(dbProduct.benefits) ? dbProduct.benefits as string[] : [],
    dosage: dbProduct.usage_instructions || "Follow package directions",
    brand: dbProduct.brand || "Quality Brand",
    inStock: true,
    evidence_level: dbProduct.evidence_level
  }));

  // Filter products by pillar and search
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedPillar === "all") {
      return matchesSearch;
    }
    
    return matchesSearch && 
           product.target_pillars?.some(p => p.toLowerCase() === selectedPillar);
  });

  // Track page view
  useEffect(() => {
    shopAnalytics.viewShop(selectedPillar);
  }, [selectedPillar]);

  // Track search
  useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(() => {
        shopAnalytics.search(searchTerm, filteredProducts.length);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, filteredProducts.length]);

  // Highlight product if coming from assessment
  useEffect(() => {
    if (highlightedProductId && fromAssessment) {
      setTimeout(() => {
        const element = document.getElementById(`product-${highlightedProductId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
          }, 3000);
        }
      }, 500);
    }
  }, [highlightedProductId, fromAssessment]);

  const handleAddToCart = (product: Product) => {
    const price = product.price;
    
    addToCart({
      id: product.id,
      name: product.name,
      price,
      image: product.image,
      brand: product.brand,
      dosage: product.dosage,
    });
    
    // Track analytics
    shopAnalytics.addToCart(product.id, product.name, price, fromAssessment ? 'assessment' : 'shop');
    
    toast({
      title: t('shop.toasts.addedToCart'),
      description: t('shop.toasts.addedToCartDesc', { name: product.name }),
    });
  };

  const pillarConfig = [
    { value: "all", label: t('shop.pillars.all'), icon: Sparkles },
    { value: "beauty", label: t('shop.pillars.beauty'), icon: Sparkles },
    { value: "brain", label: t('shop.pillars.brain'), icon: Brain },
    { value: "body", label: t('shop.pillars.body'), icon: Activity },
    { value: "balance", label: t('shop.pillars.balance'), icon: Heart },
  ];

  const getEvidenceBadge = (evidenceLevel: string | null) => {
    if (!evidenceLevel) return null;
    
    const config = {
      gold: { color: "bg-yellow-500 text-black", label: t('shop.evidence.gold') },
      silver: { color: "bg-gray-400 text-black", label: t('shop.evidence.silver') },
      bronze: { color: "bg-orange-600 text-white", label: t('shop.evidence.bronze') },
      emerging: { color: "bg-blue-500 text-white", label: t('shop.evidence.emerging') }
    };

    const badge = config[evidenceLevel as keyof typeof config];
    if (!badge) return null;

    return (
      <Badge className={badge.color}>
        <Star className="h-3 w-3 mr-1" />
        {badge.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('shop.title')}</h1>
          <p className="text-muted-foreground">
            {t('shop.subtitle')}
          </p>
        </div>

        {/* Assessment Banner */}
        {showAssessmentBanner && (
          <Alert className="mb-6 border-primary bg-primary/5">
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              {t('shop.banner.assessmentRecommendations')}
            </AlertDescription>
          </Alert>
        )}

        {/* Smart Recommendations - Authenticated Users Only */}
        {user && FEATURE_FLAGS.SHOP_SMART_RECOMMENDATIONS && (
          <div className="mb-8">
            <SmartProductRecommendations />
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('shop.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Pillar Navigation */}
        <Tabs value={selectedPillar} onValueChange={setSelectedPillar} className="mb-8">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            {pillarConfig.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <TabsTrigger
                  key={pillar.value}
                  value={pillar.value}
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{pillar.label}</span>
                  <span className="sm:hidden">{pillar.label.charAt(0)}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </>
          )}

          {!isLoading && filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              id={`product-${product.id}`}
              className="flex flex-col transition-all hover:shadow-lg"
            >
              <CardHeader className="pb-4">
                <div className="relative mb-4 rounded-lg overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {getEvidenceBadge(product.evidence_level)}
                  </div>
                  {product.target_pillars && product.target_pillars.length > 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-primary/90">
                        {product.target_pillars[0].toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg line-clamp-2 h-14">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2">{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {product.benefits && product.benefits.length > 0 && (
                  <div className="mb-4">
                    <ul className="space-y-1">
                      {product.benefits.slice(0, 3).map((benefit, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span className="line-clamp-1">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
                    <Badge variant="outline" className="text-xs">
                      {product.inStock ? t('shop.product.inStock') : t('shop.product.outOfStock')}
                    </Badge>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {t('shop.product.addToCart')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {!isLoading && filteredProducts.length === 0 && (
            <div className="col-span-full">
              <EmptyShopState variant="no-products" />
            </div>
          )}
        </div>

        {/* Health Disclaimer */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">{t('shop.disclaimer.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('shop.disclaimer.content')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Shop;
