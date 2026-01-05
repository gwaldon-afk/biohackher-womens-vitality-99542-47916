import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TableStats {
  rowCount: number;
  hasRls: boolean;
}

export const useDatabaseStats = () => {
  const [stats, setStats] = useState<Record<string, TableStats>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (tableNames: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const newStats: Record<string, TableStats> = {};

      // Fetch row counts for each table using safe queries
      // We can't run arbitrary SQL, so we'll check each table individually
      for (const tableName of tableNames) {
        try {
          // Try to get a count from the table
          const { count, error: countError } = await supabase
            .from(tableName as any)
            .select('*', { count: 'exact', head: true });

          if (!countError) {
            newStats[tableName] = {
              rowCount: count || 0,
              hasRls: true, // Assume RLS is enabled if we can query
            };
          } else {
            // If we get an error, the table might not exist or have RLS blocking
            newStats[tableName] = {
              rowCount: 0,
              hasRls: countError.message.includes('RLS') || countError.code === '42501',
            };
          }
        } catch (e) {
          newStats[tableName] = {
            rowCount: 0,
            hasRls: true,
          };
        }
      }

      setStats(newStats);
    } catch (e) {
      console.error('Failed to fetch database stats:', e);
      setError('Failed to fetch database statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
  };
};
