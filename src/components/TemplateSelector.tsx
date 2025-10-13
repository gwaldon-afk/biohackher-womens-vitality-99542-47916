import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, ChefHat, Check } from "lucide-react";
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

  const generateShoppingList = (template: MealPlanTemplate) => {
    const mealPlan = templateMealPlans[template.id as keyof typeof templateMealPlans];
    if (!mealPlan) return;

    // Collect and consolidate ingredients
    const ingredientsMap = new Map<string, { quantity: number; unit: string }>();
    
    Object.entries(mealPlan).forEach(([day, meals]: [string, any]) => {
      Object.entries(meals).forEach(([mealType, meal]: [string, any]) => {
        if (meal.ingredients) {
          meal.ingredients.forEach((ingredient: string) => {
            // Parse ingredient: "2 cups oats" -> quantity: 2, unit: cups, item: oats
            const match = ingredient.match(/^([\d.\/]+)?\s*([a-zA-Z]+)?\s+(.+)$/);
            if (match) {
              const [, qty, unit, item] = match;
              const quantity = qty ? eval(qty) : 1; // Handle fractions like 1/2
              const key = item.toLowerCase().trim();
              
              if (ingredientsMap.has(key)) {
                const existing = ingredientsMap.get(key)!;
                if (existing.unit === unit) {
                  existing.quantity += quantity;
                } else {
                  // Different units, just list separately
                  ingredientsMap.set(`${key} (${unit})`, { quantity, unit: unit || '' });
                }
              } else {
                ingredientsMap.set(key, { quantity, unit: unit || '' });
              }
            } else {
              // No quantity specified, just add as-is
              const key = ingredient.toLowerCase().trim();
              if (!ingredientsMap.has(key)) {
                ingredientsMap.set(key, { quantity: 1, unit: '' });
              }
            }
          });
        }
      });
    });

    // Convert to sorted list
    const consolidatedList = Array.from(ingredientsMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([item, { quantity, unit }]) => {
        const qtyStr = quantity > 1 || quantity % 1 !== 0 ? quantity.toString() : '';
        return `${qtyStr} ${unit} ${item}`.trim();
      });

    // Create printable HTML
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const hasIngredients = consolidatedList.length > 0;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${template.name} - Shopping List</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.6;
            }
            h1 {
              color: #333;
              border-bottom: 3px solid #000;
              padding-bottom: 10px;
            }
            h2 {
              color: #555;
              margin-top: 30px;
            }
            .header {
              margin-bottom: 30px;
            }
            .section {
              margin: 30px 0;
            }
            ul {
              list-style: none;
              padding: 0;
            }
            li {
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            li:before {
              content: "☐ ";
              margin-right: 10px;
              font-size: 18px;
            }
            .meal-item {
              margin: 15px 0;
              padding: 10px;
              background: #f9f9f9;
            }
            .meal-title {
              font-weight: bold;
              color: #333;
            }
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${template.icon} ${template.name}</h1>
            <p><strong>7-Day Shopping List</strong></p>
            <p>${template.description}</p>
          </div>

          ${hasIngredients ? `
            <div class="section">
              <h2>Consolidated Shopping List</h2>
              <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
                Quantities have been combined across all meals for the week
              </p>
              <ul>
                ${consolidatedList.map(ingredient => 
                  `<li>${ingredient}</li>`
                ).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="section">
            <h2>Meal Plan Overview</h2>
            ${Object.entries(mealPlan).map(([day, meals]: [string, any]) => `
              <h3>${getDayName(day)}</h3>
              ${Object.entries(meals).map(([mealType, meal]: [string, any]) => `
                <div class="meal-item">
                  <div class="meal-title">${mealType.charAt(0).toUpperCase() + mealType.slice(1)}: ${meal.name}</div>
                  <div>${meal.description}</div>
                  <div style="margin-top: 5px; font-size: 14px; color: #666;">
                    ${meal.calories} cal | ${meal.protein}g protein | ${meal.carbs}g carbs | ${meal.fat}g fat
                  </div>
                </div>
              `).join('')}
            `).join('')}
          </div>

          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
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
              <div className="space-y-3 pt-4 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      // TODO: Implement save as file functionality
                      console.log('Generate saveable file');
                    }}
                    size="lg"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Generate Saveable File
                  </Button>
                  <Button
                    onClick={() => {
                      if (previewTemplate) {
                        generateShoppingList(previewTemplate);
                      }
                    }}
                    size="lg"
                    variant="secondary"
                  >
                    Print Shopping List
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      handleUseTemplate(previewTemplate.id);
                      setShowPreview(false);
                    }}
                    size="lg"
                    variant="secondary"
                  >
                    Add To Nutrition Tracker
                  </Button>
                  <Button
                    onClick={() => setShowPreview(false)}
                    variant="outline"
                    size="lg"
                  >
                    Close Preview
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateSelector;
