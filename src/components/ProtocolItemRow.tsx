import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Utensils, Dumbbell, Sparkles, Heart, ShoppingCart } from "lucide-react";

interface ProtocolItem {
  id: string;
  name: string;
  details?: string;
  item_type: string;
  time_of_day?: string[];
  is_active: boolean;
}

interface ProtocolItemRowProps {
  item: ProtocolItem;
  completed?: boolean;
  onToggle?: (id: string) => void;
  showBuyButton?: boolean;
}

const getItemIcon = (itemType: string) => {
  const iconMap: Record<string, any> = {
    supplement: Package,
    diet: Utensils,
    exercise: Dumbbell,
    therapy: Sparkles,
    habit: Heart,
  };
  return iconMap[itemType] || Heart;
};

export const ProtocolItemRow = ({ item, completed, onToggle, showBuyButton }: ProtocolItemRowProps) => {
  const Icon = getItemIcon(item.item_type);
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      {onToggle && (
        <Checkbox
          checked={completed}
          onCheckedChange={() => onToggle(item.id)}
        />
      )}
      <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{item.name}</p>
        {item.details && (
          <p className="text-sm text-muted-foreground truncate">{item.details}</p>
        )}
      </div>
      {item.time_of_day && item.time_of_day.length > 0 && (
        <Badge variant="outline" className="flex-shrink-0 text-xs">
          {item.time_of_day[0]}
        </Badge>
      )}
      {item.item_type === 'supplement' && showBuyButton && (
        <Button size="sm" variant="outline" className="flex-shrink-0">
          <ShoppingCart className="w-4 h-4 mr-1" />
          Buy
        </Button>
      )}
    </div>
  );
};
