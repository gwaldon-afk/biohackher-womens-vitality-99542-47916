import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useExpertServices } from "@/hooks/useExpertServices";
import { Plus, Trash2, Clock, DollarSign } from "lucide-react";

interface ExpertServicesManagerProps {
  expertId: string;
}

export const ExpertServicesManager = ({ expertId }: ExpertServicesManagerProps) => {
  const { services, loading, addService, deleteService } = useExpertServices(expertId);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    service_name: "",
    description: "",
    duration_minutes: 60,
    price: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addService({
      expert_id: expertId,
      ...formData,
      available: true,
    });
    
    if (result) {
      setOpen(false);
      setFormData({
        service_name: "",
        description: "",
        duration_minutes: 60,
        price: 0,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Services Offered</CardTitle>
            <CardDescription>Manage the services you provide to clients</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>Create a service offering for your clients</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Service Name *</label>
                  <Input
                    value={formData.service_name}
                    onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                    placeholder="e.g., Initial Consultation"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this service includes..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add Service</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading services...</p>
        ) : services.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No services added yet. Click "Add Service" to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="flex items-start justify-between p-4 rounded-lg border">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{service.service_name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                  <div className="flex gap-4 text-sm">
                    {service.duration_minutes && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {service.duration_minutes} min
                      </Badge>
                    )}
                    {service.price && (
                      <Badge variant="outline">
                        <DollarSign className="h-3 w-3 mr-1" />
                        ${service.price}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteService(service.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};