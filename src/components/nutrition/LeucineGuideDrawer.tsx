import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Dumbbell } from 'lucide-react';
import ScienceBackedIcon from '@/components/ScienceBackedIcon';
import ResearchCitation from '@/components/ResearchCitation';
import { leucineRichFoods } from '@/data/nutritionData';

interface LeucineGuideDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getLeucineScoreColor = (score: string) => {
  switch (score) {
    case "Excellent": return "text-green-600 bg-green-50 border-green-200";
    case "Good": return "text-blue-600 bg-blue-50 border-blue-200";
    case "Fair": return "text-orange-600 bg-orange-50 border-orange-200";
    default: return "text-muted-foreground bg-muted border-border";
  }
};

export function LeucineGuideDrawer({ open, onOpenChange }: LeucineGuideDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            Leucine-Rich Foods
            <ScienceBackedIcon className="h-4 w-4" showTooltip={false} />
          </SheetTitle>
          <SheetDescription>
            Key amino acid for muscle protein synthesis - aim for 2.5-3g per meal
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <ResearchCitation
            title="The Role of Leucine in Weight Loss Diet and Glucose Homeostasis"
            journal="Frontiers in Pharmacology"
            year={2016}
            url="https://pubmed.ncbi.nlm.nih.gov/27242532/"
            doi="10.3389/fphar.2016.00144"
            studyType="Review"
          />
          
          <div className="grid gap-3">
            {leucineRichFoods.map((food, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{food.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {food.protein}g protein • {food.leucine}g leucine
                  </p>
                </div>
                <Badge className={getLeucineScoreColor(food.score)}>
                  {food.score}
                </Badge>
              </div>
            ))}
          </div>

          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h4 className="font-semibold text-foreground mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-muted-foreground">
              Consume leucine-rich foods within 2 hours after resistance training. 
              Combining different protein sources helps reach the optimal leucine threshold.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
