import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface AssessmentOptionProps {
  id: string;
  value: string;
  label: ReactNode;
  description?: ReactNode;
  selected: boolean;
  onSelect: () => void;
  className?: string;
  labelClassName?: string;
  showImpactIndicator?: boolean;
  impactPercent?: number;
  impactLabel?: string;
}

const AssessmentOption = ({
  id,
  value,
  label,
  description,
  selected,
  onSelect,
  className,
  labelClassName,
  showImpactIndicator = false,
  impactPercent,
  impactLabel,
}: AssessmentOptionProps) => {
  return (
    <div
      className={cn(
        "flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all",
        selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        className
      )}
      onClick={onSelect}
    >
      <RadioGroupItem value={value} id={id} />
      <Label htmlFor={id} className={cn("flex-1 cursor-pointer", labelClassName)}>
        <div className="font-medium">{label}</div>
        {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
      </Label>
      {showImpactIndicator && typeof impactPercent === "number" ? (
        <div className="w-28">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{impactLabel ?? "Impact"}</span>
            <span className="font-semibold">{Math.round(impactPercent)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${impactPercent}%` }} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AssessmentOption;
