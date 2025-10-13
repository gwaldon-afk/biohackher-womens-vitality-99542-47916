import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Heart, Activity, Lock, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Sample goal data for demo
const sampleGoals = [
  {
    id: '1',
    title: 'Improve Sleep Quality',
    pillar_category: 'body',
    status: 'active',
    current_progress: 65,
    target_value: '7-8 hours nightly',
    start_date: '2025-09-15',
    target_date: '2025-12-15',
    next_check_in_due: '2025-10-20',
    interventions: ['Sleep hygiene routine', 'Magnesium supplement', 'Blue light blocking'],
  },
  {
    id: '2',
    title: 'Enhance Cognitive Performance',
    pillar_category: 'brain',
    status: 'active',
    current_progress: 40,
    target_value: 'Complete daily brain training',
    start_date: '2025-10-01',
    target_date: '2026-01-01',
    next_check_in_due: '2025-10-22',
    interventions: ['Meditation 10min daily', 'Learning new language', 'Omega-3 supplementation'],
  },
  {
    id: '3',
    title: 'Reduce Stress & Improve Balance',
    pillar_category: 'balance',
    status: 'active',
    current_progress: 80,
    target_value: 'HRV improvement by 15%',
    start_date: '2025-08-01',
    target_date: '2025-11-01',
    next_check_in_due: '2025-10-18',
    interventions: ['Daily breathwork', 'Weekly yoga', 'Adaptogenic herbs'],
  },
];

const getPillarIcon = (pillar: string) => {
  switch (pillar) {
    case 'brain':
      return Brain;
    case 'balance':
      return Heart;
    case 'body':
      return Activity;
    default:
      return Activity;
  }
};

const getPillarColor = (pillar: string) => {
  switch (pillar) {
    case 'brain':
      return 'bg-purple-500';
    case 'balance':
      return 'bg-blue-500';
    case 'body':
      return 'bg-green-500';
    default:
      return 'bg-primary';
  }
};

const GuestGoalsPreview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Health Goals</h1>
          <p className="text-muted-foreground text-lg">
            Track your personalized longevity goals and measure progress
          </p>
        </div>

        <Alert className="mb-6 border-primary/50 bg-primary/5">
          <Lock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>This is a preview. Sign in to create and track your own personalized health goals.</span>
            <Button 
              onClick={() => navigate('/auth')} 
              size="sm"
              className="ml-4"
            >
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="active">Active Goals (3)</TabsTrigger>
            <TabsTrigger value="completed">Completed (0)</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sampleGoals.map((goal) => {
                const Icon = getPillarIcon(goal.pillar_category);
                const colorClass = getPillarColor(goal.pillar_category);

                return (
                  <Card key={goal.id} className="hover:shadow-lg transition-shadow relative overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1 ${colorClass}`} />
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
                          <Icon className={`h-5 w-5 ${colorClass.replace('bg-', 'text-')}`} />
                        </div>
                        <Badge variant="secondary">{goal.pillar_category}</Badge>
                      </div>
                      <CardTitle className="text-xl">{goal.title}</CardTitle>
                      <CardDescription>Target: {goal.target_value}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{goal.current_progress}%</span>
                        </div>
                        <Progress value={goal.current_progress} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Interventions:</p>
                        <div className="flex flex-wrap gap-2">
                          {goal.interventions.slice(0, 2).map((intervention, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {intervention}
                            </Badge>
                          ))}
                          {goal.interventions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{goal.interventions.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Next check-in: {new Date(goal.next_check_in_due).toLocaleDateString()}
                        </p>
                      </div>

                      <Button className="w-full" variant="outline" disabled>
                        <Lock className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Create Your Own Goals</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Sign in to create personalized health goals, track your progress, and receive AI-powered recommendations.
                </p>
                <Button onClick={() => navigate('/auth')} size="lg">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Track Your Achievements</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Complete goals and celebrate your health milestones. Sign in to get started.
                </p>
                <Button onClick={() => navigate('/auth')} size="lg">
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GuestGoalsPreview;
