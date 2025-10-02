import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CTAButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "secondary";
  icon?: LucideIcon;
  className?: string;
  showArrow?: boolean;
}

const CTAButton = ({ 
  text, 
  href, 
  onClick, 
  variant = "default", 
  icon: Icon,
  className = "",
  showArrow = true
}: CTAButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  return (
    <Button
      variant={variant}
      size="lg"
      onClick={handleClick}
      className={`group ${className}`}
    >
      {Icon && <Icon className="h-5 w-5 mr-2" />}
      {text}
      {showArrow && (
        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
      )}
    </Button>
  );
};

export default CTAButton;
