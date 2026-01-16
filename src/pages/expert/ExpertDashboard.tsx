import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExpertProfile } from "@/hooks/useExpertProfile";
import { useAuth } from "@/hooks/useAuth";
import { ExpertProfileEditor } from "@/components/expert/ExpertProfileEditor";
import { ExpertServicesManager } from "@/components/expert/ExpertServicesManager";
import { ExpertAvailabilityManager } from "@/components/expert/ExpertAvailabilityManager";
import { ExpertCredentialsManager } from "@/components/expert/ExpertCredentialsManager";
import { ExpertAnalytics } from "@/components/expert/ExpertAnalytics";
import { User, Settings, DollarSign, Star, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ExpertDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, isExpert } = useExpertProfile();

  useEffect(() => {
    if (!loading && !isExpert) {
      navigate('/expert/register');
    }
  }, [loading, isExpert, navigate]);

  if (loading) {
    return <div className="container py-8 text-center">Loading your expert dashboard...</div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Expert profile unavailable</CardTitle>
            <CardDescription>
              Please complete your expert registration to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/expert/register')} className="w-full">
              Go to Expert Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = () => {
    const status = profile.verification_status;
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', icon: AlertCircle, label: 'Pending Review' },
      approved: { variant: 'default', icon: CheckCircle2, label: 'Approved' },
      rejected: { variant: 'destructive', icon: AlertCircle, label: 'Rejected' },
      suspended: { variant: 'destructive', icon: AlertCircle, label: 'Suspended' },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Expert Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your profile, services, and track your impact
          </p>
        </div>
        <div className="text-right space-y-2">
          {getStatusBadge()}
          <p className="text-sm text-muted-foreground">ID: {profile.expert_id}</p>
        </div>
      </div>

      {/* Status Messages */}
      {profile.verification_status === 'pending' && (
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardContent className="pt-6">
            <p className="text-sm">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Your application is under review. We'll notify you once it's been processed (typically within 24-48 hours).
            </p>
          </CardContent>
        </Card>
      )}

      {profile.verification_status === 'rejected' && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <p className="text-sm mb-2">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              <strong>Application Rejected:</strong> {profile.rejection_reason || 'Please contact support for details.'}
            </p>
            <Button size="sm" onClick={() => navigate('/expert/register')}>
              Reapply
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tier</CardDescription>
            <CardTitle className="text-2xl capitalize">{profile.tier}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Commission Rate</CardDescription>
            <CardTitle className="text-2xl">{profile.referral_rate}%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl">${profile.revenue_total.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rating</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              {profile.average_rating.toFixed(1)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="analytics">
            <DollarSign className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ExpertProfileEditor profile={profile} />
        </TabsContent>

        <TabsContent value="services">
          <ExpertServicesManager expertId={profile.id} />
        </TabsContent>

        <TabsContent value="availability">
          <ExpertAvailabilityManager expertId={profile.id} />
        </TabsContent>

        <TabsContent value="credentials">
          <ExpertCredentialsManager expertId={profile.id} />
        </TabsContent>

        <TabsContent value="analytics">
          <ExpertAnalytics expertId={profile.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}