import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Analytics() {
  const analyticsSections = [
    {
      title: 'Assessment Completion',
      description: 'LIS 2.0 completion rates, drop-off points, and average scores',
      icon: Target,
      comingSoon: true
    },
    {
      title: 'User Engagement',
      description: 'Session duration, page views, and feature adoption',
      icon: Users,
      comingSoon: true
    },
    {
      title: 'Protocol Success',
      description: 'Protocol adherence, completion rates, and outcomes',
      icon: TrendingUp,
      comingSoon: true
    },
    {
      title: 'Platform Metrics',
      description: 'Overall usage statistics and growth trends',
      icon: BarChart3,
      comingSoon: true
    },
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Platform metrics, user engagement, and success tracking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analyticsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{section.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {section.description}
                  </p>
                  {section.comingSoon ? (
                    <Button variant="outline" disabled>
                      Coming Soon
                    </Button>
                  ) : (
                    <Button variant="outline">View Details</Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
