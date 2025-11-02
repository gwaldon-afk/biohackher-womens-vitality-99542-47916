import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus } from "lucide-react";

interface ProtocolTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  benefits: string[];
  icon: string;
}

interface ProtocolTemplateCardProps {
  template: ProtocolTemplate;
  onAdd: (templateId: string) => void;
}

const ProtocolTemplateCard = ({ template, onAdd }: ProtocolTemplateCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <span className="text-4xl">{template.icon}</span>
          <Badge variant="outline" className="capitalize">
            {template.category}
          </Badge>
        </div>
        <CardTitle className="text-xl">{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Key Benefits:</p>
          <ul className="space-y-1">
            {template.benefits.slice(0, 3).map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          {template.benefits.length > 3 && (
            <p className="text-xs text-muted-foreground italic">
              +{template.benefits.length - 3} more benefits
            </p>
          )}
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={() => onAdd(template.id)} 
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Protocol
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProtocolTemplateCard;
