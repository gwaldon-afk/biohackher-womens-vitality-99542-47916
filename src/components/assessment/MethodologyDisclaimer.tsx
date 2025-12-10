import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, ExternalLink } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

interface FrameworkReference {
  name: string;
  description: string;
  externalUrl?: string;
}

interface MethodologyDisclaimerProps {
  assessmentType: 'hormone' | 'lis' | 'nutrition';
  className?: string;
}

const METHODOLOGY_DATA: Record<string, {
  title: string;
  intro: string;
  frameworks: FrameworkReference[];
  researchLink?: string;
}> = {
  hormone: {
    title: 'Our Scientific Approach',
    intro: 'Our Hormone Age calculation is informed by validated clinical frameworks used in women\'s health research worldwide.',
    frameworks: [
      {
        name: 'STRAW+10 Criteria',
        description: 'The gold standard staging system for reproductive aging, developed by leading researchers in women\'s health.',
        externalUrl: 'https://pubmed.ncbi.nlm.nih.gov/22617238/'
      },
      {
        name: 'SWAN Study',
        description: 'Longitudinal data from 16,000+ women tracking hormone transitions across diverse populations.',
        externalUrl: 'https://www.swanstudy.org/'
      },
      {
        name: 'Menopause Rating Scale (MRS)',
        description: 'Validated 11-item severity scale used internationally to assess hormone-related symptoms.',
        externalUrl: 'https://pubmed.ncbi.nlm.nih.gov/12369584/'
      },
      {
        name: 'Greene Climacteric Scale',
        description: '21-item validated assessment tool for measuring symptom severity across psychological and somatic domains.',
        externalUrl: 'https://pubmed.ncbi.nlm.nih.gov/9649422/'
      }
    ],
    researchLink: '/hormone-compass/research'
  },
  lis: {
    title: 'Evidence-Based Methodology',
    intro: 'Our Biological Age estimation draws on peer-reviewed longevity research and population health studies.',
    frameworks: [
      {
        name: 'PsychoAge & SubjAge Research',
        description: 'Studies showing subjective age perception correlates with biological markers and mortality risk.',
        externalUrl: 'https://pubmed.ncbi.nlm.nih.gov/29579457/'
      },
      {
        name: 'Lancet Step Count Meta-Analysis',
        description: 'Comprehensive analysis of physical activity and longevity across 15+ studies.',
        externalUrl: 'https://pubmed.ncbi.nlm.nih.gov/34942530/'
      },
      {
        name: 'Gompertz Mortality Modeling',
        description: 'Mathematical framework for understanding aging trajectories used in actuarial science.',
        externalUrl: 'https://pubmed.ncbi.nlm.nih.gov/27034168/'
      },
      {
        name: 'Epigenetic Clock Research',
        description: 'Pioneering work on biological age markers by Horvath and others.',
        externalUrl: 'https://pubmed.ncbi.nlm.nih.gov/24138928/'
      }
    ],
    researchLink: '/lis2-research'
  },
  nutrition: {
    title: 'Nutritional Science Foundation',
    intro: 'Our Nutrition Score is developed using metabolic health research and validated nutritional science.',
    frameworks: [
      {
        name: 'NHANES Population Data',
        description: 'National Health and Nutrition Examination Survey data informing healthy intake benchmarks.',
        externalUrl: 'https://www.cdc.gov/nchs/nhanes/index.htm'
      },
      {
        name: 'Phenotypic Age Research',
        description: 'Levine et al. (2018) methodology for metabolic biomarker assessment.',
        externalUrl: 'https://pubmed.ncbi.nlm.nih.gov/29676998/'
      },
      {
        name: 'Time-Restricted Eating Studies',
        description: 'Circadian nutrition research by Dr. Satchin Panda and colleagues.',
        externalUrl: 'https://pubmed.ncbi.nlm.nih.gov/31339000/'
      },
      {
        name: 'Protein & Muscle Health Research',
        description: 'Evidence on optimal protein intake for longevity and metabolic health.',
        externalUrl: 'https://pubmed.ncbi.nlm.nih.gov/26797090/'
      }
    ],
    researchLink: '/nutrition/research'
  }
};

export function MethodologyDisclaimer({ assessmentType, className = '' }: MethodologyDisclaimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const data = METHODOLOGY_DATA[assessmentType];

  if (!data) return null;

  return (
    <div className={`${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between px-4 py-3 h-auto text-left bg-secondary/30 hover:bg-secondary/50 border border-border/50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{data.title}</span>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <div className="bg-secondary/20 border border-border/50 rounded-lg p-4 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.intro}
            </p>
            
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                Research Frameworks
              </h4>
              <div className="grid gap-2">
                {data.frameworks.map((framework, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-2 rounded-md bg-background/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {framework.name}
                        </span>
                        {framework.externalUrl && (
                          <a 
                            href={framework.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors"
                            aria-label={`View ${framework.name} research`}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {framework.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground italic border-t border-border/50 pt-3">
              Our proprietary algorithm synthesizes insights from these validated frameworks to provide personalized, evidence-informed assessments.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
