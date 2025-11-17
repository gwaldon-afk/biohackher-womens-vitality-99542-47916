import { Check } from "lucide-react";

const trustIndicators = [
  "Science-backed by 500+ peer-reviewed studies",
  "Designed by longevity researchers & hormone specialists",
  "Used by 50,000+ women aged 25-80"
];

const TrustIndicators = () => {
  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
      {trustIndicators.map((indicator, index) => (
        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="h-3 w-3 text-primary" />
          </div>
          <span>{indicator}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustIndicators;
