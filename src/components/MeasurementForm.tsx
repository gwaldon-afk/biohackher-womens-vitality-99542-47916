import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MeasurementFormProps {
  onSubmit: (measurement: any) => Promise<void>;
  onCancel?: () => void;
}

export const MeasurementForm = ({ onSubmit, onCancel }: MeasurementFormProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    weight: '',
    body_fat_percentage: '',
    muscle_mass: '',
    waist_circumference: '',
    hip_circumference: '',
    chest_circumference: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        date: format(date, 'yyyy-MM-dd'),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : null,
        muscle_mass: formData.muscle_mass ? parseFloat(formData.muscle_mass) : null,
        waist_circumference: formData.waist_circumference ? parseFloat(formData.waist_circumference) : null,
        hip_circumference: formData.hip_circumference ? parseFloat(formData.hip_circumference) : null,
        chest_circumference: formData.chest_circumference ? parseFloat(formData.chest_circumference) : null,
        notes: formData.notes || null
      });

      setFormData({
        weight: '',
        body_fat_percentage: '',
        muscle_mass: '',
        waist_circumference: '',
        hip_circumference: '',
        chest_circumference: '',
        notes: ''
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Measurement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body_fat">Body Fat (%)</Label>
              <Input
                id="body_fat"
                type="number"
                step="0.1"
                value={formData.body_fat_percentage}
                onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="muscle_mass">Muscle Mass (kg)</Label>
              <Input
                id="muscle_mass"
                type="number"
                step="0.1"
                value={formData.muscle_mass}
                onChange={(e) => setFormData({ ...formData, muscle_mass: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waist">Waist (cm)</Label>
              <Input
                id="waist"
                type="number"
                step="0.1"
                value={formData.waist_circumference}
                onChange={(e) => setFormData({ ...formData, waist_circumference: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hip">Hip (cm)</Label>
              <Input
                id="hip"
                type="number"
                step="0.1"
                value={formData.hip_circumference}
                onChange={(e) => setFormData({ ...formData, hip_circumference: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chest">Chest (cm)</Label>
              <Input
                id="chest"
                type="number"
                step="0.1"
                value={formData.chest_circumference}
                onChange={(e) => setFormData({ ...formData, chest_circumference: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about your progress..."
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Measurement'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
