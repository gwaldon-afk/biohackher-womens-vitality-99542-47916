import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HealthSummaryCard } from "@/components/profile/HealthSummaryCard";
import { AssessmentHistoryTab } from "@/components/profile/AssessmentHistoryTab";
import { HealthGoalsTab } from "@/components/profile/HealthGoalsTab";
import { PreferencesTab } from "@/components/profile/PreferencesTab";
import { AccountSettingsTab } from "@/components/profile/AccountSettingsTab";
import { AssessmentOverviewCards } from "@/components/AssessmentOverviewCards";
import { ConsolidatedInsightsCard } from "@/components/profile/ConsolidatedInsightsCard";
import { UnifiedSymptomView } from "@/components/profile/UnifiedSymptomView";
import { MasterProtocolSheet } from "@/components/profile/MasterProtocolSheet";
import { User, ClipboardList, Target, Settings, Sliders, Home, Activity, FileStack } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("assessments");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Top Return Button */}
        <div className="flex justify-start mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate(user ? '/today' : '/')}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            {t('common.return')}
          </Button>
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
          </div>
          <p className="text-muted-foreground">
            {t('profile.description')}
          </p>
        </div>

        {/* Assessment Overview Cards - Main 3 assessments */}
        <AssessmentOverviewCards />

        {/* Health Summary Card - Always visible at top */}
        <HealthSummaryCard />

        {/* Consolidated AI Insights Card */}
        <div className="mt-6">
          <ConsolidatedInsightsCard />
        </div>

        {/* Tabbed Content */}
        <Card className="mt-6 p-6 bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20 shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="assessments" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                <span className="hidden sm:inline">{t('profile.tabs.assessments')}</span>
                <span className="sm:hidden">{t('profile.tabs.assessmentsShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="protocols" className="flex items-center gap-2">
                <FileStack className="h-4 w-4" />
                <span className="hidden sm:inline">{t('profile.tabs.protocols')}</span>
                <span className="sm:hidden">{t('profile.tabs.protocolsShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="symptoms" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">{t('profile.tabs.healthProfile')}</span>
                <span className="sm:hidden">{t('profile.tabs.healthShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">{t('profile.tabs.goals')}</span>
                <span className="sm:hidden">{t('profile.tabs.goals')}</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                <span className="hidden sm:inline">{t('profile.tabs.preferences')}</span>
                <span className="sm:hidden">{t('profile.tabs.preferencesShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">{t('profile.tabs.account')}</span>
                <span className="sm:hidden">{t('profile.tabs.account')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assessments">
              <AssessmentHistoryTab />
            </TabsContent>

            <TabsContent value="protocols">
              <MasterProtocolSheet />
            </TabsContent>

            <TabsContent value="symptoms">
              <UnifiedSymptomView />
            </TabsContent>

            <TabsContent value="goals">
              <HealthGoalsTab />
            </TabsContent>

            <TabsContent value="preferences">
              <PreferencesTab />
            </TabsContent>

            <TabsContent value="account">
              <AccountSettingsTab />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Bottom Return Button */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate(user ? '/today' : '/')} 
            size="lg"
          >
            {t('common.return')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
