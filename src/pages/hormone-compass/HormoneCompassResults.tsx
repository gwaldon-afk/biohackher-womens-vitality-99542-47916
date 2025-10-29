import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HormoneCompassStageCompass } from "@/components/hormone-compass/HormoneCompassStageCompass";
import { CheckCircle, ArrowRight, Download, ShoppingCart, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchProductsBySymptoms, formatProductPrice, type Product } from "@/services/productService";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateProtocolFromHormoneStage, updateUserProfileAfterAssessment } from "@/services/assessmentProtocolService";
import { useState } from "react";
import { AssessmentAIAnalysisCard } from "@/components/AssessmentAIAnalysisCard";

const STAGE_INFO = {
  'pre': {
    title: 'Pre-Menopause',
    description: 'Your cycles are still regular, and you\'re not experiencing significant hormonal changes yet.',
    targetSymptoms: ['energy', 'mood', 'cycle_support'],
    recommendations: [
      'Focus on establishing healthy habits now',
      'Track your cycles to establish a baseline',
      'Consider preventive nutrition and exercise',
      'Monitor energy and mood patterns'
    ]
  },
  'early-peri': {
    title: 'Early Perimenopause',
    description: 'You\'re beginning to experience subtle hormonal shifts. Cycles may become slightly irregular.',
    targetSymptoms: ['sleep', 'mood', 'hot_flashes', 'cycle_irregularity'],
    recommendations: [
      'Start tracking symptoms consistently',
      'Consider adaptogenic herbs for hormone support',
      'Optimize sleep hygiene',
      'Add strength training to preserve muscle mass'
    ]
  },
  'mid-peri': {
    title: 'Mid Perimenopause',
    description: 'Hormonal fluctuations are more pronounced. You may notice significant cycle changes and symptoms.',
    targetSymptoms: ['hot_flashes', 'night_sweats', 'sleep', 'mood', 'brain_fog'],
    recommendations: [
      'Focus on stress management and cortisol regulation',
      'Consider magnesium for sleep and mood',
      'Increase phytoestrogen-rich foods',
      'Track hot flashes and night sweats patterns'
    ]
  },
  'late-peri': {
    title: 'Late Perimenopause',
    description: 'You\'re approaching menopause. Periods may be very irregular or absent for months.',
    targetSymptoms: ['hot_flashes', 'night_sweats', 'bone_health', 'heart_health', 'vaginal_dryness'],
    recommendations: [
      'Support bone health with vitamin D and K2',
      'Focus on cardiovascular exercise',
      'Consider hormone testing with your doctor',
      'Optimize gut health for hormone metabolism'
    ]
  },
  'post': {
    title: 'Post-Menopause',
    description: 'It\'s been 12+ months since your last period. Focus shifts to long-term health optimization.',
    targetSymptoms: ['bone_health', 'heart_health', 'brain_health', 'skin_aging', 'energy'],
    recommendations: [
      'Prioritize bone density and cardiovascular health',
      'Continue strength training',
      'Focus on longevity nutrition',
      'Monitor metabolic health markers'
    ]
  }
};

