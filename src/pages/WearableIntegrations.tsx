import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { useWearables } from "@/hooks/useWearables";
import { useToast } from "@/hooks/use-toast";
import { 
  Watch, 
  Activity, 
  Moon, 
  Heart, 
  TrendingUp, 
  RefreshCw, 
  Link as LinkIcon,
  Unlink,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SUPPORTED_DEVICES = [
  {
    id: 'demo',
    nameKey: 'wearables.devices.demo.name',
    descriptionKey: 'wearables.devices.demo.description',
    icon: Sparkles,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  { 
    id: 'fitbit', 
    nameKey: 'wearables.devices.fitbit.name',
    descriptionKey: 'wearables.devices.fitbit.description',
    icon: Activity,
    color: 'bg-blue-500'
  },
  { 
    id: 'oura', 
    nameKey: 'wearables.devices.oura.name',
    descriptionKey: 'wearables.devices.oura.description',
    icon: Moon,
    color: 'bg-purple-500'
  },
  { 
    id: 'whoop', 
    nameKey: 'wearables.devices.whoop.name',
    descriptionKey: 'wearables.devices.whoop.description',
    icon: Heart,
    color: 'bg-red-500'
  },
  { 
    id: 'apple_health', 
    nameKey: 'wearables.devices.appleHealth.name',
    descriptionKey: 'wearables.devices.appleHealth.description',
    icon: Heart,
    color: 'bg-gray-500'
  },
  { 
    id: 'garmin', 
    nameKey: 'wearables.devices.garmin.name',
    descriptionKey: 'wearables.devices.garmin.description',
    icon: Watch,
    color: 'bg-cyan-500'
  }
];

const WearableIntegrations = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    connections, 
    wearableData, 
    loading, 
    disconnectWearable, 
    triggerSync,
    connectDemo,
    initiateFitbitAuth,
    syncFitbit 
  } = useWearables();
  const { toast } = useToast();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Handle OAuth callback status
  useEffect(() => {
    const status = searchParams.get('status');
    const provider = searchParams.get('provider');
    
    if (status === 'success') {
      toast({
        title: t('wearables.toast.connected.title'),
        description: t('wearables.toast.connected.description', { provider: provider || 'device' })
      });
    } else if (status === 'failed' || status === 'cancelled') {
      toast({
        variant: 'destructive',
        title: t('wearables.toast.connectionFailed.title'),
        description: t('wearables.toast.connectionFailed.description')
      });
    }
    
    // Clean URL params
    if (status) {
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, toast, t]);

  const isConnected = (providerId: string) => {
    return connections.some(c => c.provider === providerId && c.is_active);
  };

  const getConnection = (providerId: string) => {
    return connections.find(c => c.provider === providerId && c.is_active);
  };

  const handleConnect = async (deviceId: string) => {
    const device = SUPPORTED_DEVICES.find(d => d.id === deviceId);
    const deviceName = device ? t(device.nameKey) : deviceId;
    
    setConnectingId(deviceId);
    
    try {
      if (deviceId === 'demo') {
        await connectDemo();
        toast({
          title: t('wearables.toast.demoConnected.title'),
          description: t('wearables.toast.demoConnected.description')
        });
      } else if (deviceId === 'fitbit') {
        await initiateFitbitAuth();
        // Will redirect to Fitbit OAuth
      } else {
        // Other devices coming soon
        toast({
          title: t('wearables.toast.comingSoon.title'),
          description: t('wearables.toast.comingSoon.description', { deviceName })
        });
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        variant: 'destructive',
        title: t('wearables.toast.connectionFailed.title'),
        description: t('wearables.toast.connectionFailed.description')
      });
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = async (providerId: string) => {
    const connection = getConnection(providerId);
    if (!connection) return;

    try {
      await disconnectWearable(connection.id);
      toast({
        title: t('wearables.toast.disconnected.title'),
        description: t('wearables.toast.disconnected.description')
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('wearables.toast.disconnectError.title'),
        description: t('wearables.toast.disconnectError.description')
      });
    }
  };

  const handleSync = async (providerId: string) => {
    const connection = getConnection(providerId);
    if (!connection) return;

    setSyncingId(connection.id);
    try {
      await triggerSync(connection.id);
      toast({
        title: t('wearables.toast.syncComplete.title'),
        description: t('wearables.toast.syncComplete.description')
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('wearables.toast.syncFailed.title'),
        description: t('wearables.toast.syncFailed.description')
      });
    } finally {
      setSyncingId(null);
    }
  };

  // Prepare chart data from wearable data with locale-aware date formatting
  const sleepChartData = wearableData
    .filter(d => d.total_sleep_hours !== null)
    .slice(0, 14)
    .reverse()
    .map(d => ({
      date: new Date(d.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' }),
      hours: d.total_sleep_hours
    }));

  const stepsChartData = wearableData
    .filter(d => d.steps !== null)
    .slice(0, 14)
    .reverse()
    .map(d => ({
      date: new Date(d.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' }),
      steps: d.steps
    }));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-primary">{t('wearables.pageTitle')}</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('wearables.pageSubtitle')}
          </p>
        </div>

        {/* Connected Devices Overview */}
        {connections.filter(c => c.is_active).length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle>{t('wearables.overview.title')}</CardTitle>
              <CardDescription>{t('wearables.overview.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-background rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">{t('wearables.overview.activeConnections')}</div>
                  <div className="text-2xl font-bold text-primary">
                    {connections.filter(c => c.is_active).length}
                  </div>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">{t('wearables.overview.daysOfData')}</div>
                  <div className="text-2xl font-bold">
                    {wearableData.length}
                  </div>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">{t('wearables.overview.lastSync')}</div>
                  <div className="text-sm font-medium">
                    {connections[0]?.last_sync_at 
                      ? new Date(connections[0].last_sync_at).toLocaleDateString(i18n.language)
                      : t('wearables.overview.never')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Visualizations */}
        {wearableData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {sleepChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5" />
                    {t('wearables.charts.sleepTrends')}
                  </CardTitle>
                  <CardDescription>{t('wearables.charts.last14Days')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={sleepChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {stepsChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {t('wearables.charts.activityTrends')}
                  </CardTitle>
                  <CardDescription>{t('wearables.charts.last14Days')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={stepsChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line type="monotone" dataKey="steps" stroke="hsl(var(--success))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Available Devices */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t('wearables.availableDevices')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUPPORTED_DEVICES.map((device) => {
              const connected = isConnected(device.id);
              const Icon = device.icon;

              return (
                <Card key={device.id} className={connected ? 'border-primary/50' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${device.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{t(device.nameKey)}</CardTitle>
                          {connected && (
                            <div className="flex gap-1 mt-1">
                              <Badge variant="default">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {t('wearables.status.connected')}
                              </Badge>
                              {device.id === 'demo' && (
                                <Badge variant="secondary">
                                  {t('wearables.demo.badge')}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {t(device.descriptionKey)}
                      {connected && device.id === 'demo' && (
                        <span className="block mt-2 text-xs text-muted-foreground italic">
                          {t('wearables.demo.disclaimer')}
                        </span>
                      )}
                    </CardDescription>
                    
                    {connected ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSync(device.id)}
                          disabled={syncingId === getConnection(device.id)?.id}
                        >
                          {syncingId === getConnection(device.id)?.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              {t('wearables.status.syncing')}
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              {t('wearables.status.syncNow')}
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisconnect(device.id)}
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleConnect(device.id)}
                        disabled={connectingId === device.id}
                      >
                        {connectingId === device.id ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            {t('wearables.status.connecting')}
                          </>
                        ) : (
                          <>
                            <LinkIcon className="h-4 w-4 mr-2" />
                            {t('wearables.status.connect')}
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Info Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t('wearables.howItWorks.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              • <strong>{t('wearables.howItWorks.automaticSync')}</strong> {t('wearables.howItWorks.automaticSyncDesc')}
            </p>
            <p className="text-sm text-muted-foreground">
              • <strong>{t('wearables.howItWorks.reducedEntry')}</strong> {t('wearables.howItWorks.reducedEntryDesc')}
            </p>
            <p className="text-sm text-muted-foreground">
              • <strong>{t('wearables.howItWorks.privacyFirst')}</strong> {t('wearables.howItWorks.privacyFirstDesc')}
            </p>
            <p className="text-sm text-muted-foreground">
              • <strong>{t('wearables.howItWorks.smartLis')}</strong> {t('wearables.howItWorks.smartLisDesc')}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default WearableIntegrations;
