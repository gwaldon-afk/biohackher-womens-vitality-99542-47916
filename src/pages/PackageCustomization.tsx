import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Package, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PackageCustomization = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [customizedPrice, setCustomizedPrice] = useState(0);

  const { data: packageData, isLoading } = useQuery({
    queryKey: ['package-customization', packageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('protocol_packages')
        .select(`
          *,
          package_protocol_items (
            *,
            protocol_items (*),
            products (*)
          )
        `)
        .eq('id', packageId)
        .single();

      if (error) throw error;

      // Initialize all items as selected
      const itemIds = new Set(data.package_protocol_items?.map((item: any) => item.id) || []);
      setSelectedItems(itemIds);
      setCustomizedPrice(data.final_price);

      return data;
    },
    enabled: !!packageId
  });

  const handleToggleItem = (itemId: string, itemPrice: number) => {
    const newSelected = new Set(selectedItems);
    
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
      setCustomizedPrice(prev => prev - itemPrice);
    } else {
      newSelected.add(itemId);
      setCustomizedPrice(prev => prev + itemPrice);
    }
    
    setSelectedItems(newSelected);
  };

  const handleProceedToCheckout = () => {
    // Store customization in session storage
    sessionStorage.setItem('packageCustomization', JSON.stringify({
      packageId,
      selectedItems: Array.from(selectedItems),
      customizedPrice
    }));
    
    navigate(`/package-checkout/${packageId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="container mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground">Package not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{packageData.package_name}</h1>
            <p className="text-muted-foreground">Customize your protocol package</p>
          </div>
        </div>

        {/* Price Summary Card */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>Package Summary</CardTitle>
            <CardDescription>
              {selectedItems.size} of {packageData.total_items_count} items selected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                £{customizedPrice.toFixed(2)}
              </span>
              <Badge variant="outline">
                {packageData.tier.toUpperCase()} PACKAGE
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Package Items</CardTitle>
            <CardDescription>
              Select the items you want to include in your package
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {packageData.package_protocol_items?.map((item: any) => {
              const product = item.products;
              const protocolItem = item.protocol_items;
              const itemPrice = product?.price_gbp || 0;

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => handleToggleItem(item.id, itemPrice)}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{product?.name || protocolItem?.name}</h4>
                        {protocolItem?.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {protocolItem.description}
                          </p>
                        )}
                        {product?.evidence_level && (
                          <Badge variant="outline" className="mt-2">
                            {product.evidence_level} evidence
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">£{itemPrice.toFixed(2)}</p>
                        {protocolItem?.frequency && (
                          <p className="text-xs text-muted-foreground">
                            {protocolItem.frequency}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Proceed Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button 
            size="lg" 
            onClick={handleProceedToCheckout}
            disabled={selectedItems.size === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PackageCustomization;
