import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus } from "lucide-react";
import { EnergyBiohack } from "@/data/energyBiohacks";

interface EnergyActionCardProps {
  biohack: EnergyBiohack;
  onAddToProtocol?: () => void;
  onComplete?: () => void;
  isAdded?: boolean;
}

const typeColors = {
  balance: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  fuel: "bg-green-500/10 text-green-500 border-green-500/20",
  calm: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  recharge: "bg-amber-500/10 text-amber-500 border-amber-500/20"
};

const typeIcons = {
  balance: "⚖️",
  fuel: "🍳",
  calm: "🧘‍♀️",
  recharge: "🌙"
};

export const EnergyActionCard = ({ 
  biohack, 
  onAddToProtocol, 
  onComplete,
  isAdded 
}: EnergyActionCardProps) => {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{typeIcons[biohack.type]}</span>
            <h3 className="font-semibold">{biohack.name}</h3>
          </div>
          
          <p className="text-sm text-muted-foreground">{biohack.description}</p>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={typeColors[biohack.type]}>
              {biohack.type}
            </Badge>
            <Badge variant="outline">
              {biohack.duration}
            </Badge>
            <Badge variant="outline">
              {biohack.difficulty}
            </Badge>
            <Badge variant="outline">
              {biohack.evidenceLevel.replace('_', ' ')} evidence
            </Badge>
          </div>
        </div>
      </div>

      {biohack.benefits && biohack.benefits.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium">Benefits:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {biohack.benefits.slice(0, 3).map((benefit, idx) => (
              <li key={idx}>✓ {benefit}</li>
            ))}
          </ul>
        </div>
      )}

      {biohack.instructions && biohack.instructions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium">How to:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {biohack.instructions.slice(0, 3).map((instruction, idx) => (
              <li key={idx}>{idx + 1}. {instruction}</li>
            ))}
          </ul>
        </div>
      )}

      {biohack.contraindications && biohack.contraindications.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
            Caution:
          </p>
          <p className="text-xs text-muted-foreground">
            {biohack.contraindications.join(', ')}
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        {onComplete && (
          <Button onClick={onComplete} variant="outline" size="sm" className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Mark Complete
          </Button>
        )}
        {onAddToProtocol && (
          <Button 
            onClick={onAddToProtocol} 
            size="sm" 
            className="flex-1"
            disabled={isAdded}
          >
            {isAdded ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Added to Protocol
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add to Protocol
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};
