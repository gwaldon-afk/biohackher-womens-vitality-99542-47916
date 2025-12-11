import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AssessmentHeroCardProps {
  icon: LucideIcon;
  headline: string;
  benefit: string;
  duration: string;
  ctaRoute: string;
}

export const AssessmentHeroCard = ({
  icon: Icon,
  headline,
  benefit,
  duration,
  ctaRoute,
}: AssessmentHeroCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="border-2 border-primary/30 hover:border-primary/50 transition-all hover:shadow-lg group h-full cursor-pointer bg-[#F8C5AC]/20 hover:bg-[#F8C5AC]/30" 
      onClick={() => navigate(ctaRoute)}
    >
      <CardContent className="p-6 h-full flex flex-col justify-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-[#F8C5AC]/40 flex items-center justify-center group-hover:bg-[#F8C5AC]/60 transition-colors">
              <Icon className="h-6 w-6 text-foreground" />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-xl font-bold leading-tight">{headline}</h3>
            <p className="text-muted-foreground">{benefit}</p>
          </div>

          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-[#F8C5AC]/30 text-foreground text-sm px-3 py-1">
              {duration}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
