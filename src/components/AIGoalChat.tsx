import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIGoalChatProps {
  currentSuggestion: any;
  onSuggestionUpdate: (newSuggestion: any) => void;
}

export function AIGoalChat({ currentSuggestion, onSuggestionUpdate }: AIGoalChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "I've created your personalized goal plan using the HACK Protocol framework!\n\n✓ H - Healthspan Target (your specific outcome)\n✓ A - Aging Blueprint (evidence-based interventions)\n✓ C - Check-in Frequency (progress reviews)\n✓ K - Knowledge of Barriers (anticipated obstacles)\n\nWant to make any changes? Just tell me what you'd like to adjust. For example:\n• \"Make check-ins weekly instead\"\n• \"Add meditation to the interventions\"\n• \"Change the healthspan target to 90 days\"\n\nI'll make sure to maintain the HACK structure while incorporating your changes."
    }
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-goal-suggestions', {
        body: {
          goalDescription: `Refine this goal: ${currentSuggestion.title}`,
          pillar: currentSuggestion.pillar_category,
          currentGoal: currentSuggestion,
          refinementRequest: input.trim(),
          conversationHistory: messages,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: "I've updated your goal plan based on your request. Review the changes above!"
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      onSuggestionUpdate(data.suggestion);

      toast({
        title: "Goal updated!",
        description: "Your changes have been applied",
      });

    } catch (error: any) {
      console.error('Error refining goal:', error);
      toast({
        title: "Refinement failed",
        description: error.message || "Could not update your goal. Please try again.",
        variant: "destructive",
      });
      
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
      setInput(input); // Restore input
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Refine Your Goal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to adjust anything... (press Enter to send)"
            className="min-h-[80px] resize-none"
            disabled={isGenerating}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            size="icon"
            className="shrink-0 h-[80px] w-12"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Changes will be reflected in the goal plan above
        </p>
      </CardContent>
    </Card>
  );
}
