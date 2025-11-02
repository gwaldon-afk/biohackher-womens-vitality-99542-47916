import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Database, Zap, AlertTriangle } from 'lucide-react';

export default function SystemHealth() {
  const systemSections = [
    {
      title: 'Edge Functions',
      description: 'Monitor serverless function performance and logs',
      icon: Zap,
      comingSoon: true
    },
    {
      title: 'Database Performance',
      description: 'Query performance, connection pools, and indexes',
      icon: Database,
      comingSoon: true
    },
    {
      title: 'Error Monitoring',
      description: 'Track errors, exceptions, and system issues',
      icon: AlertTriangle,
      comingSoon: true
    },
    {
      title: 'API Usage',
      description: 'Monitor external API calls and rate limits',
      icon: Activity,
      comingSoon: true
    },
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Health</h1>
        <p className="text-muted-foreground">
          Monitor system performance, errors, and API usage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {systemSections.map((section) => {
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
