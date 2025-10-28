import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, CreditCard, Calendar, CheckCircle2, Package } from "lucide-react";
import { useActivePackage } from "@/hooks/useProtocolPackages";
import { useActivePurchase } from "@/hooks/usePackagePurchases";
import { useProtocols } from "@/hooks/useProtocols";
import { useAuth } from "@/hooks/useAuth";
import { generateProtocolPackage } from "@/services/packageGenerationService";
import { useToast } from "@/hooks/use-toast";

export const ProtocolPackageOfferCard = () => {
  const { user } = useAuth();
  const { protocols } = useProtocols();
  const { activePackage } = useActivePackage();
  const { hasPurchase } = useActivePurchase();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [localPackage, setLocalPackage] = useState(activePackage);

  const activeProtocol = protocols?.find(p => p.is_active);

  // Don't show if no active protocol or already purchased
  if (!activeProtocol || hasPurchase) return null;

  // If we have a local package or fetched package, show the offer
  const packageToShow = localPackage || activePackage;

  const handleGeneratePackage = async () => {
    if (!user || !activeProtocol) return;

    setIsGenerating(true);
    try {
      const pkg = await generateProtocolPackage(user.id, activeProtocol.id);
      if (pkg) {
        setLocalPackage(pkg);
        toast({
          title: "Package Generated!",
          description: "Your personalized 90-day protocol package is ready."
        });
      }
    } catch (error) {
      console.error('Error generating package:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate package. Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePurchase = (purchaseType: 'full_90_day' | 'payment_plan_3x') => {
    if (!packageToShow) return;
    navigate(`/package-checkout/${packageToShow.id}?type=${purchaseType}`);
  };

  // If no package yet, show generation prompt
  if (!packageToShow) {
    return (
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="text-xs">NEW</Badge>
          </div>
          <CardTitle>Get Your Complete 90-Day Protocol Package</CardTitle>
          <CardDescription>
            Save 15% when you purchase all your protocol items together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGeneratePackage} 
            disabled={isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate My Package"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show full package offer
  const installmentPrice = (packageToShow.final_price * 1.075) / 3;

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="text-xs">
            {packageToShow.tier.toUpperCase()} PACKAGE
          </Badge>
        </div>
        <CardTitle>Get Your Complete 90-Day Protocol</CardTitle>
        <CardDescription>
          {packageToShow.total_items_count} evidence-based products delivered to your door
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pricing Display */}
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">
              £{packageToShow.final_price.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              £{packageToShow.base_price.toFixed(2)}
            </span>
            <Badge className="bg-success text-success-foreground">
              Save £{packageToShow.discount_amount.toFixed(2)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Full 90-day supply • 15% discount applied
          </p>
        </div>

        {/* Payment Options */}
        <div className="space-y-2">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => handlePurchase('full_90_day')}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Buy Now - £{packageToShow.final_price.toFixed(2)}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => handlePurchase('payment_plan_3x')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            3 Monthly Payments of £{installmentPrice.toFixed(2)}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Payment plan includes 7.5% processing fee
          </p>
        </div>

        {/* What's Included */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">What's Included:</h4>
          <ul className="space-y-1 text-sm">
            {packageToShow.gold_items_count > 0 && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {packageToShow.gold_items_count} Gold-tier evidence products
              </li>
            )}
            {packageToShow.silver_items_count > 0 && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {packageToShow.silver_items_count} Silver-tier evidence products
              </li>
            )}
            {packageToShow.bronze_items_count > 0 && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {packageToShow.bronze_items_count} Bronze-tier products
              </li>
            )}
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Free shipping & tracking
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              90-day progress tracking
            </li>
          </ul>
        </div>

        {/* Customization Link */}
        <Button 
          variant="link" 
          className="w-full"
          onClick={() => navigate(`/package-customize/${packageToShow.id}`)}
        >
          <Package className="h-4 w-4 mr-2" />
          Customize Products Before Purchase
        </Button>
      </CardContent>
    </Card>
  );
};
