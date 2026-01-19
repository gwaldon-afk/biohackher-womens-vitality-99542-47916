import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useWeeklyPlan, DayPlanData, WeeklyAction } from "@/hooks/useWeeklyPlan";
import AssessmentGatewayScreen from "@/components/AssessmentGatewayScreen";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { TrialGateCard } from "@/components/subscription/TrialGateCard";
import {
  Calendar,
  Sun,
  Cloud,
  Moon,
  Utensils,
  Pill,
  Dumbbell,
  Sparkles,
  ArrowRight,
  ChevronRight,
  CheckCircle2
} from "lucide-react";

const TimeBlock = ({ 
  title, 
  icon: Icon, 
  actions 
}: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>; 
  actions: WeeklyAction[];
}) => {
  const { t } = useTranslation();
  
  if (actions.length === 0) return null;

  const getItemIcon = (action: WeeklyAction) => {
    if (action.type === 'meal') return Utensils;
    if (action.itemType === 'supplement') return Pill;
    if (action.itemType === 'exercise') return Dumbbell;
    return Sparkles;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{title}</span>
      </div>
      <div className="space-y-2">
        {actions.map((action) => {
          const ItemIcon = getItemIcon(action);
          return (
            <div
              key={action.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                action.completed
                  ? 'bg-muted/50 border-muted'
                  : 'bg-card border-border hover:border-primary/30'
              }`}
            >
              <div className={`p-1.5 rounded-md ${action.completed ? 'bg-primary/10' : 'bg-primary/5'}`}>
                <ItemIcon className={`h-4 w-4 ${action.completed ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${action.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {action.title}
                </p>
                {action.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {action.description}
                  </p>
                )}
              </div>
              {action.completed ? (
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DayView = ({ day }: { day: DayPlanData }) => {
  const { t } = useTranslation();
  
  const morningActions = day.actions.filter(a => a.timeOfDay === 'morning');
  const afternoonActions = day.actions.filter(a => a.timeOfDay === 'afternoon');
  const eveningActions = day.actions.filter(a => a.timeOfDay === 'evening');

  const progressPercent = day.totalCount > 0 
    ? Math.round((day.completedCount / day.totalCount) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Day Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {day.isToday ? t('weeklyPlan.today') : day.dayName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {format(day.date, 'MMMM d, yyyy')}
          </p>
        </div>
        <Badge variant={progressPercent === 100 ? "default" : "secondary"}>
          {day.completedCount}/{day.totalCount}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Time Blocks */}
      <div className="space-y-6">
        <TimeBlock 
          title={t('weeklyPlan.morning')} 
          icon={Sun} 
          actions={morningActions} 
        />
        <TimeBlock 
          title={t('weeklyPlan.afternoon')} 
          icon={Cloud} 
          actions={afternoonActions} 
        />
        <TimeBlock 
          title={t('weeklyPlan.evening')} 
          icon={Moon} 
          actions={eveningActions} 
        />
      </div>

      {day.actions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>{t('weeklyPlan.noItems')}</p>
        </div>
      )}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-2 w-full" />
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  </div>
);

export default function WeeklyPlan() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasTrialAccess } = useSubscription();
  const { weeklyData, loading } = useWeeklyPlan();
  const trialAccess = hasTrialAccess();
  
  // Find today's index for default tab
  const todayIndex = weeklyData?.days.findIndex(d => d.isToday) ?? 0;
  const [selectedDay, setSelectedDay] = useState<string>(todayIndex.toString());

  const breadcrumbs = [
    { label: t('common.home'), href: "/" },
    { label: t('weeklyPlan.myPlans'), href: "/today" },
    { label: t('weeklyPlan.title'), href: "/plans/weekly" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <AssessmentGatewayScreen pageName="weekly" />
        </main>
      </div>
    );
  }

  if (!trialAccess) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="max-w-5xl mx-auto pt-6">
          <TrialGateCard onKeepExploring={() => navigate('/biohacking-toolkit')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-5xl">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              {t('weeklyPlan.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('weeklyPlan.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/today')}
            >
              {t('weeklyPlan.viewToday')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/plans/90-day')}
            >
              {t('weeklyPlan.view90Day')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Week Navigation */}
        {loading ? (
          <LoadingSkeleton />
        ) : weeklyData ? (
          <Card>
            <CardContent className="p-4 md:p-6">
              <Tabs value={selectedDay} onValueChange={setSelectedDay}>
                <TabsList className="w-full grid grid-cols-7 mb-6">
                  {weeklyData.days.map((day, index) => (
                    <TabsTrigger
                      key={day.dayKey}
                      value={index.toString()}
                      className={`relative text-xs md:text-sm ${day.isToday ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                    >
                      <span className="hidden md:inline">{day.dayName.slice(0, 3)}</span>
                      <span className="md:hidden">{day.dayName.slice(0, 1)}</span>
                      {day.completedCount === day.totalCount && day.totalCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {weeklyData.days.map((day, index) => (
                  <TabsContent key={day.dayKey} value={index.toString()}>
                    <DayView day={day} />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">{t('weeklyPlan.noProtocol')}</h3>
              <p className="text-muted-foreground mb-4">{t('weeklyPlan.noProtocolDescription')}</p>
              <Button onClick={() => navigate('/my-protocol')}>
                {t('weeklyPlan.createProtocol')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
