import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useExpertProfile } from "@/hooks/useExpertProfile";
import { useAuth } from "@/hooks/useAuth";
import { SPECIALTIES } from "@/types/experts";
import { UserPlus, Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  practice_name: z.string().min(2, "Practice name must be at least 2 characters"),
  bio: z.string().min(50, "Bio must be at least 50 characters").max(1000, "Bio must be less than 1000 characters"),
  specialties: z.array(z.string()).min(1, "Select at least one specialty"),
  location: z.string().min(2, "Location is required"),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  years_of_practice: z.number().min(0).max(100),
  license_number: z.string().min(3, "License number is required"),
  insurance_number: z.string().min(3, "Insurance number is required"),
  consultation_fee: z.number().min(0).optional(),
  accepts_insurance: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function ExpertRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createProfile, profile, loading: profileLoading } = useExpertProfile();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      practice_name: "",
      bio: "",
      specialties: [],
      location: "",
      phone: "",
      website: "",
      years_of_practice: 0,
      license_number: "",
      insurance_number: "",
      consultation_fee: 0,
      accepts_insurance: false,
    },
  });

  if (!user) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Please log in to register as an expert</p>
            <Button onClick={() => navigate('/auth')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return <div className="container max-w-2xl py-8 text-center">Loading...</div>;
  }

  if (profile) {
    return (
      <div className="container max-w-2xl py-8">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle>Application Submitted!</CardTitle>
            </div>
            <CardDescription>
              Your expert profile has been created and is pending verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm mb-2"><strong>Expert ID:</strong> {profile.expert_id}</p>
              <p className="text-sm mb-2"><strong>Status:</strong> {profile.verification_status}</p>
              <p className="text-sm text-muted-foreground">
                Our team will review your credentials within 24-48 hours. You'll receive an email once your profile is approved.
              </p>
            </div>
            <Button onClick={() => navigate('/expert/dashboard')} className="w-full">
              Go to Expert Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (values: FormValues) => {
    const result = await createProfile(values);
    if (result) {
      setStep(3);
    }
  };

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Become an Expert Partner</h1>
        <p className="text-muted-foreground">
          Join our network of verified health professionals and help empower women on their longevity journey.
        </p>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Partner Benefits</CardTitle>
            <CardDescription>What you get as a BiohackHer Expert Partner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {['Free', 'Premium', 'Elite'].map((tier) => (
                <Card key={tier} className={tier === 'Premium' ? 'border-primary' : ''}>
                  <CardHeader>
                    <CardTitle className="text-lg">{tier}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {tier === 'Free' && (
                      <>
                        <p>• Directory listing</p>
                        <p>• 10% referral commission</p>
                        <p>• Basic analytics</p>
                        <p className="font-bold mt-4">$0/year</p>
                      </>
                    )}
                    {tier === 'Premium' && (
                      <>
                        <p>• Featured placement</p>
                        <p>• 20% referral commission</p>
                        <p>• Content co-creation</p>
                        <p>• Priority support</p>
                        <p className="font-bold mt-4">$299/year</p>
                      </>
                    )}
                    {tier === 'Elite' && (
                      <>
                        <p>• Co-branding</p>
                        <p>• 30% referral commission</p>
                        <p>• Advanced analytics</p>
                        <p>• Event invitations</p>
                        <p>• Dedicated manager</p>
                        <p className="font-bold mt-4">$999/year</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={() => setStep(2)} className="w-full" size="lg">
              <UserPlus className="mr-2 h-5 w-5" />
              Start Application
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Expert Application</CardTitle>
            <CardDescription>Tell us about your practice and credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="practice_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practice Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Clinic or Practice Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Bio *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your expertise, approach, and what makes you unique..." 
                          rows={5}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Minimum 50 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialties"
                  render={() => (
                    <FormItem>
                      <FormLabel>Specialties * (Select all that apply)</FormLabel>
                      <div className="grid md:grid-cols-2 gap-3">
                        {SPECIALTIES.map((specialty) => (
                          <FormField
                            key={specialty}
                            control={form.control}
                            name="specialties"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(specialty)}
                                    onCheckedChange={(checked) => {
                                      const value = field.value || [];
                                      if (checked) {
                                        field.onChange([...value, specialty]);
                                      } else {
                                        field.onChange(value.filter((v) => v !== specialty));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {specialty}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State/Region" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="years_of_practice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Practice *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="license_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Professional license #" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="insurance_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Professional insurance #" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+61 xxx xxx xxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourpractice.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="consultation_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultation Fee (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Your standard consultation fee in your local currency</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accepts_insurance"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        I accept insurance
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1">
                    Submit Application
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}