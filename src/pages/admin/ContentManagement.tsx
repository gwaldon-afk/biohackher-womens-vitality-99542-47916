import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Newspaper, HelpCircle, Beaker } from 'lucide-react';

export default function ContentManagement() {
  const contentSections = [
    {
      title: 'Landing Page',
      description: 'Edit hero text, CTAs, and trust indicators',
      icon: Newspaper,
      comingSoon: true
    },
    {
      title: 'FAQ Management',
      description: 'Add, edit, or remove frequently asked questions',
      icon: HelpCircle,
      comingSoon: true
    },
    {
      title: 'Research Citations',
      description: 'Manage research database and evidence links',
      icon: Beaker,
      comingSoon: true
    },
    {
      title: 'Assessment Questions',
      description: 'Edit LIS 2.0 and other assessment content',
      icon: FileText,
      comingSoon: true
    },
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Management</h1>
        <p className="text-muted-foreground">
          Manage site content, FAQs, research citations, and assessments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contentSections.map((section) => {
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
