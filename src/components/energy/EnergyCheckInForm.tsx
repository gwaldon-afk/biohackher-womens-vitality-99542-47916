import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Moon, Brain } from "lucide-react";

interface EnergyCheckInFormProps {
  onSubmit: (data: {
    energy_rating: number;
    sleep_quality: number;
    stress_level: number;
    notes?: string;
  }) => Promise<void>;
  initialData?: {
    energy_rating?: number;
    sleep_quality?: number;
    stress_level?: number;
    notes?: string;
  };
}

const energyEmojis = ['💤', '😴', '😐', '🙂', '😊', '😃', '😄', '🤩', '⚡', '🔥'];
const sleepEmojis = ['💤', '😴', '😐', '🙂', '😊', '😃', '😄', '🤩', '⚡', '🔥'];
const stressEmojis = ['😌', '🙂', '😐', '😟', '😰', '😱', '🤯', '😤', '😡', '😵'];

export const EnergyCheckInForm = ({ onSubmit, initialData }: EnergyCheckInFormProps) => {
  const [energyRating, setEnergyRating] = useState(initialData?.energy_rating || 5);
  const [sleepQuality, setSleepQuality] = useState(initialData?.sleep_quality || 5);
  const [stressLevel, setStressLevel] = useState(initialData?.stress_level || 5);
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
        notes: notes || undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Quick daily check-in to track patterns. For a comprehensive energy assessment, complete the{' '}
          <a href="/assessment/energy-levels" className="text-primary hover:underline font-medium">
            Energy Levels Assessment
          </a>
          {' '}every 30 days.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Energy Rating */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-base">
              <Zap className="w-5 h-5" />
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
            <Label className="flex items-center gap-2 text-base">
              <Moon className="w-5 h-5" />
              How was your sleep quality?
            </Label>
            <span className="text-3xl">{sleepEmojis[sleepQuality - 1]}</span>
          </div>
          <div className="space-y-2">
            <Slider
              value={[sleepQuality]}
              onValueChange={([value]) => setSleepQuality(value)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Terrible</span>
              <span className="font-semibold text-foreground">{sleepQuality}/10</span>
              <span>Amazing</span>
            </div>
          </div>
        </div>

        {/* Stress Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-base">
              <Brain className="w-5 h-5" />
              What's your stress level?
            </Label>
            <span className="text-3xl">{stressEmojis[stressLevel - 1]}</span>
          </div>
          <div className="space-y-2">
            <Slider
              value={[stressLevel]}
              onValueChange={([value]) => setStressLevel(value)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Zen</span>
              <span className="font-semibold text-foreground">{stressLevel}/10</span>
              <span>Overwhelmed</span>
            </div>
          </div>
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
        {isSubmitting ? 'Saving...' : 'Save Daily Check-In'}
      </Button>
    </form>
  );
};
