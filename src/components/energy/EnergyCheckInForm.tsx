import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Zap, Moon, Activity, Brain, Apple, Droplets } from "lucide-react";

interface EnergyCheckInFormProps {
  onSubmit: (data: {
    energy_rating: number;
    sleep_quality: number;
    stress_level: number;
    movement_completed: boolean;
    movement_quality: number;
    nutrition_quality: number;
    hydrated: boolean;
    cycle_day?: number | null;
    notes?: string;
  }) => Promise<void>;
  initialData?: {
    energy_rating?: number;
    sleep_quality?: number;
    stress_level?: number;
    movement_completed?: boolean;
    notes?: string;
  };
}

const energyEmojis = ['💤', '😴', '😐', '🙂', '😊', '😃', '😄', '🤩', '⚡', '🔥'];
const sleepEmojis = ['😫', '😴', '😐', '🙂', '😊'];
const stressEmojis = ['😌', '🙂', '😐', '😰', '😱'];
const nutritionEmojis = ['🍔', '😐', '🥗', '💚', '⭐'];

export const EnergyCheckInForm = ({ onSubmit, initialData }: EnergyCheckInFormProps) => {
  const [energyRating, setEnergyRating] = useState(initialData?.energy_rating || 5);
  const [sleepQuality, setSleepQuality] = useState(initialData?.sleep_quality || 3);
  const [stressLevel, setStressLevel] = useState(initialData?.stress_level || 3);
  const [movementQuality, setMovementQuality] = useState(initialData?.movement_completed ? 4 : 3);
  const [nutritionQuality, setNutritionQuality] = useState(3);
  const [hydrated, setHydrated] = useState(true);
  const [cycleDay, setCycleDay] = useState<number | null>(null);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        energy_rating: energyRating,
        sleep_quality: sleepQuality,
        stress_level: stressLevel,
        movement_completed: movementQuality >= 3,
        movement_quality: movementQuality,
        nutrition_quality: nutritionQuality,
        hydrated,
        cycle_day: cycleDay,
        notes: notes || undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 space-y-6">
        {/* Energy Rating */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              How's your energy right now?
            </Label>
            <span className="text-3xl">{energyEmojis[energyRating - 1]}</span>
          </div>
          <div className="space-y-2">
            <Slider
              value={[energyRating]}
              onValueChange={([value]) => setEnergyRating(value)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Exhausted</span>
              <span className="font-semibold text-foreground">{energyRating}/10</span>
              <span>Supercharged</span>
            </div>
          </div>
        </div>

        {/* Sleep Quality */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              How was your sleep?
            </Label>
            <span className="text-3xl">{sleepEmojis[sleepQuality - 1]}</span>
          </div>
          <div className="space-y-2">
            <Slider
              value={[sleepQuality]}
              onValueChange={([value]) => setSleepQuality(value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Terrible</span>
              <span className="font-semibold text-foreground">{sleepQuality}/5</span>
              <span>Amazing</span>
            </div>
          </div>
        </div>

        {/* Stress Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              What's your stress level?
            </Label>
            <span className="text-3xl">{stressEmojis[stressLevel - 1]}</span>
          </div>
          <div className="space-y-2">
            <Slider
              value={[stressLevel]}
              onValueChange={([value]) => setStressLevel(value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Zen</span>
              <span className="font-semibold text-foreground">{stressLevel}/5</span>
              <span>Overwhelmed</span>
            </div>
          </div>
        </div>

        {/* Movement Completed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Movement Quality
            </Label>
          </div>
          <div className="space-y-2">
            <Slider
              value={[movementQuality]}
              onValueChange={([value]) => setMovementQuality(value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Light</span>
              <span className="font-semibold text-foreground">{movementQuality}/5</span>
              <span>Intense</span>
            </div>
          </div>
        </div>

        {/* Nutrition Quality */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Apple className="w-4 h-4" />
              How's your nutrition today?
            </Label>
            <span className="text-3xl">{nutritionEmojis[nutritionQuality - 1]}</span>
          </div>
          <div className="space-y-2">
            <Slider
              value={[nutritionQuality]}
              onValueChange={([value]) => setNutritionQuality(value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Poor</span>
              <span className="font-semibold text-foreground">{nutritionQuality}/5</span>
              <span>Excellent</span>
            </div>
          </div>
        </div>

        {/* Hydration */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <Label htmlFor="hydration" className="flex items-center gap-2 cursor-pointer">
            <Droplets className="w-4 h-4" />
            <span>Stayed well hydrated today?</span>
          </Label>
          <Switch
            id="hydration"
            checked={hydrated}
            onCheckedChange={setHydrated}
          />
        </div>

        {/* Cycle Day */}
        <div className="space-y-2">
          <Label htmlFor="cycle-day" className="text-sm font-medium">
            Cycle Day (optional - for hormonal tracking)
          </Label>
          <Input
            id="cycle-day"
            type="number"
            min="1"
            max="35"
            placeholder="e.g. 14 (Day 1 = first day of period)"
            value={cycleDay || ""}
            onChange={(e) => setCycleDay(e.target.value ? parseInt(e.target.value) : null)}
            className="max-w-sm"
          />
          <p className="text-xs text-muted-foreground">
            Track your cycle for personalized insights
          </p>
        </div>

        {/* Optional Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any patterns you noticed? What affected your energy today?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Updating...' : 'Update My Energy'}
      </Button>
    </form>
  );
};
