import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProtocolRecommendations } from '@/hooks/useProtocolRecommendations';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

/**
 * Protocol Recommendations Notifier
 * Monitors for new protocol recommendations and displays toast notifications
 * when recommendations are generated from assessments.
 */
export const ProtocolRecommendationsNotifier = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recommendations, pendingCount } = useProtocolRecommendations({ status: 'pending' });
  const previousCountRef = useRef<number>(0);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Skip on initial mount - only notify on actual new recommendations
    if (!hasInitializedRef.current) {
      previousCountRef.current = pendingCount;
      hasInitializedRef.current = true;
      return;
    }

    // Check if count increased (new recommendations added)
    if (pendingCount > previousCountRef.current) {
      const newCount = pendingCount - previousCountRef.current;
      
      // Get the most recent recommendation to show source
      const latestRecommendation = recommendations?.[0];
      const sourceType = latestRecommendation?.source_type || 'assessment';
      
      // Map source types to user-friendly names
      const sourceNames: Record<string, string> = {
        'hormone_compass': 'Hormone Compass Assessment',
        'lis': 'Longevity Impact Score Assessment',
        'symptom': 'Symptom Assessment',
        'goal': 'Goal Setting'
      };
      
      const sourceName = sourceNames[sourceType] || 'Assessment';

      toast({
        title: "New Protocol Recommendations Available! 🎉",
        description: `You have ${newCount} new ${newCount === 1 ? 'recommendation' : 'recommendations'} from your ${sourceName}.`,
        action: (
          <Button 
            size="sm" 
            onClick={() => navigate('/my-protocol')}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Review Now
          </Button>
        ),
        duration: 8000, // Show for 8 seconds
      });
    }

    // Update previous count
    previousCountRef.current = pendingCount;
  }, [pendingCount, recommendations, navigate, toast]);

  // This component doesn't render anything
  return null;
};
