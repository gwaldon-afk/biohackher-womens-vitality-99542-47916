import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ExpertReferral } from "@/types/experts";
import { DollarSign, Users, TrendingUp, Calendar } from "lucide-react";

interface ExpertAnalyticsProps {
  expertId: string;
}

export const ExpertAnalytics = ({ expertId }: ExpertAnalyticsProps) => {
  const [referrals, setReferrals] = useState<ExpertReferral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrals();
  }, [expertId]);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expert_referrals')
        .select('*')
        .eq('expert_id', expertId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = referrals
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.commission_amount, 0);

  const thisMonthRevenue = referrals
    .filter(r => {
      const date = new Date(r.created_at);
      const now = new Date();
      return r.status === 'completed' && 
             date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, r) => sum + r.commission_amount, 0);

  const totalReferrals = referrals.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              ${totalRevenue.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              ${thisMonthRevenue.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Referrals</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-600" />
              {totalReferrals}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>Your latest commission earnings</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading referrals...</p>
          ) : referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No referrals yet. Your commissions will appear here once clients book through your link.
            </p>
          ) : (
            <div className="space-y-3">
              {referrals.slice(0, 10).map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium capitalize">{referral.referral_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      +${referral.commission_amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{referral.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};