import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { ProgressCircle } from '@/components/ui/progress-circle';
import { Slider } from '@/components/ui/slider';
import { Lock } from 'lucide-react';

interface NutritionPreviewCardProps {
  onUnlockClick: () => void;
}

export const NutritionPreviewCard = ({ onUnlockClick }: NutritionPreviewCardProps) => {
  const { t } = useTranslation();

  // Demo values for preview
  const demoData = {
    hydration: 3,
    vegetables: 3,
    protein: 3,
    fatsOmegas: 5,
    sugarProcessed: 0,
    alcohol: 0,
  };

  const demoScore = 11;
  const demoGrade = 'A';

  return (
    <Card className="p-6 relative">
      {/* Subtle overlay to indicate disabled state */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] rounded-lg pointer-events-none z-10" />
      
      <div className="space-y-6 relative opacity-60">
        {/* Score Circle */}
        <div className="flex flex-col items-center space-y-2">
          <ProgressCircle 
            value={(demoScore / 15) * 100} 
            size="xl"
            className="text-primary"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">{demoScore}</div>
              <div className="text-sm text-muted-foreground">{t('onboarding.nutritionPreview.outOf15')}</div>
              <div className="text-2xl font-bold text-primary mt-1">{t('onboarding.nutritionPreview.grade', { grade: demoGrade })}</div>
            </div>
          </ProgressCircle>
          <p className="text-sm text-center text-muted-foreground max-w-md">
            {t('onboarding.nutritionPreview.description')}
          </p>
        </div>

        {/* Demo Sliders - All Disabled */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">{t('onboarding.nutritionPreview.categories.hydration')}</label>
              <span className="text-sm text-muted-foreground">{t('onboarding.nutritionPreview.values.glasses', { count: 3 })}</span>
            </div>
            <Slider
              value={[demoData.hydration]}
              max={5}
              step={1}
              disabled
              className="cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">{t('onboarding.nutritionPreview.categories.vegetables')}</label>
              <span className="text-sm text-muted-foreground">{t('onboarding.nutritionPreview.values.servings', { count: 3 })}</span>
            </div>
            <Slider
              value={[demoData.vegetables]}
              max={5}
              step={1}
              disabled
              className="cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">{t('onboarding.nutritionPreview.categories.protein')}</label>
              <span className="text-sm text-muted-foreground">{t('onboarding.nutritionPreview.values.goodSources')}</span>
            </div>
            <Slider
              value={[demoData.protein]}
              max={5}
              step={1}
              disabled
              className="cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">{t('onboarding.nutritionPreview.categories.fats')}</label>
              <span className="text-sm text-muted-foreground">{t('onboarding.nutritionPreview.values.excellent')}</span>
            </div>
            <Slider
              value={[demoData.fatsOmegas]}
              max={5}
              step={1}
              disabled
              className="cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">{t('onboarding.nutritionPreview.categories.sugar')}</label>
              <span className="text-sm text-muted-foreground">{t('onboarding.nutritionPreview.values.nonePerfect')}</span>
            </div>
            <Slider
              value={[demoData.sugarProcessed]}
              max={5}
              step={1}
              disabled
              className="cursor-not-allowed"
              inverted
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">{t('onboarding.nutritionPreview.categories.alcohol')}</label>
              <span className="text-sm text-muted-foreground">{t('onboarding.nutritionPreview.values.none')}</span>
            </div>
            <Slider
              value={[demoData.alcohol]}
              max={5}
              step={1}
              disabled
              className="cursor-not-allowed"
              inverted
            />
          </div>
        </div>

        {/* Lock icon overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="bg-background/95 backdrop-blur-sm rounded-full p-4 shadow-lg border-2 border-primary/20">
            <Lock className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>
    </Card>
  );
};
