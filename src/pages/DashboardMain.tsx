import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

const DashboardMain = () => {
  const navigate = useNavigate();
  const [bioScore, setBioScore] = useState(70);
  const [moodScore, setMoodScore] = useState(65);
  const [energyScore, setEnergyScore] = useState(68);

  useEffect(() => {
    const bio = localStorage.getItem('bio_score');
    const mood = localStorage.getItem('mood_score');
    const energy = localStorage.getItem('energy_score');
    
    if (bio) setBioScore(parseInt(bio));
    if (mood) setMoodScore(parseInt(mood));
    if (energy) setEnergyScore(parseInt(energy));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6 pt-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Bio Score</p>
                <p className="text-4xl font-bold">{bioScore}</p>
              </div>
              <div className="w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${(bioScore / 100) * 176} 176`}
                    className="text-primary"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Mood Score</p>
                <p className="text-4xl font-bold">{moodScore}</p>
              </div>
              <div className="w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${(moodScore / 100) * 176} 176`}
                    className="text-secondary"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Energy Score</p>
                <p className="text-4xl font-bold">{energyScore}</p>
              </div>
              <div className="w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${(energyScore / 100) * 176} 176`}
                    className="text-accent"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Progress Trends</h2>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">Line chart visualization</p>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Weekly Activity</h2>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">Bar chart visualization</p>
          </div>
        </Card>

        <Button onClick={() => navigate('/insights-detail')} className="w-full" size="lg">
          <TrendingUp className="mr-2 h-5 w-5" />
          View Detailed Insights
        </Button>
      </div>
    </div>
  );
};

export default DashboardMain;
