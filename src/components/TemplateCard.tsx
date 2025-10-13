import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Eye } from "lucide-react";

export interface MealPlanTemplate {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  dietaryTags: string[];
  icon: string;
}

interface TemplateCardProps {
  template: MealPlanTemplate;
  onPreview: () => void;
  onUse: () => void;
  isSelected?: boolean;
}

const TemplateCard = ({ template, onPreview, onUse, isSelected }: TemplateCardProps) => {
  return (
    <Card className={`transition-all hover:shadow-lg ${isSelected ? 'border-primary border-2' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{template.icon}</span>
            <div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription className="text-sm mt-1">{template.description}</CardDescription>
            </div>
          </div>
          {isSelected && (
            <Badge className="bg-primary">
              <Check className="h-3 w-3 mr-1" />
              Selected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nutritional Overview */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-bold text-primary">{template.avgCalories}</div>
            <div className="text-xs text-muted-foreground">cal/day</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold">{template.avgProtein}g</div>
            <div className="text-xs text-muted-foreground">protein</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold">{template.avgCarbs}g</div>
            <div className="text-xs text-muted-foreground">carbs</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold">{template.avgFat}g</div>
            <div className="text-xs text-muted-foreground">fat</div>
          </div>
        </div>

        {/* Dietary Tags */}
        <div className="flex flex-wrap gap-1">
          {template.dietaryTags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Benefits */}
        <div className="space-y-1">
          {template.benefits.slice(0, 3).map((benefit, index) => (
            <div key={index} className="flex items-start gap-2 text-xs">
              <Check className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onPreview}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            size="sm" 
            onClick={onUse}
            className="flex-1"
          >
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
