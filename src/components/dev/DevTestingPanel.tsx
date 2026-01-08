/**
 * Developer Testing Panel
 * 
 * Unified panel for test mode tier selection and persona testing.
 * Only visible when TEST_MODE_ENABLED is true.
 * Toggle with Ctrl+Shift+T or click the floating button.
 */
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  FlaskConical, 
  X, 
  Play, 
  Trash2, 
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Users,
  Brain,
  Salad,
  Heart,
  ClipboardList,
  Watch,
  Pencil,
  Crown,
  User,
  UserX,
  UserCheck,
  Star
} from 'lucide-react';
import { TEST_MODE_ENABLED } from '@/config/testMode';
import { useTestPersonas } from '@/hooks/useTestPersonas';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

type AssessmentType = 'lis' | 'nutrition' | 'hormone';
type TestTier = 'guest' | 'registered' | 'subscribed' | 'premium';

const tierConfig: Record<TestTier, { icon: React.ReactNode; label: string; color: string }> = {
  guest: { icon: <UserX className="h-3 w-3" />, label: 'Guest', color: 'text-muted-foreground' },
  registered: { icon: <User className="h-3 w-3" />, label: 'Registered', color: 'text-blue-500' },
  subscribed: { icon: <UserCheck className="h-3 w-3" />, label: 'Subscribed', color: 'text-green-500' },
  premium: { icon: <Crown className="h-3 w-3" />, label: 'Premium', color: 'text-amber-500' },
};

