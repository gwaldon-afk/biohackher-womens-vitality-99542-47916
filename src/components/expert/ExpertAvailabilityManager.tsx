import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExpertServices } from "@/hooks/useExpertServices";
import { Plus, Trash2, Calendar } from "lucide-react";

interface ExpertAvailabilityManagerProps {
  expertId: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const ExpertAvailabilityManager = ({ expertId }: ExpertAvailabilityManagerProps) => {
  const { availability, loading, setAvailabilitySlot, deleteAvailabilitySlot } = useExpertServices(expertId);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "17:00",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await setAvailabilitySlot({
      expert_id: expertId,
      ...formData,
      available: true,
    });
    
    if (result) {
      setOpen(false);
    }
  };

  const groupedAvailability = DAYS.map((day, index) => ({
    day,
    dayIndex: index,
    slots: availability.filter(a => a.day_of_week === index),
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Weekly Availability</CardTitle>
            <CardDescription>Set your available hours for consultations</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Time Slot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Availability</DialogTitle>
                <DialogDescription>Define when you're available for consultations</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Day of Week</label>
                  <Select
                    value={formData.day_of_week.toString()}
                    onValueChange={(value) => setFormData({ ...formData, day_of_week: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day, index) => (
                        <SelectItem key={day} value={index.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Time</label>
                    <input
                      type="time"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <input
                      type="time"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add Slot</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading availability...</p>
        ) : (
          <div className="space-y-4">
            {groupedAvailability.map((day) => (
              <div key={day.dayIndex} className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {day.day}
                </h4>
                {day.slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground ml-6">Not available</p>
                ) : (
                  <div className="ml-6 space-y-2">
                    {day.slots.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-2 rounded border">
                        <span className="text-sm">
                          {slot.start_time} - {slot.end_time}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAvailabilitySlot(slot.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};