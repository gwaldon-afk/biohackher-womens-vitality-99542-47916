import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, ChevronRight, ClipboardList, Target, FileStack } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import { useProtocols } from '@/hooks/useProtocols';

export const ProfileQuickAccessCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goals } = useGoals();
  const { protocols } = useProtocols();

  const activeGoals = goals?.filter(g => g.status === 'active')?.length || 0;
  const activeProtocols = protocols?.filter(p => p.is_active)?.length || 0;

  return (
    <Card 
      className="p-4 bg-gradient-to-r from-secondary/30 to-primary/10 border border-primary/20 cursor-pointer hover:border-primary/40 transition-all group"
      onClick={() => navigate('/profile')}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t('today.profileCard.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('today.profileCard.subtitle')}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      
      {/* Quick Stats */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-primary/10">
        <div className="flex items-center gap-2 text-sm">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">
            {t('today.profileCard.activeGoals', { count: activeGoals })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FileStack className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">
            {t('today.profileCard.activeProtocols', { count: activeProtocols })}
          </span>
        </div>
      </div>
    </Card>
  );
};
