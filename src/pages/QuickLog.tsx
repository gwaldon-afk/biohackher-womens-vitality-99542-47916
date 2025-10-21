import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";

const QuickLog = () => {
  const navigate = useNavigate();
  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(7);

  const handleSubmit = () => {
    const currentBioScore = parseInt(localStorage.getItem('bio_score') || '70');
    const avgInput = (sleep + energy) / 2;
    const newBioScore = Math.min(100, Math.round(currentBioScore + avgInput));
    
    localStorage.setItem('bio_score', newBioScore.toString());
    navigate('/plan-home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-xl mx-auto space-y-6 pt-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Quick Log</h1>
          <Button variant="ghost" size="icon" onClick={() => navigate('/plan-home')}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <Card className="p-6 space-y-8">
          <div className="space-y-4">
            <Label className="text-lg font-medium">Sleep Quality</Label>
            <Slider
              value={[sleep]}
              onValueChange={([value]) => setSleep(value)}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Poor</span>
              <span className="text-lg font-semibold text-foreground">{sleep}/10</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-medium">Energy Levels</Label>
            <Slider
              value={[energy]}
              onValueChange={([value]) => setEnergy(value)}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Low</span>
              <span className="text-lg font-semibold text-foreground">{energy}/10</span>
              <span>High</span>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full" size="lg">
            Save Log
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default QuickLog;
