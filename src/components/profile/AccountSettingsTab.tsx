import { useAuth } from "@/hooks/useAuth";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Crown, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { formatDistanceToNow } from "date-fns";

export const AccountSettingsTab = () => {
  const { user, profile } = useAuth();
  const { profile: healthProfile } = useHealthProfile();
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  const getTierBadge = (tier: string | undefined) => {
    if (!tier) return <Badge variant="outline">Free</Badge>;
    
    const tierMap: Record<string, { label: string; className: string }> = {
      registered: { label: "Registered", className: "bg-blue-500" },
      premium: { label: "Premium", className: "bg-gradient-to-r from-yellow-500 to-orange-500" },
    };
    
    const tierInfo = tierMap[tier] || { label: tier, className: "bg-gray-500" };
    
    return (
      <Badge className={tierInfo.className}>
        <Crown className="h-3 w-3 mr-1" />
        {tierInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Preferred Name</p>
              <p className="font-medium">{profile?.preferred_name || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Account Created</p>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {user?.created_at && formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
              <p className="font-medium">
                {healthProfile?.date_of_birth
                  ? new Date(healthProfile.date_of_birth).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
              <div className="flex items-center gap-2">
                {getTierBadge(subscription?.subscription_tier)}
              </div>
            </div>
            {subscription?.subscription_tier !== "premium" && (
              <Button onClick={() => navigate("/upgrade")}>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            )}
          </div>

          {subscription?.trial_end_date && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Trial Status</p>
              <p className="font-medium">
                Ends {formatDistanceToNow(new Date(subscription.trial_end_date), { addSuffix: true })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/settings")}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Full Settings
          </Button>
          <Button variant="outline" className="w-full justify-start text-muted-foreground">
            Export My Data
          </Button>
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
