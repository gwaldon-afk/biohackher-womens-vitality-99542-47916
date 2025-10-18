import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProtocols } from "@/hooks/useProtocols";
import { HealthGoal } from "@/hooks/useGoals";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link2, Plus, CheckCircle, ExternalLink } from "lucide-react";

interface GoalProtocolSyncProps {
  goal: HealthGoal;
  onSync?: () => void;
}

export const GoalProtocolSync = ({ goal, onSync }: GoalProtocolSyncProps) => {
  const navigate = useNavigate();
  const { protocols, loading, createProtocol } = useProtocols();
  const [syncing, setSyncing] = useState(false);

  const linkedProtocol = protocols.find(p => p.id === goal.linked_protocol_id);
  const hasAgingBlueprint = goal.aging_blueprint && Object.keys(goal.aging_blueprint).length > 0;

  const syncToProtocol = async () => {
    if (!hasAgingBlueprint) {
      toast.error("No aging blueprint to sync");
      return;
    }

    setSyncing(true);
    try {
      // Create or update protocol
      let protocolId = goal.linked_protocol_id;

      if (!protocolId) {
        // Create new protocol using useProtocols hook
        const newProtocol = await createProtocol({
          name: `${goal.title} Protocol`,
          description: `Auto-generated from goal: ${goal.title}`,
          is_active: true,
          start_date: new Date().toISOString().split('T')[0],
          end_date: null,
          created_from_pillar: goal.pillar_category,
        });

        if (!newProtocol) throw new Error('Failed to create protocol');
        protocolId = newProtocol.id;

        // Link protocol to goal
        await supabase
          .from('user_health_goals')
          .update({ linked_protocol_id: protocolId })
          .eq('id', goal.id);
      }

      // Parse aging blueprint and add items
      const blueprint = goal.aging_blueprint as any;
      const interventions = blueprint.interventions || [];

      for (const intervention of interventions) {
        await supabase
          .from('protocol_items')
          .insert({
            protocol_id: protocolId,
            goal_id: goal.id,
            name: intervention.name || intervention.title || 'Intervention',
            description: intervention.description || '',
            item_type: intervention.type || 'supplement',
            frequency: intervention.frequency || 'daily',
            dosage: intervention.dosage || '',
            notes: intervention.notes || '',
          });
      }

      toast.success('Protocol synced successfully!');
      onSync?.();
    } catch (error) {
      console.error('Error syncing protocol:', error);
      toast.error('Failed to sync protocol');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">Loading protocol data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          <CardTitle>Protocol Integration</CardTitle>
        </div>
        <CardDescription>
          Connect your goal interventions to your daily protocol
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {linkedProtocol ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold">
                    {linkedProtocol.description || 'Goal Protocol'}
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {linkedProtocol.created_from_pillar ? `${linkedProtocol.created_from_pillar} pillar protocol` : 'Custom protocol'}
                </p>
              </div>
              <Badge variant="secondary">Linked</Badge>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/my-protocol`)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Protocol
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {hasAgingBlueprint 
                ? "Your aging blueprint contains interventions that can be added to your protocol"
                : "Complete your goal setup to generate interventions"}
            </p>
            
            {hasAgingBlueprint && (
              <Button 
                onClick={syncToProtocol}
                disabled={syncing}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {syncing ? 'Creating Protocol...' : 'Create Protocol from Blueprint'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
