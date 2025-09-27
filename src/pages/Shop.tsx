import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Moon, Heart, Thermometer, Brain, Pill, ShoppingCart, Star, Search, Filter, DollarSign } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);

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

  // Sample products organised by symptom categories
  const products: Product[] = [
    // Sleep Products
    {
      id: "sleep-mag-glycinate",
      name: "Magnesium Glycinate 400mg",
      description: "High-absorption magnesium for deep, restorative sleep and muscle relaxation",
      price: 24.99,
      originalPrice: 29.99,
      rating: 4.8,
      reviews: 1247,
      category: "sleep",
      symptoms: ["sleep", "anxiety", "muscle-tension"],
      image: "/api/placeholder/300/300",
      benefits: ["Improving sleep onset", "Reducing muscle tension", "Supporting nervous system"],
      dosage: "Suggested Use: Take 2 capsules 30-60 minutes before bed",
      brand: "Pure Encapsulations",
      inStock: true,
      featured: true
    },
    {
      id: "sleep-melatonin",
      name: "Slow-Release Melatonin 3mg",
      description: "Extended-release melatonin for sustained sleep throughout the night",
      price: 19.99,
      rating: 4.6,
      reviews: 892,
      category: "sleep",
      symptoms: ["sleep", "jet-lag", "shift-work"],
      image: "/api/placeholder/300/300",
      benefits: ["Regulating circadian rhythm", "Extending sleep duration", "Reducing wake-ups"],
      dosage: "Suggested Use: Take 1 tablet 1-2 hours before bedtime",
      brand: "Natrol",
      inStock: true
    },
    {
      id: "sleep-theanine",
      name: "L-Theanine 200mg",
      description: "Amino acid that promotes relaxation without drowsiness",
      price: 22.99,
      rating: 4.7,
      reviews: 634,
      category: "sleep",
      symptoms: ["sleep", "anxiety", "stress"],
      image: "/api/placeholder/300/300",
      benefits: ["Promoting calm alertness", "Reducing stress", "Improving sleep quality"],
      dosage: "Suggested Use: Take 1-2 capsules before bed or during stress",
      brand: "NOW Foods",
      inStock: true
    },

    // Hot Flashes Products
    {
      id: "hf-black-cohosh",
      name: "Black Cohosh Extract 80mg",
      description: "Standardized extract to help manage menopausal symptoms naturally",
      price: 27.99,
      originalPrice: 32.99,
      rating: 4.5,
      reviews: 543,
      category: "hot-flashes",
      symptoms: ["hot-flashes", "mood-swings", "night-sweats"],
      image: "/api/placeholder/300/300",
      benefits: ["Reducing hot flash frequency", "Supporting hormone balance", "Improving mood"],
      dosage: "Suggested Use: Take 1 capsule twice daily with meals",
      brand: "Gaia Herbs",
      inStock: true,
      featured: true
    },
    {
      id: "hf-red-clover",
      name: "Red Clover Isoflavones",
      description: "Natural phytoestrogens to support hormonal balance during menopause",
      price: 21.99,
      rating: 4.3,
      reviews: 287,
      category: "hot-flashes",
      symptoms: ["hot-flashes", "bone-health", "heart-health"],
      image: "/api/placeholder/300/300",
      benefits: ["Natural estrogen support", "Supporting bone health", "Supporting cardiovascular health"],
      dosage: "Suggested Use: Take 2 capsules daily with food",
      brand: "Nature's Way",
      inStock: true
    },

    // Joint Pain Products
    {
      id: "jp-turmeric-curcumin",
      name: "Turmeric Curcumin with Bioperine",
      description: "High-potency curcumin with black pepper extract for maximum absorption",
      price: 29.99,
      originalPrice: 39.99,
      rating: 4.9,
      reviews: 1856,
      category: "joint-pain",
      symptoms: ["joint-pain", "inflammation", "arthritis"],
      image: "/api/placeholder/300/300",
      benefits: ["Powerful anti-inflammatory", "Relieving joint pain", "Supporting mobility"],
      dosage: "Suggested Use: Take 2 capsules daily with meals",
      brand: "NatureWise",
      inStock: true,
      featured: true
    },
    {
      id: "jp-omega-3",
      name: "Ultra-Pure Omega-3 Fish Oil",
      description: "High-potency EPA/DHA for inflammation reduction and joint health",
      price: 34.99,
      rating: 4.7,
      reviews: 723,
      category: "joint-pain",
      symptoms: ["joint-pain", "inflammation", "heart-health"],
      image: "/api/placeholder/300/300",
      benefits: ["Reducing inflammation", "Supporting joint mobility", "Supporting heart health"],
      dosage: "Suggested Use: Take 2 softgels daily with meals",
      brand: "Nordic Naturals",
      inStock: true
    },
    {
      id: "jp-glucosamine",
      name: "Glucosamine Chondroitin MSM",
      description: "Triple-action formula for comprehensive joint support and cartilage health",
      price: 26.99,
      rating: 4.4,
      reviews: 456,
      category: "joint-pain",
      symptoms: ["joint-pain", "cartilage-health", "mobility"],
      image: "/api/placeholder/300/300",
      benefits: ["Supporting cartilage", "Improving joint flexibility", "Enhancing mobility"],
      dosage: "Suggested Use: Take 3 tablets daily with food",
      brand: "Doctor's Best",
      inStock: true
    },

    // Gut Health Products
    {
      id: "gut-digestive-enzymes",
      name: "Full-Spectrum Digestive Enzymes",
      description: "Comprehensive enzyme blend to support optimal digestion and nutrient absorption",
      price: 31.99,
      rating: 4.8,
      reviews: 934,
      category: "gut",
      symptoms: ["bloating", "indigestion", "nutrient-absorption"],
      image: "/api/placeholder/300/300",
      benefits: ["Improving digestion", "Reducing bloating", "Enhancing nutrient absorption"],
      dosage: "Suggested Use: Take 1-2 capsules with each meal",
      brand: "Enzymedica",
      inStock: true,
      featured: true
    },
    {
      id: "gut-probiotics",
      name: "50 Billion CFU Probiotic",
      description: "Multi-strain probiotic for digestive health and immune support",
      price: 39.99,
      originalPrice: 49.99,
      rating: 4.6,
      reviews: 1123,
      category: "gut",
      symptoms: ["gut-health", "immunity", "mood"],
      image: "/api/placeholder/300/300",
      benefits: ["Supporting digestive balance", "Supporting immune system", "Supporting mood regulation"],
      dosage: "Suggested Use: Take 1 capsule daily with or without food",
      brand: "Garden of Life",
      inStock: true
    },
    {
      id: "gut-fiber",
      name: "Prebiotic Fibre Complex",
      description: "Soluble and insoluble fibre blend to support healthy digestion",
      price: 23.99,
      rating: 4.5,
      reviews: 567,
      category: "gut",
      symptoms: ["constipation", "gut-health", "blood-sugar"],
      image: "/api/placeholder/300/300",
      benefits: ["Supporting regularity", "Feeding beneficial bacteria", "Supporting blood sugar balance"],
      dosage: "Suggested Use: Mix 1 scoop in 8oz water daily",
      brand: "Heather's Tummy Care",
      inStock: true
    },
    {
      id: "gut-betaine-hcl",
      name: "Betaine HCl with Pepsin",
      description: "Supports protein digestion and stomach acid production for optimal nutrient breakdown",
      price: 27.99,
      rating: 4.4,
      reviews: 423,
      category: "gut",
      symptoms: ["bloating", "protein-digestion", "nutrient-absorption"],
      image: "/api/placeholder/300/300",
      benefits: ["Supporting protein digestion", "Enhancing stomach acid production", "Improving nutrient breakdown"],
      dosage: "Suggested Use: Take 1 capsule with protein-containing meals",
      brand: "Thorne",
      inStock: true
    },
    {
      id: "gut-l-glutamine",
      name: "L-Glutamine Powder",
      description: "Pure L-glutamine amino acid to support intestinal lining and gut barrier function",
      price: 29.99,
      rating: 4.7,
      reviews: 645,
      category: "gut",
      symptoms: ["gut-health", "intestinal-permeability", "recovery"],
      image: "/api/placeholder/300/300",
      benefits: ["Supporting gut lining", "Enhancing intestinal barrier", "Supporting recovery"],
      dosage: "Suggested Use: Take 5g twice daily between meals",
      brand: "NOW Foods",
      inStock: true
    },
    {
      id: "gut-swedish-bitters",
      name: "Swedish Bitters Complex",
      description: "Traditional herbal blend with gentian root, dandelion, and artichoke to stimulate digestion",
      price: 24.99,
      rating: 4.3,
      reviews: 287,
      category: "gut",
      symptoms: ["bloating", "poor-digestion", "appetite"],
      image: "/api/placeholder/300/300",
      benefits: ["Stimulating digestive enzymes", "Supporting appetite", "Enhancing digestion"],
      dosage: "Suggested Use: Take 1-2 drops in water, 15 minutes before each meal",
      brand: "Gaia Herbs",
      inStock: true
    },
    {
      id: "gut-gentian-root",
      name: "Gentian Root Extract",
      description: "Pure gentian root extract to support digestive function and bile production",
      price: 21.99,
      rating: 4.2,
      reviews: 198,
      category: "gut",
      symptoms: ["poor-digestion", "bloating", "appetite"],
      image: "/api/placeholder/300/300",
      benefits: ["Supporting bile production", "Enhancing digestive function", "Stimulating appetite"],
      dosage: "Suggested Use: Take 1 capsule 20 minutes before meals",
      brand: "Planetary Herbals",
      inStock: true
    },

    // Brain Fog Products
    {
      id: "bf-lions-mane",
      name: "Lion's Mane Mushroom Extract",
      description: "Organic mushroom extract to support cognitive function and nerve health",
      price: 28.99,
      rating: 4.7,
      reviews: 445,
      category: "brain-fog",
      symptoms: ["brain-fog", "memory", "focus"],
      image: "/api/placeholder/300/300",
      benefits: ["Supporting cognitive function", "Supporting nerve growth factor", "Enhancing mental clarity"],
      dosage: "Suggested Use: Take 2 capsules daily with food",
      brand: "Host Defense",
      inStock: true
    },
    {
      id: "bf-b-complex",
      name: "Active B-Complex",
      description: "Methylated B vitamins for energy production and brain function",
      price: 25.99,
      rating: 4.8,
      reviews: 692,
      category: "brain-fog",
      symptoms: ["brain-fog", "energy", "mood"],
      image: "/api/placeholder/300/300",
      benefits: ["Supporting mental energy", "Supporting neurotransmitters", "Building stress resilience"],
      dosage: "Suggested Use: Take 1 capsule daily with breakfast",
      brand: "Thorne",
      inStock: true
    }
  ];

  const categories = [
    { id: "all", name: "All Products", icon: ShoppingCart },
    { id: "sleep", name: "Sleep Support", icon: Moon },
    { id: "hot-flashes", name: "Hormone Balance", icon: Thermometer },
    { id: "joint-pain", name: "Joint Health", icon: Heart },
    { id: "gut", name: "Digestive Health", icon: Pill },
    { id: "brain-fog", name: "Cognitive Support", icon: Brain }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.symptoms.some(symptom => symptom.includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredProducts = products.filter(product => product.featured);

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

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="text-xs">
            {categories.find(cat => cat.id === product.category)?.name}
          </Badge>
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

        {/* Featured Products */}
        {featuredProducts.length > 0 && selectedCategory === "all" && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="h-6 w-6 text-warning" />
              Featured Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
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
                  {category.id === "hot-flashes" && "Hormone-balancing products for menopausal comfort"}
                  {category.id === "joint-pain" && "Anti-inflammatory supplements for joint health and mobility"}
                  {category.id === "gut" && "Digestive support for optimal gut health and comfort"}
                  {category.id === "brain-fog" && "Cognitive enhancers for mental clarity and focus"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or browse other categories.
                  </p>
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