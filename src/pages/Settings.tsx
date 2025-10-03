import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, FileText, AlertTriangle, Smartphone, Activity, Watch } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';

  const [profile, setProfile] = useState({
    name: "Sarah Johnson",
    email: "sarah@example.com",
    age: "42",
    stage: "perimenopause",
    timezone: "America/New_York"
  });

  const [notifications, setNotifications] = useState({
    dailyNudges: true,
    weeklyReports: true,
    symptomReminders: true,
    protocolUpdates: false,
    marketingEmails: false
  });

  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    anonymousAnalytics: true,
    researchParticipation: false
  });

  // Baseline assessment data
  const [baselineScore, setBaselineScore] = useState<number | null>(null);
  const [baselineDate, setBaselineDate] = useState<Date | null>(null);
  const [nextReviewDate, setNextReviewDate] = useState<Date | null>(null);
  const [reassessmentHistory, setReassessmentHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchBaselineData();
    }
  }, [user]);

  const fetchBaselineData = async () => {
    if (!user) return;

    try {
      // Fetch baseline score
      const { data: baseline } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_baseline', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (baseline) {
        setBaselineScore(baseline.longevity_impact_score);
        setBaselineDate(new Date(baseline.created_at));
      }

      // Fetch schedule
      const { data: schedule } = await supabase
        .from('baseline_assessment_schedule')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (schedule) {
        setNextReviewDate(new Date(schedule.next_prompt_date));
      }

      // Fetch reassessment history
      const { data: history } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', user.id)
        .in('assessment_type', ['lifestyle_baseline', 'quarterly_review'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (history) {
        setReassessmentHistory(history);
      }
    } catch (error) {
      console.error('Error fetching baseline data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 gradient-text">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, notifications, and privacy preferences
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="health-profile" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Health Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Legal</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your profile details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        value={profile.age}
                        onChange={(e) => setProfile({...profile, age: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stage">Current Stage</Label>
                      <select 
                        id="stage"
                        value={profile.stage}
                        onChange={(e) => setProfile({...profile, stage: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="regular-cycles">Regular Cycles</option>
                        <option value="perimenopause">Perimenopause</option>
                        <option value="menopause">Menopause</option>
                        <option value="postmenopause">Postmenopause</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select 
                      id="timezone"
                      value={profile.timezone}
                      onChange={(e) => setProfile({...profile, timezone: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                  
                  <Button className="w-full">Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>
                    Manage your account settings and subscription
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Subscription Status</h3>
                      <p className="text-sm text-muted-foreground">Premium Plan</p>
                    </div>
                    <Badge variant="outline" className="text-primary">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full">
                      Manage Subscription
                    </Button>
                    <Button variant="outline" className="w-full">
                      Export Data
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t border-destructive/20">
                    <Button variant="destructive" className="w-full">
                      Delete Account
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      This action cannot be undone
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Devices</CardTitle>
                <CardDescription>
                  Connect your wearable devices for automatic daily LIS tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Apple Health */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-8 w-8 text-gray-600" />
                    <div>
                      <h4 className="font-medium">Apple Health</h4>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="default" disabled>
                    Coming Soon
                  </Button>
                </div>

                {/* Oura Ring */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Watch className="h-8 w-8 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Oura Ring</h4>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="default" disabled>
                    Coming Soon
                  </Button>
                </div>

                {/* Fitbit */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Fitbit</h4>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="default" disabled>
                    Coming Soon
                  </Button>
                </div>

                {/* Garmin */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Watch className="h-8 w-8 text-cyan-600" />
                    <div>
                      <h4 className="font-medium">Garmin</h4>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="default" disabled>
                    Coming Soon
                  </Button>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    🚧 Wearable integrations coming soon! We're working on bringing automatic syncing to BiohackHer.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Profile Tab */}
          <TabsContent value="health-profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Profile</CardTitle>
                <CardDescription>
                  Your lifestyle baseline assessment and re-assessment history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {baselineScore ? (
                  <>
                    {/* Current Baseline Info */}
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Current Baseline Score</p>
                        <Badge variant="secondary" className="text-lg px-3 py-1">{baselineScore}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Established: {baselineDate && format(baselineDate, 'MMMM d, yyyy')}
                      </p>
                      {nextReviewDate && (
                        <p className="text-xs text-primary mt-2">
                          Next review recommended: {format(nextReviewDate, 'MMMM d, yyyy')}
                        </p>
                      )}
                    </div>

                    {/* Re-assessment Button */}
                    <Button 
                      onClick={() => navigate('/lis-assessment?mode=reassessment')}
                      variant="outline"
                      className="w-full"
                    >
                      Update My Baseline Assessment
                    </Button>

                    {/* History */}
                    {reassessmentHistory.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Assessment History</h4>
                        {reassessmentHistory.map((assessment) => (
                          <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="text-sm">{format(new Date(assessment.created_at), 'MMM d, yyyy')}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {assessment.assessment_type?.replace('_', ' ')}
                              </p>
                            </div>
                            <Badge>{assessment.longevity_impact_score}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-6">
                    <p className="text-muted-foreground mb-4">No baseline assessment found</p>
                    <Button 
                      onClick={() => navigate('/lis-assessment?mode=onboarding')}
                      variant="default"
                    >
                      Take Your Baseline Assessment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you'd like to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Daily Nudges</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive personalised daily health recommendations
                      </p>
                    </div>
                    <Switch
                      checked={notifications.dailyNudges}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, dailyNudges: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Weekly Reports</h3>
                      <p className="text-sm text-muted-foreground">
                        Get summaries of your progress and achievements
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, weeklyReports: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Symptom Reminders</h3>
                      <p className="text-sm text-muted-foreground">
                        Gentle reminders to log symptoms and track patterns
                      </p>
                    </div>
                    <Switch
                      checked={notifications.symptomReminders}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, symptomReminders: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Protocol Updates</h3>
                      <p className="text-sm text-muted-foreground">
                        Notifications about new research and protocol updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.protocolUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, protocolUpdates: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Marketing Emails</h3>
                      <p className="text-sm text-muted-foreground">
                        Occasional emails about new features and offers
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, marketingEmails: checked})
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Privacy</CardTitle>
                  <CardDescription>
                    Control how your data is used and shared
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Data Sharing</h3>
                      <p className="text-sm text-muted-foreground">
                        Allow aggregated data to improve recommendations
                      </p>
                    </div>
                    <Switch
                      checked={privacy.dataSharing}
                      onCheckedChange={(checked) => 
                        setPrivacy({...privacy, dataSharing: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Anonymous Analytics</h3>
                      <p className="text-sm text-muted-foreground">
                        Help us improve the app with anonymous usage data
                      </p>
                    </div>
                    <Switch
                      checked={privacy.anonymousAnalytics}
                      onCheckedChange={(checked) => 
                        setPrivacy({...privacy, anonymousAnalytics: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Research Participation</h3>
                      <p className="text-sm text-muted-foreground">
                        Opt-in to participate in women's health research studies
                      </p>
                    </div>
                    <Switch
                      checked={privacy.researchParticipation}
                      onCheckedChange={(checked) => 
                        setPrivacy({...privacy, researchParticipation: checked})
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-orange-800 mb-2">Your Privacy Matters</h3>
                      <p className="text-sm text-orange-700">
                        We use end-to-end encryption for all health data and never sell personal information. 
                        Your data is stored securely and used only to provide personalised recommendations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="legal" className="mt-6">
            <div className="space-y-6">
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <CardTitle className="text-yellow-800">Health Disclaimers</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm text-yellow-800">
                    <div>
                      <h3 className="font-medium mb-2">TGA Compliance (Australia)</h3>
                      <p>
                        The information provided by Biohackher is for educational purposes only and is not intended 
                        to diagnose, treat, cure, or prevent any disease. Always consult with a qualified healthcare 
                        professional before making changes to your health regimen.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Medical Disclaimer</h3>
                      <p>
                        Biohackher does not provide medical advice, diagnosis, or treatment. The recommendations 
                        are based on published research and should not replace professional medical care.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Individual Results</h3>
                      <p>
                        Results may vary between individuals. The biohackher age calculation is an estimate 
                        based on lifestyle factors and should not be considered a medical assessment.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Legal Documents</CardTitle>
                  <CardDescription>
                    Review our terms, privacy policy, and other legal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-between">
                    Terms of Service
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Privacy Policy
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Cookie Policy
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Research Ethics
                    <FileText className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;