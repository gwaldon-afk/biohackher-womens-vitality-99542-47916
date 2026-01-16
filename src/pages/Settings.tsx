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
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { getCheckinSettings, upsertCheckinSettings } from "@/lib/checkin/checkinStorage";

const Settings = () => {
  const { t } = useTranslation();
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
    marketingEmails: false,
    assessmentReminders: true
  });
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [checkinEnabled, setCheckinEnabled] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);

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
      fetchNotificationPreferences();
    }
  }, [user]);

  useEffect(() => {
    const loadCheckinSettings = async () => {
      if (!user) return;
      setCheckinLoading(true);
      try {
        const settings = await getCheckinSettings(user.id);
        setCheckinEnabled(settings?.enabled !== false);
      } catch (error) {
        console.error("Error loading check-in settings:", error);
      } finally {
        setCheckinLoading(false);
      }
    };

    loadCheckinSettings();
  }, [user]);
  
  const fetchNotificationPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!error && data) {
        setNotifications({
          dailyNudges: data.push_daily_nudges ?? true,
          weeklyReports: data.email_weekly_reports ?? true,
          symptomReminders: data.push_symptom_reminders ?? true,
          protocolUpdates: data.email_protocol_updates ?? false,
          marketingEmails: data.email_marketing ?? false,
          assessmentReminders: data.email_assessment_reminders ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };
  
  const updateNotificationPreference = async (key: string, value: boolean) => {
    if (!user) return;
    
    setLoadingPreferences(true);
    try {
      const dbKey = key === 'dailyNudges' ? 'push_daily_nudges' :
                   key === 'weeklyReports' ? 'email_weekly_reports' :
                   key === 'symptomReminders' ? 'push_symptom_reminders' :
                   key === 'protocolUpdates' ? 'email_protocol_updates' :
                   key === 'assessmentReminders' ? 'email_assessment_reminders' :
                   'email_marketing';
      
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          [dbKey]: value,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
      
      if (error) throw error;
      
      toast({
        title: t('settings.toasts.preferencesUpdated'),
        description: t('settings.toasts.preferencesUpdatedDesc'),
      });
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast({
        title: t('settings.toasts.updateFailed'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingPreferences(false);
    }
  };

  const updateCheckinSetting = async (enabled: boolean) => {
    if (!user) return;
    setCheckinLoading(true);
    try {
      await upsertCheckinSettings({
        user_id: user.id,
        enabled,
        questions_config: null,
      });
      setCheckinEnabled(enabled);
      toast({
        description: enabled ? t("checkin.enable.toast") : t("checkin.disable.toast"),
      });
    } catch (error: any) {
      console.error("Error updating check-in settings:", error);
      toast({
        title: t("common.error"),
        description: error?.message || t("common.error"),
        variant: "destructive",
      });
    } finally {
      setCheckinLoading(false);
    }
  };

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
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 gradient-text">{t('settings.title')}</h1>
          <p className="text-muted-foreground">
            {t('settings.subtitle')}
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.profile')}</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.integrations')}</span>
            </TabsTrigger>
            <TabsTrigger value="health-profile" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.healthProfile')}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.notifications')}</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.privacy')}</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.legal')}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.personalInfo')}</CardTitle>
                  <CardDescription>
                    {t('settings.personalInfoDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t('settings.fullName')}</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('settings.email')}</Label>
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
                      <Label htmlFor="age">{t('settings.age')}</Label>
                      <Input
                        id="age"
                        value={profile.age}
                        onChange={(e) => setProfile({...profile, age: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stage">{t('settings.currentStage')}</Label>
                      <select 
                        id="stage"
                        value={profile.stage}
                        onChange={(e) => setProfile({...profile, stage: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="regular-cycles">{t('settings.stages.regularCycles')}</option>
                        <option value="perimenopause">{t('settings.stages.perimenopause')}</option>
                        <option value="menopause">{t('settings.stages.menopause')}</option>
                        <option value="postmenopause">{t('settings.stages.postmenopause')}</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone">{t('settings.timezone')}</Label>
                    <select 
                      id="timezone"
                      value={profile.timezone}
                      onChange={(e) => setProfile({...profile, timezone: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="America/New_York">{t('settings.timezones.eastern')}</option>
                      <option value="America/Chicago">{t('settings.timezones.central')}</option>
                      <option value="America/Denver">{t('settings.timezones.mountain')}</option>
                      <option value="America/Los_Angeles">{t('settings.timezones.pacific')}</option>
                    </select>
                  </div>
                  
                  <Button className="w-full">{t('settings.saveChanges')}</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.account.title')}</CardTitle>
                  <CardDescription>
                    {t('settings.account.subtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{t('settings.account.subscriptionStatus')}</h3>
                      <p className="text-sm text-muted-foreground">{t('settings.account.premiumPlan')}</p>
                    </div>
                    <Badge variant="outline" className="text-primary">
                      {t('settings.account.active')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      {t('settings.account.changePassword')}
                    </Button>
                    <Button variant="outline" className="w-full">
                      {t('settings.account.manageSubscription')}
                    </Button>
                    <Button variant="outline" className="w-full">
                      {t('settings.account.exportData')}
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t border-destructive/20">
                    <Button variant="destructive" className="w-full">
                      {t('settings.account.deleteAccount')}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {t('settings.account.deleteWarning')}
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
                <CardTitle>{t('settings.integrations.title')}</CardTitle>
                <CardDescription>
                  {t('settings.integrations.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Apple Health */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-8 w-8 text-gray-600" />
                    <div>
                      <h4 className="font-medium">{t('settings.integrations.appleHealth')}</h4>
                      <p className="text-sm text-muted-foreground">{t('settings.integrations.notConnected')}</p>
                    </div>
                  </div>
                  <Button variant="default" disabled>
                    {t('settings.integrations.comingSoon')}
                  </Button>
                </div>

                {/* Oura Ring */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Watch className="h-8 w-8 text-purple-600" />
                    <div>
                      <h4 className="font-medium">{t('settings.integrations.ouraRing')}</h4>
                      <p className="text-sm text-muted-foreground">{t('settings.integrations.notConnected')}</p>
                    </div>
                  </div>
                  <Button variant="default" disabled>
                    {t('settings.integrations.comingSoon')}
                  </Button>
                </div>

                {/* Fitbit */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{t('settings.integrations.fitbit')}</h4>
                      <p className="text-sm text-muted-foreground">{t('settings.integrations.notConnected')}</p>
                    </div>
                  </div>
                  <Button variant="default" disabled>
                    {t('settings.integrations.comingSoon')}
                  </Button>
                </div>

                {/* Garmin */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Watch className="h-8 w-8 text-cyan-600" />
                    <div>
                      <h4 className="font-medium">{t('settings.integrations.garmin')}</h4>
                      <p className="text-sm text-muted-foreground">{t('settings.integrations.notConnected')}</p>
                    </div>
                  </div>
                  <Button variant="default" disabled>
                    {t('settings.integrations.comingSoon')}
                  </Button>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {t('settings.integrations.comingSoonMessage')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Profile Tab */}
          <TabsContent value="health-profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.healthProfile.title')}</CardTitle>
                <CardDescription>
                  {t('settings.healthProfile.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {baselineScore ? (
                  <>
                    {/* Current Baseline Info */}
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">{t('settings.healthProfile.currentBaseline')}</p>
                        <Badge variant="secondary" className="text-lg px-3 py-1">{baselineScore}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('settings.healthProfile.established', { date: baselineDate && format(baselineDate, 'MMMM d, yyyy') })}
                      </p>
                      {nextReviewDate && (
                        <p className="text-xs text-primary mt-2">
                          {t('settings.healthProfile.nextReview', { date: format(nextReviewDate, 'MMMM d, yyyy') })}
                        </p>
                      )}
                    </div>

                    {/* Re-assessment Button */}
                    <Button 
                      onClick={() => navigate('/lis-assessment?mode=reassessment')}
                      variant="outline"
                      className="w-full"
                    >
                      {t('settings.healthProfile.updateBaseline')}
                    </Button>

                    {/* History */}
                    {reassessmentHistory.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">{t('settings.healthProfile.reassessmentHistory')}</h4>
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
                    <p className="text-muted-foreground mb-4">{t('settings.healthProfile.noBaseline')}</p>
                    <Button 
                      onClick={() => navigate('/lis-assessment?mode=onboarding')}
                      variant="default"
                    >
                      {t('settings.healthProfile.takeBaseline')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.notifications.title')}</CardTitle>
                <CardDescription>
                  {t('settings.notifications.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{t('settings.checkin.title')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.checkin.desc')}
                      </p>
                      {checkinLoading && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('common.loading')}
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={checkinEnabled}
                      onCheckedChange={(checked) => updateCheckinSetting(checked)}
                      disabled={checkinLoading || !user}
                    />
                  </div>
                  {/* Assessment Reminders */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{t('settings.notifications.assessmentReminders')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.notifications.assessmentRemindersDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.assessmentReminders}
                      onCheckedChange={(checked) => {
                        setNotifications({...notifications, assessmentReminders: checked});
                        updateNotificationPreference('assessmentReminders', checked);
                      }}
                      disabled={loadingPreferences}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{t('settings.notifications.dailyNudges')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.notifications.dailyNudgesDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.dailyNudges}
                      onCheckedChange={(checked) => {
                        setNotifications({...notifications, dailyNudges: checked});
                        updateNotificationPreference('dailyNudges', checked);
                      }}
                      disabled={loadingPreferences}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{t('settings.notifications.weeklyReports')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.notifications.weeklyReportsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => {
                        setNotifications({...notifications, weeklyReports: checked});
                        updateNotificationPreference('weeklyReports', checked);
                      }}
                      disabled={loadingPreferences}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{t('settings.notifications.symptomReminders')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.notifications.symptomRemindersDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.symptomReminders}
                      onCheckedChange={(checked) => {
                        setNotifications({...notifications, symptomReminders: checked});
                        updateNotificationPreference('symptomReminders', checked);
                      }}
                      disabled={loadingPreferences}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{t('settings.notifications.protocolUpdates')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.notifications.protocolUpdatesDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.protocolUpdates}
                      onCheckedChange={(checked) => {
                        setNotifications({...notifications, protocolUpdates: checked});
                        updateNotificationPreference('protocolUpdates', checked);
                      }}
                      disabled={loadingPreferences}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{t('settings.notifications.marketingEmails')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.notifications.marketingEmailsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => {
                        setNotifications({...notifications, marketingEmails: checked});
                        updateNotificationPreference('marketingEmails', checked);
                      }}
                      disabled={loadingPreferences}
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
                  <CardTitle>{t('settings.privacy.title')}</CardTitle>
                  <CardDescription>
                    {t('settings.privacy.subtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{t('settings.privacy.dataSharing')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.privacy.dataSharingDesc')}
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
                      <h3 className="font-medium">{t('settings.privacy.anonymousAnalytics')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.privacy.anonymousAnalyticsDesc')}
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
                      <h3 className="font-medium">{t('settings.privacy.researchParticipation')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.privacy.researchParticipationDesc')}
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
                      <h3 className="font-medium text-orange-800 mb-2">{t('settings.privacy.privacyMatters')}</h3>
                      <p className="text-sm text-orange-700">
                        {t('settings.privacy.privacyMattersDesc')}
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
                    <CardTitle className="text-yellow-800">{t('settings.legal.healthDisclaimers')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm text-yellow-800">
                    <div>
                      <h3 className="font-medium mb-2">{t('settings.legal.tgaCompliance')}</h3>
                      <p>
                        {t('settings.legal.tgaComplianceDesc')}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">{t('settings.legal.medicalDisclaimer')}</h3>
                      <p>
                        {t('settings.legal.medicalDisclaimerDesc')}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">{t('settings.legal.individualResults')}</h3>
                      <p>
                        {t('settings.legal.individualResultsDesc')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.legal.title')}</CardTitle>
                  <CardDescription>
                    {t('settings.legal.subtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-between">
                    {t('settings.legal.termsOfService')}
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    {t('settings.legal.privacyPolicy')}
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    {t('settings.legal.cookiePolicy')}
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    {t('settings.legal.researchEthics')}
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