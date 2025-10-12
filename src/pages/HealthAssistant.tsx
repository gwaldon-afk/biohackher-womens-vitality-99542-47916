import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, MessageCircle, AlertTriangle, Sparkles, ArrowRight, Star, CheckCircle } from 'lucide-react';
import { useHealthAssistant } from '@/hooks/useHealthAssistant';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import EvidenceBadge from '@/components/EvidenceBadge';

const HealthAssistant = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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

        {/* Sign Up CTA for Guest Users */}
        {!user && messages.length > 0 && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Want to save your conversation and access personalized recommendations?</h3>
                  <p className="text-muted-foreground mb-4">
                    Sign up to unlock your full health journey with personalized assessments, progress tracking, and custom protocols.
                  </p>
                  <Button onClick={() => navigate('/auth')}>
                    Sign Up Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Container */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardContent className="p-6">
            {/* Messages Area */}
            <div className="space-y-6 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="space-y-6 py-8">
                  {/* Welcome Message */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center gap-3 mb-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full">
                      <MessageCircle className="h-12 w-12 text-primary" />
                      <Sparkles className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Welcome! Let's Start Your Health Journey
                    </h3>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                      I'm your AI health assistant, here to provide science-backed answers about women's health, hormones, nutrition, sleep, stress, and wellness.
                    </p>
                  </div>

                  {/* Ask Statement */}
                  <div className="text-center mb-4">
                    <p className="text-base font-medium text-foreground">
                      Ask me anything about your health concerns
                    </p>
                  </div>

                  {/* Large Input Box */}
                  <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-8">
                    <div className="relative">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your health question here..."
                        disabled={isLoading}
                        className="h-16 text-lg pl-6 pr-16 border-2 border-primary/30 focus:border-primary shadow-lg"
                      />
                      <Button 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                        size="lg"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-12"
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Sample Questions */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Not sure what to ask? Try one of these:
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
                      {[
                        "I'm experiencing brain fog and low energy",
                        "How can I improve my sleep quality?",
                        "What supplements help with hormonal balance?",
                        "I'm feeling stressed and anxious"
                      ].map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="default"
                          onClick={() => setInput(suggestion)}
                          className="h-auto py-3 px-4 bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 border-primary/20"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
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
                            <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                              <Sparkles className="h-5 w-5 text-primary" />
                              Tools & Therapies That Can Help:
                            </h4>
                            <div className="grid gap-3">
                              {message.recommended_tools.map((tool: any) => (
                                <Card 
                                  key={tool.id} 
                                  className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group"
                                  onClick={() => navigate(`/${tool.category_slug || 'biohacking-toolkit'}`)}
                                >
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                                        {tool.name}
                                      </CardTitle>
                                      {tool.evidence_level && (
                                        <EvidenceBadge 
                                          level={tool.evidence_level.charAt(0).toUpperCase() + tool.evidence_level.slice(1) as any} 
                                          showTooltip={false}
                                        />
                                      )}
                                    </div>
                                    <CardDescription className="text-sm">
                                      <span className="font-medium text-primary">Why this helps: </span>
                                      {tool.relevance_reason}
                                    </CardDescription>
                                    {tool.benefits && tool.benefits.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {tool.benefits.slice(0, 3).map((benefit: string, idx: number) => (
                                          <Badge key={idx} variant="secondary" className="text-xs">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            {benefit}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </CardHeader>
                                  <CardContent className="pt-0">
                                    <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                                      Explore This Tool
                                      <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommended Assessments */}
                        {message.recommended_assessments && message.recommended_assessments.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-3 text-lg">Understand What's Influencing Your Health Issues:</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              These assessments will help you identify the key factors affecting your health and track your progress over time.
                            </p>
                            <div className="grid gap-3">
                              {message.recommended_assessments.map((assessment: any) => (
                                <Card 
                                  key={assessment.id || assessment} 
                                  className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group"
                                  onClick={() => {
                                    if (user) {
                                      // Navigate to specific assessment if we have an ID
                                      if (assessment.id) {
                                        navigate(`/assessment/${assessment.id}`);
                                      } else {
                                        navigate('/symptoms');
                                      }
                                    } else {
                                      navigate('/auth');
                                    }
                                  }}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h5 className="font-medium group-hover:text-primary transition-colors">
                                          {assessment.name || assessment}
                                        </h5>
                                        {assessment.description && (
                                          <p className="text-sm text-muted-foreground mt-1">{assessment.description}</p>
                                        )}
                                        {assessment.pillar && (
                                          <Badge variant="outline" className="mt-2">
                                            {assessment.pillar} Pillar
                                          </Badge>
                                        )}
                                      </div>
                                      <Button size="sm" className="ml-4">
                                        {user ? 'Start Assessment' : 'Sign Up to Start'}
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Clinical Tests to Discuss with Doctor */}
                        {message.clinical_tests && message.clinical_tests.length > 0 && (
                          <div className="mt-4">
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <p className="font-medium mb-2">Clinical Tests to Discuss with Your Healthcare Provider:</p>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  {message.clinical_tests.map((test: string, idx: number) => (
                                    <li key={idx}>{test}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}

                        {/* Follow-up Questions */}
                        {message.follow_up_questions && message.follow_up_questions.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground mb-2">Questions to help us understand better or explore further:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.follow_up_questions.map((question: string) => (
                                <Button
                                  key={question}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setInput(question)}
                                  className="text-left h-auto py-2 whitespace-normal"
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

            {/* Input Form - Active Conversation */}
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your health question..."
                disabled={isLoading}
                className="flex-1 h-12 border-2 border-primary/20 focus:border-primary"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="lg">
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
        <Card className="border-2 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              How This Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <p className="text-foreground">Ask any question about women's health, wellness, or longevity</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-secondary flex-shrink-0" />
              <p className="text-foreground">Get evidence-based answers from our AI health assistant</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <p className="text-foreground">Receive personalized recommendations from our toolkit</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-secondary flex-shrink-0" />
              <p className="text-foreground">Discover relevant assessments to track your progress</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthAssistant;