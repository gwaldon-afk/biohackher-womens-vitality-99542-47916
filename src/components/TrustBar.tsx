import { Award, FileText, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import { getTotalStudyCount } from "@/data/researchEvidence";

const TrustBar = () => {
  const studyCount = getTotalStudyCount();

  return (
    <Link to="/research-evidence" className="block w-full bg-primary/5 border-b border-primary/10 py-2 hover:bg-primary/10 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap text-xs md:text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ScienceBackedIcon className="h-4 w-4" showTooltip={false} />
            <span className="font-medium">Evidence-Based</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-medium">Peer-Reviewed Studies</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Award className="h-4 w-4 text-primary" />
            <span className="font-medium">Science-Backed Protocols</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-medium">Data Security Guaranteed</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TrustBar;
