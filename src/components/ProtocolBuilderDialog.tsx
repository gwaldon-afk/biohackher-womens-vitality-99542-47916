import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Sparkles } from "lucide-react";
import { useProtocols } from "@/hooks/useProtocols";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface ProtocolItem {
  item_type: 'supplement' | 'therapy' | 'habit' | 'exercise' | 'diet';
  name: string;
  description: string;
  dosage: string;
  frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed';
  time_of_day: string[];
}

const PROTOCOL_TEMPLATES = {
  "energy-boost": {
    name: "Energy & Vitality Protocol",
    description: "Support natural energy levels and reduce fatigue",
    items: [
      { item_type: 'supplement', name: 'Vitamin B Complex', description: 'Energy metabolism support', dosage: '1 capsule', frequency: 'daily', time_of_day: ['morning'] },
      { item_type: 'supplement', name: 'CoQ10', description: 'Cellular energy production', dosage: '100mg', frequency: 'daily', time_of_day: ['morning'] },
      { item_type: 'habit', name: 'Morning Sunlight', description: 'Get 10-15 mins sunlight within 1hr of waking', dosage: '15 minutes', frequency: 'daily', time_of_day: ['morning'] },
      { item_type: 'exercise', name: 'Light Cardio', description: 'Brisk walk or light jog', dosage: '20 minutes', frequency: 'daily', time_of_day: ['morning', 'afternoon'] }
    ]
  },
  "sleep-optimization": {
    name: "Sleep Optimization Protocol",
    description: "Improve sleep quality and duration",
    items: [
      { item_type: 'supplement', name: 'Magnesium Glycinate', description: 'Supports relaxation and sleep', dosage: '400mg', frequency: 'daily', time_of_day: ['evening'] },
      { item_type: 'supplement', name: 'L-Theanine', description: 'Promotes calm and relaxation', dosage: '200mg', frequency: 'as_needed', time_of_day: ['evening'] },
      { item_type: 'habit', name: 'Digital Sunset', description: 'No screens 1 hour before bed', dosage: '60 minutes', frequency: 'daily', time_of_day: ['evening'] },
      { item_type: 'habit', name: 'Sleep Routine', description: 'Consistent bedtime routine', dosage: '30 minutes', frequency: 'daily', time_of_day: ['evening'] }
    ]
  },
  "stress-management": {
    name: "Stress Resilience Protocol",
    description: "Build resilience and manage stress naturally",
    items: [
      { item_type: 'supplement', name: 'Ashwagandha', description: 'Adaptogenic stress support', dosage: '300mg', frequency: 'twice_daily', time_of_day: ['morning', 'evening'] },
      { item_type: 'supplement', name: 'Rhodiola Rosea', description: 'Mental performance under stress', dosage: '200mg', frequency: 'daily', time_of_day: ['morning'] },
      { item_type: 'therapy', name: 'Breathwork Practice', description: '4-7-8 breathing technique', dosage: '10 minutes', frequency: 'daily', time_of_day: ['morning', 'evening'] },
      { item_type: 'habit', name: 'Meditation', description: 'Mindfulness or guided meditation', dosage: '15 minutes', frequency: 'daily', time_of_day: ['morning'] }
    ]
  },
  "gut-health": {
    name: "Gut Health Protocol",
    description: "Support digestive health and microbiome balance",
    items: [
      { item_type: 'supplement', name: 'Probiotic Complex', description: 'Multi-strain probiotic', dosage: '1 capsule', frequency: 'daily', time_of_day: ['morning'] },
      { item_type: 'supplement', name: 'Digestive Enzymes', description: 'Support nutrient absorption', dosage: '1-2 capsules', frequency: 'daily', time_of_day: ['afternoon', 'evening'] },
      { item_type: 'diet', name: 'Fermented Foods', description: 'Include kimchi, sauerkraut, or kefir', dosage: '1 serving', frequency: 'daily', time_of_day: ['afternoon'] },
      { item_type: 'habit', name: 'Mindful Eating', description: 'Eat slowly, chew thoroughly', dosage: 'Each meal', frequency: 'daily', time_of_day: ['morning', 'afternoon', 'evening'] }
    ]
  }
};

export const ProtocolBuilderDialog = ({ trigger }: { trigger?: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'basic' | 'template' | 'items'>('basic');
  const [protocolData, setProtocolData] = useState({
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0]
  });
  const [items, setItems] = useState<ProtocolItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const { createProtocol, addProtocolItem } = useProtocols();
  const { toast } = useToast();

  const handleTemplateSelect = (templateKey: string) => {
    const template = PROTOCOL_TEMPLATES[templateKey as keyof typeof PROTOCOL_TEMPLATES];
    setSelectedTemplate(templateKey);
    setProtocolData({
      name: template.name,
      description: template.description,
      start_date: new Date().toISOString().split('T')[0]
    });
    setItems(template.items as ProtocolItem[]);
    setStep('items');
  };

  const handleCreateProtocol = async () => {
    try {
      const protocol = await createProtocol({
        ...protocolData,
        is_active: true,
        end_date: null,
        created_from_pillar: selectedTemplate
      });

      if (protocol && items.length > 0) {
        await Promise.all(
          items.map(item =>
            addProtocolItem({
              protocol_id: protocol.id,
              ...item,
              notes: null,
              product_link: null,
              is_active: true
            })
          )
        );
      }

      toast({
        title: "Protocol Created!",
        description: `${protocolData.name} with ${items.length} items has been added.`
      });
      
      setOpen(false);
      resetForm();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create protocol. Please try again."
      });
    }
  };

  const resetForm = () => {
    setStep('basic');
    setProtocolData({ name: '', description: '', start_date: new Date().toISOString().split('T')[0] });
    setItems([]);
    setSelectedTemplate(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Protocol
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'basic' && 'Create New Protocol'}
            {step === 'template' && 'Choose a Template'}
            {step === 'items' && 'Review Protocol Items'}
          </DialogTitle>
          <DialogDescription>
            {step === 'basic' && 'Start from scratch or use a template'}
            {step === 'template' && 'Select a science-backed protocol template'}
            {step === 'items' && 'Customize your protocol items'}
          </DialogDescription>
        </DialogHeader>

        {step === 'basic' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Protocol Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Morning Energy Routine"
                  value={protocolData.name}
                  onChange={(e) => setProtocolData({ ...protocolData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What is this protocol for?"
                  value={protocolData.description}
                  onChange={(e) => setProtocolData({ ...protocolData, description: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={() => setStep('items')} className="flex-1">
                Start from Scratch
              </Button>
              <Button onClick={() => setStep('template')} variant="outline" className="flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                Use Template
              </Button>
            </div>
          </div>
        )}

        {step === 'template' && (
          <div className="space-y-4">
            {Object.entries(PROTOCOL_TEMPLATES).map(([key, template]) => (
              <Card key={key} className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleTemplateSelect(key)}>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  <p className="text-xs text-muted-foreground">{template.items.length} items included</p>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={() => setStep('basic')} className="w-full">
              Back
            </Button>
          </div>
        )}

        {step === 'items' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={true} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.dosage} • {item.frequency.replace('_', ' ')} • {item.time_of_day.join(', ')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(selectedTemplate ? 'template' : 'basic')}>
                Back
              </Button>
              <Button onClick={handleCreateProtocol} className="flex-1" disabled={items.length === 0}>
                Create Protocol
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};