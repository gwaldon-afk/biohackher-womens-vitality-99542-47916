import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, MessageCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { useHealthAssistant } from '@/hooks/useHealthAssistant';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import EvidenceBadge from '@/components/EvidenceBadge';

const HealthAssistant = () => {
  const navigate = useNavigate();
  const { messages, isLoading, askQuestion } = useHealthAssistant();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const question = input;
    setInput('');
    await askQuestion(question);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Ask Us Anything About Women's Health</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Get science-backed answers and personalized tool recommendations for your health questions
          </p>
        </div>

        {/* Medical Disclaimer */}
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This AI assistant provides educational information only and is not a substitute for professional medical advice. 
            Always consult with your healthcare provider for medical concerns.
          </AlertDescription>
        </Alert>

        {/* Chat Container */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Messages Area */}
            <div className="space-y-6 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Start a Conversation</h3>
                  <p className="text-muted-foreground mb-4">
                    Ask any question about women's health, hormones, nutrition, sleep, stress, or wellness
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                    {[
                      "I'm experiencing brain fog and low energy",
                      "How can I improve my sleep quality?",
                      "What supplements help with hormonal balance?",
                      "I'm feeling stressed and anxious"
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => setInput(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={message.role === 'user' ? 'text-right' : 'text-left'}>
                    {message.role === 'user' ? (
                      <div className="inline-block bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
                        {message.content}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-muted rounded-lg px-4 py-3 max-w-[90%] inline-block">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>

                        {/* Recommended Tools */}
                        {message.recommended_tools && message.recommended_tools.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Tools That Can Help You:
                            </h4>
                            <div className="grid gap-3">
                              {message.recommended_tools.map((tool: any) => (
                                <Card 
                                  key={tool.id} 
                                  className="cursor-pointer hover:border-primary transition-colors"
                                  onClick={() => navigate(`/biohacking-toolkit`)}
                                >
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-base">{tool.name}</CardTitle>
                                    <CardDescription className="text-sm">
                                      {tool.relevance_reason}
                                    </CardDescription>
                                  </CardHeader>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommended Assessments */}
                        {message.recommended_assessments && message.recommended_assessments.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-3">Recommended Assessments:</h4>
                            <div className="flex flex-wrap gap-2">
                              {message.recommended_assessments.map((assessment: string) => (
                                <Badge 
                                  key={assessment} 
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-secondary/80"
                                  onClick={() => navigate('/symptoms')}
                                >
                                  {assessment}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Follow-up Questions */}
                        {message.follow_up_questions && message.follow_up_questions.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground mb-2">You might also want to ask:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.follow_up_questions.map((question: string) => (
                                <Button
                                  key={question}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setInput(question)}
                                >
                                  {question}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing your question...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your health question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How This Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Ask any question about women's health, wellness, or longevity</p>
            <p>• Get evidence-based answers from our AI health assistant</p>
            <p>• Receive personalized recommendations from our toolkit</p>
            <p>• Discover relevant assessments to track your progress</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthAssistant;