import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Battery, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { useHealthProfile } from "@/hooks/useHealthProfile";

export const EnergyMetricsCard = () => {
  const { energyMetrics, loading } = useHealthProfile();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (!energyMetrics.latestScore) {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-accent/20">
            <Battery className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Energy Assessment</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Track your energy levels and get personalized recommendations.
            </p>
            <Button onClick={() => navigate('/assessment/energy-levels')}>
              Take Energy Assessment
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const getEnergyColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendIcon = () => {
    switch (energyMetrics.trendDirection) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const daysSinceAssessment = energyMetrics.assessmentDate 
    ? Math.floor((Date.now() - new Date(energyMetrics.assessmentDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-accent/20">
            <Battery className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Energy Level</h3>
            <p className="text-sm text-muted-foreground">
              Based on latest assessment
            </p>
          </div>
        </div>
        {getTrendIcon()}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-4xl font-bold ${getEnergyColor(energyMetrics.latestScore!)}`}>
              {energyMetrics.latestScore?.toFixed(0)}
            </span>
            <span className="text-muted-foreground">/100</span>
          </div>
          <Badge variant={energyMetrics.category === 'poor' ? 'destructive' : 'secondary'}>
            {energyMetrics.category?.toUpperCase()}
          </Badge>
        </div>

        {energyMetrics.chronicFatigueRisk && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Chronic Fatigue Risk</p>
              <p className="text-xs text-muted-foreground mt-1">
                Consider consulting with a healthcare provider
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t space-y-2">
          {daysSinceAssessment !== null && daysSinceAssessment > 30 && (
            <p className="text-sm text-muted-foreground">
              Last assessed {daysSinceAssessment} days ago
            </p>
          )}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/assessment/energy-levels')}
          >
            Retake Assessment
          </Button>
          {energyMetrics.latestScore! < 60 && (
            <Button 
              className="w-full"
              onClick={() => navigate('/energy/onboarding')}
            >
              Explore Energy Module
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
