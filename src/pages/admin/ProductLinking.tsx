import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Link as LinkIcon, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  batchAutoMatchProtocolItems, 
  getProtocolItemsWithProducts 
} from "@/services/protocolProductLinkingService";
import { ProductLinkingDialog } from "@/components/protocol/ProductLinkingDialog";

export default function ProductLinking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
    type: string;
    productId: string | null;
  } | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ['protocol-items-products'],
    queryFn: () => getProtocolItemsWithProducts(),
  });

  const batchMatchMutation = useMutation({
    mutationFn: batchAutoMatchProtocolItems,
    onSuccess: (results) => {
      toast({
        title: "Auto-matching complete",
        description: `Matched ${results.matched} items, ${results.unmatched} remain unmatched`,
      });
      queryClient.invalidateQueries({ queryKey: ['protocol-items-products'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to auto-match protocol items",
        variant: "destructive",
      });
    },
  });

  const linkedCount = items?.filter(item => item.product_id).length || 0;
  const unlinkedCount = items?.filter(item => !item.product_id).length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Product Linking</h1>
        <p className="text-muted-foreground mt-1">
          Link protocol items to products for bundle purchasing
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Linked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="text-2xl font-bold">{linkedCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unlinked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div className="text-2xl font-bold">{unlinkedCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Actions</CardTitle>
          <CardDescription>
            Auto-match all unlinked supplement items to products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => batchMatchMutation.mutate()}
            disabled={batchMatchMutation.isPending || unlinkedCount === 0}
          >
            {batchMatchMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Matching...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Auto-Match All ({unlinkedCount} items)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Protocol Items</CardTitle>
          <CardDescription>
            View and manage product links for all protocol items
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : items?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No protocol items found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Protocol Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Linked Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.item_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.protocols?.name}
                      </TableCell>
                      <TableCell>
                        {item.products ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">{item.products.name}</span>
                            {item.products.brand && (
                              <span className="text-xs text-muted-foreground">
                                {item.products.brand}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not linked</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.product_id ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Linked
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Unlinked
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSelectedItem({
                              id: item.id,
                              name: item.name,
                              type: item.item_type,
                              productId: item.product_id,
                            })
                          }
                        >
                          <LinkIcon className="mr-1 h-3 w-3" />
                          {item.product_id ? 'Edit Link' : 'Link Product'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Linking Dialog */}
      {selectedItem && (
        <ProductLinkingDialog
          protocolItemId={selectedItem.id}
          protocolItemName={selectedItem.name}
          protocolItemType={selectedItem.type}
          currentProductId={selectedItem.productId}
          open={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
          onLinked={() => {
            queryClient.invalidateQueries({ queryKey: ['protocol-items-products'] });
          }}
        />
      )}
    </div>
  );
}
