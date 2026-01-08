import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

export default function CompleteHealthProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/today';
  
  const { profile, createOrUpdateProfile, loading } = useHealthProfile();
  
  const [formData, setFormData] = useState({
    date_of_birth: '',
    weight_kg: '',
    height_cm: '',
    activity_level: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [prePopulated, setPrePopulated] = useState<string[]>([]);

  // Check if profile is already complete - if so, redirect away (self-healing)
  const isProfileComplete = profile && 
    profile.date_of_birth && 
    profile.weight_kg && 
    profile.height_cm && 
    profile.activity_level;

  useEffect(() => {
    if (!loading && isProfileComplete) {
      // Profile is already complete, no need to be on this page
      navigate(decodeURIComponent(returnTo), { replace: true });
    }
  }, [loading, isProfileComplete, navigate, returnTo]);

  // Pre-populate form with existing profile data
  useEffect(() => {
    if (profile && !loading) {
      const populated: string[] = [];
      
      setFormData(prev => {
        const newData = { ...prev };
        
        if (profile.date_of_birth) {
          newData.date_of_birth = profile.date_of_birth;
          populated.push('date_of_birth');
        }
        if (profile.weight_kg) {
          newData.weight_kg = String(profile.weight_kg);
          populated.push('weight_kg');
        }
        if (profile.height_cm) {
          newData.height_cm = String(profile.height_cm);
          populated.push('height_cm');
        }
        if (profile.activity_level) {
          newData.activity_level = profile.activity_level;
          populated.push('activity_level');
        }
        
        return newData;
      });
      
      setPrePopulated(populated);
    }
  }, [profile, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!formData.date_of_birth || !formData.weight_kg || !formData.height_cm || !formData.activity_level) {
      toast.error(t('completeProfile.errors.fillAllFields'));
      return;
    }

    const weight = parseFloat(formData.weight_kg);
    const height = parseFloat(formData.height_cm);

    if (isNaN(weight) || weight < 30 || weight > 300) {
      toast.error(t('completeProfile.errors.invalidWeight'));
      return;
    }

    if (isNaN(height) || height < 100 || height > 250) {
      toast.error(t('completeProfile.errors.invalidHeight'));
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
      
      toast.success(t('completeProfile.success'));
      navigate(decodeURIComponent(returnTo), { replace: true });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(t('completeProfile.errors.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const activityLevels = [
    { value: 'sedentary', labelKey: 'completeProfile.activityLevels.sedentary', descKey: 'completeProfile.activityLevels.sedentaryDesc' },
    { value: 'lightly_active', labelKey: 'completeProfile.activityLevels.lightlyActive', descKey: 'completeProfile.activityLevels.lightlyActiveDesc' },
    { value: 'moderately_active', labelKey: 'completeProfile.activityLevels.moderatelyActive', descKey: 'completeProfile.activityLevels.moderatelyActiveDesc' },
    { value: 'very_active', labelKey: 'completeProfile.activityLevels.veryActive', descKey: 'completeProfile.activityLevels.veryActiveDesc' },
    { value: 'extremely_active', labelKey: 'completeProfile.activityLevels.extremelyActive', descKey: 'completeProfile.activityLevels.extremelyActiveDesc' }
  ];

  const isPrePopulated = (field: string) => prePopulated.includes(field);
  const hasAnyPrePopulated = prePopulated.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-background to-background flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-background to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <User className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {hasAnyPrePopulated ? t('completeProfile.titleConfirm') : t('completeProfile.title')}
          </CardTitle>
          <CardDescription className="text-base">
            {hasAnyPrePopulated 
              ? t('completeProfile.descriptionConfirm')
              : t('completeProfile.description')
            }
          </CardDescription>
          {hasAnyPrePopulated && (
            <Badge variant="secondary" className="mx-auto">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {t('completeProfile.prePopulatedBadge', { count: prePopulated.length })}
            </Badge>
          )}
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date of Birth */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="dob">{t('completeProfile.fields.dateOfBirth')}</Label>
                {isPrePopulated('date_of_birth') && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                    {t('completeProfile.fromAssessment')}
                  </Badge>
                )}
              </div>
              <Input
                id="dob"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full ${isPrePopulated('date_of_birth') ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''}`}
                required
              />
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="weight">{t('completeProfile.fields.weight')}</Label>
                {isPrePopulated('weight_kg') && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                    {t('completeProfile.fromAssessment')}
                  </Badge>
                )}
              </div>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="30"
                max="300"
                placeholder={t('completeProfile.placeholders.weight')}
                value={formData.weight_kg}
                onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: e.target.value }))}
                className={isPrePopulated('weight_kg') ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''}
                required
              />
            </div>

            {/* Height */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="height">{t('completeProfile.fields.height')}</Label>
                {isPrePopulated('height_cm') && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                    {t('completeProfile.fromAssessment')}
                  </Badge>
                )}
              </div>
              <Input
                id="height"
                type="number"
                step="1"
                min="100"
                max="250"
                placeholder={t('completeProfile.placeholders.height')}
                value={formData.height_cm}
                onChange={(e) => setFormData(prev => ({ ...prev, height_cm: e.target.value }))}
                className={isPrePopulated('height_cm') ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''}
                required
              />
            </div>

            {/* Activity Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="activity">{t('completeProfile.fields.activityLevel')}</Label>
                {isPrePopulated('activity_level') && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                    {t('completeProfile.fromAssessment')}
                  </Badge>
                )}
              </div>
              <Select
                value={formData.activity_level}
                onValueChange={(value) => setFormData(prev => ({ ...prev, activity_level: value }))}
              >
                <SelectTrigger 
                  id="activity"
                  className={isPrePopulated('activity_level') ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''}
                >
                  <SelectValue placeholder={t('completeProfile.placeholders.activityLevel')} />
                </SelectTrigger>
                <SelectContent>
                  {activityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{t(level.labelKey)}</span>
                        <span className="text-xs text-muted-foreground">{t(level.descKey)}</span>
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
                  {t('completeProfile.saving')}
                </>
              ) : (
                <>
                  {hasAnyPrePopulated ? t('completeProfile.confirmContinue') : t('completeProfile.continue')}
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