export const DevTestingPanel = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [selectedAssessments, setSelectedAssessments] = useState<AssessmentType[]>(['lis', 'nutrition', 'hormone']);
  const [results, setResults] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState<TestTier>(() => {
    return (localStorage.getItem('testModeTier') as TestTier) || 'premium';
  });

  const { 
    personas, 
    runAssessments, 
    clearTestData, 
    resetAllOverrides,
    isRunning,
    hasOverrides,
    currentUserId
  } = useTestPersonas();

  // Handle tier change
  const handleTierChange = useCallback((tier: string) => {
    if (!tier) return;
    const newTier = tier as TestTier;
    setSelectedTier(newTier);
    localStorage.setItem('testModeTier', newTier);
    window.location.reload();
  }, []);

  // Only allow single persona selection for sequential testing
  const togglePersona = useCallback((id: string) => {
    setSelectedPersonas([id]); // Single selection only
  }, []);

  // Keyboard shortcut: Ctrl+Shift+T
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleAssessment = useCallback((type: AssessmentType) => {
    setSelectedAssessments(prev =>
      prev.includes(type)
        ? prev.filter(a => a !== type)
        : [...prev, type]
    );
  }, []);

  const handleRun = useCallback(async () => {
    if (selectedPersonas.length === 0) return;
    if (selectedAssessments.length === 0) return;

    const result = await runAssessments(selectedPersonas, selectedAssessments);
    setResults(result.results);
  }, [selectedPersonas, selectedAssessments, runAssessments]);

  const handleClear = useCallback(async () => {
    await clearTestData();
    setResults(['All test data cleared']);
  }, [clearTestData]);

  // Don't render if test mode is disabled
  if (!TEST_MODE_ENABLED) {
    return null;
  }

  // Floating toggle button
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 rounded-full w-12 h-12 p-0 bg-purple-600 hover:bg-purple-700 shadow-lg"
        title="Open Dev Testing Panel (Ctrl+Shift+T)"
      >
        <FlaskConical className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-24 right-6 z-50 w-80 shadow-xl border-purple-500/50 bg-background/95 backdrop-blur",
      isMinimized && "h-auto"
    )}>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-purple-500" />
          <CardTitle className="text-sm font-medium">Dev Testing</CardTitle>
          {hasOverrides && (
            <Badge variant="outline" className="text-xs">Modified</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-4 pt-0 space-y-4">
          {/* Tier Selection */}
          <div className="space-y-2">
            <span className="text-xs font-medium">Test Tier</span>
            <ToggleGroup 
              type="single" 
              value={selectedTier} 
              onValueChange={handleTierChange}
              className="justify-start flex-wrap gap-1"
            >
              {(Object.keys(tierConfig) as TestTier[]).map((tier) => (
                <ToggleGroupItem
                  key={tier}
                  value={tier}
                  size="sm"
                  className={cn(
                    "text-xs gap-1 h-7 px-2",
                    selectedTier === tier && tierConfig[tier].color
                  )}
                >
                  {tierConfig[tier].icon}
                  {tierConfig[tier].label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <Separator />

          {/* User Info Banner */}
          {selectedTier === 'guest' ? (
            <div className="text-xs bg-muted/50 rounded p-2 text-muted-foreground">
              <span className="font-medium">Guest Mode:</span> Not authenticated. Viewing public pages only.
            </div>
          ) : currentUserId ? (
            <div className="text-xs bg-muted/50 rounded p-2 text-muted-foreground">
              Testing as: <span className="font-mono">{currentUserId.slice(0, 8)}...</span>
              <br />
              <span className="text-[10px]">Data writes to your account (one persona at a time)</span>
            </div>
          ) : (
            <div className="text-xs bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded p-2">
              <span className="font-medium">{tierConfig[selectedTier].label} Mode:</span> Using mock authentication.
            </div>
          )}

          {/* Persona Selection - Single Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1">
                <Users className="h-3 w-3" /> Select Persona
              </span>
            </div>
            <ScrollArea className="h-40">
              <div className="space-y-1">
                {personas.map(persona => (
                  <label
                    key={persona.id}
                    className={cn(
                      "flex items-center gap-2 p-1.5 rounded cursor-pointer",
                      selectedPersonas.includes(persona.id) 
                        ? "bg-purple-500/20 border border-purple-500/50" 
                        : "hover:bg-muted/50"
                    )}
                    title={persona.backstory?.whyTheyreHere || persona.description}
                  >
                    <Checkbox
                      checked={selectedPersonas.includes(persona.id)}
                      onCheckedChange={() => togglePersona(persona.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">
                          {persona.backstory?.nickname || persona.name} ({persona.demographics.age})
                        </span>
                        {/* Tier badge */}
                        {persona.subscriptionTier === 'premium' ? (
                          <Crown className="h-3 w-3 text-amber-500" />
                        ) : (
                          <User className="h-3 w-3 text-blue-500" />
                        )}
                        {/* Data method badge */}
                        {persona.dataInputMethod === 'wearable' ? (
                          <Watch className="h-3 w-3 text-green-500" />
                        ) : (
                          <Pencil className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate block">
                        {persona.backstory?.occupation?.split(' at ')[0]}, {persona.backstory?.location?.split(',')[0]}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Assessment Selection */}
          <div className="space-y-2">
            <span className="text-xs font-medium">Assessments</span>
            <div className="flex gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <Checkbox
                  checked={selectedAssessments.includes('lis')}
                  onCheckedChange={() => toggleAssessment('lis')}
                />
                <Brain className="h-3 w-3 text-blue-500" />
                <span className="text-xs">LIS</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <Checkbox
                  checked={selectedAssessments.includes('nutrition')}
                  onCheckedChange={() => toggleAssessment('nutrition')}
                />
                <Salad className="h-3 w-3 text-green-500" />
                <span className="text-xs">Nutrition</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <Checkbox
                  checked={selectedAssessments.includes('hormone')}
                  onCheckedChange={() => toggleAssessment('hormone')}
                />
                <Heart className="h-3 w-3 text-pink-500" />
                <span className="text-xs">Hormone</span>
              </label>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleRun}
              disabled={isRunning || selectedPersonas.length === 0 || selectedAssessments.length === 0 || selectedTier === 'guest'}
              size="sm"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Play className="h-3 w-3 mr-1" />
              Apply Persona
            </Button>
            <Button
              onClick={handleClear}
              disabled={isRunning || selectedTier === 'guest'}
              variant="outline"
              size="sm"
              title="Clear all your test data"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            {hasOverrides && (
              <Button
                onClick={resetAllOverrides}
                disabled={isRunning}
                variant="outline"
                size="sm"
                title="Reset all persona modifications"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Results</span>
              <ScrollArea className="h-24 rounded border border-border p-2">
                <div className="space-y-0.5">
                  {results.map((result, i) => (
                    <div key={i} className="text-xs font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Quick Links */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              onClick={() => window.open('/dev-checklist', '_blank')}
            >
              <ClipboardList className="h-3 w-3" />
              Checklist
            </Button>
          </div>

          {/* Keyboard shortcut hint */}
          <div className="text-center">
            <span className="text-[10px] text-muted-foreground">
              Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Ctrl+Shift+T</kbd> to toggle
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
