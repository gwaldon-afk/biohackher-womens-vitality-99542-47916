import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ClipboardList, Calendar, TrendingUp } from "lucide-react";

const Intro3Step = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: ClipboardList,
      titleKey: "onboarding.intro.slides.assess.title",
      descriptionKey: "onboarding.intro.slides.assess.description",
    },
    {
      icon: Calendar,
      titleKey: "onboarding.intro.slides.plan.title",
      descriptionKey: "onboarding.intro.slides.plan.description",
    },
    {
      icon: TrendingUp,
      titleKey: "onboarding.intro.slides.track.title",
      descriptionKey: "onboarding.intro.slides.track.description",
    },
  ];

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
            <h2 className="text-3xl font-bold">{t(slide.titleKey)}</h2>
            <p className="text-muted-foreground text-lg">{t(slide.descriptionKey)}</p>
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
                {t('onboarding.intro.previous')}
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {currentSlide < slides.length - 1 ? (
                <>
                  {t('onboarding.intro.next')}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                t('onboarding.intro.getStarted')
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Intro3Step;
