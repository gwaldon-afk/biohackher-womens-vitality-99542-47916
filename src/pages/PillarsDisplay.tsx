import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import bodyPillar from "@/assets/body-pillar.png";
import balancePillar from "@/assets/balance-pillar.png";
import brainPillar from "@/assets/brain-pillar.png";
import beautyPillar from "@/assets/beauty-pillar.png";

const PillarsDisplay = () => {
  const pillars = [
    {
      name: "Body",
      image: bodyPillar,
      color: "hsl(24, 95%, 53%)", // #f97316 orange
    },
    {
      name: "Balance",
      image: balancePillar,
      color: "hsl(0, 84%, 60%)", // #ef4444 red
    },
    {
      name: "Brain",
      image: brainPillar,
      color: "hsl(271, 91%, 65%)", // #a855f7 purple
    },
    {
      name: "Beauty",
      image: beautyPillar,
      color: "hsl(330, 81%, 60%)", // #ec4899 pink
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      {/* Pillars Display */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {pillars.map((pillar) => (
            <div
              key={pillar.name}
              className="flex flex-col items-center justify-center p-8 rounded-lg transition-transform hover:scale-105"
              style={{ backgroundColor: `${pillar.color}10` }}
            >
              <div className="w-48 h-48 mb-6 flex items-center justify-center">
                <img
                  src={pillar.image}
                  alt={`${pillar.name} Pillar`}
                  className="w-full h-full object-contain"
                />
              </div>
              <h2
                className="text-2xl font-bold text-center"
                style={{ color: pillar.color }}
              >
                {pillar.name}
              </h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PillarsDisplay;
