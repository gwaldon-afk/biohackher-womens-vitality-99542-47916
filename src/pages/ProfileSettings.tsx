import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Camera, Mic, Lightbulb, Activity, Shield, Download, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileSettings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const handlePermissionToggle = async (key: string, value: boolean) => {
    if (!user || !profile?.device_permissions) return;
    
    const updatedPermissions = {
      ...profile.device_permissions,
      [key]: value,
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ device_permissions: updatedPermissions } as any)
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Error",
        description: "Failed to update permissions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const permissions = [
    { key: 'camera', icon: Camera, label: 'Camera Access', description: 'For nutrition scanning and progress photos' },
    { key: 'microphone', icon: Mic, label: 'Microphone Access', description: 'For voice check-ins and mood tracking' },
    { key: 'light_sensor', icon: Lightbulb, label: 'Light Sensor', description: 'For circadian rhythm tracking' },
    { key: 'motion', icon: Activity, label: 'Motion Sensors', description: 'For activity and movement tracking' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-3xl mx-auto space-y-6 pt-8">
        <h1 className="text-4xl font-bold">Settings</h1>

        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Device Permissions</h2>
            <div className="space-y-4">
              {permissions.map((permission) => {
                const Icon = permission.icon;
                const isEnabled = profile?.device_permissions?.[permission.key as keyof typeof profile.device_permissions] || false;
                
                return (
                  <div key={permission.key} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label htmlFor={permission.key} className="text-base font-medium cursor-pointer">
                        {permission.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{permission.description}</p>
                    </div>
                    <Switch
                      id={permission.key}
                      checked={isEnabled}
                      onCheckedChange={(checked) => handlePermissionToggle(permission.key, checked)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-2xl font-semibold mb-4">Privacy & Data</h2>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between" size="lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  <span>Privacy Policy</span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" className="w-full justify-between" size="lg">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5" />
                  <span>Export My Data</span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;
