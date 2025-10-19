import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Moon, Sun } from 'lucide-react';

export const TomorrowPrep = () => {
  const prepItems = [
    { id: 1, text: 'Set out morning supplements', icon: '💊' },
    { id: 2, text: 'Prep workout clothes', icon: '👟' },
    { id: 3, text: 'Review tomorrow\'s schedule', icon: '📅' },
    { id: 4, text: 'Set wake-up intention', icon: '🎯' }
  ];

  return (
    <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-indigo-600" />
          Prepare for Tomorrow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3">
          {prepItems.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <Checkbox />
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-start gap-2">
            <Sun className="w-4 h-4 text-orange-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Tomorrow's Preview</p>
              <p className="text-xs text-muted-foreground">7 actions scheduled • Morning focus time at 9am</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
