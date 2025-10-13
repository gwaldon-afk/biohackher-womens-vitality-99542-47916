import { Award, FileText, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import { getTotalStudyCount } from "@/data/researchEvidence";
import { useTranslation } from "react-i18next";

const TrustBar = () => {
  const { t } = useTranslation();
  const studyCount = getTotalStudyCount();

  return (
    <Link to="/research-evidence" className="block w-full bg-primary/5 border-b border-primary/10 py-2 hover:bg-primary/10 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap text-xs md:text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ScienceBackedIcon className="h-4 w-4" showTooltip={false} />
            <span className="font-medium">{t('trustBar.evidenceBased')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-medium">{t('trustBar.peerReviewed')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Award className="h-4 w-4 text-primary" />
            <span className="font-medium">{t('trustBar.scienceBacked')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const DataSecurityBadge = () => {
  const { t } = useTranslation();
  
  return (
    <Link 
      to="/faq#data-privacy" 
      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Shield className="h-4 w-4 text-primary" />
      <span className="font-medium">{t('trustBar.dataSecurity')}</span>
    </Link>
  );
};

const TrustBarWithSecurity = () => {
  const { t } = useTranslation();
  
  return (
    <div className="w-full bg-primary/5 border-b border-primary/10 py-1.5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap text-xs">
          <Link to="/about?tab=research" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ScienceBackedIcon className="h-3.5 w-3.5" showTooltip={false} />
            <span className="font-medium">Science-Backed</span>
          </Link>
          <Link to="/about?tab=faq#data-privacy" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">Privacy Protected</span>
          </Link>
          <Link to="/about?tab=advisory" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <Award className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">Expert Approved</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TrustBarWithSecurity;
