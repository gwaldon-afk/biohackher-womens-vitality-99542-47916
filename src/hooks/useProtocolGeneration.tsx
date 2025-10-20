import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProtocolGeneration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateProtocolFromAssessments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-protocol-from-assessments', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Protocol Generated!",
        description: `Created personalized protocol with ${data.items_count} items based on your assessments.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error generating protocol:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate protocol from assessments",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateProtocolFromAssessments,
    loading,
  };
};