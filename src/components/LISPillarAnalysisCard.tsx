import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LucideIcon, TrendingUp, AlertCircle, Info, ShoppingCart } from 'lucide-react';
import { useEvidenceStore } from '@/stores/evidenceStore';
import { useCart } from '@/hooks/useCart';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/services/productService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';

interface PillarAnalysisCardProps {
  pillarName: string;
  pillarDisplayName: string;
  pillarAnalysisName: string;
  pillarScore: number;
  icon: LucideIcon;
  color: string;
  overallLIS: number;
  userAge?: number;
  hideHeader?: boolean;
}

export const LISPillarAnalysisCard = ({ 
  pillarName,
  pillarDisplayName,
  pillarAnalysisName,
  pillarScore, 
  icon: Icon, 
  color,
  overallLIS,
  userAge,
  hideHeader = false
}: PillarAnalysisCardProps) => {
  const { t } = useTranslation();
  const { isMetric } = useLocale();
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return t('lisPillarAnalysis.scoreLabels.excellent');
    if (score >= 60) return t('lisPillarAnalysis.scoreLabels.good');
    if (score >= 40) return t('lisPillarAnalysis.scoreLabels.fair');
    return t('lisPillarAnalysis.scoreLabels.needsWork');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'destructive';
  };

  const getAnalysis = () => {
    const scoreBand = pillarScore >= 80 ? 'excellent' : 
                      pillarScore >= 60 ? 'good' : 
                      pillarScore >= 40 ? 'fair' : 'poor';

    // Map pillarAnalysisName to translation key
    const pillarKey = pillarAnalysisName.toLowerCase();
    const basePath = `lisPillarAnalysis.pillars.${pillarKey}.${scoreBand}`;
    
    // Check if translation exists, otherwise use default
    const impactKey = `${basePath}.impact`;
    const impact = t(impactKey);
    
    // If translation key returns the key itself, use default
    if (impact === impactKey) {
      return {
        impact: t('lisPillarAnalysis.default.impact', { pillarName: pillarDisplayName }),
        recommendations: [
          t('lisPillarAnalysis.default.recommendations.0'),
          t('lisPillarAnalysis.default.recommendations.1'),
          t('lisPillarAnalysis.default.recommendations.2')
        ],
        quickWin: t('lisPillarAnalysis.default.quickWin')
      };
    }

    // Get recommendations array
    const recommendations: string[] = [];
    for (let i = 0; i < 5; i++) {
      const rec = t(`${basePath}.recommendations.${i}`, { defaultValue: '' });
      if (rec && rec !== `${basePath}.recommendations.${i}`) {
        recommendations.push(rec);
      }
    }

    return {
      impact,
      recommendations,
      quickWin: t(`${basePath}.quickWin`)
    };
  };

  const analysis = getAnalysis();
  const scoreLabel = getScoreLabel(pillarScore);

  // Evidence store for opening research drawer
  const { openEvidence } = useEvidenceStore();

  // Cart functionality
  const { addToCart } = useCart();

  // Fetch products matching this pillar
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  // Map pillar names to product target_pillars
  const pillarToTargetPillar: Record<string, string> = {
    'sleep': 'sleep',
    'stress': 'stress',
    'activity': 'body',
    'nutrition': 'nutrition',
    'social': 'balance',
    'cognitive': 'brain',
  };

  const targetPillar = pillarToTargetPillar[pillarName.toLowerCase()] || pillarName.toLowerCase();

  // Get products that match this pillar
  const matchedProducts = products.filter(product => 
    product.target_pillars?.some((p: string) => 
      p.toLowerCase().includes(targetPillar) || targetPillar.includes(p.toLowerCase())
    )
  );

  const handleViewEvidence = () => {
    openEvidence(
      `pillar:${pillarName.toLowerCase()}`,
      t('lisPillarAnalysis.evidence.title', { pillar: pillarDisplayName }),
      t('lisPillarAnalysis.evidence.description', { pillar: pillarDisplayName.toLowerCase() })
    );
  };

  const handleAddToCart = () => {
    if (matchedProducts.length > 0) {
      const product = matchedProducts[0];
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price_gbp || product.price_usd || 0,
        quantity: 1,
        image: product.image_url || undefined,
      });
      toast.success(t('lisPillarAnalysis.toast.addedToCart', { productName: product.name }));
    } else {
      toast.info(t('lisPillarAnalysis.toast.noSupplementsFound', { pillarName: pillarDisplayName }));
    }
  };

  return (
    <Card className="border-l-4" style={{ borderLeftColor: color }}>
      <CardContent className="p-6">
        {/* Conditionally render header */}
        {!hideHeader && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{pillarDisplayName}</h3>
                  <Badge variant={getBadgeVariant(pillarScore)} className="mt-1">
                    {scoreLabel}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getScoreColor(pillarScore)}`}>
                  {pillarScore}
                </div>
                <div className="text-xs text-muted-foreground">/ 100</div>
              </div>
            </div>

            {/* Progress Bar */}
            <Progress value={pillarScore} className="mb-4 h-2" />
          </>
        )}

        {/* Impact Statement */}
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>{t('lisPillarAnalysis.ui.impact')}</strong> {analysis.impact}
            </p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            {t('lisPillarAnalysis.ui.keyActions')}
          </h4>
          <ul className="space-y-2">
            {analysis.recommendations.slice(0, 3).map((rec, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary font-bold flex-shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Win */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <h4 className="font-semibold text-sm mb-1 text-primary">{t('lisPillarAnalysis.ui.quickWin')}</h4>
          <p className="text-sm text-muted-foreground">{analysis.quickWin}</p>
        </div>

        {/* Action Buttons: Evidence & Cart */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewEvidence}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Info className="h-4 w-4" />
            <span className="text-xs">{t('lisPillarAnalysis.ui.viewEvidence')}</span>
          </Button>
          {matchedProducts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddToCart}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="text-xs">{t('lisPillarAnalysis.ui.addSupplement')}</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
