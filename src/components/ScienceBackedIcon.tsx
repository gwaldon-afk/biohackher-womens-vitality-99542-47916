import { Microscope } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScienceBackedIconProps {
  className?: string;
  showTooltip?: boolean;
}

const ScienceBackedIcon = ({ className = "h-4 w-4", showTooltip = true }: ScienceBackedIconProps) => {
  const icon = <Microscope className={`text-primary ${className}`} />;

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
