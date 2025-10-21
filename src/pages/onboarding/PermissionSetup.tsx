import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Camera, Mic, Lightbulb, Activity } from "lucide-react";
import { useUserStore } from "@/stores/userStore";

const PermissionSetup = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUserStore();
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false,
    light_sensor: false,
    motion: false,
  });

  const handleToggle = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = () => {
    updateProfile({ device_permissions: permissions });
    navigate('/onboarding/menomap-entry');
  };

  const permissionItems = [
    {
      key: 'camera' as const,
      icon: Camera,
      title: 'Camera',
      description: 'For progress photos and nutrition scanning',
    },
    {
      key: 'microphone' as const,
      icon: Mic,
      title: 'Microphone',
      description: 'For voice notes and mood check-ins',
    },
    {
      key: 'light_sensor' as const,
      icon: Lightbulb,
      title: 'Light Sensor',
      description: 'For circadian rhythm tracking',
    },
    {
      key: 'motion' as const,
      icon: Activity,
      title: 'Motion',
      description: 'For activity and movement tracking',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Setup Permissions</h1>
          <p className="text-muted-foreground">
            Enable features to get the most personalized experience
          </p>
        </div>

        <Card className="p-6 space-y-4">
          {permissionItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor={item.key} className="text-base font-medium cursor-pointer">
                    {item.title}
                  </Label>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  id={item.key}
                  checked={permissions[item.key]}
                  onCheckedChange={() => handleToggle(item.key)}
                />
              </div>
            );
          })}
        </Card>

        <Button onClick={handleContinue} className="w-full" size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default PermissionSetup;
