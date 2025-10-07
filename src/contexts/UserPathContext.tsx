import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';

type JourneyType = 'performance' | 'menopause' | 'general';

interface UserPathContextType {
  journeyType: JourneyType;
  setJourneyType: (type: JourneyType) => void;
  isLoading: boolean;
}

const UserPathContext = createContext<UserPathContextType | undefined>(undefined);

export const UserPathProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [journeyType, setJourneyTypeState] = useState<JourneyType>('general');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadJourneyType = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_journey_type')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        setJourneyTypeState((data.user_journey_type as JourneyType) || 'general');
      } catch (error) {
        console.error('Error loading journey type:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadJourneyType();
  }, [user]);

  useEffect(() => {
    const pathParam = searchParams.get('path');
    if (pathParam === 'performance' || pathParam === 'menopause') {
      setJourneyType(pathParam);
    }
  }, [searchParams]);

  const setJourneyType = async (type: JourneyType) => {
    setJourneyTypeState(type);
    
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ user_journey_type: type })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating journey type:', error);
      }
    }
  };

  return (
    <UserPathContext.Provider value={{ journeyType, setJourneyType, isLoading }}>
      {children}
    </UserPathContext.Provider>
  );
};

export const useUserPath = () => {
  const context = useContext(UserPathContext);
  if (context === undefined) {
    throw new Error('useUserPath must be used within a UserPathProvider');
  }
  return context;
};
