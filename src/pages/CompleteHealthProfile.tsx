import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CompleteHealthProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/today';
  
  const { createOrUpdateProfile, loading } = useHealthProfile();
  
  const [formData, setFormData] = useState({
    date_of_birth: '',
    weight_kg: '',
    height_cm: '',
    activity_level: ''
  });
  
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!formData.date_of_birth || !formData.weight_kg || !formData.height_cm || !formData.activity_level) {
      toast.error('Please fill in all fields');
      return;
    }

    const weight = parseFloat(formData.weight_kg);
    const height = parseFloat(formData.height_cm);

    if (isNaN(weight) || weight < 30 || weight > 300) {
      toast.error('Please enter a valid weight between 30-300 kg');
      return;
    }

    if (isNaN(height) || height < 100 || height > 250) {
      toast.error('Please enter a valid height between 100-250 cm');
      return;
    }

    try {
      setSubmitting(true);
      
      await createOrUpdateProfile({
        date_of_birth: formData.date_of_birth,
        weight_kg: weight,
        height_cm: height,
        activity_level: formData.activity_level
      });
      
      toast.success('Profile completed successfully!');
      navigate(decodeURIComponent(returnTo), { replace: true });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
    { value: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
    { value: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
    { value: 'active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
    { value: 'very_active', label: 'Extremely Active', description: 'Very hard exercise & physical job' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-background to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <User className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Complete Your Health Profile</CardTitle>
          <CardDescription className="text-base">
            We need a few details to personalize your experience and provide accurate recommendations.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className="w-full"
                required
              />
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="30"
                max="300"
                placeholder="e.g., 65"
                value={formData.weight_kg}
                onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: e.target.value }))}
                required
              />
            </div>

            {/* Height */}
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="1"
                min="100"
                max="250"
                placeholder="e.g., 165"
                value={formData.height_cm}
                onChange={(e) => setFormData(prev => ({ ...prev, height_cm: e.target.value }))}
                required
              />
            </div>

            {/* Activity Level */}
            <div className="space-y-2">
              <Label htmlFor="activity">Current Activity Level</Label>
              <Select
                value={formData.activity_level}
                onValueChange={(value) => setFormData(prev => ({ ...prev, activity_level: value }))}
              >
                <SelectTrigger id="activity">
                  <SelectValue placeholder="Select your activity level" />
                </SelectTrigger>
                <SelectContent>
                  {activityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{level.label}</span>
                        <span className="text-xs text-muted-foreground">{level.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={submitting || loading}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
