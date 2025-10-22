import { useEvidenceStore } from '@/stores/evidenceStore';
import { useEvidence } from '@/hooks/useEvidence';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import EvidenceBadge from './EvidenceBadge';
import { ExternalLink, Users, FlaskConical, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

const studyTypeIcons: Record<string, any> = {
  'rct': FlaskConical,
  'meta-analysis': FlaskConical,
  'cohort': Users,
  'case-control': Users,
  'review': FlaskConical,
  'other': FlaskConical,
};

const studyTypeLabels: Record<string, string> = {
  'rct': 'Randomized Controlled Trial',
  'meta-analysis': 'Meta-Analysis',
  'cohort': 'Cohort Study',
  'case-control': 'Case-Control Study',
  'review': 'Systematic Review',
  'other': 'Research Study',
};

const EvidenceDrawer = () => {
  const { isOpen, currentEvidence, closeEvidence } = useEvidenceStore();
  const { data, isLoading } = useEvidence(currentEvidence?.key || '', {
    enabled: isOpen && !!currentEvidence?.key,
  });

  const evidenceLevel = data?.studies[0]?.evidence_level;
  const womenSpecificStudies = data?.studies.filter(s => s.is_women_specific) || [];
  const generalStudies = data?.studies.filter(s => !s.is_women_specific) || [];

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && closeEvidence()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {evidenceLevel && (
                <EvidenceBadge 
                  level={evidenceLevel === 'gold' ? 'Gold' : evidenceLevel === 'silver' ? 'Silver' : evidenceLevel === 'bronze' ? 'Bronze' : 'Emerging'} 
                  className="mb-2"
                  showTooltip={false}
                />
              )}
              <DrawerTitle className="text-left">{currentEvidence?.title || 'Research Evidence'}</DrawerTitle>
              <DrawerDescription className="text-left mt-2">
                {currentEvidence?.summary}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="py-6 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : !data?.studies || data.studies.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Research evidence is being compiled for this topic. Check back soon for detailed scientific support.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {womenSpecificStudies.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Women-Specific Research</h3>
                      <Badge variant="secondary" className="ml-auto">
                        {womenSpecificStudies.length} {womenSpecificStudies.length === 1 ? 'Study' : 'Studies'}
                      </Badge>
                    </div>
                    <Accordion type="single" collapsible className="space-y-2">
                      {womenSpecificStudies.map((study, index) => (
                        <AccordionItem key={study.id} value={`women-${index}`} className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-start gap-3 text-left flex-1">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{study.title}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {study.study_type && (
                                    <Badge variant="outline" className="text-xs">
                                      {studyTypeLabels[study.study_type] || study.study_type}
                                    </Badge>
                                  )}
                                  {study.sample_size && (
                                    <span className="text-xs text-muted-foreground">n={study.sample_size}</span>
                                  )}
                                  {study.year && (
                                    <span className="text-xs text-muted-foreground">{study.year}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4">
                            {study.key_findings && study.key_findings.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium mb-2">Key Findings:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                  {study.key_findings.map((finding, i) => (
                                    <li key={i}>{finding}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {study.journal && (
                              <p className="text-sm text-muted-foreground mb-2">
                                <span className="font-medium">Published in:</span> {study.journal}
                              </p>
                            )}
                            <div className="flex gap-2 mt-3">
                              {study.doi && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={`https://doi.org/${study.doi}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    DOI
                                  </a>
                                </Button>
                              )}
                              {study.url && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={study.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Read Study
                                  </a>
                                </Button>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}

                {generalStudies.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FlaskConical className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Supporting Research</h3>
                      <Badge variant="secondary" className="ml-auto">
                        {generalStudies.length} {generalStudies.length === 1 ? 'Study' : 'Studies'}
                      </Badge>
                    </div>
                    <Accordion type="single" collapsible className="space-y-2">
                      {generalStudies.map((study, index) => (
                        <AccordionItem key={study.id} value={`general-${index}`} className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-start gap-3 text-left flex-1">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{study.title}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {study.study_type && (
                                    <Badge variant="outline" className="text-xs">
                                      {studyTypeLabels[study.study_type] || study.study_type}
                                    </Badge>
                                  )}
                                  {study.sample_size && (
                                    <span className="text-xs text-muted-foreground">n={study.sample_size}</span>
                                  )}
                                  {study.year && (
                                    <span className="text-xs text-muted-foreground">{study.year}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4">
                            {study.key_findings && study.key_findings.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium mb-2">Key Findings:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                  {study.key_findings.map((finding, i) => (
                                    <li key={i}>{finding}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {study.journal && (
                              <p className="text-sm text-muted-foreground mb-2">
                                <span className="font-medium">Published in:</span> {study.journal}
                              </p>
                            )}
                            <div className="flex gap-2 mt-3">
                              {study.doi && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={`https://doi.org/${study.doi}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    DOI
                                  </a>
                                </Button>
                              )}
                              {study.url && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={study.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Read Study
                                  </a>
                                </Button>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <DrawerFooter className="border-t">
          <Button variant="outline" onClick={closeEvidence} className="w-full">
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EvidenceDrawer;
