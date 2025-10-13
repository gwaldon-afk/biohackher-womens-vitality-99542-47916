import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, ChefHat } from "lucide-react";
import TemplateCard, { MealPlanTemplate } from "./TemplateCard";
import { mealTemplates, templateMealPlans } from "@/data/mealTemplates";

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void;
  onCustomize: () => void;
}

const TemplateSelector = ({ onSelectTemplate, onCustomize }: TemplateSelectorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<MealPlanTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = (template: MealPlanTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    onSelectTemplate(templateId);
  };

  const getDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  return (
    <>
      <div className="mb-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
              <ChefHat className="h-6 w-6 text-primary" />
              Choose Your Starting Point
            </h2>
            <p className="text-muted-foreground">
              Select a pre-built template or customize your own meal plan from scratch
            </p>
          </div>
        </div>

        {/* Template Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {mealTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={() => handlePreview(template)}
              onUse={() => handleUseTemplate(template.id)}
              isSelected={selectedTemplate === template.id}
            />
          ))}
        </div>

        {/* Or Customize Option */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Card className="mt-6 border-2 border-dashed hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">Customize From Scratch</CardTitle>
            <CardDescription>
              Build your own personalized meal plan by selecting your preferred recipes and dietary requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onCustomize} variant="outline" className="w-full">
              <ArrowRight className="h-4 w-4 mr-2" />
              Start Customizing
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <span className="text-3xl">{previewTemplate?.icon}</span>
              {previewTemplate?.name}
            </DialogTitle>
            <DialogDescription className="text-base">
              {previewTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-6 mt-4">
              {/* Benefits */}
              <div>
                <h4 className="font-semibold mb-3">Health Benefits</h4>
                <div className="grid gap-2">
                  {previewTemplate.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Plan Preview */}
              <div>
                <h4 className="font-semibold mb-3">7-Day Meal Plan Preview</h4>
                <div className="space-y-4">
                  {Object.entries(templateMealPlans[previewTemplate.id as keyof typeof templateMealPlans] || {}).map(([day, meals]: [string, any]) => (
                    <Card key={day} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{getDayName(day)}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {Object.entries(meals).map(([mealType, meal]: [string, any]) => (
                          <div key={mealType} className="flex items-start justify-between text-sm">
                            <div className="flex-1">
                              <div className="font-medium">{meal.name}</div>
                              <div className="text-xs text-muted-foreground">{meal.description}</div>
                            </div>
                            <div className="flex gap-3 text-xs text-right ml-4">
                              <div>
                                <div className="font-bold">{meal.calories}</div>
                                <div className="text-muted-foreground">cal</div>
                              </div>
                              <div>
                                <div className="font-bold">{meal.protein}g</div>
                                <div className="text-muted-foreground">pro</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    handleUseTemplate(previewTemplate.id);
                    setShowPreview(false);
                  }}
                  className="flex-1"
                >
                  Use This Template
                </Button>
                <Button
                  onClick={() => setShowPreview(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close Preview
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateSelector;
