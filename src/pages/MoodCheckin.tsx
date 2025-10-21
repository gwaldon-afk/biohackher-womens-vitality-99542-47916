import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, X, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MoodCheckin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    const interval = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 5) {
          clearInterval(interval);
          setIsRecording(false);
          setHasRecording(true);
          return 5;
        }
        return prev + 0.1;
      });
    }, 100);
  };

  const handleSubmit = () => {
    const moodScore = Math.floor(Math.random() * (90 - 55 + 1)) + 55;
    const currentBioScore = parseInt(localStorage.getItem('bio_score') || '70');
    const newBioScore = Math.round(currentBioScore * 0.9 + moodScore * 0.1);
    
    localStorage.setItem('bio_score', newBioScore.toString());
    localStorage.setItem('mood_score', moodScore.toString());

    toast({
      title: "Mood captured",
      description: `Bio score updated: ${newBioScore}`,
    });

    navigate('/plan-home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-xl mx-auto space-y-6 pt-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mood Check-in</h1>
          <Button variant="ghost" size="icon" onClick={() => navigate('/plan-home')}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <Card className="p-8 space-y-6">
          <div className="flex flex-col items-center space-y-6">
            <div className={`relative w-32 h-32 rounded-full flex items-center justify-center ${
              isRecording ? 'bg-red-500/20 animate-pulse' : 'bg-primary/10'
            }`}>
              {isRecording ? (
                <Circle className="w-16 h-16 text-red-500 fill-red-500" />
              ) : (
                <Mic className="w-16 h-16 text-primary" />
              )}
            </div>

            {isRecording && (
              <p className="text-2xl font-mono font-bold">{recordingTime.toFixed(1)}s</p>
            )}

            {!hasRecording ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Record a 5-second voice note about how you're feeling
                </p>
                <Button
                  onClick={startRecording}
                  disabled={isRecording}
                  size="lg"
                  className="w-full"
                >
                  {isRecording ? 'Recording...' : 'Start Recording'}
                </Button>
              </div>
            ) : (
              <div className="w-full space-y-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Voice note recorded (5.0s)</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setHasRecording(false);
                      setRecordingTime(0);
                    }}
                    className="flex-1"
                  >
                    Re-record
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1">
                    Submit
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MoodCheckin;
