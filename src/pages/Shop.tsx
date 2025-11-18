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
import Navigation from "@/components/Navigation";
import SmartProductRecommendations from "@/components/SmartProductRecommendations";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/hooks/useLocale";
import { getProductPrice } from "@/services/productService";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/productService";
import type { Product as DbProduct } from "@/services/productService";

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
  useState(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
    }
  });
  
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

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand,
      dosage: product.dosage,
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const pillarConfig = [
    { value: "all", label: "All Products", icon: Sparkles, color: "text-primary" },
    { value: "beauty", label: "BEAUTY", icon: Sparkles, color: "text-pink-500" },
    { value: "brain", label: "BRAIN", icon: Brain, color: "text-purple-500" },
    { value: "body", label: "BODY", icon: Activity, color: "text-orange-500" },
    { value: "balance", label: "BALANCE", icon: Heart, color: "text-red-500" },
  ];

  const getEvidenceBadge = (level: string | null) => {
    if (!level) return null;
    
    const config = {
      gold: { className: "bg-yellow-500 text-black", label: "Gold" },
      silver: { className: "bg-gray-400 text-white", label: "Silver" },
      bronze: { className: "bg-orange-700 text-white", label: "Bronze" },
      emerging: { className: "bg-blue-500 text-white", label: "Emerging" }
    };
    
    const badge = config[level as keyof typeof config];
    if (!badge) return null;
    
    return (
      <Badge className={badge.className}>
        <Star className="h-3 w-3 mr-1" />
        {badge.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Shop Wellness Products</h1>
          <p className="text-muted-foreground">
            Evidence-based supplements and products to support your longevity journey
          </p>
        </div>

        {/* Assessment Context Banner */}
        {showAssessmentBanner && (
          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertDescription>
              Based on your assessment results, we recommend this product to support your health goals.
            </AlertDescription>
          </Alert>
        )}

        {/* Smart Recommendations - Authenticated Users Only */}
        {user && (
          <div className="mb-8">
            <SmartProductRecommendations />
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Pillar Navigation Tabs */}
        <Tabs value={selectedPillar} onValueChange={setSelectedPillar} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            {pillarConfig.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <TabsTrigger key={pillar.value} value={pillar.value} className="gap-2">
                  <Icon className={`h-4 w-4 ${pillar.color}`} />
                  {pillar.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Products Grid */}
          <TabsContent value={selectedPillar}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-96 w-full" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.id} 
                    className={`overflow-hidden hover:shadow-lg transition-shadow ${
                      highlightedProductId === product.id ? 'ring-2 ring-primary shadow-xl' : ''
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {getEvidenceBadge(product.evidence_level)}
                      </div>
                      {product.target_pillars && product.target_pillars.length > 0 && (
                        <Badge className="absolute top-2 left-2 bg-primary/90">
                          {product.target_pillars[0].toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        {/* Benefits */}
                        {product.benefits.length > 0 && (
                          <ul className="text-sm space-y-1">
                            {product.benefits.slice(0, 3).map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-1">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {/* Price and Add to Cart */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                          </div>
                          <Button
                            onClick={() => handleAddToCart(product)}
                            className="gap-2"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Health Disclaimer */}
        <Card className="mt-12 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>Health Disclaimer:</strong> These statements have not been evaluated by the FDA. 
              Products are not intended to diagnose, treat, cure, or prevent any disease. 
              Consult your healthcare provider before starting any supplement regimen.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Shop;
