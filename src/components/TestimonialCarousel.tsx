import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const testimonials = [
  {
    quote: "I discovered I was aging 8 years faster than my chronological age. After following my protocol for 3 months, my LIS score improved from 58 to 74. I feel like I've reversed the clock.",
    author: "Sarah M., 47, Sydney",
    metrics: ["LIS 58→74", "Bio Age reduced by 5 years"],
    type: "LIS Success"
  },
  {
    quote: "My nutrition score was 51—I had no idea I was missing so much. The supplement protocol fixed my energy crashes and brain fog within 2 weeks. Game changer.",
    author: "Emma L., 52, Melbourne",
    metrics: ["Nutrition Score 51→82", "Energy levels transformed"],
    type: "Nutrition Success"
  },
  {
    quote: "The Hormone Compass helped me understand my perimenopause symptoms weren't 'just stress.' The targeted protocol reduced hot flashes by 80% in 6 weeks.",
    author: "Lisa K., 49, Brisbane",
    metrics: ["Hormone symptoms reduced 80%", "Sleep quality improved"],
    type: "Hormone Success"
  }
];

const TestimonialCarousel = () => {
  const plugin = useRef(
    Autoplay({ delay: 7000, stopOnInteraction: true })
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Carousel
        plugins={[plugin.current]}
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
                        {testimonial.type}
                      </h3>
                    </div>
                    
                    <blockquote className="text-lg text-center italic text-foreground leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                    
                    <p className="text-center text-sm text-muted-foreground">
                      — {testimonial.author}
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                      {testimonial.metrics.map((metric, idx) => (
                        <Badge key={idx} variant="outline" className="border-primary/30 bg-primary/5">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {metric}
                        </Badge>
                      ))}
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
