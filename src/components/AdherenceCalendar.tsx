import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";

interface AdherenceCalendarProps {
  completedDates: string[];
}

export const AdherenceCalendar = ({ completedDates }: AdherenceCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const modifiers = {
    completed: completedDates.map(dateStr => new Date(dateStr))
  };

  const modifiersStyles = {
    completed: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      fontWeight: 'bold'
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adherence Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="rounded-md border"
        />
        <div className="mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary"></div>
            <span>Days with completed items</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
