import { Microscope } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEvidenceStore } from "@/stores/evidenceStore";
import { getEvidenceContext } from "@/data/evidenceMapping";

interface ScienceBackedIconProps {
  className?: string;
  showTooltip?: boolean;
  evidenceKey?: string;
  onClick?: () => void;
}

const ScienceBackedIcon = ({ 
  className = "h-4 w-4", 
  showTooltip = true,
  evidenceKey,
  onClick
}: ScienceBackedIconProps) => {
  const { openEvidence } = useEvidenceStore();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (evidenceKey) {
      const context = getEvidenceContext(evidenceKey);
      if (context) {
        openEvidence(evidenceKey, context.title, context.summary);
      }
    }
  };

  const isClickable = !!evidenceKey || !!onClick;
  
  const icon = (
    <Microscope 
      className={`text-primary transition-all ${className} ${
        isClickable ? 'cursor-pointer hover:opacity-100 hover:scale-110' : ''
      } ${isClickable ? 'opacity-70' : ''}`}
      onClick={isClickable ? handleClick : undefined}
    />
  );

  if (!showTooltip) {
    return icon;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex cursor-help">
            {icon}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm font-medium">Evidence-Based</p>
          <p className="text-xs text-muted-foreground">Supported by peer-reviewed research</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ScienceBackedIcon;
