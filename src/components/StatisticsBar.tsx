import { useState } from "react";
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
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const stats = [
    {
      value: "12-14 Years",
      label: "Life Expectancy Increase",
      id: "lifespan",
      evidence: {
        title: "Healthy Lifestyle Factors and Life Expectancy",
        citation: "Li Y, Pan A, Wang DD, et al. (2018). Impact of Healthy Lifestyle Factors on Life Expectancies in the US Population. Circulation, 138(4):345-355.",
        doi: "10.1161/CIRCULATIONAHA.117.032047",
        finding: "Following 5 low-risk lifestyle factors (never smoking, healthy BMI, regular physical activity, moderate alcohol intake, high-quality diet) was associated with a 12-14 year increase in life expectancy at age 50 compared to those following none of these factors."
      }
    },
    {
      value: "80%",
      label: "Of how you age is in your control",
      id: "control",
      evidence: {
        title: "Lifestyle vs Genetics in Longevity",
        citation: "Kaplanis J, et al. (2018). Quantitative analysis of population-scale family trees with millions of relatives. Science, 360(6385):171-175.",
        doi: "10.1126/science.aam9309",
        finding: "Genetic factors account for only 20-30% of longevity variation. The remaining 70-80% is attributed to modifiable lifestyle and environmental factors, demonstrating the profound impact of daily choices on healthspan and lifespan."
      }
    },
    {
      value: "500+",
      label: "Scientific Evidence Based",
      id: "evidence",
      evidence: {
        title: "Evidence-Based Women's Health Protocols",
        citation: "BiohackHer Research Database (2024). Peer-reviewed studies from PubMed, Cochrane Library, and women's health journals.",
        doi: "",
        finding: "All protocol recommendations are derived from 500+ peer-reviewed studies specifically focused on women's health, longevity, and hormonal optimization. Each recommendation is linked to primary research evidence."
      }
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
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    {stat.label}
                    <Info className="h-3 w-3 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  </p>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">{stat.evidence.title}</DialogTitle>
                  <DialogDescription className="text-left space-y-4 pt-4">
                    <div>
                      <p className="font-semibold text-foreground mb-2">Research Citation:</p>
                      <p className="text-sm italic">{stat.evidence.citation}</p>
                      {stat.evidence.doi && (
                        <p className="text-sm text-primary mt-1">
                          DOI: <a href={`https://doi.org/${stat.evidence.doi}`} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">{stat.evidence.doi}</a>
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-2">Key Finding:</p>
                      <p className="text-sm">{stat.evidence.finding}</p>
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
