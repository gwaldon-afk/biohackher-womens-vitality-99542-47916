import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

const TrustIndicators = () => {
  const { t } = useTranslation();

  const indicatorKeys = [
    "home.trust.indicator1",
    "home.trust.indicator2",
    "home.trust.indicator3"
  ];

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
      {indicatorKeys.map((key, index) => (
        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="h-3 w-3 text-primary" />
          </div>
          <span>{t(key)}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustIndicators;
