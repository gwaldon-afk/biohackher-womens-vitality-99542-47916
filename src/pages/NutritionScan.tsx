import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Camera, X, Loader2, Check, Edit2, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useFoodLogging, FoodAnalysisResult } from "@/hooks/useFoodLogging";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const NutritionScan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { analyzePhoto, saveMeal, confirmMeal, isAnalyzing, isSaving, isConfirming, uploadPhoto } = useFoodLogging();
  
  const [image, setImage] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [pendingMealId, setPendingMealId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fibre: number;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine default meal type based on time of day
  useState(() => {
    const hour = new Date().getHours();
    if (hour < 10) setMealType('breakfast');
    else if (hour < 14) setMealType('lunch');
    else if (hour < 18) setMealType('snack');
    else setMealType('dinner');
  });

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysisResult(null);
        setPendingMealId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image || !user) {
      if (!user) {
        toast({
          title: t('common.signInRequired', 'Sign In Required'),
          description: t('foodScanner.signInToAnalyze', 'Please sign in to analyze your meals'),
          variant: 'destructive',
        });
      }
      return;
    }

    try {
      const result = await analyzePhoto({ imageBase64: image, mealType });
      setAnalysisResult(result);
      setEditedValues({
        calories: Math.round(result.calories_estimated),
        protein: Number(result.protein_g.toFixed(1)),
        carbs: Number(result.carbs_g.toFixed(1)),
        fats: Number(result.fats_g.toFixed(1)),
        fibre: Number(result.fibre_g.toFixed(1)),
      });
      
      // Upload photo and save as unconfirmed
      const photoUrl = await uploadPhoto(image);
      const meal = await saveMeal({
        photoUrl: photoUrl || undefined,
        mealType,
        analysis: result,
        confirmed: false,
      });
      setPendingMealId(meal.id);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleConfirm = async () => {
    if (!pendingMealId) return;

    try {
      const adjustedValues = isEditing && editedValues ? {
        calories_estimated: editedValues.calories,
        protein_g: editedValues.protein,
        carbs_g: editedValues.carbs,
        fats_g: editedValues.fats,
        fibre_g: editedValues.fibre,
      } : undefined;

      await confirmMeal({ mealId: pendingMealId, adjustedValues });
      navigate('/today');
    } catch (error) {
      console.error('Confirm failed:', error);
    }
  };

  const handleDiscard = () => {
    setImage(null);
    setAnalysisResult(null);
    setPendingMealId(null);
    setEditedValues(null);
    setIsEditing(false);
  };

  const mealTypeLabels: Record<MealType, string> = {
    breakfast: t('foodScanner.mealType.breakfast'),
    lunch: t('foodScanner.mealType.lunch'),
    dinner: t('foodScanner.mealType.dinner'),
    snack: t('foodScanner.mealType.snack'),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-xl mx-auto space-y-6 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              {t('foodScanner.pageTitle', 'AI Meal Scanner')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('foodScanner.pageSubtitle', 'Snap a photo to analyse nutrition')}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate('/today')}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Meal Type Selector */}
        <div className="space-y-2">
          <Label>{t('foodScanner.selectMealType', 'Meal Type')}</Label>
          <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(mealTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            {!image ? (
              /* Camera Capture State */
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center gap-4">
                  <Camera className="w-16 h-16 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center px-4">
                    {t('foodScanner.captureHint', 'Take a clear photo of your meal for best results')}
                  </p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()} className="w-full" size="lg">
                  <Camera className="mr-2 h-5 w-5" />
                  {t('foodScanner.takePhoto', 'Take Photo')}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCapture}
                  className="hidden"
                />
              </div>
            ) : !analysisResult ? (
              /* Photo Preview - Pre-Analysis */
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden relative">
                  <img src={image} alt="Captured food" className="w-full h-full object-cover" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm font-medium">{t('foodScanner.analysing', 'Analysing your meal...')}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleDiscard} className="flex-1" disabled={isAnalyzing}>
                    {t('foodScanner.retake', 'Retake')}
                  </Button>
                  <Button onClick={handleAnalyze} className="flex-1" disabled={isAnalyzing || !user}>
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('foodScanner.analysing', 'Analysing...')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {t('foodScanner.analyzeButton', 'Analyse Meal')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* Analysis Results with Confirmation */
              <div className="space-y-5">
                {/* Photo thumbnail */}
                <div className="flex gap-4 items-start">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={image} alt="Meal" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{analysisResult.meal_description}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {analysisResult.food_items.slice(0, 4).map((item, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{item}</Badge>
                      ))}
                      {analysisResult.food_items.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{analysisResult.food_items.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Confidence indicator */}
                {analysisResult.confidence_score < 0.7 && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <p className="text-yellow-800 dark:text-yellow-200">
                      {t('foodScanner.lowConfidence', 'Analysis confidence is lower than usual. Please verify the values below.')}
                    </p>
                  </div>
                )}

                {/* Nutrition Values */}
                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{t('foodScanner.estimatedNutrition', 'Estimated Nutrition')}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsEditing(!isEditing)}
                        className="h-8"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        {isEditing ? t('common.done', 'Done') : t('common.edit', 'Edit')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isEditing && editedValues ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t('foodScanner.calories', 'Calories')}</Label>
                          <Input
                            type="number"
                            value={editedValues.calories}
                            onChange={(e) => setEditedValues({ ...editedValues, calories: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('foodScanner.proteinG', 'Protein (g)')}</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={editedValues.protein}
                            onChange={(e) => setEditedValues({ ...editedValues, protein: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('foodScanner.carbsG', 'Carbs (g)')}</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={editedValues.carbs}
                            onChange={(e) => setEditedValues({ ...editedValues, carbs: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('foodScanner.fatsG', 'Fats (g)')}</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={editedValues.fats}
                            onChange={(e) => setEditedValues({ ...editedValues, fats: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-1 col-span-2">
                          <Label className="text-xs">{t('foodScanner.fibreG', 'Fibre (g)')}</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={editedValues.fibre}
                            onChange={(e) => setEditedValues({ ...editedValues, fibre: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('foodScanner.calories', 'Calories')}</span>
                          <span className="font-semibold">{editedValues?.calories || Math.round(analysisResult.calories_estimated)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('foodScanner.protein', 'Protein')}</span>
                          <span className="font-semibold">{editedValues?.protein || analysisResult.protein_g.toFixed(1)}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('foodScanner.carbs', 'Carbs')}</span>
                          <span className="font-semibold">{editedValues?.carbs || analysisResult.carbs_g.toFixed(1)}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('foodScanner.fats', 'Fats')}</span>
                          <span className="font-semibold">{editedValues?.fats || analysisResult.fats_g.toFixed(1)}g</span>
                        </div>
                        <div className="flex justify-between col-span-2">
                          <span className="text-muted-foreground">{t('foodScanner.fibre', 'Fibre')}</span>
                          <span className="font-semibold">{editedValues?.fibre || analysisResult.fibre_g.toFixed(1)}g</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Health Notes */}
                {analysisResult.health_notes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{t('foodScanner.healthNotes', 'Health Notes')}</p>
                    <ul className="space-y-1">
                      {analysisResult.health_notes.map((note, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Confirmation Prompt */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium">
                    {t('foodScanner.confirmPrompt', 'Add this meal to your nutrition record?')}
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleDiscard} className="flex-1" disabled={isConfirming}>
                      {t('foodScanner.discard', 'Discard')}
                    </Button>
                    <Button onClick={handleConfirm} className="flex-1" disabled={isConfirming}>
                      {isConfirming ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      {t('foodScanner.addToRecord', 'Add to Record')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help text */}
        {!analysisResult && (
          <p className="text-sm text-muted-foreground text-center">
            {t('foodScanner.helpText', 'AI will estimate calories, protein, carbs, fats and fibre from your photo')}
          </p>
        )}
      </div>
    </div>
  );
};

export default NutritionScan;
