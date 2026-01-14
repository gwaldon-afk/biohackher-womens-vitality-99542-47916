import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const TestimonialCarousel = () => {
  const { t } = useTranslation();
  const plugin = useRef(
    Autoplay({ 
      delay: 7000, 
      stopOnInteraction: false,
      stopOnMouseEnter: true 
    })
  );

  const testimonials = [
    {
      typeKey: "home.testimonials.lis.type",
      quoteKey: "home.testimonials.lis.quote",
      authorKey: "home.testimonials.lis.author",
      metric1Key: "home.testimonials.lis.metric1",
      metric2Key: "home.testimonials.lis.metric2"
    },
    {
      typeKey: "home.testimonials.nutrition.type",
      quoteKey: "home.testimonials.nutrition.quote",
      authorKey: "home.testimonials.nutrition.author",
      metric1Key: "home.testimonials.nutrition.metric1",
      metric2Key: "home.testimonials.nutrition.metric2"
    },
    {
      typeKey: "home.testimonials.hormone.type",
      quoteKey: "home.testimonials.hormone.quote",
      authorKey: "home.testimonials.hormone.author",
      metric1Key: "home.testimonials.hormone.metric1",
      metric2Key: "home.testimonials.hormone.metric2"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Carousel
        plugins={[plugin.current]}
        opts={{ loop: true }}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {testimonials.map((testimonial, index) => (
            <CarouselItem key={index}>
              <Card className="border-2 border-[#F8C5AC]/30 bg-[#F8C5AC]/20">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <h3 className="text-xl font-bold text-foreground">
                        {t(testimonial.typeKey)}
                      </h3>
                    </div>
                    
                    <blockquote className="text-lg text-center italic text-foreground leading-relaxed">
                      "{t(testimonial.quoteKey)}"
                    </blockquote>
                    
                    <p className="text-center text-sm text-muted-foreground">
                      — {t(testimonial.authorKey)}
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                      <Badge variant="outline" className="border-primary/30 bg-primary/5">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {t(testimonial.metric1Key)}
                      </Badge>
                      <Badge variant="outline" className="border-primary/30 bg-primary/5">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {t(testimonial.metric2Key)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default TestimonialCarousel;
