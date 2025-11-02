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
  selected?: boolean;
}

const PROTOCOL_TEMPLATES = {
  "evidence-based-foundation": {
    name: "Evidence-Based Foundation Protocol",
    description: "Universal wellness interventions from Gabrielle Lyon, Stacey Sims & contemporary longevity research",
    items: [
      // Protein Protocol (Gabrielle Lyon)
      { item_type: 'diet', name: 'Protein-Rich Breakfast', description: '30-40g protein per meal for muscle protein synthesis', dosage: '30-40g protein', frequency: 'daily', time_of_day: ['morning'] },
      { item_type: 'diet', name: 'Protein-Rich Lunch', description: 'Maintains muscle protein synthesis throughout day', dosage: '30-40g protein', frequency: 'daily', time_of_day: ['afternoon'] },
      { item_type: 'diet', name: 'Protein-Rich Dinner', description: 'Supports overnight muscle recovery', dosage: '30-40g protein', frequency: 'daily', time_of_day: ['evening'] },
      // Resistance Training (Stacey Sims)
      { item_type: 'exercise', name: 'Lower Body Compound Lifts', description: 'Squats, deadlifts, lunges - progressive overload', dosage: '3-4 sets x 6-10 reps', frequency: 'twice_daily', time_of_day: ['morning', 'afternoon'] },
      { item_type: 'exercise', name: 'Upper Body Compound Lifts', description: 'Bench press, overhead press, rows', dosage: '3-4 sets x 6-10 reps', frequency: 'twice_daily', time_of_day: ['morning', 'afternoon'] },
      // HIIT (Stacey Sims)
      { item_type: 'exercise', name: 'HIIT Training', description: '4-6 intervals at 85-95% max HR, 2x/week', dosage: '30-60 sec intervals', frequency: 'twice_daily', time_of_day: ['morning', 'afternoon'] },
      // Critical Supplements
      { item_type: 'supplement', name: 'Creatine Monohydrate', description: 'Muscle strength, bone density, cognitive function', dosage: '5g', frequency: 'daily', time_of_day: ['morning'] },
      { item_type: 'supplement', name: 'Vitamin D3 + K2', description: 'Bone health, immune function, mood', dosage: '2000-4000 IU D3 + 100mcg K2', frequency: 'daily', time_of_day: ['morning'] },
      { item_type: 'supplement', name: 'Glycine', description: 'Sleep quality, collagen synthesis', dosage: '3g', frequency: 'daily', time_of_day: ['evening'] },
      { item_type: 'supplement', name: 'Collagen Peptides', description: 'Skin elasticity, joint health, bone density', dosage: '10-20g', frequency: 'daily', time_of_day: ['morning'] },
    ]
  },
  "mediterranean-meal-plan": {
    name: "Mediterranean 7-Day Meal Plan",
    description: "Complete week of heart-healthy Mediterranean meals with shopping list",
    items: [
      { item_type: 'diet', name: 'Mediterranean Meal Plan', description: '7-day plan with recipes, ~1800 cal/day, 120g protein avg', dosage: '1800 cal, 120g protein daily', frequency: 'daily', time_of_day: ['morning', 'afternoon', 'evening'], meal_template_id: 'mediterranean' }
    ]
  },
  "high-protein-meal-plan": {
    name: "High Protein Athlete 7-Day Plan",
    description: "Muscle-building meal plan optimized for 2g protein per kg bodyweight",
    items: [
      { item_type: 'diet', name: 'High Protein Meal Plan', description: '7-day plan for athletes, ~2200 cal/day, 180g protein avg', dosage: '2200 cal, 180g protein daily', frequency: 'daily', time_of_day: ['morning', 'afternoon', 'evening'], meal_template_id: 'high-protein' }
    ]
  },
  "plant-based-meal-plan": {
    name: "Plant-Based Power 7-Day Plan",
    description: "Complete plant-based nutrition with optimal amino acid profile",
    items: [
      { item_type: 'diet', name: 'Plant-Based Meal Plan', description: '7-day vegan plan, ~1900 cal/day, 110g protein avg, 40g+ fiber', dosage: '1900 cal, 110g protein daily', frequency: 'daily', time_of_day: ['morning', 'afternoon', 'evening'], meal_template_id: 'plant-based' }
    ]
  },
  "low-fodmap-meal-plan": {
    name: "Low-FODMAP Gentle 7-Day Plan",
    description: "IBS-friendly meals to support digestive comfort",
    items: [
      { item_type: 'diet', name: 'Low-FODMAP Meal Plan', description: '7-day IBS-friendly plan, ~1750 cal/day, 115g protein avg', dosage: '1750 cal, 115g protein daily', frequency: 'daily', time_of_day: ['morning', 'afternoon', 'evening'], meal_template_id: 'low-fodmap' }
    ]
  },
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

export const ProtocolBuilderDialog = ({ trigger, onProtocolCreated }: { trigger?: React.ReactNode; onProtocolCreated?: () => void }) => {
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
    // Mark all template items as selected by default
    setItems(template.items.map(item => ({ ...item, selected: true })) as ProtocolItem[]);
    setStep('items');
  };

  const toggleItemSelection = (index: number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, selected: !item.selected } : item
    ));
  };

  const handleCreateProtocol = async () => {
    try {
      const protocol = await createProtocol({
        ...protocolData,
        is_active: true,
        end_date: null,
        created_from_pillar: selectedTemplate
      });

      // Only add selected items
      const selectedItems = items.filter(item => item.selected !== false);
      
      if (protocol && selectedItems.length > 0) {
        await Promise.all(
          selectedItems.map(item => {
            const { selected, ...itemData } = item;
            return addProtocolItem({
              protocol_id: protocol.id,
              ...itemData,
              notes: null,
              product_link: null,
              is_active: true
            });
          })
        );
      }

      toast({
        title: "Protocol Created!",
        description: `${protocolData.name} with ${selectedItems.length} items has been added.`
      });
      
      setOpen(false);
      resetForm();
      
      // Trigger refresh in parent component
      if (onProtocolCreated) {
        onProtocolCreated();
      }
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
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Select the items you want to include in your protocol ({items.filter(i => i.selected !== false).length} of {items.length} selected)
              </p>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-colors ${item.selected === false ? 'opacity-50' : ''}`}
                  onClick={() => toggleItemSelection(index)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={item.selected !== false} 
                        onCheckedChange={() => toggleItemSelection(index)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.dosage} • {item.frequency.replace(/_/g, ' ')} • {item.time_of_day.join(', ')}
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
              <Button 
                onClick={handleCreateProtocol} 
                className="flex-1" 
                disabled={items.filter(i => i.selected !== false).length === 0}
              >
                Create Protocol with {items.filter(i => i.selected !== false).length} Items
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};