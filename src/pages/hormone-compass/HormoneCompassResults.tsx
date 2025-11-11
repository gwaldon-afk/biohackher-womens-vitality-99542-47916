import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HormoneCompassStageCompass } from '@/components/hormone-compass/HormoneCompassStageCompass';
import { AssessmentAIAnalysisCard } from '@/components/AssessmentAIAnalysisCard';
import { useAuth } from '@/hooks/useAuth';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { Product } from '@/types/products';
import { searchProductsBySymptoms } from '@/services/productService';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart, Share2, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { differenceInYears } from 'date-fns';

// Health level information mapping (life-stage agnostic)
const HEALTH_LEVEL_INFO: Record<string, {
  title: string;
  description: string;
  targetSymptoms: string[];
  recommendations: string[];
  color: string;
}> = {
  'feeling-great': {
    title: 'Feeling Great',
    description: 'Your hormone health is thriving. You\'re experiencing minimal disruption across key areas.',
    targetSymptoms: ['maintenance', 'optimization', 'prevention'],
    recommendations: [
      'Maintain your current healthy habits and routines',
      'Track symptoms monthly to establish your baseline',
      'Focus on preventive nutrition and stress management',
      'Consider reassessments every 6-12 months'
    ],
    color: 'text-green-600'
  },
  'doing-well': {
    title: 'Doing Well',
    description: 'Your hormone health is good with mild occasional symptoms. Small adjustments can optimize your well-being.',
    targetSymptoms: ['sleep-quality', 'stress-management', 'energy-optimization'],
    recommendations: [
      'Continue current healthy practices',
      'Address specific mild symptoms with targeted lifestyle changes',
      'Prioritize sleep quality and stress reduction techniques',
      'Consider adding adaptogenic herbs for hormonal support'
    ],
    color: 'text-blue-600'
  },
  'having-challenges': {
    title: 'Having Challenges',
    description: 'You\'re experiencing moderate symptoms that are affecting daily life. Support can help restore balance.',
    targetSymptoms: ['cycle-regulation', 'mood-swings', 'sleep-disruption', 'energy-crashes'],
    recommendations: [
      'Work with a healthcare provider to identify root causes',
      'Implement targeted nutrition and supplement protocols',
      'Establish consistent sleep routines and stress management',
      'Consider comprehensive hormone testing',
      'Track symptoms to identify patterns and triggers'
    ],
    color: 'text-yellow-600'
  },
  'really-struggling': {
    title: 'Really Struggling',
    description: 'You\'re facing significant symptoms that are impacting your quality of life. Professional support is recommended.',
    targetSymptoms: ['severe-symptoms', 'hot-flashes', 'mood-disorders', 'cognitive-issues'],
    recommendations: [
      'Schedule consultation with hormone specialist or gynecologist',
      'Discuss hormone replacement therapy or other medical options',
      'Implement comprehensive lifestyle and supplement protocol',
      'Prioritize sleep, nutrition, and stress management',
      'Consider working with a therapist for mood-related symptoms'
    ],
    color: 'text-orange-600'
  },
  'need-support': {
    title: 'Need Support Now',
    description: 'You\'re experiencing severe symptoms that require immediate professional attention and comprehensive support.',
    targetSymptoms: ['severe-disruption', 'multiple-symptoms', 'quality-of-life'],
    recommendations: [
      'Seek immediate medical evaluation from hormone specialist',
      'Discuss all treatment options including HRT with your provider',
      'Request comprehensive hormone and health panel',
      'Consider working with integrative healthcare team',
      'Implement multi-faceted support protocol under medical guidance',
      'Prioritize self-care and mental health support'
    ],
    color: 'text-red-600'
  }
};

