import { GoalTemplate } from "@/services/goalTemplateService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Target, 
  Calendar, 
  Pill, 
  Activity, 
  Utensils, 
  Brain,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface GoalTemplatePreviewProps {
  template: GoalTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChooseTemplate: () => void;
}

const INTERVENTION_ICONS = {
  supplement: Pill,
  activity: Activity,
  nutrition: Utensils,
  habit: Brain,
  default: CheckCircle2,
};

const GoalTemplatePreview = ({ 
  template, 
  open, 
  onOpenChange, 
  onChooseTemplate 
}: GoalTemplatePreviewProps) => {
  if (!template) return null;

  const interventions = template.default_interventions?.protocols || [];
  const externalMetrics = template.default_metrics?.external || [];
  const selfReportedMetrics = template.default_metrics?.self_reported || [];
  const barriers = template.common_barriers?.barriers || [];
  const healthspanTarget = template.default_healthspan_target || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Target className="h-6 w-6 text-primary" />
            {template.name}
          </DialogTitle>
          <DialogDescription className="text-base">
            {template.description}
          </DialogDescription>
          {template.is_premium_only && (
            <Badge variant="secondary" className="w-fit mt-2">Premium Template</Badge>
          )}
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Detailed Description */}
          {template.detailed_description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{template.detailed_description}</p>
              </CardContent>
            </Card>
          )}

          <Accordion type="single" collapsible defaultValue="healthspan" className="w-full">
            {/* Healthspan Target */}
            {healthspanTarget && Object.keys(healthspanTarget).length > 0 && (
              <AccordionItem value="healthspan">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Healthspan Target
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      {healthspanTarget.baseline_questions && (
                        <div>
                          <h4 className="font-medium mb-2">Questions to Consider:</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {healthspanTarget.baseline_questions.map((q: string, i: number) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {healthspanTarget.objective_template && (
                        <div>
                          <h4 className="font-medium mb-2">Objective:</h4>
                          <p className="text-muted-foreground">{healthspanTarget.objective_template}</p>
                        </div>
                      )}
                      {healthspanTarget.expected_outcome && (
                        <div>
                          <h4 className="font-medium mb-2">Expected Outcome:</h4>
                          <p className="text-muted-foreground">{healthspanTarget.expected_outcome}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Interventions (Aging Blueprint) */}
            {interventions.length > 0 && (
              <AccordionItem value="interventions">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Interventions ({interventions.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3">
                    {interventions.map((intervention: any, i: number) => {
                      const Icon = INTERVENTION_ICONS[intervention.type as keyof typeof INTERVENTION_ICONS] || INTERVENTION_ICONS.default;
                      return (
                        <Card key={i}>
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{intervention.name}</h4>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {intervention.type}
                                  </Badge>
                                </div>
                                {intervention.rationale && (
                                  <p className="text-sm text-muted-foreground">{intervention.rationale}</p>
                                )}
                                {intervention.frequency && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Frequency: {intervention.frequency}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Metrics to Track */}
            {(externalMetrics.length > 0 || selfReportedMetrics.length > 0) && (
              <AccordionItem value="metrics">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Metrics to Track
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {externalMetrics.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">External Biomarkers:</h4>
                        <div className="grid gap-2">
                          {externalMetrics.map((metric: any, i: number) => (
                            <Card key={i}>
                              <CardContent className="pt-3 pb-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{metric.name}</span>
                                  {metric.unit && (
                                    <Badge variant="secondary" className="text-xs">
                                      {metric.unit}
                                    </Badge>
                                  )}
                                </div>
                                {metric.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{metric.description}</p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    {selfReportedMetrics.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Self-Reported Metrics:</h4>
                        <div className="grid gap-2">
                          {selfReportedMetrics.map((metric: any, i: number) => (
                            <Card key={i}>
                              <CardContent className="pt-3 pb-3">
                                <span className="font-medium">{metric.name}</span>
                                {metric.scale && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Scale: {metric.scale}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Common Barriers */}
            {barriers.length > 0 && (
              <AccordionItem value="barriers">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    Common Barriers & Strategies
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3">
                    {barriers.map((barrier: any, i: number) => (
                      <Card key={i}>
                        <CardContent className="pt-4">
                          <h4 className="font-medium mb-2">{barrier.barrier}</h4>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">If-Then Strategy:</span> {barrier.if_then_template}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={onChooseTemplate} className="flex-1">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Choose This Template
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalTemplatePreview;
