import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ClipboardList, Calendar, TrendingUp } from "lucide-react";

const slides = [
  {
    icon: ClipboardList,
    title: "Assess",
    description: "Complete your personalized health assessment to understand your unique needs and current state.",
  },
  {
    icon: Calendar,
    title: "Plan",
    description: "Receive a tailored protocol designed specifically for your goals and health journey.",
  },
  {
    icon: TrendingUp,
    title: "Track",
    description: "Monitor your progress with daily check-ins and see your vitality scores improve over time.",
  },
];

const Intro3Step = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/onboarding/permission-setup');
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-xl w-full space-y-8">
        <Card className="p-8 space-y-6">
          <div className="flex justify-center">
            <div className="p-6 bg-primary/10 rounded-full">
              <Icon className="w-16 h-16 text-primary" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">{slide.title}</h2>
            <p className="text-muted-foreground text-lg">{slide.description}</p>
          </div>

          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-primary w-8' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-4">
            {currentSlide > 0 && (
              <Button variant="outline" onClick={handlePrev} className="flex-1">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {currentSlide < slides.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Intro3Step;