export default function HormoneCompassResults() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { profile } = useHealthProfile();

  const assessmentId = searchParams.get('assessmentId');
  const stateData = location.state as { stage?: string; confidence?: number } || {};
  
  // Calculate user age from health profile
  const userAge = profile?.date_of_birth 
    ? differenceInYears(new Date(), new Date(profile.date_of_birth))
    : null;

  // Fetch assessment from database if we have an ID
  const { data: assessmentData, isLoading } = useQuery({
    queryKey: ['hormone-compass-assessment', assessmentId],
    queryFn: async () => {
      if (!assessmentId) return null;
      
      const { data, error } = await supabase
        .from('hormone_compass_stages')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!assessmentId
  });

  const healthLevel = assessmentData?.stage || stateData.stage;
  const confidence = assessmentData?.confidence_score || stateData.confidence;

  // Fetch products based on health level symptoms - ALWAYS call this hook
  const { data: recommendedProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['health-level-products', healthLevel],
    queryFn: () => {
      if (!healthLevel) return [];
      const levelInfo = HEALTH_LEVEL_INFO[healthLevel as keyof typeof HEALTH_LEVEL_INFO];
      return searchProductsBySymptoms(levelInfo.targetSymptoms || []);
    },
    enabled: !!healthLevel,
  });

  // Now check conditions AFTER all hooks are called
  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <Card className="p-8">
          <p>Loading your results...</p>
        </Card>
      </div>
    );
  }

  if (!healthLevel) {
    navigate('/hormone-compass/assessment');
    return null;
  }

  const levelInfo = HEALTH_LEVEL_INFO[healthLevel as keyof typeof HEALTH_LEVEL_INFO];
  
  // Generate age-based contextual insight
  const getLifeStageContext = () => {
    if (!userAge) return null;
    
    if (userAge >= 25 && userAge <= 35) {
      if (healthLevel === 'having-challenges' || healthLevel === 'really-struggling') {
        return 'At your age, these symptoms may indicate PCOS, thyroid imbalances, or cycle irregularities. Consider working with a healthcare provider to identify root causes.';
      }
      return 'You\'re in your prime reproductive years. Focus on establishing healthy baseline habits and tracking patterns.';
    } else if (userAge >= 36 && userAge <= 44) {
      if (healthLevel === 'having-challenges' || healthLevel === 'really-struggling') {
        return 'These symptoms could be early signs of hormonal shifts as you approach perimenopause, or may indicate other hormonal imbalances worth investigating.';
      }
      return 'You\'re approaching the perimenopausal transition window. Now is an ideal time to optimize hormone health and establish strong habits.';
    } else if (userAge >= 45 && userAge <= 55) {
      if (healthLevel === 'having-challenges' || healthLevel === 'really-struggling') {
        return 'These symptoms are common during the perimenopause transition. Targeted support can significantly improve your quality of life during this phase.';
      }
      return 'You\'re in the typical perimenopause window. Proactive support can help you navigate this transition smoothly.';
    } else if (userAge >= 56) {
      if (healthLevel === 'having-challenges' || healthLevel === 'really-struggling') {
        return 'If you\'re experiencing ongoing symptoms in postmenopause, hormone replacement therapy or targeted interventions may provide relief. Consult with your provider.';
      }
      return 'You\'re in the postmenopause phase. Focus on longevity optimization—bone health, cardiovascular support, and cognitive function.';
    }
    return null;
  };
  
  const lifeStageContext = getLifeStageContext();

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

  const handleAddToPlan = async () => {
    if (!user) {
      toast.error('Please sign in to add to your plan');
      navigate('/auth');
      return;
    }

    try {
      toast.success('Hormone health profile saved!');
      navigate('/my-protocol');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Celebration Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Assessment Complete!</h1>
        <p className="text-muted-foreground">
          Your hormone health has been evaluated
        </p>
      </div>

      {/* Health Level Compass Visualization */}
      <HormoneCompassStageCompass 
        currentStage={healthLevel as any}
        confidenceScore={confidence || 0}
        size="lg"
      />

      {/* Health Level Information */}
      <Card className="p-6">
        <h2 className={`text-xl font-semibold mb-3 ${levelInfo.color}`}>{levelInfo.title}</h2>
        <p className="text-muted-foreground mb-4">{levelInfo.description}</p>
        
        {/* Life-Stage Context */}
        {lifeStageContext && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
            <p className="text-sm">
              <span className="font-semibold">For Your Life Stage ({userAge} years old): </span>
              {lifeStageContext}
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Recommended Actions:</h3>
            <ul className="space-y-2">
              {levelInfo.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* AI Analysis Card */}
      {user && (
        <AssessmentAIAnalysisCard
          assessmentType="hormone-compass"
          assessmentId={assessmentId || 'hormone-compass'}
          score={confidence || 75}
          scoreCategory={healthLevel}
          answers={{}}
          metadata={{ 
            healthLevel,
            userAge,
            answers: (stateData as any)?.answers || assessmentData?.hormone_indicators
          }}
          autoGenerate={false}
          renderButton={(onClick, isLoading) => (
            <Button onClick={onClick} disabled={isLoading} variant="outline" size="sm" className="w-full">
              {isLoading ? 'Generating...' : 'Get AI-Powered Deep Dive (Optional)'}
            </Button>
          )}
        />
      )}

      {/* Recommended Products */}
      {recommendedProducts && recommendedProducts.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Recommended Supplements</h3>
          <div className="space-y-3">
            {recommendedProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="flex gap-3 p-3 border rounded-lg">
                <img 
                  src={product.image_url || '/placeholder.svg'} 
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{product.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{product.brand}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-semibold">£{product.price_gbp?.toFixed(2)}</span>
                    <Button size="sm" variant="outline" onClick={() => handleAddToCart(product)}>
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add to Plan CTA */}
      {user && (
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Add to Your Plan</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Save your hormone health profile and get personalized recommendations
          </p>
          <Button onClick={handleAddToPlan} className="w-full">
            Add to My Plan
          </Button>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">What's Next?</h3>
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-between"
            onClick={() => navigate('/hormone-compass/tracker')}
          >
            <span>Start Tracking Daily Symptoms</span>
            <Calendar className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-between"
            onClick={() => navigate('/dashboard')}
          >
            <span>View Dashboard</span>
            <TrendingUp className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
