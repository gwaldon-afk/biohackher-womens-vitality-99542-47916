import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Camera, Mic, Lightbulb, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PermissionSetup = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '';
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false,
    light_sensor: false,
    motion: false,
  });

  const handleToggle = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = async () => {
    if (!user) return;

    try {
      // Save to database
      const { error } = await supabase
        .from('profiles')
        .update({ device_permissions: permissions } as any)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh profile from database
      await refreshProfile();
      
      // Route to unified onboarding path
      const nextPath = returnTo || '/energy-loop/onboarding';
      navigate(nextPath);
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: t('onboarding.permissions.errorTitle'),
        description: t('onboarding.permissions.errorDescription'),
        variant: "destructive",
      });
    }
  };

  const permissionItems = [
    {
      key: 'camera' as const,
      icon: Camera,
      titleKey: 'onboarding.permissions.items.camera.title',
      descriptionKey: 'onboarding.permissions.items.camera.description',
    },
    {
      key: 'microphone' as const,
      icon: Mic,
      titleKey: 'onboarding.permissions.items.microphone.title',
      descriptionKey: 'onboarding.permissions.items.microphone.description',
    },
    {
      key: 'light_sensor' as const,
      icon: Lightbulb,
      titleKey: 'onboarding.permissions.items.lightSensor.title',
      descriptionKey: 'onboarding.permissions.items.lightSensor.description',
    },
    {
      key: 'motion' as const,
      icon: Activity,
      titleKey: 'onboarding.permissions.items.motion.title',
      descriptionKey: 'onboarding.permissions.items.motion.description',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{t('onboarding.permissions.title')}</h1>
          <p className="text-muted-foreground">
            {t('onboarding.permissions.description')}
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
                    {t(item.titleKey)}
                  </Label>
                  <p className="text-sm text-muted-foreground">{t(item.descriptionKey)}</p>
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
          {t('onboarding.permissions.continue')}
        </Button>
      </div>
    </div>
  );
};

export default PermissionSetup;
