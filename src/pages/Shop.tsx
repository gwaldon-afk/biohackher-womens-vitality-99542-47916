import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Moon, Heart, Thermometer, Brain, Pill, ShoppingCart, Star, Search, Filter, DollarSign, Sparkles, Zap, Shield } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/productService";
import type { Product as DbProduct } from "@/services/productService";
import bodyPillar from "@/assets/body-pillar.png";
import balancePillar from "@/assets/balance-pillar.png";
import brainPillar from "@/assets/brain-pillar.png";
import beautyPillar from "@/assets/beauty-pillar.png";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  symptoms: string[];
  image: string;
  benefits: string[];
  dosage: string;
  brand: string;
  inStock: boolean;
  featured?: boolean;
}

const Shop = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);

  // Fetch products from database
  const { data: dbProducts, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  console.log('[Shop] Query state:', { isLoading, hasData: !!dbProducts, dataLength: dbProducts?.length, error });

  // Convert database products to local format
  const products: Product[] = (dbProducts || []).map(dbProduct => ({
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    price: dbProduct.price_gbp || dbProduct.price_usd || 0,
    rating: 4.5, // Default rating - could be added to DB later
    reviews: 100, // Default reviews - could be added to DB later
    category: dbProduct.category,
    symptoms: Array.isArray(dbProduct.target_symptoms) ? dbProduct.target_symptoms as string[] : [],
    image: dbProduct.image_url || "/api/placeholder/300/300",
    benefits: Array.isArray(dbProduct.benefits) ? dbProduct.benefits as string[] : [],
    dosage: dbProduct.usage_instructions || "Follow package directions",
    brand: dbProduct.brand || "Quality Brand",
    inStock: true,
    featured: dbProduct.evidence_level === 'gold'
  }));

  // Check for payment status in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      toast({
        title: "Payment Successful!",
        description: "Your order has been processed. You should receive a confirmation email shortly.",
      });
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      toast({
        variant: "destructive",
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again anytime.",
      });
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  // Show error toast if products fail to load
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error Loading Products",
        description: "Failed to load products. Please try again later.",
      });
    }
  }, [error, toast]);

  const categories = [
    { id: "all", name: "All Products", icon: ShoppingCart },
    { id: "sleep", name: "Sleep Support", icon: Moon },
    { id: "hormone-balance", name: "Hormone Balance", icon: Thermometer },
    { id: "stress", name: "Stress & Mood", icon: Heart },
    { id: "brain-fog", name: "Cognitive Support", icon: Brain },
    { id: "beauty", name: "Beauty & Skin", icon: Sparkles },
    { id: "energy", name: "Energy & Vitality", icon: Zap },
    { id: "immune", name: "Immune Support", icon: Shield }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.symptoms.some(symptom => symptom.includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Hero products - one from each pillar
  const pillarHeroProducts = [
    { name: "Collagen Peptides", pillar: "Body", logo: bodyPillar },
    { name: "Ashwagandha KSM-66", pillar: "Balance", logo: balancePillar },
    { name: "Ginkgo Biloba Extract", pillar: "Brain", logo: brainPillar },
    { name: "Hyaluronic Acid", pillar: "Beauty", logo: beautyPillar }
  ];

  const heroProducts = pillarHeroProducts
    .map(hero => ({
      product: products.find(p => p.name === hero.name),
      pillar: hero.pillar,
      logo: hero.logo
    }))
    .filter(item => item.product);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      action: (
        <Button variant="outline" size="sm" onClick={() => setIsCartOpen(true)}>
          View Cart
        </Button>
      )
    });
  };

  const handleBuyNow = async (product: Product) => {
    if (isProcessingPayment) return;
    
    setIsProcessingPayment(product.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          productId: product.name,
          priceAmount: product.price
        },
        headers: user ? {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        } : {}
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe Checkout in a new tab
        window.open(data.url, '_blank');
        toast({
          title: "Redirecting to Payment",
          description: "A new tab has opened for secure payment processing.",
        });
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "Failed to process payment. Please try again.",
      });
    } finally {
      setIsProcessingPayment(null);
    }
  };

  const ProductCard = ({ product, pillarLogo, pillarName }: { product: Product; pillarLogo?: string; pillarName?: string }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          {pillarLogo && pillarName ? (
            <div className="flex items-center gap-2">
              <img src={pillarLogo} alt={pillarName} className="h-8 w-8 object-contain" />
              <Badge variant="outline" className="text-xs">
                {pillarName} Pillar
              </Badge>
            </div>
          ) : (
            <Badge variant="outline" className="text-xs">
              {categories.find(cat => cat.id === product.category)?.name}
            </Badge>
          )}
          {product.featured && (
            <Badge className="bg-warning/10 text-warning border-warning/20">
              Featured
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </CardTitle>
        <CardDescription className="text-sm line-clamp-3">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-warning fill-warning' : 'text-muted-foreground'}`} 
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {product.rating} ({product.reviews} reviews)
          </span>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-success">May Support:</h4>
          <div className="flex flex-wrap gap-1">
            {product.benefits.slice(0, 3).map((benefit, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {benefit}
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Suggested Use:</strong> {product.dosage.replace('Suggested Use: ', '')}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            <strong>Brand:</strong> {product.brand}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAddToCart(product)}
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
            <Button 
              size="sm"
              onClick={() => handleBuyNow(product)}
              disabled={!product.inStock || isProcessingPayment === product.id}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              {isProcessingPayment === product.id ? "Processing..." : "Buy Now"}
            </Button>
          </div>
        </div>

        {!product.inStock && (
          <div className="text-center text-sm text-destructive font-medium">
            Out of Stock
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            Wellness Shop
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Evidence-based supplements and products to support your health journey. 
            Each product is carefully selected based on scientific research and quality standards.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products, symptoms, or ingredients..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Hero Products Carousel */}
        {heroProducts.length > 0 && selectedCategory === "all" && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="h-6 w-6 text-warning" />
              Pillar Hero Products
            </h2>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {heroProducts.map((item) => (
                  <CarouselItem key={item.product!.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                    <ProductCard 
                      product={item.product!} 
                      pillarLogo={item.logo}
                      pillarName={item.pillar}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex flex-col items-center p-3">
                <category.icon className="h-4 w-4 mb-1" />
                <span className="text-xs">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {category.name}
                </h2>
                <p className="text-muted-foreground">
                  {category.id === "all" && "Browse our complete selection of wellness products"}
                  {category.id === "sleep" && "Natural supplements to improve sleep quality and duration"}
                  {category.id === "hormone-balance" && "Hormone-balancing products for women's health and vitality"}
                  {category.id === "stress" && "Adaptogenic herbs and supplements for stress resilience and mood balance"}
                  {category.id === "brain-fog" && "Cognitive enhancers for mental clarity and focus"}
                  {category.id === "beauty" && "Science-backed supplements for skin, hair, and beauty from within"}
                  {category.id === "energy" && "Cellular energy support for vitality and endurance"}
                  {category.id === "immune" && "Immune system strengthening and antioxidant protection"}
                </p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-6 w-full mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-32 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or browse other categories.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Disclaimer */}
        <div className="mt-12 bg-muted/30 p-6 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Important:</strong> These statements have not been evaluated by the FDA. 
            These products are not intended to diagnose, treat, cure, or prevent any disease. 
            Consult with a healthcare professional before starting any new supplement regimen, 
            especially if you have medical conditions or take medications.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Shop;