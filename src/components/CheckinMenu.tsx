import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Camera, Mic, PenLine } from "lucide-react";
import { useTranslation } from 'react-i18next';

const CheckinMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const options = [
    {
      id: 'nutrition',
      titleKey: 'today.checkin.nutritionScan',
      descriptionKey: 'today.checkin.nutritionScanDesc',
      icon: Camera,
      route: '/nutrition-scan',
    },
    {
      id: 'mood',
      titleKey: 'today.checkin.moodCheckin',
      descriptionKey: 'today.checkin.moodCheckinDesc',
      icon: Mic,
      route: '/mood-checkin',
    },
    {
      id: 'quick',
      titleKey: 'today.checkin.quickLog',
      descriptionKey: 'today.checkin.quickLogDesc',
      icon: PenLine,
      route: '/quick-log',
    },
  ];

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-2xl font-bold text-center">{t('today.checkin.title')}</h2>
      <div className="grid gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <Card
              key={option.id}
              className="p-4 cursor-pointer hover:shadow-md transition-all"
              onClick={() => navigate(option.route)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{t(option.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(option.descriptionKey)}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CheckinMenu;
