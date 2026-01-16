/**
 * Developer Testing Panel
 * 
 * Real authentication login/logout switcher for test personas.
 * Only visible when TEST_MODE_ENABLED is true.
 * Toggle with Ctrl+Shift+T or click the floating button.
 */
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  LogIn,
  LogOut,
  Loader2,
  CheckCircle2,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { TEST_MODE_ENABLED } from '@/config/testMode';
import { useTestPersonas } from '@/hooks/useTestPersonas';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AssessmentType = 'lis' | 'nutrition' | 'hormone';

export const DevTestingPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [selectedAssessments, setSelectedAssessments] = useState<AssessmentType[]>(['lis', 'nutrition', 'hormone']);
  const [results, setResults] = useState<string[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSeedingUsers, setIsSeedingUsers] = useState(false);
  const safeGet = (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const [usersSeeded, setUsersSeeded] = useState(() => safeGet('testUsersSeeded') === 'true');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { user } = useAuth();
  
  const { 
    personas, 
    runAssessments, 
    clearTestData, 
    resetAllOverrides,
    isRunning,
    hasOverrides,
  } = useTestPersonas();

  // Find current logged-in persona based on email
  const currentPersona = user?.email 
    ? personas.find(p => p.credentials.email === user.email)
    : null;

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

  // Login as a test persona
  const handleLogin = useCallback(async (personaId: string) => {
    const persona = personas.find(p => p.id === personaId);
    if (!persona) return;

    setIsLoggingIn(true);
    setResults([]);

    try {
      // Sign out first if already logged in
      if (user) {
        await supabase.auth.signOut();
      }

      // Sign in with persona credentials
      const { error } = await supabase.auth.signInWithPassword({
        email: persona.credentials.email,
        password: persona.credentials.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          // Users might not exist - clear seeded flag
          localStorage.removeItem('testUsersSeeded');
          setUsersSeeded(false);
          setResults([
            `Login failed: User "${persona.name}" doesn't exist yet.`,
            'Click "Seed Test Users" to create all test accounts first.',
          ]);
          toast.error(`User ${persona.name} not found. Run "Seed Test Users" first.`);
        } else {
          throw error;
        }
      } else {
        setResults([`✓ Logged in as ${persona.name}`]);
        toast.success(`Logged in as ${persona.name}`);
        setSelectedPersonaId(null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setResults([`✗ Login failed: ${message}`]);
      toast.error(message);
    } finally {
      setIsLoggingIn(false);
    }
  }, [personas, user]);

  // Logout
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      setResults(['✓ Logged out']);
      toast.success('Logged out');
    } catch (error) {
      toast.error('Failed to log out');
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  // Apply persona data to current logged-in user
  const handleApplyData = useCallback(async () => {
    if (!currentPersona || selectedAssessments.length === 0) return;

    const result = await runAssessments([currentPersona.id], selectedAssessments);
    setResults(result.results);
  }, [currentPersona, selectedAssessments, runAssessments]);

  // Clear data for current user
  const handleClear = useCallback(async () => {
    await clearTestData();
    setResults(['All test data cleared']);
  }, [clearTestData]);

  // Seed test users via edge function
  const handleSeedUsers = useCallback(async () => {
    setIsSeedingUsers(true);
    setResults(['Seeding test users...']);

    try {
      const { data, error } = await supabase.functions.invoke('seed-test-users');
      
      if (error) throw error;

      const resultMessages = data.results?.map((r: { email: string; status: string; error?: string }) => 
        `${r.email}: ${r.status}${r.error ? ` (${r.error})` : ''}`
      ) || [];
      
      setResults(['✓ Test users seeded:', ...resultMessages]);
      
      // Only mark as seeded if truly successful
      const hasErrors = data.results?.some((r: { status: string }) => r.status === 'error');
      if (data.success && !hasErrors) {
        localStorage.setItem('testUsersSeeded', 'true');
        setUsersSeeded(true);
        toast.success('Test users created successfully');
      } else {
        toast.error('Some test users failed to seed. Check results below.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to seed users';
      setResults([`✗ Seed failed: ${message}`]);
      toast.error(message);
    } finally {
      setIsSeedingUsers(false);
    }
  }, []);

  // Reset test users - clears data and re-seeds
  const handleResetUsers = useCallback(async () => {
    setShowResetConfirm(false);
    await clearTestData();
    await handleSeedUsers();
  }, [clearTestData, handleSeedUsers]);

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
          {/* Current Auth Status */}
          {user ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded p-3 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Logged in
                </span>
              </div>
              {currentPersona ? (
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{currentPersona.backstory?.nickname || currentPersona.name}</span>
                    {currentPersona.subscriptionTier === 'premium' ? (
                      <Crown className="h-3 w-3 text-amber-500" />
                    ) : (
                      <User className="h-3 w-3 text-blue-500" />
                    )}
                    {currentPersona.dataInputMethod === 'wearable' && (
                      <Watch className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    {currentPersona.backstory?.occupation?.split(' at ')[0]} • Age {currentPersona.demographics.age}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  <span className="font-mono">{user.email}</span>
                  <br />
                  <span className="text-[10px]">(Not a test persona)</span>
                </div>
              )}
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="outline"
                size="sm"
                className="w-full mt-2"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <LogOut className="h-3 w-3 mr-1" />
                )}
                Logout
              </Button>
            </div>
          ) : (
            <div className="bg-muted/50 rounded p-2 text-xs text-muted-foreground text-center">
              Not logged in. Select a persona below to login.
            </div>
          )}

          <Separator />

          {/* Persona Selection - for login or showing options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1">
                <Users className="h-3 w-3" /> 
                {user ? 'Switch Persona' : 'Login as Persona'}
              </span>
            </div>
            <ScrollArea className="h-36">
              <div className="space-y-1">
                {personas.map(persona => (
                  <div
                    key={persona.id}
                    className={cn(
                      "flex items-center gap-2 p-1.5 rounded cursor-pointer",
                      selectedPersonaId === persona.id 
                        ? "bg-purple-500/20 border border-purple-500/50" 
                        : currentPersona?.id === persona.id
                          ? "bg-green-500/10 border border-green-500/30"
                          : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedPersonaId(
                      selectedPersonaId === persona.id ? null : persona.id
                    )}
                    title={persona.backstory?.whyTheyreHere || persona.description}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">
                          {persona.backstory?.nickname || persona.name} ({persona.demographics.age})
                        </span>
                        {persona.subscriptionTier === 'premium' ? (
                          <Crown className="h-3 w-3 text-amber-500" />
                        ) : (
                          <User className="h-3 w-3 text-blue-500" />
                        )}
                        {persona.dataInputMethod === 'wearable' ? (
                          <Watch className="h-3 w-3 text-green-500" />
                        ) : (
                          <Pencil className="h-3 w-3 text-muted-foreground" />
                        )}
                        {currentPersona?.id === persona.id && (
                          <CheckCircle2 className="h-3 w-3 text-green-500 ml-auto" />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate block">
                        {persona.backstory?.occupation?.split(' at ')[0]}, {persona.backstory?.location?.split(',')[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Login button for selected persona */}
            {selectedPersonaId && (
              <Button
                onClick={() => handleLogin(selectedPersonaId)}
                disabled={isLoggingIn}
                size="sm"
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isLoggingIn ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <LogIn className="h-3 w-3 mr-1" />
                )}
                Login as {personas.find(p => p.id === selectedPersonaId)?.backstory?.nickname}
              </Button>
            )}
          </div>

          {/* Data seeding section - only when logged in as a persona */}
          {currentPersona && (
            <>
              <Separator />
              
              {/* Assessment Selection */}
              <div className="space-y-2">
                <span className="text-xs font-medium">Apply Assessment Data</span>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAssessments.includes('lis')}
                      onChange={() => toggleAssessment('lis')}
                      className="h-3 w-3"
                    />
                    <Brain className="h-3 w-3 text-blue-500" />
                    <span className="text-xs">LIS</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAssessments.includes('nutrition')}
                      onChange={() => toggleAssessment('nutrition')}
                      className="h-3 w-3"
                    />
                    <Salad className="h-3 w-3 text-green-500" />
                    <span className="text-xs">Nutrition</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAssessments.includes('hormone')}
                      onChange={() => toggleAssessment('hormone')}
                      className="h-3 w-3"
                    />
                    <Heart className="h-3 w-3 text-pink-500" />
                    <span className="text-xs">Hormone</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleApplyData}
                  disabled={isRunning || selectedAssessments.length === 0}
                  size="sm"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isRunning ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3 mr-1" />
                  )}
                  Apply Data
                </Button>
                <Button
                  onClick={handleClear}
                  disabled={isRunning}
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
            </>
          )}

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

          <Separator />

          {/* Admin Actions */}
          <div className="flex gap-2">
            {usersSeeded ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1 border-orange-500/50 text-orange-600 hover:bg-orange-500/10"
                onClick={() => setShowResetConfirm(true)}
                disabled={isSeedingUsers}
                title="Clear test data and re-seed all test user accounts"
              >
                {isSeedingUsers ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Reset Test Users
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1 border-purple-500/50 text-purple-600 hover:bg-purple-500/10"
                onClick={handleSeedUsers}
                disabled={isSeedingUsers}
                title="Create test user accounts in the database"
              >
                {isSeedingUsers ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <UserPlus className="h-3 w-3" />
                )}
                Seed Test Users
              </Button>
            )}
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

          {/* Reset Confirmation Dialog */}
          <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset All Test Users?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>This will:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Clear all assessment data for your current account</li>
                    <li>Re-create/update all test user accounts</li>
                    <li>Apply fresh profile data from mockTestPersonas.ts</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use this after editing test data in mockTestPersonas.ts or the seed edge function.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleResetUsers}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Reset Users
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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
