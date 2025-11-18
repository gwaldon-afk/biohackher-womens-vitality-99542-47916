import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, UserX } from 'lucide-react';
import { TEST_MODE_ENABLED } from '@/config/testMode';

export const DevModeToggle = () => {
  const [mode, setMode] = useState<'guest' | 'auth'>('auth');

  useEffect(() => {
    const savedMode = localStorage.getItem('devMode') as 'guest' | 'auth' | null;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'guest' ? 'auth' : 'guest';
    setMode(newMode);
    localStorage.setItem('devMode', newMode);
    window.location.reload(); // Reload to apply auth changes
  };

  if (!TEST_MODE_ENABLED) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-6 z-50">
      <Button
        onClick={toggleMode}
        variant={mode === 'auth' ? 'default' : 'outline'}
        size="sm"
        className="gap-2 shadow-lg"
      >
        {mode === 'auth' ? (
          <>
            <User className="w-4 h-4" />
            Authenticated
          </>
        ) : (
          <>
            <UserX className="w-4 h-4" />
            Guest Mode
          </>
        )}
      </Button>
    </div>
  );
};
