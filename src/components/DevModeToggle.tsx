import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, UserX, Crown, CreditCard } from 'lucide-react';
import { TEST_MODE_ENABLED } from '@/config/testMode';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type TestTier = 'guest' | 'registered' | 'subscribed' | 'premium';

const tierConfig: Record<TestTier, { icon: React.ElementType; label: string; color: string }> = {
  guest: { icon: UserX, label: 'Guest', color: 'bg-muted text-muted-foreground' },
  registered: { icon: User, label: 'Registered', color: 'bg-blue-500/20 text-blue-500 border-blue-500/50' },
  subscribed: { icon: CreditCard, label: 'Subscribed', color: 'bg-green-500/20 text-green-500 border-green-500/50' },
  premium: { icon: Crown, label: 'Premium', color: 'bg-amber-500/20 text-amber-500 border-amber-500/50' },
};

export const DevModeToggle = () => {
  const { t } = useTranslation();
  const [selectedTier, setSelectedTier] = useState<TestTier>('premium');

  useEffect(() => {
    const savedTier = localStorage.getItem('testModeTier') as TestTier | null;
    if (savedTier && tierConfig[savedTier]) {
      setSelectedTier(savedTier);
    }
  }, []);

  const handleTierChange = (tier: TestTier) => {
    setSelectedTier(tier);
    localStorage.setItem('testModeTier', tier);
    window.location.reload(); // Reload to apply tier changes
  };

  if (!TEST_MODE_ENABLED) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-6 z-50 flex flex-col gap-2">
      <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide px-1">
        {t('testMode.label', 'Test Mode')}
      </div>
      <div className="flex gap-1 bg-background/95 backdrop-blur rounded-lg p-1 shadow-lg border">
        {(Object.keys(tierConfig) as TestTier[]).map((tier) => {
          const config = tierConfig[tier];
          const Icon = config.icon;
          const isSelected = selectedTier === tier;
          
          return (
            <Button
              key={tier}
              onClick={() => handleTierChange(tier)}
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1.5 px-2 py-1 h-auto text-xs transition-all",
                isSelected && config.color,
                isSelected && "border"
              )}
              title={t(`testMode.tiers.${tier}Description`, config.label)}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{t(`testMode.tiers.${tier}`, config.label)}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
