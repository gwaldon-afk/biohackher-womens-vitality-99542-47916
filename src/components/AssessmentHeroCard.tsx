import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AssessmentHeroCardProps {
  icon: LucideIcon;
  headline: string;
  painPoint: string;
  benefits: string[];
  duration: string;
  ctaText: string;
  ctaRoute: string;
  socialProof?: string;
}

export const AssessmentHeroCard = ({
  icon: Icon,
  headline,
  painPoint,
  benefits,
  duration,
  ctaText,
  ctaRoute,
  socialProof,
}: AssessmentHeroCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-2 border-primary/30 hover:border-primary/50 transition-all hover:shadow-lg group h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex-1 space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-xl font-bold">{headline}</h3>
            <p className="text-sm text-muted-foreground italic">{painPoint}</p>
          </div>

          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-primary/5">
              {duration}
            </Badge>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <Button
            onClick={() => navigate(ctaRoute)}
            className="w-full group-hover:scale-105 transition-transform"
            size="lg"
          >
            {ctaText}
          </Button>

          {socialProof && (
            <p className="text-xs text-center text-muted-foreground">{socialProof}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
