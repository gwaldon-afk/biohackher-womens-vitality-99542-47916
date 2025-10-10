import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  name: string;
  description: string;
  iconName: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
}

const tierColors = {
  bronze: 'from-amber-700 to-amber-900',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-400 to-purple-600'
};

const tierTextColors = {
  bronze: 'text-amber-700',
  silver: 'text-gray-600',
  gold: 'text-yellow-600',
  platinum: 'text-purple-600'
};

export const AchievementCard = ({
  name,
  description,
  iconName,
  tier,
  points,
  unlocked,
  unlockedAt
}: AchievementCardProps) => {
  // Dynamically get the icon component
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Award;

  return (
    <Card className={cn(
      "transition-all duration-300",
      unlocked 
        ? "border-primary/50 bg-primary/5 hover:shadow-lg" 
        : "opacity-60 grayscale hover:opacity-80"
    )}>
      <CardContent className="pt-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Icon with tier gradient */}
          <div className={cn(
            "p-3 rounded-xl bg-gradient-to-br",
            unlocked ? tierColors[tier] : "bg-muted"
          )}>
            <IconComponent className={cn(
              "h-6 w-6",
              unlocked ? "text-white" : "text-muted-foreground"
            )} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={cn(
                "font-semibold",
                unlocked ? tierTextColors[tier] : "text-muted-foreground"
              )}>
                {name}
              </h3>
              <Badge 
                variant={unlocked ? "default" : "secondary"}
                className="shrink-0"
              >
                {points} pts
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              {description}
            </p>

            {/* Status */}
            <div className="flex items-center gap-2 text-xs">
              <Badge 
                variant={unlocked ? "default" : "outline"}
                className="capitalize"
              >
                {tier}
              </Badge>
              {unlocked && unlockedAt && (
                <span className="text-muted-foreground">
                  Unlocked {new Date(unlockedAt).toLocaleDateString()}
                </span>
              )}
              {!unlocked && (
                <span className="text-muted-foreground">
                  🔒 Locked
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
