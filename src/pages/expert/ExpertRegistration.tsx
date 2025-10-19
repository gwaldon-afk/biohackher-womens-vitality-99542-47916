import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExpertProfile } from "@/hooks/useExpertProfile";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle } from "lucide-react";
import { ExpertRegistrationWizard } from "@/components/expert/ExpertRegistrationWizard";

export default function ExpertRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useExpertProfile();

  if (!user) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Please log in to register as an expert</p>
            <Button onClick={() => navigate('/auth')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return <div className="container max-w-2xl py-8 text-center">Loading...</div>;
  }

  if (profile) {
    return (
      <div className="container max-w-2xl py-8">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle>Application Submitted!</CardTitle>
            </div>
            <CardDescription>
              Your expert profile has been created and is pending verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm mb-2"><strong>Expert ID:</strong> {profile.expert_id}</p>
              <p className="text-sm mb-2"><strong>Status:</strong> {profile.verification_status}</p>
              <p className="text-sm text-muted-foreground">
                Our team will review your credentials within 24-48 hours. You'll receive an email once your profile is approved.
              </p>
            </div>
            <Button onClick={() => navigate('/expert/dashboard')} className="w-full">
              Go to Expert Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <ExpertRegistrationWizard />
    </div>
  );
}