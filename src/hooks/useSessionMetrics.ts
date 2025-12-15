import { useState, useEffect } from 'react';

interface SessionMetrics {
  weight_kg: number | null;
  height_cm: number | null;
  activity_level: string | null;
  fitness_goal: string | null;
  date_of_birth: string | null;
}

const STORAGE_KEY = 'biohackher_session_metrics';
const EXPIRY_DAYS = 7;

export const useSessionMetrics = () => {
  const [metrics, setMetricsState] = useState<SessionMetrics>({
    weight_kg: null,
    height_cm: null,
    activity_level: null,
    fitness_goal: null,
    date_of_birth: null,
  });

  // Load from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check expiry
        if (parsed.expiry && new Date(parsed.expiry) > new Date()) {
          setMetricsState(parsed.data);
        } else {
          // Expired, clear it
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.error('Failed to parse session metrics:', e);
      }
    }
  }, []);

  const setMetrics = (newMetrics: Partial<SessionMetrics>) => {
    const updated = { ...metrics, ...newMetrics };
    setMetricsState(updated);
    
    // Store with 7-day expiry
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + EXPIRY_DAYS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      data: updated,
      expiry: expiry.toISOString(),
    }));
  };

  const clearMetrics = () => {
    setMetricsState({
      weight_kg: null,
      height_cm: null,
      activity_level: null,
      fitness_goal: null,
      date_of_birth: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    metrics,
    setMetrics,
    clearMetrics,
  };
};
