import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Search } from 'lucide-react';
import FoodDatabaseSearch from '@/components/FoodDatabaseSearch';
import LongevityFoodInsights from '@/components/LongevityFoodInsights';

interface FoodSearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FoodSearchDrawer({ open, onOpenChange }: FoodSearchDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Longevity Foods Database
          </SheetTitle>
          <SheetDescription>
            Search our database of anti-aging and longevity-promoting foods
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <FoodDatabaseSearch />
          <LongevityFoodInsights />
        </div>
      </SheetContent>
    </Sheet>
  );
}
