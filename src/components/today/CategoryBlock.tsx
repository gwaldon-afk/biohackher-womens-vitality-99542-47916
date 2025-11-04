import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Clock, ShoppingCart, Utensils, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CategoryBlockProps {
  icon: string;
  title: string;
  items: any[];
  completedCount: number;
  totalCount: number;
  totalMinutes: number;
  color: string;
  defaultExpanded?: boolean;
  onToggle: (actionId: string) => void;
  getItemCompleted: (actionId: string) => boolean;
  onBuySupplements?: (action: any) => void;
  onViewMeal?: (action: any) => void;
  isUsingSampleData?: boolean;
  user?: any;
  onNavigate?: () => void;
}

export const CategoryBlock = ({
  icon,
  title,
  items,
  completedCount,
  totalCount,
  totalMinutes,
  color,
  defaultExpanded = false,
  onToggle,
  getItemCompleted,
  onBuySupplements,
  onViewMeal,
  isUsingSampleData,
  user,
  onNavigate,
}: CategoryBlockProps) => {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  if (totalCount === 0) return null;

  const isFullyCompleted = completedCount === totalCount;

  // Group items by time of day
  const morningItems = items.filter((a: any) => a.timeOfDay?.includes('morning'));
  const afternoonItems = items.filter((a: any) => a.timeOfDay?.includes('afternoon') || a.timeOfDay?.includes('midday'));
  const eveningItems = items.filter((a: any) => a.timeOfDay?.includes('evening') || a.timeOfDay?.includes('night'));

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300' },
    green: { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-300' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-200 dark:border-pink-800', text: 'text-pink-700 dark:text-pink-300' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300' },
  };

  const colors = colorMap[color] || colorMap.blue;

  const renderTimeSection = (sectionTitle: string, sectionItems: any[]) => {
    if (sectionItems.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider pl-2">
          {sectionTitle}
        </h4>
        {sectionItems.map((action: any) => {
          const isCompleted = getItemCompleted(action.id);
          const isSupplementCategory = action.category === 'supplement';
          const isMeal = action.type === 'meal';

          return (
            <div
              key={action.id}
              className="group relative flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all"
            >
              <Checkbox
                checked={isCompleted}
                onCheckedChange={() => onToggle(action.id)}
                className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                disabled={isUsingSampleData && !user}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {action.title}
                    </p>
                    <ScienceBackedIcon className="w-3.5 h-3.5" showTooltip={true} />
                    {isMeal && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Utensils className="w-3 h-3" />
                        Meal
                      </Badge>
                    )}
                  </div>
                  {action.pillar && (
                    <Badge variant="outline" className="text-xs capitalize shrink-0 bg-primary/5 text-primary border-primary/20">
                      {action.pillar}
                    </Badge>
                  )}
                </div>
                {action.description && (
                  <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {action.estimatedMinutes} min
                  </div>
                  {isMeal && action.mealData && onViewMeal && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewMeal(action)}
                      className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Utensils className="w-3 h-3" />
                      View Recipe
                    </Button>
                  )}
                  {isSupplementCategory && onBuySupplements && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onBuySupplements(action)}
                      className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Buy
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("rounded-xl border-2 overflow-hidden", colors.border, colors.bg)}>
        {/* Header */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <h3 className="font-semibold text-lg text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground">
                  {completedCount}/{totalCount} complete • {totalMinutes} min total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isFullyCompleted && (
                <CheckCircle className={cn("w-5 h-5", colors.text)} />
              )}
              <div className={cn(
                "text-sm font-semibold px-3 py-1 rounded-full",
                isFullyCompleted ? "bg-primary/20 text-primary" : "bg-background/50"
              )}>
                {completedCount}/{totalCount}
              </div>
              <ChevronDown className={cn(
                "w-5 h-5 transition-transform",
                isOpen && "rotate-180"
              )} />
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {renderTimeSection("Morning", morningItems)}
            {renderTimeSection("Afternoon", afternoonItems)}
            {renderTimeSection("Evening", eveningItems)}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
