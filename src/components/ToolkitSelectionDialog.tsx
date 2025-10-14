import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, CheckCircle2 } from "lucide-react";
import { getAllToolkitItems, ToolkitItemWithCategory } from "@/services/toolkitService";
import { Skeleton } from "@/components/ui/skeleton";

interface ToolkitSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pillarFilter?: string;
  onItemsSelected: (items: ToolkitItemWithCategory[]) => void;
}

export function ToolkitSelectionDialog({
  open,
  onOpenChange,
  pillarFilter,
  onItemsSelected,
}: ToolkitSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<ToolkitItemWithCategory[]>([]);

  const { data: allItems, isLoading } = useQuery({
    queryKey: ['toolkit-items-all'],
    queryFn: getAllToolkitItems,
    enabled: open,
  });

  const filteredItems = allItems?.filter(item => {
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return matchesSearch;
  });

  const itemsByCategory = filteredItems?.reduce((acc, item) => {
    const categoryName = item.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, ToolkitItemWithCategory[]>);

  const toggleItem = (item: ToolkitItemWithCategory) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleConfirm = () => {
    onItemsSelected(selectedItems);
    setSelectedItems([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Interventions from Toolkit</DialogTitle>
          <DialogDescription>
            Browse evidence-based biohacking tools to add to your goal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search interventions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </span>
            </div>
          )}

          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Tabs defaultValue={Object.keys(itemsByCategory || {})[0]} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                  {Object.keys(itemsByCategory || {}).map(category => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(itemsByCategory || {}).map(([category, items]) => (
                  <TabsContent key={category} value={category} className="space-y-3 mt-4">
                    {items.map(item => {
                      const isSelected = selectedItems.some(i => i.id === item.id);
                      return (
                        <Card
                          key={item.id}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => toggleItem(item)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <CardTitle className="text-base flex items-center gap-2">
                                  {item.name}
                                  {isSelected && (
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                  )}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  {item.description}
                                </CardDescription>
                              </div>
                              {item.evidence_level && (
                                <Badge variant="secondary" className="capitalize shrink-0">
                                  {item.evidence_level}
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </ScrollArea>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedItems.length === 0}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