export default function MenoMapResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const [addingToPlan, setAddingToPlan] = useState(false);
  
  const assessmentId = searchParams.get('assessmentId');
  const stateData = location.state || {};

  // Fetch assessment from database if we have an ID
  const { data: assessmentData, isLoading } = useQuery({
    queryKey: ['hormone-assessment', assessmentId],
    queryFn: async () => {
      if (!assessmentId || !user) return null;
      
      const { data, error } = await supabase
        .from('hormone_compass_stages')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!assessmentId && !!user
  });

  // Use database data if available, fallback to state
  const stage = assessmentData?.stage || stateData.stage;
  const confidence = assessmentData?.confidence_score || stateData.confidence;

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <p className="text-center text-muted-foreground">Loading your results...</p>
      </div>
    );
  }

  if (!stage) {
    navigate('/menomap/assessment');
    return null;
  }

  const stageInfo = STAGE_INFO[stage as keyof typeof STAGE_INFO];

  // Fetch products based on stage-specific symptoms
  const { data: recommendedProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['stage-products', stage],
    queryFn: () => searchProductsBySymptoms(stageInfo.targetSymptoms || []),
    enabled: !!stage,
  });

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price_gbp || 0,
      image: product.image_url || '/placeholder.svg',
      brand: product.brand || 'Unknown',
      dosage: product.usage_instructions || 'As directed',
    });
    toast.success(`${product.name} added to cart`);
  };

  const topProducts = recommendedProducts?.slice(0, 3) || [];

  const handleAddToPlan = async () => {
    if (!user) {
      toast.error('Please sign in to add interventions to your plan');
      navigate(`/auth?returnTo=/hormone-compass/results?assessmentId=${assessmentId}`);
      return;
    }

    setAddingToPlan(true);
    try {
      await generateProtocolFromHormoneStage(user.id, stage, confidence);
      await updateUserProfileAfterAssessment(user.id, 'hormone', { stage, confidence });
      
      toast.success('Stage-specific interventions added to your protocol!');
      navigate('/my-protocol');
    } catch (error) {
      console.error('Error adding to plan:', error);
      toast.error('Failed to add interventions to your plan');
    } finally {
      setAddingToPlan(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Assessment Complete!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your menopause stage has been mapped
          </p>
        </div>
      </div>

      {/* Stage Result */}
      <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="pt-8">
          <HormoneCompassStageCompass 
            currentStage={stage}
            confidenceScore={confidence}
            size="lg"
          />
        </CardContent>
      </Card>

      {/* Stage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{stageInfo.title}</CardTitle>
          <CardDescription className="text-base">
            {stageInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Recommended Next Steps:</h3>
            <ul className="space-y-2">
              {stageInfo.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Card */}
      {user && (
        <div className="mb-6">
          <AssessmentAIAnalysisCard
            assessmentType="hormone-compass"
            assessmentId="hormone-stage-assessment"
            score={75} // Default confidence score, could be made dynamic
            scoreCategory={stage}
            answers={{}} // Hormone compass doesn't use traditional Q&A format
            metadata={{ 
              stage,
              answers: stateData.answers || assessmentData?.hormone_indicators
            }}
            autoGenerate={true}
          />
        </div>
      )}

      {/* Recommended Products */}
      {topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Supplements</CardTitle>
            <CardDescription>
              Based on your {stageInfo.title.toLowerCase()} profile, these products may support your wellness journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {productsLoading ? (
              <p className="text-sm text-muted-foreground">Loading recommendations...</p>
            ) : (
              <>
                {topProducts.map((product) => (
                  <div key={product.id} className="flex gap-4 p-4 border rounded-lg">
                    <img 
                      src={product.image_url || '/placeholder.svg'} 
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-semibold line-clamp-1">{product.name}</h4>
                          {product.brand && (
                            <p className="text-sm text-muted-foreground">{product.brand}</p>
                          )}
                        </div>
                        {product.evidence_level && (
                          <Badge variant="outline" className="flex-shrink-0 text-xs">
                            {product.evidence_level}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">
                          {formatProductPrice(product)}
                        </span>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddToCart(product)}
                          className="ml-auto"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/shop')}
                >
                  View All Products
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add to My Plan */}
      {user && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Build Your Personalized Protocol
            </CardTitle>
            <CardDescription>
              Add {stageInfo.recommendations.length} evidence-based interventions to your daily plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleAddToPlan}
              disabled={addingToPlan}
              className="w-full"
              size="lg"
            >
              {addingToPlan ? 'Adding to Plan...' : 'Add Stage Interventions to My Plan'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* What's Next */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
          <CardDescription>
            Continue your Hormone Compass journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate('/menomap/tracker')}
            variant="outline"
            className="w-full justify-between"
            size="lg"
          >
            <span>Start Tracking Daily Symptoms</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          <Button 
            onClick={() => navigate('/dashboard?tab=insights')}
            variant="outline"
            className="w-full justify-between"
            size="lg"
          >
            <span>View Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>

      {/* Share or Export */}
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1 gap-2">
          <Download className="w-4 h-4" />
          Export Results (PDF)
        </Button>
      </div>
    </div>
  );
}
