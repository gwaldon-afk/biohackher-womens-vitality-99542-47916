import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AssessmentHeroCardProps {
  icon: LucideIcon;
  headline: string;
  benefit: string;
  duration: string;
  ctaText: string;
  ctaRoute: string;
  socialProof?: string;
}

export const AssessmentHeroCard = ({
  icon: Icon,
  headline,
  benefit,
  duration,
  ctaText,
  ctaRoute,
  socialProof,
}: AssessmentHeroCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-2 border-primary/30 hover:border-primary/50 transition-all hover:shadow-lg group h-full cursor-pointer" onClick={() => navigate(ctaRoute)}>
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex-1 space-y-3">
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-base font-bold leading-tight">{headline}</h3>
            <p className="text-sm text-muted-foreground">{benefit}</p>
          </div>

          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-primary/5 text-xs">
              {duration}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mt-3">
          <Button
            onClick={(e) => { e.stopPropagation(); navigate(ctaRoute); }}
            className="w-full group-hover:scale-105 transition-transform text-sm"
            size="default"
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
