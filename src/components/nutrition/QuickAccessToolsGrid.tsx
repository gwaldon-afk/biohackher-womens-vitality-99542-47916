import { Card, CardContent } from '@/components/ui/card';
import { Calculator, Search, Dumbbell, Apple } from 'lucide-react';

interface QuickAccessToolsGridProps {
  onOpenCalculator: () => void;
  onOpenFoodSearch: () => void;
  onOpenLeucine: () => void;
  onOpenFODMAP: () => void;
}

const tools = [
  {
    id: 'calculator',
    icon: Calculator,
    title: 'Protein Calculator',
    description: 'Your daily targets',
    action: 'onOpenCalculator'
  },
  {
    id: 'food-search',
    icon: Search,
    title: 'Food Database',
    description: 'Longevity foods',
    action: 'onOpenFoodSearch'
  },
  {
    id: 'leucine',
    icon: Dumbbell,
    title: 'Leucine Guide',
    description: 'Muscle support',
    action: 'onOpenLeucine'
  },
  {
    id: 'fodmap',
    icon: Apple,
    title: 'FODMAP Guide',
    description: 'Gut health',
    action: 'onOpenFODMAP'
  }
];

export function QuickAccessToolsGrid({ 
  onOpenCalculator, 
  onOpenFoodSearch, 
  onOpenLeucine, 
  onOpenFODMAP 
}: QuickAccessToolsGridProps) {
  const actionMap: Record<string, () => void> = {
    onOpenCalculator,
    onOpenFoodSearch,
    onOpenLeucine,
    onOpenFODMAP
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Nutrition Tools</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card 
              key={tool.id}
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
              onClick={actionMap[tool.action]}
            >
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{tool.title}</h3>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
