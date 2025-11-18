import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmptyShopStateProps {
  variant: "no-recommendations" | "no-products" | "no-assessment";
}

export const EmptyShopState = ({ variant }: EmptyShopStateProps) => {
  const navigate = useNavigate();

  if (variant === "no-assessment") {
    return (
      <Card className="p-8 text-center border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-3">Get Personalized Product Recommendations</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Complete your assessments to receive AI-powered product recommendations matched to your health profile and goals.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/guest-lis-assessment')} size="lg">
            <TrendingUp className="mr-2 h-4 w-4" />
            Take LIS Assessment
          </Button>
          <Button onClick={() => navigate('/longevity-nutrition')} variant="outline" size="lg">
            <Target className="mr-2 h-4 w-4" />
            Nutrition Assessment
          </Button>
        </div>
      </Card>
    );
  }

  if (variant === "no-products") {
    return (
      <Card className="p-12 text-center border-2 border-border/50">
        <p className="text-muted-foreground text-lg">
          No products found matching your criteria
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your filters or search term
        </p>
      </Card>
    );
  }

  return null;
};
