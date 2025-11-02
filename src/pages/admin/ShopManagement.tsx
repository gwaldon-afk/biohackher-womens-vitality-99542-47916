import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

export default function ShopManagement() {
  const shopSections = [
    {
      title: 'Product Catalog',
      description: 'Add, edit, or remove products and supplements',
      icon: Package,
      comingSoon: true
    },
    {
      title: 'Order Management',
      description: 'View orders, fulfillment status, and shipping',
      icon: ShoppingCart,
      comingSoon: true
    },
    {
      title: 'Revenue Reports',
      description: 'Sales analytics, revenue trends, and forecasts',
      icon: DollarSign,
      comingSoon: true
    },
    {
      title: 'Affiliate Partners',
      description: 'Manage affiliate relationships and commission tracking',
      icon: TrendingUp,
      comingSoon: true
    },
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shop Management</h1>
        <p className="text-muted-foreground">
          Manage products, orders, inventory, and affiliate partnerships
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shopSections.map((section) => {
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
