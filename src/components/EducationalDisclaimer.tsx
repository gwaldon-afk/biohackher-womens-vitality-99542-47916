import { AlertCircle, Info } from "lucide-react";

interface EducationalDisclaimerProps {
  type?: "health" | "nutrition" | "therapy" | "general";
  className?: string;
}

const EducationalDisclaimer = ({ type = "general", className = "" }: EducationalDisclaimerProps) => {
  const disclaimerContent = {
    health: {
      icon: Info,
      title: "Educational Information",
      text: "This content presents commonly used approaches and evidence-based health information. It is for educational purposes only and does not constitute medical advice. Always consult with qualified healthcare professionals before making health decisions or starting any treatment."
    },
    nutrition: {
      icon: Info,
      title: "Educational Information",
      text: "This content presents evidence-based nutrition recommendations. It is for educational purposes only and does not constitute medical or dietary advice. Always consult with qualified healthcare or nutrition professionals before making dietary changes."
    },
    therapy: {
      icon: Info,
      title: "Educational Information",
      text: "This content presents commonly used treatments and therapies. It is for educational purposes only and does not constitute medical advice. Always consult with qualified healthcare professionals before starting any supplement regimen or therapy."
    },
    general: {
      icon: Info,
      title: "Educational Information",
      text: "This information is for educational purposes only and does not constitute medical advice. Always consult with qualified healthcare professionals for personalised guidance."
    }
  };

  const content = disclaimerContent[type];
  const Icon = content.icon;

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800">
            <strong>📚 {content.title}:</strong> {content.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EducationalDisclaimer;
