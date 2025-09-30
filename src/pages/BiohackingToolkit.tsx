import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Moon, UtensilsCrossed, Brain, Pill } from "lucide-react";
import Navigation from "@/components/Navigation";

const BiohackingToolkit = () => {
  const toolkitItems = [
    {
      id: "therapies",
      title: "Therapies",
      description: "Evidence-based biohacking therapies and protocols",
      icon: Activity,
      href: "/therapies",
      color: "from-primary/20 to-primary/10"
    },
    {
      id: "sleep",
      title: "Sleep",
      description: "Optimize your sleep quality and recovery",
      icon: Moon,
      href: "/sleep",
      color: "from-blue-100 to-blue-50"
    },
    {
      id: "nutrition",
      title: "Nutrition",
      description: "Personalized nutrition strategies for longevity",
      icon: UtensilsCrossed,
      href: "/nutrition",
      color: "from-green-100 to-green-50"
    },
    {
      id: "coaching",
      title: "Coaching",
      description: "Cycle-synced training and wellness coaching",
      icon: Brain,
      href: "/coaching",
      color: "from-purple-100 to-purple-50"
    },
    {
      id: "supplements",
      title: "Supplements",
      description: "Science-backed supplement recommendations",
      icon: Pill,
      href: "/supplements",
      color: "from-amber-100 to-amber-50"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-albra font-bold mb-4">
              Biohacking Toolkit
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your comprehensive suite of evidence-based biohacking tools and protocols. 
              Explore personalized strategies for optimal health, performance, and longevity 
              tailored specifically for women's unique biology.
            </p>
          </div>

          {/* Toolkit Items Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {toolkitItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.id} to={item.href}>
                  <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50">
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                        <Icon className="h-7 w-7 text-foreground" />
                      </div>
                      <CardTitle className="text-2xl">{item.title}</CardTitle>
                      <CardDescription className="text-base">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiohackingToolkit;
