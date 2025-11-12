import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Utensils, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PreferencesTab = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Manage your nutrition preferences, regional settings, and more
      </p>

      {/* Nutrition Preferences */}
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Utensils className="h-5 w-5 text-primary" />
            Nutrition Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Set your dietary preferences, restrictions, and nutrition goals
          </p>
          <Button variant="outline" onClick={() => navigate("/nutrition")}>
            Manage Nutrition Preferences
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            Regional Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Language, timezone, and measurement units
          </p>
          <Button variant="outline" onClick={() => navigate("/settings")}>
            Update Regional Settings
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Device Permissions */}
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            Device Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manage camera, location, and notification permissions
          </p>
          <Button variant="outline" onClick={() => navigate("/profile-settings")}>
            Manage Permissions
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
