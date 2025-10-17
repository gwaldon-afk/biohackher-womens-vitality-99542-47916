import { useNavigate } from "react-router-dom";
import { useEnergyLoop } from "@/hooks/useEnergyLoop";
import { useProtocols } from "@/hooks/useProtocols";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnergyActionCard } from "@/components/energy/EnergyActionCard";
import { ENERGY_BIOHACKS, getBiohacksByType } from "@/data/energyBiohacks";
import { ArrowLeft, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EnergyActions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addAction } = useEnergyLoop();
  const { protocols, addProtocolItem, createProtocol } = useProtocols();

  const handleAddToProtocol = async (biohack: any) => {
    try {
      // First add to energy actions
      await addAction({
        action_type: biohack.type,
        action_name: biohack.name,
        description: biohack.description
      });

      // Find or create "Energy Optimization" protocol
      let energyProtocol = protocols.find(p => p.name === "Energy Optimization" && p.is_active);
      
      if (!energyProtocol) {
        energyProtocol = await createProtocol({
          name: "Energy Optimization",
          description: "Quick biohacks for daily energy from Energy Loop",
          is_active: true,
          start_date: new Date().toISOString().split('T')[0],
          end_date: null,
          created_from_pillar: null
        });
      }

      if (energyProtocol) {
        // Add as protocol item
        await addProtocolItem({
          protocol_id: energyProtocol.id,
          item_type: 'habit',
          name: biohack.name,
          description: biohack.description,
          frequency: 'daily',
          time_of_day: [],
          is_active: true,
          dosage: null,
          notes: biohack.instructions ? biohack.instructions.join('. ') : null,
          product_link: null
        });

        toast({
          title: 'Added to Protocol!',
          description: `${biohack.name} has been added to your Energy Optimization protocol.`
        });
      }
    } catch (error) {
      console.error('Error adding to protocol:', error);
      toast({
        title: 'Error',
        description: 'Failed to add action to protocol',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/energy-loop')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Energy Loop
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Energy Biohacks</h1>
        </div>
        <p className="text-muted-foreground">
          Science-backed actions to optimize your energy. Add them to your daily protocol.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="balance">⚖️ Balance</TabsTrigger>
          <TabsTrigger value="fuel">🍳 Fuel</TabsTrigger>
          <TabsTrigger value="calm">🧘‍♀️ Calm</TabsTrigger>
          <TabsTrigger value="recharge">🌙 Recharge</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {ENERGY_BIOHACKS.map(biohack => (
              <EnergyActionCard
                key={biohack.id}
                biohack={biohack}
                onAddToProtocol={() => handleAddToProtocol(biohack)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="balance" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {getBiohacksByType('balance').map(biohack => (
              <EnergyActionCard
                key={biohack.id}
                biohack={biohack}
                onAddToProtocol={() => handleAddToProtocol(biohack)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fuel" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {getBiohacksByType('fuel').map(biohack => (
              <EnergyActionCard
                key={biohack.id}
                biohack={biohack}
                onAddToProtocol={() => handleAddToProtocol(biohack)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calm" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {getBiohacksByType('calm').map(biohack => (
              <EnergyActionCard
                key={biohack.id}
                biohack={biohack}
                onAddToProtocol={() => handleAddToProtocol(biohack)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recharge" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {getBiohacksByType('recharge').map(biohack => (
              <EnergyActionCard
                key={biohack.id}
                biohack={biohack}
                onAddToProtocol={() => handleAddToProtocol(biohack)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="font-semibold mb-2">How Energy Loop Works</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your Energy Loop tracks 5 key segments: Sleep Recovery, Stress Load, Fuel & Nutrition, Movement Quality, and Hormonal Rhythm. 
          Each biohack targets one or more segments to help you close the loop and optimize your daily energy.
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#4A90E2' }} />
              <span className="font-medium">Sleep Recovery (30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#F5A623' }} />
              <span className="font-medium">Stress Load (25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#7ED321' }} />
              <span className="font-medium">Fuel & Nutrition (20%)</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#E94B8E' }} />
              <span className="font-medium">Movement Quality (15%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#9B51E0' }} />
              <span className="font-medium">Hormonal Rhythm (10%)</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
