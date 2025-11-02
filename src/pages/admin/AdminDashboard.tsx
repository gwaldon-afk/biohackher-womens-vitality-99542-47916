import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  FileCheck, 
  ShoppingCart, 
  AlertCircle,
  TrendingUp,
  Clock,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalUsers: number;
  activeProtocols: number;
  recentAssessments: number;
  pendingExperts: number;
  openFeedback: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, protocolsRes, assessmentsRes, expertsRes, feedbackRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('protocols').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('assessments').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('expert_profiles').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
          supabase.from('user_feedback').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        ]);

        setStats({
          totalUsers: usersRes.count || 0,
          activeProtocols: protocolsRes.count || 0,
          recentAssessments: assessmentsRes.count || 0,
          pendingExperts: expertsRes.count || 0,
          openFeedback: feedbackRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-primary',
      link: '/admin/users'
    },
    {
      title: 'Active Protocols',
      value: stats?.activeProtocols || 0,
      icon: FileCheck,
      color: 'text-primary',
      link: '/admin/analytics'
    },
    {
      title: 'Recent Assessments',
      value: stats?.recentAssessments || 0,
      icon: TrendingUp,
      color: 'text-primary',
      subtitle: 'Last 7 days',
      link: '/admin/analytics'
    },
    {
      title: 'Pending Expert Verifications',
      value: stats?.pendingExperts || 0,
      icon: Clock,
      color: 'text-warning',
      link: '/admin/experts'
    },
    {
      title: 'Open Support Tickets',
      value: stats?.openFeedback || 0,
      icon: AlertCircle,
      color: 'text-destructive',
      link: '/admin/users'
    },
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of platform activity and pending actions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2 rounded-lg bg-muted", stat.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                {stat.value > 0 && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={stat.link}>View</Link>
                  </Button>
                )}
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.pendingExperts > 0 && (
            <Button variant="outline" asChild className="h-auto py-4 flex-col">
              <Link to="/admin/experts">
                <Clock className="h-5 w-5 mb-2" />
                <span>Review Expert Applications</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {stats.pendingExperts} pending
                </span>
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild className="h-auto py-4 flex-col">
            <Link to="/admin/content">
              <FileText className="h-5 w-5 mb-2" />
              <span>Manage Content</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto py-4 flex-col">
            <Link to="/admin/analytics">
              <BarChart3 className="h-5 w-5 mb-2" />
              <span>View Analytics</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto py-4 flex-col">
            <Link to="/admin/system">
              <Settings className="h-5 w-5 mb-2" />
              <span>System Health</span>
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

