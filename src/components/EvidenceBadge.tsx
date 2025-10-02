import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EvidenceBadgeProps {
  level: "Gold" | "Silver" | "Bronze" | "Emerging";
  className?: string;
  showTooltip?: boolean;
}

const evidenceInfo = {
  Gold: {
    description: "Multiple RCTs, meta-analyses, systematic reviews",
    color: "evidence-gold"
  },
  Silver: {
    description: "Multiple observational studies, some RCTs",
    color: "evidence-silver"
  },
  Bronze: {
    description: "Preliminary research, mechanistic studies",
    color: "evidence-bronze"
  },
  Emerging: {
    description: "Promising but needs more research",
    color: "bg-secondary/50 text-secondary-foreground border-secondary"
  }
};

const EvidenceBadge = ({ level, className = "", showTooltip = true }: EvidenceBadgeProps) => {
  const info = evidenceInfo[level];
  
  const badge = (
    <Badge className={`${info.color} ${className}`}>
      {level} Evidence
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{badge}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{info.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EvidenceBadge;
