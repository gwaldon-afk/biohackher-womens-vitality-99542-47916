import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Pill, Dumbbell, Sun, Utensils, ChevronRight, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useProtocols, useProtocolItems, useProtocolCompletions, useToggleProtocolCompletion } from "@/queries/protocolQueries";
import { useAuth } from "@/hooks/useAuth";
import { ProtocolItem } from "@/types/protocols";
import { useMemo } from "react";

interface GroupedItems {
  morning: ProtocolItem[];
  afternoon: ProtocolItem[];
  evening: ProtocolItem[];
}

export const TodayProtocolWidget = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const { data: protocols } = useProtocols(userId);
  const activeProtocol = protocols?.find(p => p.is_active);
  
  const { data: items = [] } = useProtocolItems(activeProtocol?.id);
  const { data: completions = [] } = useProtocolCompletions(userId);
  const toggleCompletion = useToggleProtocolCompletion(userId || '');

  const completedItemIds = useMemo(
    () => new Set(completions.map(c => c.protocol_item_id)),
    [completions]
  );

  const groupedItems = useMemo(() => {
    const grouped: GroupedItems = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    items.forEach(item => {
      if (!item.is_active) return;
      
      const timeOfDay = item.time_of_day || [];
      if (timeOfDay.includes('morning') || timeOfDay.includes('Morning')) {
        grouped.morning.push(item);
      } else if (timeOfDay.includes('afternoon') || timeOfDay.includes('Afternoon')) {
        grouped.afternoon.push(item);
      } else if (timeOfDay.includes('evening') || timeOfDay.includes('Evening')) {
        grouped.evening.push(item);
      } else {
        // Default to morning if no time specified
        grouped.morning.push(item);
      }
    });

    return grouped;
  }, [items]);

  const totalItems = items.filter(i => i.is_active).length;
  const completedCount = items.filter(i => i.is_active && completedItemIds.has(i.id)).length;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  if (!activeProtocol || totalItems === 0) {
    return null;
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'supplement':
        return <Pill className="h-4 w-4" />;
      case 'exercise':
        return <Dumbbell className="h-4 w-4" />;
      case 'habit':
        return <Sun className="h-4 w-4" />;
      case 'diet':
        return <Utensils className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const handleToggle = (itemId: string) => {
    toggleCompletion.mutate({ protocolItemId: itemId });
  };

  const renderItem = (item: ProtocolItem) => {
    const isCompleted = completedItemIds.has(item.id);
    
    return (
      <div
        key={item.id}
        className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => handleToggle(item.id)}
            className="h-5 w-5"
          />
          <div className="flex items-center gap-2">
            {getItemIcon(item.item_type)}
            <div>
              <p className={cn(
                "font-medium text-sm",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {item.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.dosage || item.description || `${item.frequency} • ${item.item_type}`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {item.item_type === 'supplement' && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs"
              onClick={() => navigate('/shop')}
            >
              Buy
            </Button>
          )}
          {!isCompleted && (item.item_type === 'exercise' || item.item_type === 'habit') && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-xs"
              onClick={() => handleToggle(item.id)}
            >
              Start
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Today's Protocol</CardTitle>
          <Badge variant="outline" className="text-primary border-primary/30">
            {activeProtocol.name}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {completedCount} of {totalItems} completed ({progressPercent}%)
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Morning Activities */}
        {groupedItems.morning.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Morning</h4>
            <div className="space-y-2">
              {groupedItems.morning.map(renderItem)}
            </div>
          </div>
        )}

        {/* Afternoon Activities */}
        {groupedItems.afternoon.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Afternoon</h4>
            <div className="space-y-2">
              {groupedItems.afternoon.map(renderItem)}
            </div>
          </div>
        )}

        {/* Evening Activities */}
        {groupedItems.evening.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Evening</h4>
            <div className="space-y-2">
              {groupedItems.evening.map(renderItem)}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/my-protocol")}
          >
            View Full Protocol
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={() => navigate("/shop")}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Shop Supplements
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
