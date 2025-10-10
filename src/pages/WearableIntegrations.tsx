import { useState } from "react";
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
  AlertCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SUPPORTED_DEVICES = [
  { 
    id: 'fitbit', 
    name: 'Fitbit', 
    icon: Activity,
    description: 'Sync activity, sleep, and heart rate data',
    color: 'bg-blue-500'
  },
  { 
    id: 'oura', 
    name: 'Oura Ring', 
    icon: Moon,
    description: 'Advanced sleep and readiness tracking',
    color: 'bg-purple-500'
  },
  { 
    id: 'whoop', 
    name: 'WHOOP', 
    icon: Heart,
    description: 'Recovery, strain, and sleep analysis',
    color: 'bg-red-500'
  },
  { 
    id: 'apple_health', 
    name: 'Apple Health', 
    icon: Heart,
    description: 'Comprehensive health data from Apple devices',
    color: 'bg-gray-500'
  },
  { 
    id: 'garmin', 
    name: 'Garmin', 
    icon: Watch,
    description: 'Fitness and activity tracking',
    color: 'bg-cyan-500'
  }
];

const WearableIntegrations = () => {
  const { connections, wearableData, loading, disconnectWearable, triggerSync } = useWearables();
  const { toast } = useToast();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const isConnected = (providerId: string) => {
    return connections.some(c => c.provider === providerId && c.is_active);
  };

  const getConnection = (providerId: string) => {
    return connections.find(c => c.provider === providerId && c.is_active);
  };

  const handleConnect = (deviceId: string) => {
    toast({
      title: "Connection Coming Soon",
      description: `${SUPPORTED_DEVICES.find(d => d.id === deviceId)?.name} integration is being finalized. Check back soon!`
    });
  };

  const handleDisconnect = async (providerId: string) => {
    const connection = getConnection(providerId);
    if (!connection) return;

    try {
      await disconnectWearable(connection.id);
      toast({
        title: "Device Disconnected",
        description: "Your wearable has been disconnected successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to disconnect device. Please try again."
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
        title: "Sync Complete",
        description: "Your data has been synced successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "Unable to sync data. Please try again."
      });
    } finally {
      setSyncingId(null);
    }
  };

  // Prepare chart data from wearable data
  const sleepChartData = wearableData
    .filter(d => d.total_sleep_hours !== null)
    .slice(0, 14)
    .reverse()
    .map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: d.total_sleep_hours
    }));

  const stepsChartData = wearableData
    .filter(d => d.steps !== null)
    .slice(0, 14)
    .reverse()
    .map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      steps: d.steps
    }));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-primary">Wearable</span> Integrations
          </h1>
          <p className="text-lg text-muted-foreground">
            Automatically sync data from your fitness trackers and health devices
          </p>
        </div>

        {/* Connected Devices Overview */}
        {connections.filter(c => c.is_active).length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
              <CardDescription>Your active wearable connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-background rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Active Connections</div>
                  <div className="text-2xl font-bold text-primary">
                    {connections.filter(c => c.is_active).length}
                  </div>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Days of Data</div>
                  <div className="text-2xl font-bold">
                    {wearableData.length}
                  </div>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Last Sync</div>
                  <div className="text-sm font-medium">
                    {connections[0]?.last_sync_at 
                      ? new Date(connections[0].last_sync_at).toLocaleDateString()
                      : 'Never'}
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
                    Sleep Trends
                  </CardTitle>
                  <CardDescription>Last 14 days</CardDescription>
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
                    Activity Trends
                  </CardTitle>
                  <CardDescription>Last 14 days</CardDescription>
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
          <h2 className="text-2xl font-bold">Available Devices</h2>
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
                          <CardTitle className="text-lg">{device.name}</CardTitle>
                          {connected && (
                            <Badge variant="default" className="mt-1">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {device.description}
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
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Sync Now
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
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Connect
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
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              • <strong>Automatic Sync:</strong> Data syncs automatically every 24 hours
            </p>
            <p className="text-sm text-muted-foreground">
              • <strong>Reduced Manual Entry:</strong> Sleep, activity, and HRV data populate automatically
            </p>
            <p className="text-sm text-muted-foreground">
              • <strong>Privacy First:</strong> Your data is encrypted and only accessible by you
            </p>
            <p className="text-sm text-muted-foreground">
              • <strong>Smart LIS Calculations:</strong> Wearable data contributes to your daily LIS score
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default WearableIntegrations;