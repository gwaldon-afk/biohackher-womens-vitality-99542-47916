import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, Shield, MessageSquare } from 'lucide-react';

export default function UserManagement() {
  const managementSections = [
    {
      title: 'User Search',
      description: 'Search and view user profiles, subscriptions, and activity',
      icon: Search,
      comingSoon: true
    },
    {
      title: 'Role Management',
      description: 'Assign admin, expert, or custom roles to users',
      icon: Shield,
      comingSoon: true
    },
    {
      title: 'Support Tickets',
      description: 'View and respond to user feedback and support requests',
      icon: MessageSquare,
      comingSoon: true
    },
    {
      title: 'User Analytics',
      description: 'View engagement metrics and user behavior patterns',
      icon: Users,
      comingSoon: true
    },
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, subscriptions, and support tickets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {managementSections.map((section) => {
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
                    <Button variant="outline">Manage</Button>
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
