import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ExternalLink, Pill } from "lucide-react";
import { useActivePurchase } from "@/hooks/usePackagePurchases";

export const ProtocolPackageStatusCard = () => {
  const { activePurchase } = useActivePurchase();
  const navigate = useNavigate();

  if (!activePurchase) return null;

  const packageData = (activePurchase as any).protocol_packages;
  if (!packageData) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'default';
      case 'processing': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'shipped': return 'In Transit';
      case 'processing': return 'Processing';
      default: return 'Pending';
    }
  };

  return (
    <Card className="border-success/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="success" className="mb-2">ACTIVE PACKAGE</Badge>
            <CardTitle>{packageData.package_name}</CardTitle>
            <CardDescription>
              {getStatusLabel(activePurchase.shipment_status)} • 
              {activePurchase.purchase_type === 'payment_plan_3x' 
                ? ` Payment ${activePurchase.payment_plan_current_installment}/3`
                : ' Paid in Full'}
            </CardDescription>
          </div>
          <Package className="h-8 w-8 text-success" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Shipment Status */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Shipment Status</span>
              <Badge variant={getStatusColor(activePurchase.shipment_status) as "default" | "destructive" | "outline" | "secondary"}>
                {getStatusLabel(activePurchase.shipment_status)}
              </Badge>
            </div>
            {activePurchase.tracking_number && (
              <a 
                href={`https://track.shipment.com/${activePurchase.tracking_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Track: {activePurchase.tracking_number}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {activePurchase.delivered_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Delivered on {new Date(activePurchase.delivered_at).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* What's Included */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Your Package Includes:</h4>
            <div className="grid grid-cols-2 gap-2">
              {packageData.package_protocol_items
                ?.slice(0, 4)
                .map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2 text-xs">
                    <Pill className="h-3 w-3" />
                    <span className="truncate">{item.products?.name || item.protocol_items?.name}</span>
                  </div>
                ))}
            </div>
            {packageData.total_items_count > 4 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{packageData.total_items_count - 4} more items
              </p>
            )}
          </div>

          {/* Daily Actions from Package */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/plan-home')}
          >
            View Today's Protocol Actions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
