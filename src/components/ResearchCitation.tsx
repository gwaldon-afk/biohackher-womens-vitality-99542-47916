import { ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResearchCitationProps {
  title: string;
  journal?: string;
  year?: number;
  url: string;
  doi?: string;
  studyType?: "RCT" | "Meta-analysis" | "Cohort" | "Review" | "Observational" | "Systematic Review" | "Policy" | "Report";
  sampleSize?: number;
  className?: string;
}

const ResearchCitation = ({
  title,
  journal,
  year,
  url,
  doi,
  studyType,
  sampleSize,
  className = ""
}: ResearchCitationProps) => {
  return (
    <div className={`border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors ${className}`}>
      <div className="flex items-start gap-3">
        <FileText className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <h4 className="font-medium text-sm leading-snug">{title}</h4>
          
          <div className="flex flex-wrap gap-2 items-center">
            {journal && (
              <Badge variant="outline" className="text-xs">
                {journal}
              </Badge>
            )}
            {year && (
              <span className="text-xs text-muted-foreground">{year}</span>
            )}
            {studyType && (
              <Badge variant="secondary" className="text-xs">
                {studyType}
              </Badge>
            )}
            {sampleSize && (
              <span className="text-xs text-muted-foreground">
                n={sampleSize.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex gap-3 text-xs">
            {doi && (
              <a
                href={`https://doi.org/${doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                View Study (DOI) <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              Alternative Source <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchCitation;
