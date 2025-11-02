import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink } from "lucide-react";
import { LibraryProtocol } from "@/services/protocolLibraryService";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProtocolLibraryCardProps {
  protocol: LibraryProtocol;
  onAddToProtocol: (protocol: LibraryProtocol) => void;
  isAdding?: boolean;
}

const evidenceBadgeColors = {
  very_strong: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  strong: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  moderate: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  weak: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
};

const evidenceLabels = {
  very_strong: "Gold Standard",
  strong: "Strong Evidence",
  moderate: "Moderate Evidence",
  weak: "Emerging Evidence"
};

export const ProtocolLibraryCard = ({ protocol, onAddToProtocol, isAdding }: ProtocolLibraryCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {protocol.icon && <span className="text-2xl">{protocol.icon}</span>}
              <Badge variant="outline" className="capitalize">
                {protocol.category}
              </Badge>
            </div>
            {protocol.evidenceLevel && (
              <Badge 
                variant="outline" 
                className={evidenceBadgeColors[protocol.evidenceLevel]}
              >
                {evidenceLabels[protocol.evidenceLevel]}
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl mt-2">{protocol.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {protocol.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="space-y-2 mb-4 flex-1">
            <p className="text-sm font-medium text-muted-foreground">Key Benefits:</p>
            <ul className="text-sm space-y-1">
              {protocol.benefits.slice(0, 3).map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="flex-1">{benefit}</span>
                </li>
              ))}
            </ul>
            {protocol.benefits.length > 3 && (
              <p className="text-xs text-muted-foreground italic">
                +{protocol.benefits.length - 3} more benefits
              </p>
            )}
          </div>
          
          {protocol.evidenceSource && (
            <p className="text-xs text-muted-foreground mb-4 italic">
              Source: {protocol.evidenceSource}
            </p>
          )}

          <div className="flex gap-2 mt-auto">
            <Button
              onClick={() => setShowDetails(true)}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Details
            </Button>
            <Button
              onClick={() => onAddToProtocol(protocol)}
              disabled={isAdding}
              className="flex-1"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              {isAdding ? 'Adding...' : 'Add to Protocol'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {protocol.icon && <span className="text-3xl">{protocol.icon}</span>}
              <DialogTitle className="text-2xl">{protocol.name}</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              {protocol.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Badge variant="outline" className="capitalize">
                {protocol.category}
              </Badge>
              {protocol.evidenceLevel && (
                <Badge 
                  variant="outline" 
                  className={evidenceBadgeColors[protocol.evidenceLevel]}
                >
                  {evidenceLabels[protocol.evidenceLevel]}
                </Badge>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Benefits:</h4>
              <ul className="space-y-2">
                {protocol.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span className="flex-1">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {protocol.evidenceSource && (
              <div>
                <h4 className="font-semibold mb-2">Evidence Source:</h4>
                <p className="text-sm text-muted-foreground">{protocol.evidenceSource}</p>
              </div>
            )}

            <Button
              onClick={() => {
                onAddToProtocol(protocol);
                setShowDetails(false);
              }}
              disabled={isAdding}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isAdding ? 'Adding to Your Protocol...' : 'Add to My Protocol'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
