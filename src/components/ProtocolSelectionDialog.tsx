import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCart } from '@/hooks/useCart';
import { useLocale } from '@/hooks/useLocale';
import { Product, searchProductsBySymptoms, formatProductPrice, getProductPrice } from '@/services/productService';
import { ProtocolItem } from '@/utils/hormoneCompassProtocolGenerator';
import { CheckCircle2, ChevronDown, ShoppingCart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProtocolSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  protocol: {
    immediate: ProtocolItem[];
    foundation: ProtocolItem[];
    optimization: ProtocolItem[];
  };
  onSave: (selectedItems: ProtocolItem[], cartItems: Product[]) => Promise<void>;
  onCancel: () => void;
}

interface SelectableProtocolItem extends ProtocolItem {
  selected: boolean;
  matchedProduct?: Product | null;
  addToCart?: boolean;
}

export const ProtocolSelectionDialog = ({
  open,
  onOpenChange,
  protocol,
  onSave,
  onCancel
}: ProtocolSelectionDialogProps) => {
  const { addToCart } = useCart();
  const { getCurrentLocale } = useLocale();
  const [items, setItems] = useState<{
    immediate: SelectableProtocolItem[];
    foundation: SelectableProtocolItem[];
    optimization: SelectableProtocolItem[];
  }>({
    immediate: [],
    foundation: [],
    optimization: []
  });
  const [openSections, setOpenSections] = useState<string[]>(['immediate', 'foundation']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize items and fetch product matches
  useEffect(() => {
    const initializeItems = async () => {
      setIsLoading(true);
      
      // Pre-select immediate items, leave others unselected
      const immediateItems: SelectableProtocolItem[] = protocol.immediate.map(item => ({
        ...item,
        selected: true,
        addToCart: false
      }));

      const foundationItems: SelectableProtocolItem[] = protocol.foundation.map(item => ({
        ...item,
        selected: false,
        addToCart: false
      }));

      const optimizationItems: SelectableProtocolItem[] = protocol.optimization.map(item => ({
        ...item,
        selected: false,
        addToCart: false
      }));

      // Fetch product matches for items with keywords
      const allItems = [...immediateItems, ...foundationItems, ...optimizationItems];
      
      for (const item of allItems) {
        if (item.productKeywords && item.productKeywords.length > 0) {
          try {
            const products = await searchProductsBySymptoms(item.productKeywords);
            item.matchedProduct = products.length > 0 ? products[0] : null;
          } catch (error) {
            console.error(`Error matching product for ${item.name}:`, error);
            item.matchedProduct = null;
          }
        }
      }

      setItems({
        immediate: immediateItems,
        foundation: foundationItems,
        optimization: optimizationItems
      });
      
      setIsLoading(false);
    };

    if (open) {
      initializeItems();
    }
  }, [open, protocol]);

  const toggleItemSelection = (category: 'immediate' | 'foundation' | 'optimization', index: number) => {
    setItems(prev => ({
      ...prev,
      [category]: prev[category].map((item, i) => 
        i === index ? { ...item, selected: !item.selected } : item
      )
    }));
  };

  const toggleCartSelection = (category: 'immediate' | 'foundation' | 'optimization', index: number) => {
    setItems(prev => ({
      ...prev,
      [category]: prev[category].map((item, i) => 
        i === index ? { ...item, addToCart: !item.addToCart } : item
      )
    }));
  };

  const handleSelectAll = () => {
    setItems(prev => ({
      immediate: prev.immediate.map(item => ({ ...item, selected: true })),
      foundation: prev.foundation.map(item => ({ ...item, selected: true })),
      optimization: prev.optimization.map(item => ({ ...item, selected: true }))
    }));
  };

  const handleSaveSelected = async () => {
    setIsSaving(true);
    try {
      const selectedItems = [
        ...items.immediate.filter(item => item.selected),
        ...items.foundation.filter(item => item.selected),
        ...items.optimization.filter(item => item.selected)
      ];

      if (selectedItems.length === 0) {
        toast.error('Please select at least one action to add to your plan');
        setIsSaving(false);
        return;
      }

      // Get cart items
      const cartItems = [
        ...items.immediate.filter(item => item.addToCart && item.matchedProduct),
        ...items.foundation.filter(item => item.addToCart && item.matchedProduct),
        ...items.optimization.filter(item => item.addToCart && item.matchedProduct)
      ].map(item => item.matchedProduct!);

      await onSave(selectedItems, cartItems);
      
      // Add items to cart
      const locale = getCurrentLocale();
      cartItems.forEach(product => {
        const price = getProductPrice(product, locale.currency) || 0;
        addToCart({
          id: product.id,
          name: product.name,
          price: price,
          image: product.image_url || '/placeholder.svg',
          brand: product.brand || 'Unknown',
          dosage: product.usage_instructions || 'As directed',
        });
      });
      
      if (cartItems.length > 0) {
        toast.success(`${selectedItems.length} actions added to your plan and ${cartItems.length} products added to cart!`);
      } else {
        toast.success(`${selectedItems.length} actions added to your plan!`);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving protocol:', error);
      toast.error('Failed to save protocol. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getTotalSelected = () => {
    return items.immediate.filter(item => item.selected).length +
           items.foundation.filter(item => item.selected).length +
           items.optimization.filter(item => item.selected).length;
  };

  const renderProtocolItem = (
    item: SelectableProtocolItem,
    category: 'immediate' | 'foundation' | 'optimization',
    index: number,
    priorityColor: string
  ) => {
    const locale = getCurrentLocale();
    
    return (
      <div key={index} className={`p-4 rounded-lg border ${item.selected ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
        <div className="flex items-start gap-3">
          <Checkbox
            checked={item.selected}
            onCheckedChange={() => toggleItemSelection(category, index)}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm">{item.name}</h4>
              <Badge variant="outline" className={priorityColor}>
                {category === 'immediate' ? 'CRITICAL' : category === 'foundation' ? 'HIGH' : 'MEDIUM'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
            <p className="text-xs italic text-muted-foreground">{item.relevance}</p>
            
            {/* Product match with cart toggle */}
            {item.matchedProduct && (
              <div className="mt-3 p-3 bg-muted/50 rounded border border-border/50">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={item.addToCart || false}
                    onCheckedChange={() => toggleCartSelection(category, index)}
                    disabled={!item.selected}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.matchedProduct.name}</p>
                    <p className="text-xs text-muted-foreground">{item.matchedProduct.brand}</p>
                    <p className="text-sm font-bold text-primary mt-1">
                      {formatProductPrice(item.matchedProduct, locale.currency)}
                    </p>
                  </div>
                  <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Your Personalized Protocol</DialogTitle>
          <DialogDescription>
            Select the actions you're ready to commit to. You can always add more later.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>Loading protocol recommendations...</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Info Alert */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    You're in control of your protocol
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200/90">
                    Only selected items will appear in your daily plan. Immediate actions are pre-selected as they're critical for your health goals.
                  </p>
                </div>
              </div>
            </div>

            {/* Immediate Actions */}
            {items.immediate.length > 0 && (
              <Collapsible
                open={openSections.includes('immediate')}
                onOpenChange={(open) => {
                  setOpenSections(prev => 
                    open ? [...prev, 'immediate'] : prev.filter(s => s !== 'immediate')
                  );
                }}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">DO TODAY</Badge>
                      <span className="font-semibold">Immediate Actions</span>
                      <span className="text-xs text-muted-foreground">
                        ({items.immediate.filter(i => i.selected).length}/{items.immediate.length} selected)
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openSections.includes('immediate') ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 mt-2">
                    {items.immediate.map((item, index) => 
                      renderProtocolItem(item, 'immediate', index, 'text-red-600 border-red-600')
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Foundation Protocol */}
            {items.foundation.length > 0 && (
              <Collapsible
                open={openSections.includes('foundation')}
                onOpenChange={(open) => {
                  setOpenSections(prev => 
                    open ? [...prev, 'foundation'] : prev.filter(s => s !== 'foundation')
                  );
                }}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">THIS WEEK</Badge>
                      <span className="font-semibold">Foundation Protocol</span>
                      <span className="text-xs text-muted-foreground">
                        ({items.foundation.filter(i => i.selected).length}/{items.foundation.length} selected)
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openSections.includes('foundation') ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 mt-2">
                    {items.foundation.map((item, index) => 
                      renderProtocolItem(item, 'foundation', index, 'text-blue-600 border-blue-600')
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Optimization Layer */}
            {items.optimization.length > 0 && (
              <Collapsible
                open={openSections.includes('optimization')}
                onOpenChange={(open) => {
                  setOpenSections(prev => 
                    open ? [...prev, 'optimization'] : prev.filter(s => s !== 'optimization')
                  );
                }}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">NEXT 30 DAYS</Badge>
                      <span className="font-semibold">Optimization Layer</span>
                      <span className="text-xs text-muted-foreground">
                        ({items.optimization.filter(i => i.selected).length}/{items.optimization.length} selected)
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openSections.includes('optimization') ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 mt-2">
                    {items.optimization.map((item, index) => 
                      renderProtocolItem(item, 'optimization', index, 'text-primary border-primary')
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {getTotalSelected()} {getTotalSelected() === 1 ? 'item' : 'items'} selected
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              Review Later
            </Button>
            <Button
              variant="outline"
              onClick={handleSelectAll}
              disabled={isLoading || isSaving}
            >
              Select All
            </Button>
            <Button
              onClick={handleSaveSelected}
              disabled={isLoading || isSaving || getTotalSelected() === 0}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Selected to My Plan'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};