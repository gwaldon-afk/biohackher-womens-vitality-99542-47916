import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NutritionScan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const currentScore = parseInt(localStorage.getItem('bio_score') || '70');
    const newScore = Math.min(100, currentScore + 2);
    localStorage.setItem('bio_score', newScore.toString());

    toast({
      title: "Gut glow unlocked ✨",
      description: "+2 bio score points!",
    });

    navigate('/plan-home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-xl mx-auto space-y-6 pt-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Nutrition Scan</h1>
          <Button variant="ghost" size="icon" onClick={() => navigate('/plan-home')}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <Card className="p-6 space-y-6">
          {!image ? (
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <Camera className="w-16 h-16 text-muted-foreground" />
              </div>
              <Button onClick={() => fileInputRef.current?.click()} className="w-full" size="lg">
                <Camera className="mr-2 h-5 w-5" />
                Take Photo
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
          ) : (
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img src={image} alt="Captured food" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setImage(null)} className="flex-1">
                  Retake
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  Analyze Meal
                </Button>
              </div>
            </div>
          )}
        </Card>

        <p className="text-sm text-muted-foreground text-center">
          Snap a photo of your meal to track nutrition and boost your bio score
        </p>
      </div>
    </div>
  );
};

export default NutritionScan;
