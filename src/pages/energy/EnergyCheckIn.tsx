import { useNavigate } from "react-router-dom";
import { useEnergyLoop } from "@/hooks/useEnergyLoop";
import { EnergyCheckInForm } from "@/components/energy/EnergyCheckInForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EnergyCheckIn() {
  const navigate = useNavigate();
  const { todayCheckIn, submitCheckIn } = useEnergyLoop();

  const handleSubmit = async (data: any) => {
    await submitCheckIn(data);
    navigate('/dashboard?tab=today');
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Plan
      </Button>

      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Daily Energy Check-In</h1>
        <p className="text-muted-foreground">
          Take 30 seconds to reflect on your current state. Your Energy Loop updates automatically.
        </p>
      </div>

      <EnergyCheckInForm
        onSubmit={handleSubmit}
        initialData={todayCheckIn || undefined}
      />
    </div>
  );
}
