import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus, X, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

export const ShoppingCartIcon = () => {
  const { getTotalItems, isCartOpen, setIsCartOpen } = useCart();
  const totalItems = getTotalItems();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {totalItems > 99 ? '99+' : totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <ShoppingCartContent />
      </SheetContent>
    </Sheet>
  );
};

const ShoppingCartContent = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { toast } = useToast();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "Please add items to your cart before checking out."
      });
      return;
    }

    toast({
      title: "Checkout Coming Soon",
      description: "Bulk checkout functionality will be available soon. Use 'Buy Now' for individual items."
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart."
    });
  };

  if (items.length === 0) {
    return (
      <>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            Your cart is empty. Add some products to get started!
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <ShoppingCart className="h-16 w-16 mb-4" />
          <p>Your cart is empty</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SheetHeader>
        <div className="flex items-center justify-between">
          <div>
            <SheetTitle>Shopping Cart</SheetTitle>
            <SheetDescription>
              {items.length} item{items.length !== 1 ? 's' : ''} in your cart
            </SheetDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                <p className="text-xs text-muted-foreground">{item.brand}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.dosage}</p>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="font-medium text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      {item.originalPrice && (
                        <div className="text-xs text-muted-foreground line-through">
                          ${(item.originalPrice * item.quantity).toFixed(2)}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total:</span>
          <span className="font-bold text-lg">${getTotalPrice().toFixed(2)}</span>
        </div>
        
        <div className="space-y-2">
          <Button className="w-full" onClick={handleCheckout}>
            Checkout (${getTotalPrice().toFixed(2)})
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Secure checkout powered by Stripe
          </p>
        </div>
      </div>
    </>
  );
};