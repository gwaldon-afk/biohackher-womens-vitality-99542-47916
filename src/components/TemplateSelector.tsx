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

  // Helper function to safely parse fractions and decimals
  const parseFraction = (str: string): number => {
    if (str.includes('/')) {
      const [num, denom] = str.split('/').map(Number);
      return num / denom;
    }
    return parseFloat(str);
  };

  // Helper function to parse ingredient strings
  const parseIngredient = (ingredient: string) => {
    // Pattern 1: "200g chicken breast"
    const pattern1 = /^(\d+(?:\.\d+)?)\s*(g|kg|oz|lb|lbs|mg)\s+(.+)$/i;
    // Pattern 2: "2 cups oats"
    const pattern2 = /^([\d.\/\s]+)\s*(cup|cups|tbsp|tsp|tablespoon|teaspoon|tablespoons|teaspoons)\s+(.+)$/i;
    // Pattern 3: "2 chicken breasts (300g)"
    const pattern3 = /^(\d+)\s+([^(]+)\s*\((\d+)\s*(g|kg|oz|lb)\s*\)$/i;
    // Pattern 4: "1/2 avocado"
    const pattern4 = /^([\d\/]+)\s+(.+)$/;
    
    let match = ingredient.match(pattern1);
    if (match) {
      return { quantity: parseFloat(match[1]), unit: match[2].toLowerCase(), item: match[3].trim() };
    }
    
    match = ingredient.match(pattern2);
    if (match) {
      return { quantity: parseFraction(match[1].trim()), unit: match[2].toLowerCase(), item: match[3].trim() };
    }
    
    match = ingredient.match(pattern3);
    if (match) {
      return { quantity: parseFloat(match[3]), unit: match[4].toLowerCase(), item: match[2].trim() };
    }
    
    match = ingredient.match(pattern4);
    if (match) {
      const qty = match[1].includes('/') ? parseFraction(match[1]) : parseFloat(match[1]);
      return { quantity: qty, unit: '', item: match[2].trim() };
    }
    
    // No quantity found
    return { quantity: 1, unit: '', item: ingredient.trim() };
  };

  // Helper function to normalize ingredient names
  const normalizeIngredientName = (name: string): string => {
    let normalized = name.toLowerCase().trim();
    
    // Remove common descriptors and cooking methods
    const descriptors = [
      'fresh', 'frozen', 'dried', 'raw', 'cooked', 'grilled', 'baked', 'roasted', 'steamed',
      'chopped', 'sliced', 'diced', 'minced', 'shredded', 'grated',
      'whole', 'large', 'small', 'medium', 'extra', 'super',
      'boneless', 'skinless', 'lean', 'trimmed', 'filleted', 'ground',
      'organic', 'free-range', 'grass-fed', 'wild-caught'
    ];
    descriptors.forEach(desc => {
      normalized = normalized.replace(new RegExp(`\\b${desc}\\b`, 'gi'), '').trim();
    });
    
    // Simplify protein names to base type
    const proteinSimplifications: { [key: string]: string } = {
      'chicken breast': 'chicken',
      'chicken thigh': 'chicken',
      'chicken leg': 'chicken',
      'chicken wing': 'chicken',
      'beef steak': 'beef',
      'beef mince': 'beef',
      'ground beef': 'beef',
      'pork chop': 'pork',
      'pork loin': 'pork',
      'salmon fillet': 'salmon',
      'tuna steak': 'tuna',
      'white fish': 'white fish fillet',
      'egg white': 'egg white',
    };
    
    // Apply protein simplifications
    for (const [pattern, replacement] of Object.entries(proteinSimplifications)) {
      if (normalized.includes(pattern)) {
        normalized = replacement;
        break;
      }
    }
    
    // Handle plurals - convert to singular
    if (normalized.endsWith('ies')) {
      normalized = normalized.slice(0, -3) + 'y';
    } else if (normalized.endsWith('ves')) {
      normalized = normalized.slice(0, -3) + 'f';
    } else if (normalized.endsWith('ses') || normalized.endsWith('ches') || normalized.endsWith('shes')) {
      normalized = normalized.slice(0, -2);
    } else if (normalized.endsWith('s') && !normalized.endsWith('ss') && !normalized.endsWith('lentils')) {
      normalized = normalized.slice(0, -1);
    }
    
    return normalized.replace(/\s+/g, ' ').trim();
  };

  // Helper function to convert units to base units
  const convertToBaseUnit = (quantity: number, unit: string): { quantity: number; unit: string } => {
    const unitLower = unit.toLowerCase();
    
    // Weight conversions to grams
    if (unitLower === 'kg') return { quantity: quantity * 1000, unit: 'g' };
    if (unitLower === 'oz') return { quantity: quantity * 28.35, unit: 'g' };
    if (unitLower === 'lb' || unitLower === 'lbs') return { quantity: quantity * 453.592, unit: 'g' };
    if (unitLower === 'mg') return { quantity: quantity / 1000, unit: 'g' };
    
    // Volume conversions to cups
    if (unitLower === 'tbsp' || unitLower === 'tablespoon' || unitLower === 'tablespoons') {
      return { quantity: quantity / 16, unit: 'cup' };
    }
    if (unitLower === 'tsp' || unitLower === 'teaspoon' || unitLower === 'teaspoons') {
      return { quantity: quantity / 48, unit: 'cup' };
    }
    if (unitLower === 'cups') return { quantity, unit: 'cup' };
    
    return { quantity, unit: unitLower };
  };

  // Helper function to categorize ingredients
  const categorizeIngredient = (item: string): string => {
    const itemLower = item.toLowerCase();
    
    if (/(chicken|beef|pork|lamb|turkey|duck|steak|sausage|bacon|meat|prawns|shrimp|salmon|tuna|fish|cod|haddock|mackerel|sardine|octopus|squid|calamari|crab|lobster|mussel|scallop|oyster|tempeh|tofu|seitan)/i.test(itemLower)) {
      return 'Proteins';
    }
    if (/(egg|white)/i.test(itemLower)) {
      return 'Eggs & Dairy';
    }
    if (/(rice|quinoa|oat|pasta|bread|couscous|lentil|chickpea|bean)/i.test(itemLower)) {
      return 'Grains & Legumes';
    }
    if (/(spinach|kale|broccoli|asparagus|green|lettuce|tomato|zucchini|pepper|carrot|cucumber|celery|onion|garlic|ginger|vegetable)/i.test(itemLower)) {
      return 'Vegetables';
    }
    if (/(banana|berry|berries|apple|orange|fruit|avocado|lemon)/i.test(itemLower)) {
      return 'Fruits';
    }
    if (/(yogurt|milk|cheese|cottage)/i.test(itemLower)) {
      return 'Dairy';
    }
    if (/(almond|nut|seed|sesame|tahini|peanut)/i.test(itemLower)) {
      return 'Nuts & Seeds';
    }
    if (/(oil|sauce|dressing|spice|herb|salt|pepper|honey|syrup|butter|glaze)/i.test(itemLower)) {
      return 'Condiments & Seasonings';
    }
    if (/(protein powder|whey|supplement)/i.test(itemLower)) {
      return 'Supplements';
    }
    return 'Other';
  };

  // Common pantry items that most people have
  const pantryItems = new Set([
    'salt', 'pepper', 'black pepper', 'sea salt', 'kosher salt',
    'olive oil', 'oil', 'vegetable oil', 'coconut oil', 'cooking oil',
    'garlic', 'onion', 'ginger',
    'cumin', 'paprika', 'oregano', 'basil', 'thyme', 'rosemary', 'parsley', 'coriander', 'turmeric',
    'soy sauce', 'vinegar', 'balsamic vinegar', 'lemon juice', 'lime juice',
    'honey', 'sugar', 'brown sugar',
    'flour', 'baking powder', 'baking soda',
    'stock', 'broth', 'bouillon'
  ]);

  const generateShoppingList = (template: MealPlanTemplate) => {
    const mealPlan = templateMealPlans[template.id as keyof typeof templateMealPlans];
    if (!mealPlan) return;

    // Check if this template has ingredient data
    const firstDay = Object.values(mealPlan)[0];
    const firstMeal = Object.values(firstDay)[0];
    const hasIngredientData = firstMeal && 'ingredients' in firstMeal;

    // Collect and consolidate ingredients
    interface IngredientData {
      quantity: number;
      unit: string;
      category: string;
      originalItem: string;
    }
    
    const ingredientsMap = new Map<string, IngredientData>();
    const pantryItemsFound = new Map<string, IngredientData>();
    
    Object.entries(mealPlan).forEach(([day, meals]: [string, any]) => {
      Object.entries(meals).forEach(([mealType, meal]: [string, any]) => {
        if (meal.ingredients) {
          meal.ingredients.forEach((ingredient: string) => {
            const parsed = parseIngredient(ingredient);
            const normalized = normalizeIngredientName(parsed.item);
            const converted = convertToBaseUnit(parsed.quantity, parsed.unit);
            const category = categorizeIngredient(parsed.item);
            
            // Check if this is a pantry item
            const isPantryItem = pantryItems.has(normalized) || 
                                 Array.from(pantryItems).some(item => normalized.includes(item));
            
            const targetMap = isPantryItem ? pantryItemsFound : ingredientsMap;
            const unitKey = converted.unit ? `${normalized}__${converted.unit}` : normalized;
            
            // Add or update ingredient
            if (targetMap.has(unitKey)) {
              targetMap.get(unitKey)!.quantity += converted.quantity;
            } else {
              targetMap.set(unitKey, {
                quantity: converted.quantity,
                unit: converted.unit,
                category,
                originalItem: parsed.item
              });
            }
          });
        }
      });
    });

    // Helper to format items
    const formatItem = (data: IngredientData, key: string): string => {
      const displayName = key.includes('__') ? key.split('__')[0] : key;
      if (data.unit) {
        const qty = Math.round(data.quantity * 100) / 100;
        const qtyStr = qty % 1 === 0 ? qty.toString() : qty.toFixed(1);
        return `${qtyStr}${data.unit} ${displayName}`;
      } else {
        const qty = Math.ceil(data.quantity);
        return qty > 1 ? `${qty} ${displayName}` : displayName;
      }
    };

    // Group shopping items by category
    const categorized = new Map<string, Array<{ item: string; display: string }>>();
    ingredientsMap.forEach((data, key) => {
      const displayName = key.includes('__') ? key.split('__')[0] : key;
      const display = formatItem(data, key);
      
      if (!categorized.has(data.category)) {
        categorized.set(data.category, []);
      }
      categorized.get(data.category)!.push({ item: displayName, display });
    });

    // Format pantry items
    const pantryList = Array.from(pantryItemsFound.entries()).map(([key, data]) => ({
      item: key.includes('__') ? key.split('__')[0] : key,
      display: formatItem(data, key)
    })).sort((a, b) => a.item.localeCompare(b.item));
    
    // Sort categories in logical order
    const categoryOrder = [
      'Proteins',
      'Eggs & Dairy',
      'Dairy',
      'Grains & Legumes',
      'Vegetables',
      'Fruits',
      'Nuts & Seeds',
      'Condiments & Seasonings',
      'Supplements',
      'Other'
    ];
    
    const sortedCategories = Array.from(categorized.keys()).sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    // Create printable HTML
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const hasIngredients = ingredientsMap.size > 0 && hasIngredientData;
    
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
              <h2>Shopping List</h2>
              <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
                Quantities consolidated for the full week
              </p>
              ${sortedCategories.map(category => {
                const items = categorized.get(category)!.sort((a, b) => a.item.localeCompare(b.item));
                return `
                  <h3 style="color: #333; font-size: 16px; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; border-bottom: 2px solid #ddd; padding-bottom: 5px;">
                    ${category}
                  </h3>
                  <ul>
                    ${items.map(({ display }) => `<li>${display}</li>`).join('')}
                  </ul>
                `;
              }).join('')}
              
              ${pantryList.length > 0 ? `
                <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #6c757d;">
                  <h2 style="font-size: 18px; margin-bottom: 10px;">Pantry Check</h2>
                  <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
                    Common items you probably have - just verify you have enough
                  </p>
                  <ul>
                    ${pantryList.map(({ display }) => `<li>${display}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          ` : `
            <div class="section">
              <h2>Shopping List Not Available</h2>
              <p style="color: #666; font-size: 14px; margin-bottom: 15px; padding: 20px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px;">
                <strong>Note:</strong> This meal template doesn't include detailed ingredient lists yet. 
                Please refer to the meal descriptions below to create your shopping list, or try the <strong>High Protein Athlete</strong> template which includes a complete consolidated shopping list.
              </p>
            </div>
          `}

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
