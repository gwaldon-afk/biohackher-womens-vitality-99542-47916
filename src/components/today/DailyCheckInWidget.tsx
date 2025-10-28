import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const DailyCheckInWidget = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTodayStatus = async () => {
      if (!user) return;
      
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_scores')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('assessment_type', 'daily_tracking')
        .maybeSingle();
      
      setHasCheckedInToday(!!data);
      setLoading(false);
    };

    checkTodayStatus();
  }, [user]);

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </Card>
    );
  }

  if (hasCheckedInToday) {
    return (
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-900">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-green-500/10">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 dark:text-green-100">Daily Check-In Complete</h3>
            <p className="text-sm text-green-700 dark:text-green-300">You're on track today!</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">Daily LIS Check-In</h3>
          <p className="text-sm text-muted-foreground">
            Track your longevity habits in under 2 minutes
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/daily-check-in')}
          className="w-full gap-2"
        >
          Start Check-In
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
