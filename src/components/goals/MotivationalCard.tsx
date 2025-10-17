import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, TrendingUp, Target, Heart, Zap, Star } from "lucide-react";

interface MotivationalCardProps {
  goalProgress?: number;
  streakDays?: number;
  recentCheckIn?: boolean;
}

export const MotivationalCard = ({ 
  goalProgress = 0, 
  streakDays = 0,
  recentCheckIn = false 
}: MotivationalCardProps) => {
  const [message, setMessage] = useState({ text: "", icon: Sparkles, color: "primary" });

  useEffect(() => {
    generateMessage();
  }, [goalProgress, streakDays, recentCheckIn]);

  const generateMessage = () => {
    const messages = [];

    // Progress-based messages
    if (goalProgress >= 90) {
      messages.push({
        text: "You're almost there! The finish line is in sight! 🎯",
        icon: Target,
        color: "text-green-500"
      });
    } else if (goalProgress >= 75) {
      messages.push({
        text: "Outstanding progress! You're in the home stretch! 💪",
        icon: TrendingUp,
        color: "text-blue-500"
      });
    } else if (goalProgress >= 50) {
      messages.push({
        text: "Halfway there! Your dedication is paying off! ⭐",
        icon: Star,
        color: "text-yellow-500"
      });
    } else if (goalProgress >= 25) {
      messages.push({
        text: "Great momentum! Every step counts! 🚀",
        icon: Zap,
        color: "text-orange-500"
      });
    } else if (goalProgress > 0) {
      messages.push({
        text: "You've taken the first step - that's the hardest part! ✨",
        icon: Sparkles,
        color: "text-primary"
      });
    }

    // Streak-based messages
    if (streakDays >= 30) {
      messages.push({
        text: "30 days strong! You've built an incredible habit! 🔥",
        icon: Zap,
        color: "text-orange-500"
      });
    } else if (streakDays >= 14) {
      messages.push({
        text: "Two weeks of consistency! You're unstoppable! 💫",
        icon: Star,
        color: "text-purple-500"
      });
    } else if (streakDays >= 7) {
      messages.push({
        text: "A full week! Your commitment is inspiring! 🌟",
        icon: Star,
        color: "text-yellow-500"
      });
    } else if (streakDays >= 3) {
      messages.push({
        text: "Building momentum! Keep the streak alive! 🎯",
        icon: Target,
        color: "text-blue-500"
      });
    }

    // Recent check-in message
    if (recentCheckIn) {
      messages.push({
        text: "You showed up today! That's what matters most! ❤️",
        icon: Heart,
        color: "text-pink-500"
      });
    }

    // Default messages
    const defaultMessages = [
      {
        text: "Small steps lead to big changes. Keep going! 🌱",
        icon: Sparkles,
        color: "text-green-500"
      },
      {
        text: "Your future self will thank you for the effort you're putting in today! 🎯",
        icon: Target,
        color: "text-primary"
      },
      {
        text: "Progress isn't always linear, but it's always valuable! 📈",
        icon: TrendingUp,
        color: "text-blue-500"
      },
      {
        text: "You're investing in your healthspan - that's powerful! ⚡",
        icon: Zap,
        color: "text-yellow-500"
      },
    ];

    // Pick a random message from available options
    const allMessages = messages.length > 0 ? messages : defaultMessages;
    const randomMessage = allMessages[Math.floor(Math.random() * allMessages.length)];
    setMessage(randomMessage);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-background/80 ${message.color}`}>
            <message.icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium leading-relaxed">
              {message.text}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
