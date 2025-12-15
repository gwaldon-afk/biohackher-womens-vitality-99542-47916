import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const StatisticsBar = () => {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const stats = [
    {
      id: "lifespan",
      valueKey: "home.statistics.lifespan.value",
      labelKey: "home.statistics.lifespan.label",
      evidenceTitleKey: "home.statistics.lifespan.evidenceTitle",
      citationKey: "home.statistics.lifespan.citation",
      findingKey: "home.statistics.lifespan.finding",
      doi: "10.1161/CIRCULATIONAHA.117.032047"
    },
    {
      id: "control",
      valueKey: "home.statistics.control.value",
      labelKey: "home.statistics.control.label",
      evidenceTitleKey: "home.statistics.control.evidenceTitle",
      citationKey: "home.statistics.control.citation",
      findingKey: "home.statistics.control.finding",
      doi: "10.1126/science.aam9309"
    },
    {
      id: "evidence",
      valueKey: "home.statistics.evidence.value",
      labelKey: "home.statistics.evidence.label",
      evidenceTitleKey: "home.statistics.evidence.evidenceTitle",
      citationKey: "home.statistics.evidence.citation",
      findingKey: "home.statistics.evidence.finding",
      doi: ""
    }
  ];

  return (
    <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 py-6 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
        {stats.map((stat, index) => (
          <>
            {index > 0 && <div key={`divider-${index}`} className="hidden md:block h-12 w-px bg-border" />}
            <Dialog key={stat.id} open={openDialog === stat.id} onOpenChange={(open) => setOpenDialog(open ? stat.id : null)}>
              <DialogTrigger asChild>
                <button className="text-center group cursor-pointer hover:opacity-80 transition-opacity">
                  <p className="text-2xl font-bold text-foreground">{t(stat.valueKey)}</p>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    {t(stat.labelKey)}
                    <Info className="h-3 w-3 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  </p>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">{t(stat.evidenceTitleKey)}</DialogTitle>
                  <DialogDescription className="text-left space-y-4 pt-4">
                    <div>
                      <p className="font-semibold text-foreground mb-2">{t('home.statistics.researchCitation')}</p>
                      <p className="text-sm italic">{t(stat.citationKey)}</p>
                      {stat.doi && (
                        <p className="text-sm text-primary mt-1">
                          DOI: <a href={`https://doi.org/${stat.doi}`} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">{stat.doi}</a>
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-2">{t('home.statistics.keyFinding')}</p>
                      <p className="text-sm">{t(stat.findingKey)}</p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </>
        ))}
      </div>
    </div>
  );
};

export default StatisticsBar;
