import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { Package, ShoppingCart, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { matchProductsToAssessment, calculateBundlePrice } from "@/utils/productMatcher";

interface AssessmentData {
  id: string;
  symptom_type: string;
  overall_score: number;
  completed_at: string;
}

const MyProtocol = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAssessments();
    }
  }, [user]);

  const fetchAssessments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('symptom_assessments')
        .select('id, symptom_type, overall_score, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      
      // Get unique assessments by symptom type (most recent for each)
      const uniqueAssessments = data?.reduce((acc: AssessmentData[], current) => {
        if (!acc.find(item => item.symptom_type === current.symptom_type)) {
          acc.push(current);
        }
        return acc;
      }, []) || [];
      
      setAssessments(uniqueAssessments);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast({
        variant: "destructive",
        title: "Loading Error",
        description: "Failed to load your protocol data."
      });
    } finally {
      setLoading(false);
    }
  };

  // Get all product recommendations across all assessments
  const allRecommendations = assessments.flatMap(assessment => {
    const products = matchProductsToAssessment(assessment.symptom_type, assessment.overall_score);
    return products.map(product => ({
      ...product,
      symptomType: assessment.symptom_type,
      assessmentId: assessment.id
    }));
  });

  // Remove duplicates based on product id
  const uniqueRecommendations = Array.from(
    new Map(allRecommendations.map(item => [item.id, item])).values()
  );

  const bundlePricing = calculateBundlePrice(uniqueRecommendations);
  const protocolCompletion = assessments.length > 0 
    ? Math.round((uniqueRecommendations.length / (assessments.length * 3)) * 100)
    : 0;

  const getSymptomName = (symptomId: string) => {
    const nameMap: Record<string, string> = {
      "hot-flashes": "Hot Flushes",
      "sleep": "Sleep",
      "joint-pain": "Joint Pain",
      "brain-fog": "Brain Fog",
      "gut": "Gut Health",
      "anxiety": "Anxiety",
      "balance-hormonal-balance-evaluation": "Hormonal Balance",
      "brain-brain-fog-assessment": "Brain Fog",
      "body-energy-&-fatigue-assessment": "Energy & Fatigue"
    };
    return nameMap[symptomId] || symptomId;
  };

  const handleAddToCart = (productId: string) => {
    const product = uniqueRecommendations.find(p => p.id === productId);
    if (product) {
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`
      });
    }
  };

  const handleAddAllToCart = () => {
    toast({
      title: "Protocol Added!",
      description: `Complete protocol with ${uniqueRecommendations.length} supplements added to cart.`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Loading your protocol...</p>
          </div>
        </main>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Protocol Yet</h2>
              <p className="text-muted-foreground mb-6">
                Complete your first symptom assessment to receive personalized supplement recommendations.
              </p>
              <Button onClick={() => navigate('/symptoms')}>
                Take Your First Assessment
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            My <span className="text-primary">Personalized Protocol</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Your complete supplement protocol based on {assessments.length} completed assessment{assessments.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Protocol Completion Status */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle>Protocol Completion</CardTitle>
            <CardDescription>Track your wellness supplement protocol</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-2xl font-bold text-primary">{protocolCompletion}%</span>
              </div>
              <Progress value={protocolCompletion} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {uniqueRecommendations.length} supplements recommended across {assessments.length} health area{assessments.length > 1 ? 's' : ''}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Supplements by Pillar */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {assessments.map((assessment) => {
            const products = matchProductsToAssessment(assessment.symptom_type, assessment.overall_score);
            if (products.length === 0) return null;

            return (
              <Card key={assessment.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{getSymptomName(assessment.symptom_type)}</CardTitle>
                  <CardDescription>
                    Based on your score of {assessment.overall_score}/100
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div 
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{product.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {product.tier}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{product.dosage}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">${product.price}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAddToCart(product.id)}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Complete Protocol Bundle */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Complete Protocol Bundle</CardTitle>
            </div>
            <CardDescription>
              Save time and money with your complete personalized protocol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Pricing Summary */}
              <div className="p-6 bg-background/60 rounded-lg border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${bundlePricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-success">Bundle Discount (10%)</span>
                  <span className="font-semibold text-success">-${bundlePricing.savings.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border my-4"></div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-3xl font-bold text-primary">${bundlePricing.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Bundle Benefits */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Save 10%</p>
                    <p className="text-xs text-muted-foreground">Bundle discount applied</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Science-Backed</p>
                    <p className="text-xs text-muted-foreground">Evidence-based selection</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Personalized</p>
                    <p className="text-xs text-muted-foreground">Based on your assessments</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleAddAllToCart}
              >
                <Package className="h-5 w-5 mr-2" />
                Add Complete Protocol to Cart
              </Button>

              {/* Subscription Option */}
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <p className="text-sm font-medium mb-1">Subscribe & Save 15%</p>
                <p className="text-xs text-muted-foreground">
                  Get your protocol delivered monthly for ${(bundlePricing.total * 0.85).toFixed(2)}/month
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Learn More About Subscriptions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Optimize Your Protocol</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/symptoms')}
            >
              Take More Assessments to Expand Your Protocol
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/shop')}
            >
              Browse All Supplements in Shop
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/dashboard')}
            >
              View Your Health Dashboard
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MyProtocol;
