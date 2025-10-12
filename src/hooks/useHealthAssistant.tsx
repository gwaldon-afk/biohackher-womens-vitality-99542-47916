import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export interface HealthMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommended_tools?: any[];
  recommended_assessments?: any[];
  clinical_tests?: string[];
  follow_up_questions?: string[];
  timestamp: Date;
}

export const useHealthAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<HealthMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const askQuestion = async (question: string) => {
    if (!question.trim()) return;

    // Add user message
    const userMessage: HealthMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('health-assistant', {
        body: {
          question,
          sessionId,
          userId: user?.id || null
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant message
      const assistantMessage: HealthMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        recommended_tools: data.recommended_tools || [],
        recommended_assessments: data.recommended_assessments || [],
        clinical_tests: data.clinical_tests || [],
        follow_up_questions: data.follow_up_questions || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Health assistant error:', error);
      
      let errorMessage = 'Failed to get response. Please try again.';
      
      if (error.message?.includes('Rate limit')) {
        errorMessage = 'Too many questions. Please wait a moment and try again.';
      } else if (error.message?.includes('payment')) {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });

      // Remove the user message if we failed
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    askQuestion,
    clearConversation,
    sessionId
  };
};