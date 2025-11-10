import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Link, Unlink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/productService";
import { linkProtocolItemToProduct, autoMatchProtocolItemToProduct } from "@/services/protocolProductLinkingService";
import { useToast } from "@/hooks/use-toast";

interface ProductLinkingDialogProps {
  protocolItemId: string;
  protocolItemName: string;
  protocolItemType: string;
  currentProductId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinked?: () => void;
}

export const ProductLinkingDialog = ({
  protocolItemId,
  protocolItemName,
  protocolItemType,
  currentProductId,
  open,
  onOpenChange,
  onLinked,
}: ProductLinkingDialogProps) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(currentProductId || null);
  const [isLinking, setIsLinking] = useState(false);
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  // Auto-suggest product on mount
  useEffect(() => {
    if (products && !currentProductId && protocolItemType === 'supplement') {
      const suggested = autoMatchProtocolItemToProduct(protocolItemName, protocolItemType, products);
      if (suggested) {
        setSelectedProductId(suggested.id);
      }
    }
  }, [products, protocolItemName, protocolItemType, currentProductId]);

  const handleLink = async () => {
    setIsLinking(true);
    try {
      await linkProtocolItemToProduct(protocolItemId, selectedProductId);
      toast({
        title: selectedProductId ? "Product linked" : "Product unlinked",
        description: selectedProductId 
          ? `${protocolItemName} is now linked to a product`
          : `${protocolItemName} has been unlinked`,
      });
      onLinked?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product link",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const suggestedProduct = products && !currentProductId 
    ? autoMatchProtocolItemToProduct(protocolItemName, protocolItemType, products)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Link Product</DialogTitle>
          <DialogDescription>
            Connect "{protocolItemName}" to a product for bundle purchasing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {protocolItemType !== 'supplement' && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Only supplement items can be linked to products.
              </p>
            </div>
          )}

          {protocolItemType === 'supplement' && (
            <>
              {suggestedProduct && !currentProductId && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5">Suggested</Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{suggestedProduct.name}</p>
                      {suggestedProduct.brand && (
                        <p className="text-xs text-muted-foreground">{suggestedProduct.brand}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Product</label>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Select
                    value={selectedProductId || "none"}
                    onValueChange={(value) => setSelectedProductId(value === "none" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">No product</span>
                      </SelectItem>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex flex-col">
                            <span>{product.name}</span>
                            {product.brand && (
                              <span className="text-xs text-muted-foreground">{product.brand}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleLink}
                  disabled={isLinking || selectedProductId === currentProductId}
                  className="flex-1"
                >
                  {isLinking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Linking...
                    </>
                  ) : selectedProductId ? (
                    <>
                      <Link className="mr-2 h-4 w-4" />
                      Link Product
                    </>
                  ) : (
                    <>
                      <Unlink className="mr-2 h-4 w-4" />
                      Remove Link
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
